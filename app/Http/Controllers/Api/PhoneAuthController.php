<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\CompletePhoneProfileRequest;
use App\Http\Requests\Auth\RequestPhoneVerificationRequest;
use App\Http\Requests\Auth\VerifyPhoneCodeRequest;
use App\Models\Project;
use App\Services\Auth\PhoneVerificationService;
use App\Services\Sponsors\ProjectSponsorshipManager;
use App\Support\PhoneNumber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PhoneAuthController extends Controller
{
    public function __construct(
        private PhoneVerificationService $phoneVerificationService,
        private ProjectSponsorshipManager $projectSponsorshipManager
    )
    {
        $this->middleware('web');
        $this->middleware('auth')->only(['completeProfile', 'uploadPhoto', 'attach']);
    }

    public function requestCode(RequestPhoneVerificationRequest $request): JsonResponse
    {
        $data = $request->validated();

        $verification = $this->phoneVerificationService->requestCode(
            $data['phone'],
            $data['organization_id'] ?? null,
            $data['project_id'] ?? null,
            Auth::user()
        );

        return response()->json([
            'token' => $verification->token,
            'expires_at' => $verification->expires_at?->toIso8601String(),
            'resend_available_in' => max(
                0,
                $verification->last_sent_at
                    ? PhoneVerificationService::RESEND_COOLDOWN_SECONDS - now()->diffInSeconds($verification->last_sent_at)
                    : 0
            ),
            'masked_phone' => PhoneNumber::masked($verification->phone),
        ], 201);
    }

    public function verifyCode(VerifyPhoneCodeRequest $request): JsonResponse
    {
        $data = $request->validated();

        $result = $this->phoneVerificationService->verifyCode(
            $data['token'],
            $data['code'],
            $data['organization_id'] ?? null,
            $data['project_id'] ?? null,
            $request->boolean('remember', false)
        );

        $request->session()->regenerate();

        $user = $result['user'];
        $requiresProfileCompletion = $result['is_new_user'] || blank($user->name);
        $requiresPassword = $result['is_new_user'] || blank($user->password);

        $projectId = $data['project_id'] ?? $result['verification']->project_id;

        if ($projectId) {
            if ($project = Project::query()->find($projectId)) {
                $this->projectSponsorshipManager->attach($project, $user, [
                    'source' => 'subscription',
                ]);
            }
        }

        return response()->json([
            'user' => $user,
            'is_new_user' => $result['is_new_user'],
            'requires_profile_completion' => $requiresProfileCompletion,
            'requires_password' => $requiresPassword,
        ]);
    }

    public function completeProfile(CompletePhoneProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $user->name = $data['name'];

        if (array_key_exists('email', $data)) {
            $previousEmail = $user->email;
            $user->email = $data['email'] ?: null;
            if ($user->email !== $previousEmail) {
                $user->email_verified_at = null;
            }
        }

        if (array_key_exists('photo', $data)) {
            $user->photo = $data['photo'] ?: null;
        }

        if (! empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        return response()->json([
            'user' => $user->fresh(['roles', 'permissions', 'organizations']),
        ]);
    }

    public function uploadPhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $file = $request->file('photo');
        $filename = Str::uuid()->toString() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('users/photos', $filename, 'public');
        $url = asset('storage/' . $path);

        return response()->json([
            'success' => true,
            'url' => $url,
            'path' => $path,
        ]);
    }

    public function attach(Request $request): JsonResponse
    {
        $data = $request->validate([
            'organization_id' => ['nullable', 'exists:organizations,id'],
            'project_id' => ['nullable', 'exists:projects,id'],
        ]);

        if (empty($data['organization_id']) && empty($data['project_id'])) {
            throw ValidationException::withMessages([
                'organization_id' => __('Укажите организацию или проект для привязки.'),
            ]);
        }

        $user = $request->user();
        $project = null;
        $organizationId = $data['organization_id'] ?? null;

        if (! empty($data['project_id'])) {
            $project = Project::query()->findOrFail($data['project_id']);
            $organizationId = $organizationId ?: $project->organization_id;

            if ($organizationId !== $project->organization_id) {
                throw ValidationException::withMessages([
                    'project_id' => __('Проект не принадлежит выбранной организации.'),
                ]);
            }
        }

        if ($organizationId) {
            $this->phoneVerificationService->attachSponsorToOrganization($user, $organizationId);
        }

        if ($project) {
            $this->projectSponsorshipManager->attach($project, $user, [
                'source' => 'manual',
            ]);
        }

        return response()->json([
            'user' => $user->fresh(['roles', 'permissions', 'organizations']),
        ]);
    }
}



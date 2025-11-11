<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\CompletePhoneProfileRequest;
use App\Http\Requests\Auth\RequestPhoneVerificationRequest;
use App\Http\Requests\Auth\VerifyPhoneCodeRequest;
use App\Services\Auth\PhoneVerificationService;
use App\Support\PhoneNumber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class PhoneAuthController extends Controller
{
    public function __construct(private PhoneVerificationService $phoneVerificationService)
    {
        $this->middleware('web');
        $this->middleware('auth')->only(['completeProfile', 'uploadPhoto', 'attach']);
    }

    public function requestCode(RequestPhoneVerificationRequest $request): JsonResponse
    {
        $verification = $this->phoneVerificationService->requestCode(
            $request->input('phone'),
            $request->integer('organization_id'),
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
        $result = $this->phoneVerificationService->verifyCode(
            $request->input('token'),
            $request->input('code'),
            $request->integer('organization_id'),
            $request->boolean('remember', false)
        );

        $request->session()->regenerate();

        $user = $result['user'];
        $requiresProfileCompletion = $result['is_new_user'] || blank($user->name);

        return response()->json([
            'user' => $user,
            'is_new_user' => $result['is_new_user'],
            'requires_profile_completion' => $requiresProfileCompletion,
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
        $request->validate([
            'organization_id' => ['required', 'exists:organizations,id'],
        ]);

        $user = $request->user();
        $this->phoneVerificationService->attachSponsorToOrganization(
            $user,
            (int) $request->input('organization_id')
        );

        return response()->json([
            'user' => $user->fresh(['roles', 'permissions', 'organizations']),
        ]);
    }
}



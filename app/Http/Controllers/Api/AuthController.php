<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Domain;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'organization_id' => 'nullable|exists:organizations,id',
            'role' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'is_active' => true,
        ]);

        // Определяем организацию для привязки
        $organizationId = $request->input('organization_id');
        if (!$organizationId) {
            $organizationId = $this->resolveOrganizationIdFromHost($request);
        }

        // Если регистрация идет на домене организации — добавляем связь в organization_users
        if ($organizationId) {
            /** @var Organization|null $organization */
            $organization = Organization::find($organizationId);
            if ($organization) {
                $organization->users()->syncWithoutDetaching([
                    $user->id => [
                        'role' => $request->input('role', 'member'),
                        'status' => 'active',
                        'permissions' => null,
                        'joined_at' => now(),
                        'last_active_at' => now(),
                    ],
                ]);
            }
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user->load(['roles', 'permissions', 'organizations']),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Неверные учетные данные'], 401);
        }

        /** @var User $user */
        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user->load(['roles', 'permissions', 'organizations']),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        if ($user) {
            $user->currentAccessToken()?->delete();
        }
        return response()->json(['success' => true]);
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();
        if (!$user) {
            // Fallback to web guard (for /api/public/session-user)
            $user = Auth::guard('web')->user();
        }
        if (!$user) {
            return response()->json(null);
        }
        $userWith = User::query()
            ->with(['roles', 'permissions', 'organizations'])
            ->find($user->id);
        return response()->json($userWith);
    }

    /**
     * Выход из web-сессии (public API с web middleware)
     */
    public function webLogout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json(['success' => true]);
    }
    /**
     * Определить организацию по текущему хосту
     */
    private function resolveOrganizationIdFromHost(Request $request): ?int
    {
        $host = strtolower($request->getHost());
        if (!$host) {
            return null;
        }

        $domain = Domain::query()
            ->where('custom_domain', $host)
            ->orWhere('domain', $host)
            ->orWhere('subdomain', $host)
            ->first();

        return $domain?->organization_id;
    }
}

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
use Illuminate\Validation\Rule;
use App\Rules\RussianPhoneNumber;
use App\Support\PhoneNumber;

class AuthController extends Controller
{
  public function register(Request $request): JsonResponse
  {
    $validator = Validator::make($request->all(), [
      'name' => 'required|string|max:255',
      'email' => [
        'nullable',
        'string',
        'email',
        'max:255',
        Rule::unique(User::class, 'email'),
      ],
      'phone' => ['nullable', new RussianPhoneNumber(), Rule::unique(User::class, 'phone')],
      'password' => 'required|string|min:6|confirmed',
      'photo' => 'nullable|string|max:255',
      'organization_id' => 'nullable|exists:organizations,id',
      'role' => 'nullable|string|max:50',
      'organization_role' => 'nullable|string|max:255',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors(),
      ], 422);
    }

    if (!$request->filled('email') && !$request->filled('phone')) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => [
          'email' => ['Необходимо указать email или номер телефона'],
          'phone' => ['Необходимо указать email или номер телефона'],
        ],
      ], 422);
    }

    $normalizedPhone = $request->filled('phone') ? PhoneNumber::normalize($request->input('phone')) : null;

    $user = User::create([
      'name' => $request->name,
      'email' => $request->email,
      'phone' => $normalizedPhone,
      'password' => Hash::make($request->password),
      'is_active' => true,
      'photo' => $request->photo,
    ]);

    // Определяем организацию для привязки
    $organizationId = $request->input('organization_id');
    if (!$organizationId) {
      $organizationId = $this->resolveOrganizationIdFromHost($request);
    }

    // Определяем роль пользователя
    $userRole = $request->input('role', 'user');
    $organizationRoles = ['organization_admin', 'graduate', 'sponsor'];
    $isOrganizationRole = in_array($userRole, $organizationRoles);

    // Назначаем системную роль через Spatie
    if ($userRole && $userRole !== 'member') {
      $user->assignRole($userRole);
    }

    // Если регистрация идет на домене организации или указана роль организации — добавляем связь в organization_users
    if ($organizationId || $isOrganizationRole) {
      $targetOrganizationId = $organizationId;
      if (!$targetOrganizationId && $isOrganizationRole && $request->filled('organization_id')) {
        $targetOrganizationId = $request->input('organization_id');
      }

      if ($targetOrganizationId) {
        /** @var Organization|null $organization */
        $organization = Organization::find($targetOrganizationId);
        if ($organization) {
          $roleInOrganization = $isOrganizationRole ? $userRole : ($request->input('organization_role', 'viewer'));
          $organization->users()->syncWithoutDetaching([
            $user->id => [
              'role' => $roleInOrganization,
              'status' => 'active',
              'permissions' => null,
              'joined_at' => now(),
              'last_active_at' => now(),
            ],
          ]);
        }
      }
    }

    // Авторизуем пользователя через веб-сессию
    Auth::login($user);

    return response()->json([
      'user' => $user->load(['roles', 'permissions', 'organizations']),
      'success' => true,
    ], 201);
  }

  public function login(Request $request): JsonResponse
  {
    $validator = Validator::make($request->all(), [
      'login' => 'required|string',
      'password' => 'required|string',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors(),
      ], 422);
    }

    // Используем веб-авторизацию как на странице /login
    $credentials = $request->only(['login', 'password']);
    $user = $this->resolveUser($credentials['login'], $credentials['password']);

    if (!$user) {
      return response()->json(['message' => 'Неверные учетные данные'], 401);
    }

    // Авторизуем пользователя через веб-сессию
    Auth::login($user, $request->boolean('remember', false));
    $request->session()->regenerate();

    return response()->json([
      'user' => $user->load(['roles', 'permissions', 'organizations']),
      'success' => true,
    ]);
  }

  public function logout(Request $request): JsonResponse
  {
    // Используем веб-выход как на странице logout
    Auth::guard('web')->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
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

  private function resolveUser(string $login, string $password): ?User
  {
    if (filter_var($login, FILTER_VALIDATE_EMAIL)) {
      $user = Auth::getProvider()->retrieveByCredentials([
        'email' => $login,
        'password' => $password,
      ]);

      return $user && Auth::getProvider()->validateCredentials($user, ['password' => $password]) ? $user : null;
    }

    $normalizedPhone = PhoneNumber::normalize($login);

    if (! $normalizedPhone) {
      return null;
    }

    /** @var User|null $user */
    $user = User::query()->where('phone', $normalizedPhone)->first();

    if (! $user || ! $user->password) {
      return null;
    }

    return Auth::getProvider()->validateCredentials($user, ['password' => $password]) ? $user : null;
  }
}

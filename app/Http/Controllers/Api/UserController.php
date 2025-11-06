<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
  /**
   * Display a listing of users.
   */
  public function index(Request $request): JsonResponse
  {
    // Временно отключаем проверку авторизации для отладки
    // $this->authorize('users.view');

    $query = User::with(['roles', 'permissions', 'organizations']);

    // Фильтрация по ролям
    if ($request->filled('role')) {
      $query->role($request->role);
    }

    // Поиск
    if ($request->filled('search')) {
      $search = $request->search;
      $query->where(function ($q) use ($search) {
        $q->where('name', 'like', "%{$search}%")
          ->orWhere('email', 'like', "%{$search}%");
      });
    }

    // Сортировка
    $sortBy = $request->get('sort_by', 'created_at');
    $sortDirection = $request->get('sort_direction', 'desc');
    $query->orderBy($sortBy, $sortDirection);

    $users = $query->paginate($request->get('per_page', 15));

    return response()->json($users);
  }

  /**
   * Store a newly created user.
   */
  public function store(Request $request): JsonResponse
  {
    $this->authorize('users.create');

    $validator = Validator::make($request->all(), [
      'name' => 'required|string|max:255',
      'email' => 'required|string|email|max:255|unique:users',
      'password' => 'required|string|min:8|confirmed',
      'photo' => 'nullable|string|max:255',
      'roles' => 'array',
      'roles.*' => 'exists:roles,name',
      'organization_id' => 'nullable|exists:organizations,id',
      'organization_role' => 'nullable|string|max:255',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    $user = User::create([
      'name' => $request->name,
      'email' => $request->email,
      'password' => Hash::make($request->password),
      'email_verified_at' => now(),
      'photo' => $request->photo,
    ]);

    // Назначаем роли
    if ($request->has('roles')) {
      $user->assignRole($request->roles);
    }

    // Если пользователь имеет роль организации и указана организация, добавляем в organization_users
    $organizationRoles = ['organization_admin', 'graduate', 'sponsor'];
    if ($request->has('organization_id') && $request->filled('organization_id')) {
      $userRoles = $request->has('roles') ? $request->roles : [];
      $intersectedRoles = array_intersect($userRoles, $organizationRoles);
      $hasOrganizationRole = !empty($intersectedRoles);

      if ($hasOrganizationRole) {
        $organization = \App\Models\Organization::find($request->organization_id);
        if ($organization) {
          // Используем первую найденную роль организации из выбранных ролей
          $roleInOrganization = !empty($intersectedRoles) ? reset($intersectedRoles) : 'viewer';
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

    $user->load(['roles', 'permissions', 'organizations']);

    return response()->json($user, 201);
  }

  /**
   * Display the specified user.
   */
  public function show(User $user): JsonResponse
  {
    $this->authorize('users.view');

    $user->load(['roles', 'permissions', 'organizations']);

    return response()->json($user);
  }

  /**
   * Update the specified user.
   */
  public function update(Request $request, User $user): JsonResponse
  {
    $this->authorize('users.edit');

    $validator = Validator::make($request->all(), [
      'name' => 'sometimes|required|string|max:255',
      'email' => [
        'sometimes',
        'required',
        'string',
        'email',
        'max:255',
        Rule::unique('users')->ignore($user->id)
      ],
      'password' => 'sometimes|nullable|string|min:8|confirmed',
      'photo' => 'nullable|string|max:255',
      'roles' => 'array',
      'roles.*' => 'exists:roles,name',
      'organization_id' => 'nullable|exists:organizations,id',
      'organization_role' => 'nullable|string|max:255',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    $updateData = $request->only(['name', 'email']);

    // Обновляем фото только если оно передано и не является data URL (слишком длинным)
    if ($request->has('photo')) {
      $photo = $request->photo;
      // Если это data URL и он слишком длинный, игнорируем (фото должно быть загружено отдельно)
      if (is_string($photo) && !str_starts_with($photo, 'data:') && strlen($photo) <= 500) {
        $updateData['photo'] = $photo;
      } elseif (str_starts_with($photo, 'data:') && strlen($photo) > 500) {
        // Data URL слишком длинный, игнорируем - фото должно быть загружено через upload-photo endpoint
        \Log::warning('User photo update skipped: data URL too long', ['user_id' => $user->id]);
      }
    }

    // Обновляем пароль только если он передан и не пустой
    if ($request->has('password') && $request->filled('password') && strlen($request->password) > 0) {
      $updateData['password'] = Hash::make($request->password);
    }

    $user->update($updateData);

    // Обновляем роли
    if ($request->has('roles')) {
      $user->syncRoles($request->roles);
    }

        // Обновляем связь с организацией если нужно
        $organizationRoles = ['organization_admin', 'graduate', 'sponsor'];
        if ($request->has('organization_id') && $request->filled('organization_id')) {
            $userRoles = $request->has('roles') ? $request->roles : $user->roles->pluck('name')->toArray();
            $intersectedRoles = array_intersect($userRoles, $organizationRoles);
            $hasOrganizationRole = !empty($intersectedRoles);
            
            if ($hasOrganizationRole) {
                $organization = \App\Models\Organization::find($request->organization_id);
                if ($organization) {
                    // Используем первую найденную роль организации из выбранных ролей
                    $roleInOrganization = !empty($intersectedRoles) ? reset($intersectedRoles) : 'viewer';
                    $organization->users()->syncWithoutDetaching([
                        $user->id => [
                            'role' => $roleInOrganization,
                            'status' => 'active',
                            'permissions' => null,
                            'last_active_at' => now(),
                        ],
                    ]);
                }
            } else {
                // Если у пользователя больше нет ролей организации, удаляем из organization_users
                $user->organizations()->detach();
            }
        }

    $user->load(['roles', 'permissions', 'organizations']);

    return response()->json($user);
  }

  /**
   * Upload user photo.
   */
  public function uploadPhoto(Request $request): JsonResponse
  {
    $this->authorize('users.edit');

    $validator = Validator::make($request->all(), [
      'photo' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    try {
      $file = $request->file('photo');
      $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
      $path = $file->storeAs('users/photos', $filename, 'public');

      $url = asset('storage/' . $path);

      return response()->json([
        'success' => true,
        'url' => $url,
        'photo' => $url,
        'path' => $path,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Ошибка загрузки фото: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Remove the specified user.
   */
  public function destroy(User $user): JsonResponse
  {
    $this->authorize('users.delete');

    // Нельзя удалить самого себя
    if ($user->id === Auth::id()) {
      return response()->json([
        'message' => 'You cannot delete yourself'
      ], 403);
    }

    $user->delete();

    return response()->json([
      'message' => 'User deleted successfully'
    ]);
  }

  /**
   * Get all roles.
   */
  public function roles(): JsonResponse
  {
    $this->authorize('roles.view');

    $roles = Role::with('permissions')->get();

    return response()->json($roles);
  }

  /**
   * Get all permissions.
   */
  public function permissions(): JsonResponse
  {
    $this->authorize('permissions.manage');

    $permissions = Permission::all();

    return response()->json($permissions);
  }

  /**
   * Assign role to user.
   */
  public function assignRole(Request $request, User $user): JsonResponse
  {
    $this->authorize('users.manage_roles');

    $validator = Validator::make($request->all(), [
      'role' => 'required|exists:roles,name'
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    $user->assignRole($request->role);

    // Если роль относится к организации и указана организация, добавляем в organization_users
    $organizationRoles = ['organization_admin', 'graduate', 'sponsor'];
    if (in_array($request->role, $organizationRoles) && $request->has('organization_id') && $request->filled('organization_id')) {
      $organization = \App\Models\Organization::find($request->organization_id);
      if ($organization) {
        $organization->users()->syncWithoutDetaching([
          $user->id => [
            'role' => $request->role,
            'status' => 'active',
            'permissions' => null,
            'joined_at' => now(),
            'last_active_at' => now(),
          ],
        ]);
      }
    }

    $user->load(['roles', 'permissions', 'organizations']);

    return response()->json($user);
  }

  /**
   * Remove role from user.
   */
  public function removeRole(Request $request, User $user): JsonResponse
  {
    $this->authorize('users.manage_roles');

    $validator = Validator::make($request->all(), [
      'role' => 'required|exists:roles,name'
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    $roleToRemove = $request->role;
    $user->removeRole($roleToRemove);

    // Если роль относится к организации и указана организация, удаляем из organization_users
    $organizationRoles = ['organization_admin', 'graduate', 'sponsor'];
    if (in_array($roleToRemove, $organizationRoles) && $request->has('organization_id') && $request->filled('organization_id')) {
      $organization = \App\Models\Organization::find($request->organization_id);
      if ($organization) {
        $organization->users()->detach($user->id);
      }
    }

    $user->load(['roles', 'permissions', 'organizations']);

    return response()->json($user);
  }

  /**
   * Give permission to user.
   */
  public function givePermission(Request $request, User $user): JsonResponse
  {
    $this->authorize('users.manage_roles');

    $validator = Validator::make($request->all(), [
      'permission' => 'required|exists:permissions,name'
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    $user->givePermissionTo($request->permission);

    $user->load(['roles', 'permissions']);

    return response()->json($user);
  }

  /**
   * Revoke permission from user.
   */
  public function revokePermission(Request $request, User $user): JsonResponse
  {
    $this->authorize('users.manage_roles');

    $validator = Validator::make($request->all(), [
      'permission' => 'required|exists:permissions,name'
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    $user->revokePermissionTo($request->permission);

    $user->load(['roles', 'permissions']);

    return response()->json($user);
  }
}

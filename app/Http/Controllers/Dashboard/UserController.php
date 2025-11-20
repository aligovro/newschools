<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Organization;
use App\Models\User;
use App\Support\InertiaResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserController extends Controller
{
    public function index(Request $request)
    {
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

        // Пагинация
        $perPage = $request->get('per_page', 15);
        $users = $query->paginate($perPage);

        // Получаем роли и разрешения для фильтров
        $roles = Role::all();
        $permissions = Permission::all();

        return Inertia::render('dashboard/users/UserManagementPage', [
            'users' => InertiaResource::paginate($users, UserResource::class),
            'roles' => $roles,
            'permissions' => $permissions,
            'filters' => $request->only(['role', 'search', 'sort_by', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'photo' => 'nullable|string|max:255',
            'roles' => 'array',
            'roles.*' => 'exists:roles,id',
            'organization_id' => 'nullable|exists:organizations,id',
            'organization_role' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'photo' => $request->photo,
        ]);

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
                $organization = Organization::find($request->organization_id);
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

        return redirect()->back()->with('success', 'Пользователь успешно создан');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
            'photo' => 'nullable|string|max:255',
            'roles' => 'array',
            'roles.*' => 'exists:roles,id',
            'organization_id' => 'nullable|exists:organizations,id',
            'organization_role' => 'nullable|string|max:255',
        ]);

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        if ($request->has('photo')) {
            $updateData['photo'] = $request->photo;
        }

        $user->update($updateData);

        // Обновляем пароль только если он передан и не пустой
        if ($request->has('password') && $request->filled('password') && strlen($request->password) > 0) {
            $user->update(['password' => Hash::make($request->password)]);
        }

        // Обновляем фото только если оно передано и не является data URL (слишком длинным)
        if ($request->has('photo')) {
            $photo = $request->photo;
            // Если это data URL и он слишком длинный, игнорируем (фото должно быть загружено отдельно)
            if (is_string($photo) && !str_starts_with($photo, 'data:') && strlen($photo) <= 500) {
                $user->update(['photo' => $photo]);
            } elseif (str_starts_with($photo, 'data:') && strlen($photo) > 500) {
                // Data URL слишком длинный, игнорируем - фото должно быть загружено через upload-photo endpoint
                Log::warning('User photo update skipped: data URL too long', ['user_id' => $user->id]);
            }
        }

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
                $organization = Organization::find($request->organization_id);
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

        return redirect()->back()->with('success', 'Пользователь успешно обновлен');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->back()->with('success', 'Пользователь успешно удален');
    }

    public function assignRole(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|exists:roles,id',
        ]);

        $role = Role::find($request->role);
        $user->assignRole($role);

        return redirect()->back()->with('success', 'Роль успешно назначена');
    }

    public function removeRole(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|exists:roles,id',
        ]);

        $role = Role::find($request->role);
        $user->removeRole($role);

        return redirect()->back()->with('success', 'Роль успешно удалена');
    }
}

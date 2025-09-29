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

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request): JsonResponse
    {
        // Временно отключаем проверку авторизации для отладки
        // $this->authorize('users.view');

        $query = User::with(['roles', 'permissions']);

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
            'roles' => 'array',
            'roles.*' => 'exists:roles,name',
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
        ]);

        // Назначаем роли
        if ($request->has('roles')) {
            $user->assignRole($request->roles);
        }

        $user->load(['roles', 'permissions']);

        return response()->json($user, 201);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): JsonResponse
    {
        $this->authorize('users.view');

        $user->load(['roles', 'permissions']);

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
            'roles' => 'array',
            'roles.*' => 'exists:roles,name',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = $request->only(['name', 'email']);

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

        // Обновляем роли
        if ($request->has('roles')) {
            $user->syncRoles($request->roles);
        }

        $user->load(['roles', 'permissions']);

        return response()->json($user);
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user): JsonResponse
    {
        $this->authorize('users.delete');

        // Нельзя удалить самого себя
        if ($user->id === auth()->id()) {
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

        $user->load(['roles', 'permissions']);

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

        $user->removeRole($request->role);

        $user->load(['roles', 'permissions']);

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

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Validator;

class RoleController extends Controller
{
  /**
   * Display a listing of roles.
   */
  public function index(Request $request): JsonResponse
  {
    // Временно отключаем проверку авторизации для отладки
    // $this->authorize('roles.view');

    $query = Role::with('permissions');

    // Поиск
    if ($request->filled('search')) {
      $search = $request->search;
      $query->where(function ($q) use ($search) {
        $q->where('name', 'like', "%{$search}%")
          ->orWhere('display_name', 'like', "%{$search}%");
      });
    }

    $roles = $query->paginate($request->get('per_page', 15));

    return response()->json($roles);
  }

  /**
   * Store a newly created role.
   */
  public function store(Request $request): JsonResponse
  {
    $this->authorize('roles.create');

    $validator = Validator::make($request->all(), [
      'name' => 'required|string|max:255|unique:roles,name',
      'permissions' => 'array',
      'permissions.*' => 'exists:permissions,name',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    $role = Role::create([
      'name' => $request->name,
    ]);

    // Назначаем разрешения
    if ($request->has('permissions')) {
      $role->givePermissionTo($request->permissions);
    }

    $role->load('permissions');

    return response()->json($role, 201);
  }

  /**
   * Display the specified role.
   */
  public function show(Role $role): JsonResponse
  {
    $this->authorize('roles.view');

    $role->load('permissions');

    return response()->json($role);
  }

  /**
   * Update the specified role.
   */
  public function update(Request $request, Role $role): JsonResponse
  {
    $this->authorize('roles.edit');

    $validator = Validator::make($request->all(), [
      'name' => 'sometimes|required|string|max:255|unique:roles,name,' . $role->id,
      'permissions' => 'array',
      'permissions.*' => 'exists:permissions,name',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    $updateData = $request->only(['name']);
    $role->update($updateData);

    // Обновляем разрешения
    if ($request->has('permissions')) {
      $role->syncPermissions($request->permissions);
    }

    $role->load('permissions');

    return response()->json($role);
  }

  /**
   * Remove the specified role.
   */
  public function destroy(Role $role): JsonResponse
  {
    $this->authorize('roles.delete');

    // Нельзя удалить системные роли
    $systemRoles = ['super_admin', 'admin'];
    if (in_array($role->name, $systemRoles)) {
      return response()->json([
        'message' => 'Cannot delete system roles'
      ], 403);
    }

    $role->delete();

    return response()->json([
      'message' => 'Role deleted successfully'
    ]);
  }

  /**
   * Get all permissions.
   */
  public function permissions(): JsonResponse
  {
    // Временно отключаем проверку авторизации для отладки
    // $this->authorize('permissions.manage');

    $permissions = Permission::all();

    return response()->json($permissions);
  }

  /**
   * Give permission to role.
   */
  public function givePermission(Request $request, Role $role): JsonResponse
  {
    $this->authorize('roles.edit');

    $validator = Validator::make($request->all(), [
      'permission' => 'required|exists:permissions,name'
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    $role->givePermissionTo($request->permission);

    $role->load('permissions');

    return response()->json($role);
  }

  /**
   * Revoke permission from role.
   */
  public function revokePermission(Request $request, Role $role): JsonResponse
  {
    $this->authorize('roles.edit');

    $validator = Validator::make($request->all(), [
      'permission' => 'required|exists:permissions,name'
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    $role->revokePermissionTo($request->permission);

    $role->load('permissions');

    return response()->json($role);
  }
}

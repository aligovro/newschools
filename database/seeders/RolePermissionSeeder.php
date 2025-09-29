<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Очищаем кэш ролей и разрешений
    app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

    // Создаем разрешения
    $permissions = [
      // Пользователи
      'users.view',
      'users.create',
      'users.edit',
      'users.delete',
      'users.manage_roles',

      // Организации
      'organizations.view',
      'organizations.create',
      'organizations.edit',
      'organizations.delete',
      'organizations.manage_members',

      // Сайты
      'sites.view',
      'sites.create',
      'sites.edit',
      'sites.delete',
      'sites.publish',

      // Проекты
      'projects.view',
      'projects.create',
      'projects.edit',
      'projects.delete',
      'projects.manage_donations',

      // Платежи
      'payments.view',
      'payments.manage',
      'payments.refund',

      // Статистика
      'statistics.view',
      'statistics.export',

      // Настройки
      'settings.view',
      'settings.edit',
      'settings.manage_system',

      // Роли и разрешения
      'roles.view',
      'roles.create',
      'roles.edit',
      'roles.delete',
      'permissions.manage',
    ];

    foreach ($permissions as $permission) {
      Permission::firstOrCreate(['name' => $permission]);
    }

    // Создаем роли
    $roles = [
      'super_admin' => [
        'permissions' => $permissions, // Все разрешения
      ],
      'admin' => [
        'permissions' => [
          'users.view',
          'users.create',
          'users.edit',
          'organizations.view',
          'organizations.create',
          'organizations.edit',
          'organizations.manage_members',
          'sites.view',
          'sites.create',
          'sites.edit',
          'sites.publish',
          'projects.view',
          'projects.create',
          'projects.edit',
          'projects.manage_donations',
          'payments.view',
          'payments.manage',
          'statistics.view',
          'statistics.export',
          'settings.view',
          'settings.edit',
        ],
      ],
      'organization_admin' => [
        'permissions' => [
          'organizations.view',
          'organizations.edit',
          'organizations.manage_members',
          'sites.view',
          'sites.create',
          'sites.edit',
          'sites.publish',
          'projects.view',
          'projects.create',
          'projects.edit',
          'projects.manage_donations',
          'payments.view',
          'statistics.view',
        ],
      ],
      'moderator' => [
        'permissions' => [
          'users.view',
          'organizations.view',
          'sites.view',
          'sites.edit',
          'projects.view',
          'projects.edit',
          'payments.view',
          'statistics.view',
        ],
      ],
      'editor' => [
        'permissions' => [
          'sites.view',
          'sites.edit',
          'projects.view',
          'projects.create',
          'projects.edit',
        ],
      ],
      'user' => [
        'permissions' => [
          'sites.view',
          'projects.view',
        ],
      ],
    ];

    foreach ($roles as $roleKey => $roleData) {
      $role = Role::firstOrCreate([
        'name' => $roleKey,
      ]);

      $role->syncPermissions($roleData['permissions']);
    }

    $this->command->info('Роли и разрешения успешно созданы!');
  }
}

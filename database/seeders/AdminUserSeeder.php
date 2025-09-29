<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Создаем супер-администратора
    $admin = User::firstOrCreate(
      ['email' => 'admin@example.com'],
      [
        'name' => 'Super Admin',
        'password' => Hash::make('password'),
        'email_verified_at' => now(),
      ]
    );

    // Назначаем роль супер-администратора
    if (!$admin->hasRole('super_admin')) {
      $admin->assignRole('super_admin');
    }

    $this->command->info('Super admin user created successfully!');
    $this->command->info('Email: admin@example.com');
    $this->command->info('Password: password');
  }
}

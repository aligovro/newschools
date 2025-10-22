<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Запускаем сидеры для платежной системы и страниц
        $this->call([
            RolePermissionSeeder::class,
            PaymentMethodsSeeder::class,
            MainSiteSeeder::class, // Главный сайт с типом main template default
            OrganizationSeeder::class,
            SitePagesSeeder::class,
            WidgetPositionsSeeder::class, // 5 позиций для виджетов
            AllWidgetsSeeder::class, // Все виджеты в одном месте
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Organization;
use App\Models\OrganizationDomain;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Получаем статистику для dashboard
        $stats = [
            'totalUsers' => User::count(),
            'totalOrganizations' => Organization::count(),
            'totalSites' => OrganizationDomain::count(),
            'totalDonations' => 0, // Пока нет API для пожертвований
            'userGrowth' => 0, // Пока нет API для роста
            'donationGrowth' => 0,
            'siteGrowth' => 0,
            'organizationGrowth' => 0,
            'recentUsers' => User::with(['roles', 'permissions'])
                ->latest()
                ->limit(5)
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->roles->first()?->name ?? 'user',
                        'created_at' => $user->created_at->toISOString(),
                    ];
                }),
            'recentOrganizations' => Organization::latest()
                ->limit(5)
                ->get()
                ->map(function ($org) {
                    return [
                        'id' => $org->id,
                        'name' => $org->name,
                        'type' => $org->type ?? 'organization',
                        'status' => $org->status ?? 'active',
                        'created_at' => $org->created_at->toISOString(),
                    ];
                }),
        ];

        return Inertia::render('Dashboard', [
            'stats' => $stats,
        ]);
    }
}

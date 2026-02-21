<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;

use App\Models\Organization;
use App\Http\Resources\OrganizationDonationResource;
use App\Http\Resources\OrganizationMediaResource;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\OrganizationStatisticResource;
use App\Support\InertiaResource;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrganizationAdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Главная страница админки организации
     */
    public function index(Organization $organization)
    {
        return redirect()->route('organizations.show', $organization);
    }

    /**
     * Управление пользователями организации
     */
    public function users(Organization $organization)
    {
        $users = $organization->users()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('OrganizationUsersPage', [
            'organization' => $organization,
            'users' => $users,
        ]);
    }

    /**
     * Настройки организации
     */
    public function settings(Organization $organization)
    {
        $organization->load(['settings', 'seo', 'domains']);

        return Inertia::render('OrganizationSettingsPage', [
            'organization' => (new OrganizationResource($organization))->toArray(request()),
        ]);
    }

    /**
     * Галерея организации
     */
    public function gallery(Organization $organization)
    {
        $media = $organization->media()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('OrganizationGalleryPage', [
            'organization' => (new OrganizationResource($organization))->toArray(request()),
            'media' => InertiaResource::paginate($media, OrganizationMediaResource::class),
        ]);
    }

    /**
     * Платежи и пожертвования
     */
    public function payments(Organization $organization)
    {
        $donations = $organization->donations()
            ->with(['donor', 'paymentTransaction'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $stats = [
            'totalAmount' => $organization->donations()->sum('amount'),
            'monthlyAmount' => $organization->donations()
                ->whereMonth('created_at', now()->month)
                ->sum('amount'),
            'totalCount' => $organization->donations()->count(),
        ];

        return Inertia::render('OrganizationPaymentsPage', [
            'organization' => (new OrganizationResource($organization))->toArray(request()),
            'donations' => InertiaResource::paginate($donations, OrganizationDonationResource::class),
            'stats' => $stats,
        ]);
    }

    /**
     * Аналитика организации
     */
    public function analytics(Organization $organization)
    {
        $statistics = $organization->statistics()
            ->orderBy('created_at', 'desc')
            ->limit(30)
            ->get();

        return Inertia::render('OrganizationAnalyticsPage', [
            'organization' => (new OrganizationResource($organization))->toArray(request()),
            'statistics' => InertiaResource::list($statistics, OrganizationStatisticResource::class),
        ]);
    }

    /**
     * Dashboard организации (алиас для index)
     */
    public function dashboard(Organization $organization)
    {
        return $this->index($organization);
    }
}

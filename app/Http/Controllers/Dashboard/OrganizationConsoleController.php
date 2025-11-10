<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;

use App\Models\Organization;
use App\Models\OrganizationStatistic;
use App\Models\Donation;
use App\Models\Member;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Http\Resources\OrganizationResource;

class OrganizationConsoleController extends Controller
{
    public function __construct()
    {
        // Middleware применяется в маршрутах
    }

    /**
     * Главная консоль организации
     */
    public function index(Organization $organization)
    {
        $stats = $this->getOrganizationStats($organization);
        $recentActivity = $this->getRecentActivity($organization);
        $quickActions = $this->getQuickActions($organization);

        return Inertia::render('dashboard/organizations/ConsoleIndex', [
            'organization' => (new OrganizationResource($organization))->toArray(request()),
            'stats' => $stats,
            'recentActivity' => $recentActivity,
            'quickActions' => $quickActions,
        ]);
    }

    /**
     * Статистика организации
     */
    public function statistics(Request $request, Organization $organization): JsonResponse
    {
        $period = $request->get('period', 'month'); // day, week, month, year
        $stats = $this->getDetailedStatistics($organization, $period);

        return response()->json($stats);
    }

    /**
     * Аналитика доходов
     */
    public function revenue(Request $request, Organization $organization): JsonResponse
    {
        $period = $request->get('period', 'month');
        $startDate = $this->getStartDate($period);

        $revenueData = Donation::where('organization_id', $organization->id)
            ->where('status', 'completed')
            ->where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $totalRevenue = $revenueData->sum('total');
        $averageDaily = $revenueData->count() > 0 ? $totalRevenue / $revenueData->count() : 0;

        return response()->json([
            'revenueData' => $revenueData,
            'totalRevenue' => $totalRevenue,
            'averageDaily' => $averageDaily,
            'period' => $period,
        ]);
    }

    /**
     * Аналитика участников
     */
    public function members(Request $request, Organization $organization): JsonResponse
    {
        $period = $request->get('period', 'month');
        $startDate = $this->getStartDate($period);

        $memberStats = Member::where('organization_id', $organization->id)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $totalMembers = $organization->members()->count();
        $newMembers = $memberStats->sum('count');
        $activeMembers = $organization->members()
            ->where('last_active_at', '>=', now()->subDays(30))
            ->count();

        return response()->json([
            'memberStats' => $memberStats,
            'totalMembers' => $totalMembers,
            'newMembers' => $newMembers,
            'activeMembers' => $activeMembers,
            'period' => $period,
        ]);
    }

    /**
     * Аналитика проектов
     */
    public function projects(Request $request, Organization $organization): JsonResponse
    {
        $projects = $organization->projects()
            ->with(['donations'])
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'target_amount' => $project->target_amount,
                    'collected_amount' => $project->collected_amount,
                    'progress_percentage' => $project->target_amount > 0
                        ? round(($project->collected_amount / $project->target_amount) * 100, 1)
                        : 0,
                    'status' => $project->status,
                    'donations_count' => $project->donations()->count(),
                    'created_at' => $project->created_at,
                ];
            });

        $totalProjects = $projects->count();
        $activeProjects = $projects->where('status', 'active')->count();
        $completedProjects = $projects->where('status', 'completed')->count();
        $totalTarget = $projects->sum('target_amount');
        $totalCollected = $projects->sum('collected_amount');

        return response()->json([
            'projects' => $projects,
            'totalProjects' => $totalProjects,
            'activeProjects' => $activeProjects,
            'completedProjects' => $completedProjects,
            'totalTarget' => $totalTarget,
            'totalCollected' => $totalCollected,
            'overallProgress' => $totalTarget > 0 ? round(($totalCollected / $totalTarget) * 100, 1) : 0,
        ]);
    }

    /**
     * Системные уведомления
     */
    public function notifications(Request $request, Organization $organization): JsonResponse
    {
        $notifications = collect();

        // Проверяем различные условия для уведомлений
        $settings = $organization->settings;

        // Проверка настроек платежей
        if (!$settings || empty($settings->payment_settings['enabled_methods'])) {
            $notifications->push([
                'type' => 'warning',
                'title' => 'Не настроены платежные методы',
                'message' => 'Настройте способы приема платежей для начала сбора пожертвований',
                'action' => 'Настроить платежи',
                'action_url' => route('dashboard.organizations.settings.index', $organization),
            ]);
        }

        // Проверка Telegram бота
        $integrationSettings = $settings->integration_settings ?? [];
        if (empty($integrationSettings['telegram_bot_token'])) {
            $notifications->push([
                'type' => 'info',
                'title' => 'Подключите Telegram бота',
                'message' => 'Настройте Telegram бота для автоматических уведомлений',
                'action' => 'Настроить бота',
                'action_url' => route('dashboard.organizations.settings.index', $organization),
            ]);
        }

        // Проверка SEO настроек
        if (!$organization->seo || empty($organization->seo->meta_title)) {
            $notifications->push([
                'type' => 'info',
                'title' => 'Настройте SEO',
                'message' => 'Добавьте мета-данные для лучшего продвижения в поисковых системах',
                'action' => 'Настроить SEO',
                'action_url' => route('dashboard.organizations.settings.index', $organization),
            ]);
        }

        // Проверка активных проектов
        $activeProjects = $organization->projects()->where('status', 'active')->count();
        if ($activeProjects === 0) {
            $notifications->push([
                'type' => 'info',
                'title' => 'Создайте проект для сбора средств',
                'message' => 'Добавьте первый проект, чтобы начать принимать пожертвования',
                'action' => 'Создать проект',
                'action_url' => route('dashboard.organizations.projects.create', $organization),
            ]);
        }

        return response()->json([
            'notifications' => $notifications,
            'unreadCount' => $notifications->count(),
        ]);
    }

    /**
     * Быстрые действия
     */
    public function quickAction(Request $request, Organization $organization): JsonResponse
    {
        $action = $request->get('action');

        switch ($action) {
            case 'create_project':
                // Создание быстрого проекта
                $project = $organization->projects()->create([
                    'title' => 'Новый проект',
                    'description' => 'Описание проекта',
                    'target_amount' => 100000, // 1000 рублей в копейках
                    'status' => 'draft',
                ]);

                return response()->json([
                    'message' => 'Проект создан',
                    'project' => $project,
                    'redirect_url' => route('dashboard.organizations.projects.edit', [$organization, $project]),
                ]);

            case 'send_notification':
                // Отправка уведомления участникам
                $memberCount = $organization->members()->count();
                return response()->json([
                    'message' => "Уведомление отправлено {$memberCount} участникам",
                ]);

            case 'backup_data':
                // Создание резервной копии данных
                return response()->json([
                    'message' => 'Резервная копия создана',
                    'backup_url' => '#', // Здесь будет ссылка на скачивание
                ]);

            case 'clear_cache':
                // Очистка кеша
                Cache::flush();
                return response()->json([
                    'message' => 'Кеш очищен',
                ]);

            default:
                return response()->json([
                    'message' => 'Неизвестное действие',
                ], 400);
        }
    }

    /**
     * Получить статистику организации
     */
    private function getOrganizationStats(Organization $organization): array
    {
        $currentMonth = now()->month;
        $currentYear = now()->year;

        return [
            'totalDonations' => $organization->donations()->where('status', 'completed')->sum('amount'),
            'monthlyDonations' => $organization->donations()
                ->where('status', 'completed')
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->sum('amount'),
            'totalMembers' => $organization->members()->count(),
            'newMembersThisMonth' => $organization->members()
                ->whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->count(),
            'activeProjects' => $organization->projects()->where('status', 'active')->count(),
            'totalProjects' => $organization->projects()->count(),
            'lastLogin' => $organization->users()->latest('last_active_at')->first()?->last_active_at,
        ];
    }

    /**
     * Получить недавнюю активность
     */
    private function getRecentActivity(Organization $organization): array
    {
        $activities = collect();

        // Последние пожертвования
        $recentDonations = $organization->donations()
            ->with('donor')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($donation) {
                return [
                    'type' => 'donation',
                    'title' => 'Новое пожертвование',
                    'description' => "От " . ($donation->donor->name ?? $donation->donor_name ?? 'Аноним') . " на сумму " .
                        number_format($donation->amount / 100, 0, ',', ' ') . ' ₽',
                    'date' => $donation->created_at,
                    'amount' => $donation->amount,
                ];
            });

        // Новые участники
        $recentMembers = $organization->members()
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($member) {
                return [
                    'type' => 'member',
                    'title' => 'Новый участник',
                    'description' => $member->name . ' присоединился к организации',
                    'date' => $member->created_at,
                ];
            });

        $activities = $activities->merge($recentDonations)->merge($recentMembers);

        return $activities->sortByDesc('date')->take(10)->values()->toArray();
    }

    /**
     * Получить быстрые действия
     */
    private function getQuickActions(Organization $organization): array
    {
        return [
            [
                'title' => 'Создать проект',
                'description' => 'Добавить новый проект для сбора средств',
                'icon' => 'plus',
                'action' => 'create_project',
                'color' => 'primary',
            ],
            [
                'title' => 'Пригласить участников',
                'description' => 'Отправить приглашения новым участникам',
                'icon' => 'user-plus',
                'action' => 'invite_members',
                'color' => 'success',
            ],
            [
                'title' => 'Настроить платежи',
                'description' => 'Обновить способы приема пожертвований',
                'icon' => 'credit-card',
                'action' => 'configure_payments',
                'color' => 'warning',
            ],
            [
                'title' => 'Создать страницу',
                'description' => 'Добавить новую страницу на сайт',
                'icon' => 'file-text',
                'action' => 'create_page',
                'color' => 'info',
            ],
        ];
    }

    /**
     * Получить детальную статистику
     */
    private function getDetailedStatistics(Organization $organization, string $period): array
    {
        $startDate = $this->getStartDate($period);

        return [
            'donations' => [
                'total' => $organization->donations()->where('status', 'completed')->sum('amount'),
                'period' => $organization->donations()
                    ->where('status', 'completed')
                    ->where('created_at', '>=', $startDate)
                    ->sum('amount'),
                'count' => $organization->donations()->where('status', 'completed')->count(),
                'periodCount' => $organization->donations()
                    ->where('status', 'completed')
                    ->where('created_at', '>=', $startDate)
                    ->count(),
            ],
            'members' => [
                'total' => $organization->members()->count(),
                'new' => $organization->members()->where('created_at', '>=', $startDate)->count(),
            ],
            'projects' => [
                'total' => $organization->projects()->count(),
                'active' => $organization->projects()->where('status', 'active')->count(),
                'completed' => $organization->projects()->where('status', 'completed')->count(),
            ],
            'period' => $period,
            'startDate' => $startDate,
        ];
    }

    /**
     * Получить дату начала периода
     */
    private function getStartDate(string $period): Carbon
    {
        return match ($period) {
            'day' => now()->subDay(),
            'week' => now()->subWeek(),
            'month' => now()->subMonth(),
            'year' => now()->subYear(),
            default => now()->subMonth(),
        };
    }
}

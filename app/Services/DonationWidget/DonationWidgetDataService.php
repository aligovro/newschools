<?php

namespace App\Services\DonationWidget;

use App\Models\Organization;
use App\Models\Fundraiser;
use App\Models\Project;
use App\Models\ProjectStage;
use App\Models\PaymentMethod;
use App\Models\Payments\YooKassaPartnerMerchant;
use App\Services\BankRequisites\BankRequisitesResolver;
use App\Services\MonthlyGoal\MonthlyGoalResolver;
use App\Services\Autopayments\RecurringSubscriptionQuery;
use App\Helpers\TerminologyHelper;
use App\Support\PhoneNumber;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * Сервис для получения данных виджета пожертвований
 */
class DonationWidgetDataService
{
    public function __construct(
        protected BankRequisitesResolver $bankRequisitesResolver,
        protected MonthlyGoalResolver $monthlyGoalResolver
    ) {
    }

    /**
     * Получить данные виджета
     */
    public function getWidgetData(Organization $organization, ?int $fundraiserId = null, ?int $projectId = null, ?int $siteId = null): array
    {
        $organization->loadMissing('yookassaPartnerMerchant');

        $merchant = $organization->yookassaPartnerMerchant;
        $merchantStatus = $merchant?->status ?? 'inactive';
        $hasCredentials = $merchant
            && is_array($merchant->credentials)
            && !empty(data_get($merchant->credentials, 'shop_id'))
            && !empty(data_get($merchant->credentials, 'secret_key'));

        $isMerchantOperational = $merchantStatus === YooKassaPartnerMerchant::STATUS_ACTIVE;

        if ($hasCredentials) {
            $isMerchantOperational = true;
        }

        if (!$merchant) {
            $isMerchantOperational = true;
        }

        $data = [
            'organization' => [
                'id' => $organization->id,
                'name' => $organization->name,
                'logo' => $organization->logo ? asset('storage/' . $organization->logo) : null,
            ],
            'organization_needs' => tap($organization->needs, function (&$needs) {
                $needs['is_active'] = ($needs['target']['minor'] ?? 0) > 0;
            }),
            'terminology' => $this->getTerminology(),
            'payment_methods' => $this->getPaymentMethods($isMerchantOperational),
            'merchant' => $merchant ? [
                'id' => $merchant->id,
                'status' => $merchantStatus,
                'activation_date' => $merchant->activated_at?->toIso8601String(),
                'is_operational' => $isMerchantOperational,
                'is_test_mode' => (bool) data_get($merchant->settings, 'is_test_mode', false),
            ] : null,
            'subscribers_count' => $this->getSubscribersCount($organization),
        ];

        if ($fundraiserId) {
            $data['fundraiser'] = $this->getFundraiserData($organization, $fundraiserId);
        }

        if ($projectId) {
            $data['project'] = $this->getProjectData($organization, $projectId);
        }

        $data['bank_requisites'] = $this->bankRequisitesResolver->resolve($organization, $projectId, $siteId);

        // Получаем цель на месяц с учетом иерархии
        $monthlyGoal = $this->monthlyGoalResolver->resolve($organization, $projectId, $siteId);
        if ($monthlyGoal !== null && $monthlyGoal > 0) {
            $collectedOverride = $this->monthlyGoalResolver->resolveCollectedOverride($organization, $projectId, $siteId);
            $monthlyCollected = $collectedOverride !== null
                ? $collectedOverride
                : $this->getMonthlyCollectedAmount($organization, $projectId);

            $data['monthly_goal'] = [
                'target' => \App\Support\Money::toArray($monthlyGoal),
                'collected' => \App\Support\Money::toArray($monthlyCollected),
                'progress_percentage' => $monthlyGoal > 0
                    ? min(100, round(($monthlyCollected / $monthlyGoal) * 100, 2))
                    : 0,
            ];
        }

        return $data;
    }

    /**
     * Получить собранную сумму за текущий месяц (календарный месяц в таймзоне приложения).
     *
     * «Собрано» = сумма донатов, которые относятся к текущему месяцу по дате поступления:
     * - по paid_at (дата фактической оплаты), если задана;
     * - иначе по created_at (для миграции created_at = post_date donator в WP).
     *
     * @param Organization $organization
     * @param int|null $projectId Если указан, считаем только для проекта
     * @return int Сумма в копейках
     */
    protected function getMonthlyCollectedAmount(Organization $organization, ?int $projectId = null): int
    {
        $tz = config('app.timezone', 'Europe/Moscow');
        $startOfMonth = now($tz)->startOfMonth();
        $endOfMonth = now($tz)->endOfMonth();

        $query = DB::table('donations')
            ->where('organization_id', $organization->id)
            ->where('status', 'completed')
            ->whereBetween(DB::raw('COALESCE(paid_at, created_at)'), [$startOfMonth, $endOfMonth]);

        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        return (int) $query->sum('amount');
    }

    /**
     * Получить терминологию
     */
    protected function getTerminology(): array
    {
        try {
            return [
                'organization_singular' => TerminologyHelper::orgSingular(),
                'organization_genitive' => TerminologyHelper::orgGenitive(),
                'action_support' => TerminologyHelper::actionSupport(),
                'member_singular' => TerminologyHelper::memberSingular(),
                'member_plural' => TerminologyHelper::memberPlural(),
            ];
        } catch (\Throwable $e) {
            Log::warning('DonationWidget terminology fallback used', [
                'error' => $e->getMessage(),
            ]);
            return [
                'organization_singular' => 'Организация',
                'organization_genitive' => 'организации',
                'action_support' => 'Поддержать',
                'member_singular' => 'участник',
                'member_plural' => 'участники',
            ];
        }
    }

    /**
     * Получить методы оплаты
     */
    protected function getPaymentMethods(bool $isMerchantOperational): array
    {
        try {
            return PaymentMethod::active()->ordered()->get()->map(function ($method) use ($isMerchantOperational) {
                return [
                    'id' => $method->id,
                    'name' => $method->name,
                    'slug' => $method->slug,
                    'icon' => $method->icon,
                    'description' => $method->description,
                    'min_amount' => $method->min_amount,
                    'max_amount' => $method->max_amount,
                    'available' => $isMerchantOperational,
                ];
            })->toArray();
        } catch (\Throwable $e) {
            Log::error('DonationWidget getWidgetData payment_methods failed', [
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Получить количество подписчиков.
     * Для мигрированных организаций — из organization_autopayments.
     * Для остальных — из payment_transactions по saved_payment_method_id.
     */
    protected function getSubscribersCount(Organization $organization): int
    {
        return Cache::remember(
            "donation_widget_subscribers_count_{$organization->id}",
            now()->addMinutes(10),
            function () use ($organization) {
                if ($organization->is_legacy_migrated) {
                    return (int) DB::table('organization_autopayments')
                        ->where('organization_id', $organization->id)
                        ->count();
                }
                return RecurringSubscriptionQuery::countUniqueSubscriptions($organization);
            }
        );
    }

    /**
     * Получить данные сбора средств
     */
    protected function getFundraiserData(Organization $organization, int $fundraiserId): array
    {
        $fundraiser = Fundraiser::with(['organization', 'project'])
            ->where('organization_id', $organization->id)
            ->findOrFail($fundraiserId);

        return [
            'id' => $fundraiser->id,
            'title' => $fundraiser->title,
            'description' => $fundraiser->description,
            'short_description' => $fundraiser->short_description,
            'image' => $fundraiser->image ? asset('storage/' . $fundraiser->image) : null,
            'target_amount' => $fundraiser->target_amount,
            'collected_amount' => $fundraiser->collected_amount,
            'target_amount_rubles' => $fundraiser->target_amount_rubles,
            'collected_amount_rubles' => $fundraiser->collected_amount_rubles,
            'progress_percentage' => $fundraiser->progress_percentage,
            'start_date' => $fundraiser->start_date?->format('Y-m-d'),
            'end_date' => $fundraiser->end_date?->format('Y-m-d'),
            'status' => $fundraiser->status,
            'min_donation' => $fundraiser->min_donation,
            'max_donation' => $fundraiser->max_donation,
        ];
    }

    /**
     * Получить данные проекта
     */
    protected function getProjectData(Organization $organization, int $projectId): array
    {
        $project = Project::where('organization_id', $organization->id)
            ->findOrFail($projectId);

        $activeStage = $project->stages()
            ->where('status', 'active')
            ->orderBy('order')
            ->first();

        $projectFunding = $project->funding;

        $data = [
            'id' => $project->id,
            'title' => $project->title,
            'description' => $project->description,
            'image' => $project->image ? asset('storage/' . $project->image) : null,
            'funding' => $projectFunding,
            'target_amount' => $projectFunding['target']['minor'],
            'collected_amount' => $projectFunding['collected']['minor'],
            'target_amount_rubles' => $projectFunding['target']['value'],
            'collected_amount_rubles' => $projectFunding['collected']['value'],
            'progress_percentage' => $projectFunding['progress_percentage'],
            'has_stages' => (bool) $project->has_stages,
        ];

        if ($activeStage) {
            $stageFunding = $activeStage->funding;

            $data['active_stage'] = [
                'id' => $activeStage->id,
                'title' => $activeStage->title,
                'description' => $activeStage->description,
                'funding' => $stageFunding,
                'target_amount' => $stageFunding['target']['minor'],
                'collected_amount' => $stageFunding['collected']['minor'],
                'target_amount_rubles' => $stageFunding['target']['value'],
                'collected_amount_rubles' => $stageFunding['collected']['value'],
                'progress_percentage' => $stageFunding['progress_percentage'],
                'status' => $activeStage->status,
                'order' => $activeStage->order,
            ];
        }

        return $data;
    }
}

<?php

namespace App\Services\DonationWidget;

use App\Models\Organization;
use App\Models\Fundraiser;
use App\Models\Project;
use App\Models\ProjectStage;
use App\Models\PaymentMethod;
use App\Models\Payments\YooKassaPartnerMerchant;
use App\Services\BankRequisites\BankRequisitesResolver;
use App\Helpers\TerminologyHelper;
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
        protected BankRequisitesResolver $bankRequisitesResolver
    ) {
    }

    /**
     * Получить данные виджета
     */
    public function getWidgetData(Organization $organization, ?int $fundraiserId = null, ?int $projectId = null): array
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

        $data['bank_requisites'] = $this->bankRequisitesResolver->resolve($organization, $projectId);

        return $data;
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
     * Получить количество подписчиков
     */
    protected function getSubscribersCount(Organization $organization): int
    {
        return Cache::remember(
            "donation_widget_subscribers_count_{$organization->id}",
            now()->addMinutes(10),
            function () use ($organization) {
                $recurringDonations = DB::table('donations')
                    ->join('payment_transactions', 'donations.payment_transaction_id', '=', 'payment_transactions.id')
                    ->where('donations.organization_id', $organization->id)
                    ->where('donations.status', 'completed')
                    ->where('payment_transactions.status', 'completed')
                    ->where(function ($query) {
                        $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(payment_transactions.payment_details, '$.is_recurring')) = 'true'")
                            ->orWhereRaw("JSON_EXTRACT(payment_transactions.payment_details, '$.is_recurring') = 1")
                            ->orWhereRaw("JSON_EXTRACT(payment_transactions.payment_details, '$.is_recurring') = true")
                            ->orWhereRaw("JSON_EXTRACT(payment_transactions.payment_details, '$.recurring_period') IS NOT NULL")
                            ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(donations.payment_details, '$.is_recurring')) = 'true'")
                            ->orWhereRaw("JSON_EXTRACT(donations.payment_details, '$.is_recurring') = 1")
                            ->orWhereRaw("JSON_EXTRACT(donations.payment_details, '$.is_recurring') = true")
                            ->orWhereRaw("JSON_EXTRACT(donations.payment_details, '$.recurring_period') IS NOT NULL")
                            ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(payment_transactions.gateway_response, '$.recurring')) = 'true'")
                            ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(payment_transactions.gateway_response, '$.is_recurring')) = 'true'");
                    })
                    ->select(
                        'donations.donor_id',
                        'donations.id as donation_id',
                        DB::raw("JSON_UNQUOTE(JSON_EXTRACT(payment_transactions.payment_details, '$.donor_email')) as donor_email"),
                        DB::raw("JSON_UNQUOTE(JSON_EXTRACT(payment_transactions.payment_details, '$.is_anonymous')) as is_anonymous")
                    )
                    ->get();

                $uniqueSubscribers = [];
                foreach ($recurringDonations as $donation) {
                    $identifier = $donation->donor_id
                        ?? $donation->donor_email
                        ?? ('anonymous_' . $donation->donation_id);

                    if ($identifier) {
                        $uniqueSubscribers[$identifier] = true;
                    }
                }

                return count($uniqueSubscribers);
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

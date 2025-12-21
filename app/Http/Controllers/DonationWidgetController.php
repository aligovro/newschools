<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\Fundraiser;
use App\Models\Project;
use App\Models\ProjectStage;
use App\Models\PaymentMethod;
use App\Models\Payments\YooKassaPartnerMerchant;
use App\Models\PaymentTransaction;
use App\Models\Donation;
use App\Services\Payment\PaymentService;
use App\Helpers\TerminologyHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class DonationWidgetController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Получение данных виджета
     */
    public function getWidgetData(Request $request, Organization $organization)
    {
        $fundraiserId = $request->input('fundraiser_id');
        $projectId = $request->input('project_id');

        // Перезагружаем модель организации, чтобы получить актуальные данные (включая needs_collected_amount)
        $organization->refresh();
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

        // Подсчет подписчиков (регулярные пожертвования) с кешированием
        $subscribersCount = Cache::remember(
            "donation_widget_subscribers_count_{$organization->id}",
            now()->addMinutes(10),
            function () use ($organization) {
                // Ищем регулярные пожертвования
                // Используем комбинацию идентификаторов:
                // 1. Если есть donor_id - используем его
                // 2. Если нет donor_id - используем donor_email из payment_details
                // 3. Если нет ни того, ни другого (анонимное) - считаем как отдельного подписчика
                $recurringDonations = DB::table('donations')
                    ->join('payment_transactions', 'donations.payment_transaction_id', '=', 'payment_transactions.id')
                    ->where('donations.organization_id', $organization->id)
                    ->where('donations.status', 'completed')
                    ->where('payment_transactions.status', 'completed')
                    ->where(function ($query) {
                        // Проверяем payment_transactions.payment_details
                        $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(payment_transactions.payment_details, '$.is_recurring')) = 'true'")
                            ->orWhereRaw("JSON_EXTRACT(payment_transactions.payment_details, '$.is_recurring') = 1")
                            ->orWhereRaw("JSON_EXTRACT(payment_transactions.payment_details, '$.is_recurring') = true")
                            // Проверяем наличие recurring_period как альтернативный признак
                            ->orWhereRaw("JSON_EXTRACT(payment_transactions.payment_details, '$.recurring_period') IS NOT NULL")
                            // Проверяем donations.payment_details (на случай если данные там)
                            ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(donations.payment_details, '$.is_recurring')) = 'true'")
                            ->orWhereRaw("JSON_EXTRACT(donations.payment_details, '$.is_recurring') = 1")
                            ->orWhereRaw("JSON_EXTRACT(donations.payment_details, '$.is_recurring') = true")
                            ->orWhereRaw("JSON_EXTRACT(donations.payment_details, '$.recurring_period') IS NOT NULL")
                            // Проверяем gateway_response
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

                // Подсчитываем уникальных подписчиков
                $uniqueSubscribers = [];
                foreach ($recurringDonations as $donation) {
                    // Приоритет: donor_id > donor_email > donation_id (для анонимных)
                    $identifier = $donation->donor_id
                        ?? $donation->donor_email
                        ?? ('anonymous_' . $donation->donation_id);

                    if ($identifier) {
                        $uniqueSubscribers[$identifier] = true;
                    }
                }

                $count = count($uniqueSubscribers);

                return $count;
            }
        );

        $data = [
            'organization' => [
                'id' => $organization->id,
                'name' => $organization->name,
                'logo' => $organization->logo ? asset('storage/' . $organization->logo) : null,
            ],
            'organization_needs' => tap($organization->needs, function (&$needs) {
                $needs['is_active'] = ($needs['target']['minor'] ?? 0) > 0;
            }),
            'terminology' => [],
            'payment_methods' => [],
            'merchant' => $merchant ? [
                'id' => $merchant->id,
                'status' => $merchantStatus,
                'activation_date' => $merchant->activated_at?->toIso8601String(),
                'is_operational' => $isMerchantOperational,
                'is_test_mode' => (bool) data_get($merchant->settings, 'is_test_mode', false),
            ] : null,
            'subscribers_count' => $subscribersCount,
        ];

        // Терминология: безопасно с дефолтами, чтобы не падать на проде
        try {
            $data['terminology'] = [
                'organization_singular' => TerminologyHelper::orgSingular(),
                'organization_genitive' => TerminologyHelper::orgGenitive(),
                'action_support' => TerminologyHelper::actionSupport(),
                'member_singular' => TerminologyHelper::memberSingular(),
                'member_plural' => TerminologyHelper::memberPlural(),
            ];
        } catch (\Throwable $e) {
            Log::warning('DonationWidget terminology fallback used', [
                'organization_id' => $organization->id,
                'error' => $e->getMessage(),
            ]);
            $data['terminology'] = [
                'organization_singular' => 'Организация',
                'organization_genitive' => 'организации',
                'action_support' => 'Поддержать',
                'member_singular' => 'участник',
                'member_plural' => 'участники',
            ];
        }

        // Защищаем блок получения методов оплаты, чтобы не отдавать 500 из-за внешних ошибок
        try {
            $paymentMethods = PaymentMethod::active()->ordered()->get()->map(function ($method) use ($isMerchantOperational) {
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
            });

            $data['payment_methods'] = $paymentMethods;
        } catch (\Throwable $e) {
            Log::error('DonationWidget getWidgetData payment_methods failed', [
                'organization_id' => $organization->id,
                'error' => $e->getMessage(),
            ]);
            // Оставляем payment_methods пустым массивом, чтобы не ломать виджет
        }

        // Добавляем данные о сборе средств
        if ($fundraiserId) {
            $fundraiser = Fundraiser::with(['organization', 'project'])
                ->where('organization_id', $organization->id)
                ->findOrFail($fundraiserId);

            $data['fundraiser'] = [
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

        // Добавляем данные о проекте
        if ($projectId) {
            $project = Project::where('organization_id', $organization->id)
                ->findOrFail($projectId);

            $activeStage = $project->stages()
                ->where('status', 'active')
                ->orderBy('order')
                ->first();

            $projectFunding = $project->funding;

            $data['project'] = [
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

                $data['project']['active_stage'] = [
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
        }

        return response()->json($data);
    }

    /**
     * Создание пожертвования
     */
    public function createDonation(Request $request, Organization $organization)
    {
        // Валидация входных данных
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:1',
            'currency' => 'required|string|in:RUB,USD,EUR',
            'payment_method_slug' => 'required|string|exists:payment_methods,slug',
            'fundraiser_id' => 'nullable|exists:fundraisers,id',
            'project_id' => 'nullable|exists:projects,id',
            'project_stage_id' => 'nullable|exists:project_stages,id',
            'donor_name' => 'required_if:is_anonymous,false|string|max:255',
            'donor_email' => 'nullable|email|max:255',
            'donor_phone' => 'nullable|string|max:20',
            'donor_message' => 'nullable|string|max:1000',
            'is_anonymous' => 'boolean',
            'is_recurring' => 'boolean',
            'recurring_period' => 'nullable|required_if:is_recurring,true|in:daily,weekly,monthly',
            'send_receipt' => 'boolean',
            'success_url' => 'nullable|url',
            'failure_url' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        try {
            // Проверяем, что fundraiser и project принадлежат организации
            $fundraiser = null;
            $project = null;
            $projectStage = null;

            if (isset($data['fundraiser_id'])) {
                $fundraiser = Fundraiser::where('id', $data['fundraiser_id'])
                    ->where('organization_id', $organization->id)
                    ->firstOrFail();
            }

            if (isset($data['project_id'])) {
                $project = Project::where('id', $data['project_id'])
                    ->where('organization_id', $organization->id)
                    ->firstOrFail();
            }

            if (isset($data['project_stage_id'])) {
                $projectStage = ProjectStage::where('id', $data['project_stage_id'])
                    ->when($project, function ($query) use ($project) {
                        $query->where('project_id', $project->id);
                    })
                    ->firstOrFail();

                if (!$project) {
                    $project = $projectStage->project;

                    if (!$project || $project->organization_id !== $organization->id) {
                        throw new \InvalidArgumentException('Stage does not belong to organization');
                    }

                    $data['project_id'] = $project->id;
                }
            }

            if ($project && !$projectStage && $project->has_stages) {
                $activeStage = $project->stages()
                    ->where('status', 'active')
                    ->orderBy('order')
                    ->first();

                if ($activeStage) {
                    $projectStage = $activeStage;
                    $data['project_stage_id'] = $activeStage->id;
                }
            }

            if ($projectStage && $project && (int) $projectStage->project_id !== (int) $project->id) {
                throw new \InvalidArgumentException('Stage does not belong to the specified project');
            }

            // Конвертируем сумму в копейки
            $amountInKopeks = (int) round($data['amount'] * 100);

            // Проверяем минимальную и максимальную сумму
            $paymentMethod = PaymentMethod::where('slug', $data['payment_method_slug'])
                ->where('is_active', true)
                ->firstOrFail();

            if (!$paymentMethod->isValidAmount($amountInKopeks)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Неверная сумма платежа',
                ], 422);
            }

            // Создаем платеж через PaymentService
            $paymentData = [
                'organization_id' => $organization->id,
                'fundraiser_id' => $data['fundraiser_id'] ?? null,
                'project_id' => $data['project_id'] ?? null,
                'project_stage_id' => $data['project_stage_id'] ?? null,
                'payment_method_slug' => $data['payment_method_slug'],
                'amount' => $amountInKopeks,
                'currency' => $data['currency'],
                'description' => $data['is_anonymous']
                    ? 'Анонимное пожертвование'
                    : "Пожертвование от {$data['donor_name']}",
                'donor_name' => $data['is_anonymous'] ? 'Анонимный донор' : $data['donor_name'],
                'donor_email' => $data['donor_email'] ?? null,
                'donor_phone' => $data['donor_phone'] ?? null,
                'donor_message' => $data['donor_message'] ?? null,
                'is_anonymous' => $data['is_anonymous'] ?? false,
                'send_receipt' => $data['send_receipt'] ?? true,
                'success_url' => $data['success_url'] ?? url('/donation/success'),
                'failure_url' => $data['failure_url'] ?? url('/donation/failure'),
                'is_recurring' => $data['is_recurring'] ?? false,
                'recurring_period' => $data['recurring_period'] ?? null,
            ];

            $result = $this->paymentService->createPayment($paymentData);

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating donation: ' . $e->getMessage(), [
                'organization_id' => $organization->id,
                'data' => $data,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Ошибка при создании пожертвования',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Получение статуса платежа
     */
    public function getPaymentStatus(Request $request, string $transactionId)
    {
        try {
            $transaction = PaymentTransaction::where('transaction_id', $transactionId)->firstOrFail();

            return response()->json([
                'success' => true,
                'data' => [
                    'transaction_id' => $transaction->transaction_id,
                    'status' => $transaction->status,
                    'amount' => $transaction->amount,
                    'amount_rubles' => $transaction->amount_rubles,
                    'formatted_amount' => $transaction->formatted_amount,
                    'currency' => $transaction->currency,
                    'payment_method' => $transaction->payment_method_slug,
                    'created_at' => $transaction->created_at->toIso8601String(),
                    'updated_at' => $transaction->updated_at->toIso8601String(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Транзакция не найдена',
            ], 404);
        }
    }

    /**
     * Получение доступных методов оплаты для организации
     */
    public function getPaymentMethods(Organization $organization)
    {
        $organization->loadMissing('yookassaPartnerMerchant');
        $merchant = $organization->yookassaPartnerMerchant;
        $merchantStatus = $merchant?->status ?? 'inactive';
        $hasCredentials = $merchant
            && is_array($merchant->credentials)
            && !empty(data_get($merchant->credentials, 'shop_id'))
            && !empty(data_get($merchant->credentials, 'secret_key'));

        $isOperational = true;
        if ($merchant) {
            $isOperational = $merchantStatus === YooKassaPartnerMerchant::STATUS_ACTIVE || $hasCredentials;
        }

        $methods = PaymentMethod::active()->ordered()->get()->map(function ($method) use ($isOperational) {
            return [
                'id' => $method->id,
                'name' => $method->name,
                'slug' => $method->slug,
                'icon' => $method->icon,
                'description' => $method->description,
                'min_amount' => $method->min_amount,
                'max_amount' => $method->max_amount,
                'min_amount_rubles' => $method->min_amount / 100,
                'max_amount_rubles' => $method->max_amount > 0 ? $method->max_amount / 100 : null,
                'available' => $isOperational,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $methods,
        ]);
    }

    /**
     * Публичные методы оплаты (для главного сайта, без организации)
     */
    public function getPaymentMethodsPublic()
    {
        $methods = PaymentMethod::active()->ordered()->get()->map(function ($method) {
            return [
                'id' => $method->id,
                'name' => $method->name,
                'slug' => $method->slug,
                'icon' => $method->icon,
                'description' => $method->description,
                'min_amount' => $method->min_amount,
                'max_amount' => $method->max_amount,
                'min_amount_rubles' => $method->min_amount / 100,
                'max_amount_rubles' => $method->max_amount > 0 ? $method->max_amount / 100 : null,
                'available' => true,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $methods,
        ]);
    }

    /**
     * Получение списка сборов средств организации
     */
    public function getFundraisers(Organization $organization)
    {
        $fundraisers = Fundraiser::where('organization_id', $organization->id)
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($fundraiser) {
                return [
                    'id' => $fundraiser->id,
                    'title' => $fundraiser->title,
                    'short_description' => $fundraiser->short_description,
                    'target_amount' => $fundraiser->target_amount,
                    'collected_amount' => $fundraiser->collected_amount,
                    'progress_percentage' => $fundraiser->progress_percentage,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $fundraisers,
        ]);
    }

    /**
     * Получение списка проектов организации
     */
    public function getProjects(Organization $organization)
    {
        $projects = Project::where('organization_id', $organization->id)
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'description' => $project->description,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $projects,
        ]);
    }
}

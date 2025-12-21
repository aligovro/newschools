<?php

namespace App\Services\Payment;

use App\Models\PaymentMethod;
use App\Models\PaymentTransaction;
use App\Models\PaymentLog;
use App\Models\Donation;
use App\Models\Organization;
use App\Models\Fundraiser;
use App\Models\Project;
use App\Models\ProjectStage;
use App\Models\Payments\YooKassaPartnerMerchant;
use App\Models\Site;
use App\Support\Money;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    /**
     * Создание платежа
     */
    public function createPayment(array $data): array
    {
        DB::beginTransaction();

        try {
            // Валидация данных
            $this->validatePaymentData($data);

            $organization = Organization::with(['yookassaPartnerMerchant', 'settings'])->findOrFail($data['organization_id']);

            // Получаем метод платежа
            $paymentMethod = PaymentMethod::where('slug', $data['payment_method_slug'])
                ->where('is_active', true)
                ->firstOrFail();

            $organizationPaymentSettings = $this->getOrganizationPaymentSettings($organization);

            // Определяем провайдера платежей
            $paymentProvider = $this->resolvePaymentProvider($organization, $organizationPaymentSettings, $paymentMethod, $data);

            $gatewayPaymentMethod = $this->applyProviderCredentials(
                clone $paymentMethod,
                $paymentProvider,
                $organizationPaymentSettings,
                $data
            );

            // Подготавливаем payment_details с информацией о регулярных пожертвованиях
            $paymentDetails = $data['payment_details'] ?? [];
            if (isset($data['is_recurring']) && $data['is_recurring']) {
                $paymentDetails['is_recurring'] = true;
                if (isset($data['recurring_period'])) {
                    $paymentDetails['recurring_period'] = $data['recurring_period'];
                }
            }
            // Сохраняем данные донора в payment_details
            if (isset($data['donor_name'])) {
                $paymentDetails['donor_name'] = $data['donor_name'];
            }
            if (isset($data['donor_email'])) {
                $paymentDetails['donor_email'] = $data['donor_email'];
            }
            if (isset($data['donor_phone'])) {
                $paymentDetails['donor_phone'] = $data['donor_phone'];
            }
            if (isset($data['donor_message'])) {
                $paymentDetails['donor_message'] = $data['donor_message'];
            }
            if (isset($data['is_anonymous'])) {
                $paymentDetails['is_anonymous'] = $data['is_anonymous'];
            }

            // Создаем транзакцию
            $transaction = PaymentTransaction::create([
                'organization_id' => $data['organization_id'],
                'fundraiser_id' => $data['fundraiser_id'] ?? null,
                'project_id' => $data['project_id'] ?? null,
                'project_stage_id' => $data['project_stage_id'] ?? null,
                'payment_method_id' => $paymentMethod->id,
                'transaction_id' => PaymentTransaction::generateTransactionId(),
                'amount' => $data['amount'],
                'currency' => $data['currency'] ?? 'RUB',
                'status' => PaymentTransaction::STATUS_PENDING,
                'payment_method_slug' => $paymentMethod->slug,
                'payment_provider' => $paymentProvider,
                'description' => $data['description'] ?? null,
                'return_url' => $data['return_url'] ?? null,
                'success_url' => $data['success_url'] ?? null,
                'failure_url' => $data['failure_url'] ?? null,
                'payment_details' => !empty($paymentDetails) ? $paymentDetails : null,
                'expires_at' => now()->addHours(24), // Платеж действителен 24 часа
            ]);

            // Создаем шлюз и инициируем платеж
            // Если есть авторизованный партнерский мерчант, передаем его в фабрику
            $partnerMerchant = $organization->yookassaPartnerMerchant;
            $gateway = PaymentGatewayFactory::createForProvider($paymentProvider, $gatewayPaymentMethod, $partnerMerchant);
            $paymentResult = $gateway->createPayment($transaction);

            if ($paymentResult['success']) {
                $qrCode = $paymentResult['qr_code'] ?? null;
                $qrCodeSvg = null;
                if (is_string($qrCode) && $qrCode !== '') {
                    $qrCodeSvg = $this->generateQrSvg($qrCode);
                }

                // Обновляем транзакцию с данными от шлюза
                $transaction->update([
                    'external_id' => $paymentResult['payment_id'] ?? null,
                    'gateway_response' => $paymentResult,
                ]);

                DB::commit();

                PaymentLog::createLog(
                    $transaction->id,
                    PaymentLog::ACTION_CREATED,
                    'Платеж успешно создан',
                    PaymentLog::LEVEL_INFO,
                    [
                        'gateway' => $gateway->getName(),
                        'amount' => $transaction->amount,
                        'amount_rubles' => Money::toRubles($transaction->amount),
                    ]
                );

                if ($gatewayPaymentMethod->is_test_mode) {
                    $this->completeTestPayment($transaction);
                }

                return [
                    'success' => true,
                    'transaction_id' => $transaction->transaction_id,
                    'payment_id' => $paymentResult['payment_id'] ?? null,
                    'redirect_url' => $paymentResult['redirect_url'] ?? null,
                    'qr_code' => $qrCode,
                    'qr_code_svg' => $qrCodeSvg,
                    'deep_link' => $paymentResult['deep_link'] ?? null,
                    'confirmation_url' => $paymentResult['confirmation_url'] ?? null,
                ];
            } else {
                // Обновляем статус транзакции на неудачный
                $transaction->update([
                    'status' => PaymentTransaction::STATUS_FAILED,
                    'failed_at' => now(),
                    'gateway_response' => $paymentResult,
                ]);

                DB::commit();

                PaymentLog::createErrorLog(
                    $transaction->id,
                    PaymentLog::ACTION_FAILED,
                    'Ошибка создания платежа: ' . ($paymentResult['error'] ?? 'Неизвестная ошибка'),
                    ['gateway' => $gateway->getName()]
                );

                return [
                    'success' => false,
                    'error' => $paymentResult['error'] ?? 'Неизвестная ошибка',
                ];
            }
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Payment creation failed', [
                'error' => $e->getMessage(),
                'data' => $data,
            ]);

            return [
                'success' => false,
                'error' => 'Ошибка создания платежа: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Обработка webhook'а
     */
    public function handleWebhook(string $gatewaySlug, Request $request): array
    {
        try {
            $gateway = PaymentGatewayFactory::createBySlug($gatewaySlug);
            return $gateway->handleWebhook($request);
        } catch (\Exception $e) {
            Log::error('Webhook handling failed', [
                'gateway' => $gatewaySlug,
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            return [
                'success' => false,
                'error' => 'Ошибка обработки webhook: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Получение статуса платежа
     */
    public function getPaymentStatus(string $transactionId): array
    {
        try {
            $transaction = PaymentTransaction::where('transaction_id', $transactionId)->firstOrFail();

            // Проверяем статус в шлюзе, если есть external_id
            // Проверяем для всех статусов, не только pending, чтобы синхронизировать состояние
            if ($transaction->external_id) {
                $transaction->loadMissing('paymentMethod');

                if ($transaction->paymentMethod) {
                    $organization = $transaction->organization()->with(['yookassaPartnerMerchant', 'settings'])->first();
                    $organizationSettings = $this->getOrganizationPaymentSettings($organization);

                    $gatewayPaymentMethod = $this->applyProviderCredentials(
                        clone $transaction->paymentMethod,
                        $transaction->payment_provider ?? PaymentGatewayFactory::guessProviderFromGatewayClass(
                            $transaction->paymentMethod->gateway
                        ),
                        $organizationSettings
                    );

                    $partnerMerchant = $organization->yookassaPartnerMerchant;
                    $gateway = PaymentGatewayFactory::createForProvider(
                        $transaction->payment_provider ?? PaymentGatewayFactory::guessProviderFromGatewayClass(
                            $transaction->paymentMethod->gateway
                        ),
                        $gatewayPaymentMethod,
                        $partnerMerchant
                    );

                    try {
                        $externalStatus = $gateway->getPaymentStatus($transaction->external_id);
                        $oldStatus = $transaction->status;

                        if ($externalStatus !== $transaction->status) {
                            $updateData = ['status' => $externalStatus];

                            // Обновляем дату оплаты при успешном платеже
                            if ($externalStatus === PaymentTransaction::STATUS_COMPLETED && !$transaction->paid_at) {
                                $updateData['paid_at'] = now();
                            }

                            // Обновляем дату ошибки при неуспешном платеже
                            if (in_array($externalStatus, [PaymentTransaction::STATUS_FAILED, PaymentTransaction::STATUS_CANCELLED]) && !$transaction->failed_at) {
                                $updateData['failed_at'] = now();
                            }

                            $transaction->update($updateData);
                            $transaction->refresh(); // Обновляем объект после сохранения

                            Log::info('Transaction status updated from gateway', [
                                'transaction_id' => $transaction->transaction_id,
                                'old_status' => $oldStatus,
                                'new_status' => $externalStatus,
                                'organization_id' => $transaction->organization_id,
                            ]);
                        }
                    } catch (\Exception $e) {
                        Log::warning('Failed to check payment status from gateway', [
                            'transaction_id' => $transaction->transaction_id,
                            'external_id' => $transaction->external_id,
                            'error' => $e->getMessage(),
                        ]);
                        // Продолжаем выполнение, возвращаем текущий статус транзакции
                    }
                }
            }

            // Обновляем объект транзакции перед возвратом
            $transaction->refresh();

            return [
                'success' => true,
                'transaction_id' => $transaction->transaction_id,
                'status' => $transaction->status,
                'amount' => $transaction->amount,
                'amount_rubles' => Money::toRubles($transaction->amount),
                'formatted_amount' => Money::format($transaction->amount, $transaction->currency ?? 'RUB'),
                'currency' => $transaction->currency,
                'created_at' => $transaction->created_at,
                'paid_at' => $transaction->paid_at,
                'failed_at' => $transaction->failed_at,
                'is_expired' => $transaction->isExpired(),
            ];
        } catch (\Exception $e) {
            Log::error('Payment status check failed', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Ошибка получения статуса платежа: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Отмена платежа
     */
    public function cancelPayment(string $transactionId): array
    {
        try {
            $transaction = PaymentTransaction::where('transaction_id', $transactionId)->firstOrFail();

            if (!$transaction->isPending()) {
                return [
                    'success' => false,
                    'error' => 'Платеж не может быть отменен',
                ];
            }

            $transaction->loadMissing('paymentMethod');

            if (!$transaction->paymentMethod) {
                throw new \RuntimeException('Payment method is missing for transaction ' . $transaction->transaction_id);
            }

            $organization = $transaction->organization()->with(['yookassaPartnerMerchant', 'settings'])->first();
            $organizationSettings = $this->getOrganizationPaymentSettings($organization);

            $gatewayPaymentMethod = $this->applyProviderCredentials(
                clone $transaction->paymentMethod,
                $transaction->payment_provider ?? PaymentGatewayFactory::guessProviderFromGatewayClass(
                    $transaction->paymentMethod->gateway
                ),
                $organizationSettings
            );

            $partnerMerchant = $organization->yookassaPartnerMerchant;
            $gateway = PaymentGatewayFactory::createForProvider(
                $transaction->payment_provider ?? PaymentGatewayFactory::guessProviderFromGatewayClass(
                    $transaction->paymentMethod->gateway
                ),
                $gatewayPaymentMethod,
                $partnerMerchant
            );
            $cancelled = $gateway->cancelPayment($transaction->external_id);

            if ($cancelled) {
                $transaction->update([
                    'status' => PaymentTransaction::STATUS_CANCELLED,
                    'failed_at' => now(),
                ]);

                PaymentLog::createLog(
                    $transaction->id,
                    PaymentLog::ACTION_CANCELLED,
                    'Платеж отменен'
                );

                return [
                    'success' => true,
                    'message' => 'Платеж успешно отменен',
                ];
            } else {
                return [
                    'success' => false,
                    'error' => 'Не удалось отменить платеж в платежной системе',
                ];
            }
        } catch (\Exception $e) {
            Log::error('Payment cancellation failed', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Ошибка отмены платежа: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Возврат платежа
     */
    public function refundPayment(string $transactionId, int $amount = null): array
    {
        try {
            $transaction = PaymentTransaction::where('transaction_id', $transactionId)->firstOrFail();

            if (!$transaction->isCompleted()) {
                return [
                    'success' => false,
                    'error' => 'Можно вернуть только завершенные платежи',
                ];
            }

            $refundAmount = $amount ?? $transaction->amount;

            if ($refundAmount > $transaction->amount) {
                return [
                    'success' => false,
                    'error' => 'Сумма возврата не может превышать сумму платежа',
                ];
            }

            $transaction->loadMissing('paymentMethod');

            if (!$transaction->paymentMethod) {
                throw new \RuntimeException('Payment method is missing for transaction ' . $transaction->transaction_id);
            }

            $organization = $transaction->organization()->with(['yookassaPartnerMerchant', 'settings'])->first();
            $organizationSettings = $this->getOrganizationPaymentSettings($organization);

            $gatewayPaymentMethod = $this->applyProviderCredentials(
                clone $transaction->paymentMethod,
                $transaction->payment_provider ?? PaymentGatewayFactory::guessProviderFromGatewayClass(
                    $transaction->paymentMethod->gateway
                ),
                $organizationSettings
            );

            $partnerMerchant = $organization->yookassaPartnerMerchant;
            $gateway = PaymentGatewayFactory::createForProvider(
                $transaction->payment_provider ?? PaymentGatewayFactory::guessProviderFromGatewayClass(
                    $transaction->paymentMethod->gateway
                ),
                $gatewayPaymentMethod,
                $partnerMerchant
            );
            $refunded = $gateway->refundPayment($transaction->external_id, $refundAmount);

            if ($refunded) {
                $newStatus = $refundAmount === $transaction->amount
                    ? PaymentTransaction::STATUS_REFUNDED
                    : PaymentTransaction::STATUS_COMPLETED;

                $transaction->update([
                    'status' => $newStatus,
                    'refunded_at' => now(),
                ]);

                PaymentLog::createLog(
                    $transaction->id,
                    PaymentLog::ACTION_REFUNDED,
                    "Возврат платежа на сумму {$refundAmount} копеек"
                );

                return [
                    'success' => true,
                    'message' => 'Возврат успешно выполнен',
                    'refunded_amount' => $refundAmount,
                    'refunded_amount_rubles' => Money::toRubles($refundAmount),
                    'refunded_amount_formatted' => Money::format($refundAmount, $transaction->currency ?? 'RUB'),
                ];
            } else {
                return [
                    'success' => false,
                    'error' => 'Не удалось выполнить возврат в платежной системе',
                ];
            }
        } catch (\Exception $e) {
            Log::error('Payment refund failed', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Ошибка возврата платежа: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Определяем провайдера платежей для организации.
     */
    protected function resolvePaymentProvider(Organization $organization, array $organizationPaymentSettings, PaymentMethod $paymentMethod, array $data): string
    {
        if (!empty($data['payment_provider']) && is_string($data['payment_provider'])) {
            return strtolower($data['payment_provider']);
        }

        $merchant = $organization->yookassaPartnerMerchant;
        if ($merchant && $merchant->status === YooKassaPartnerMerchant::STATUS_ACTIVE) {
            $credentials = $merchant->credentials ?? [];
            $accessToken = $credentials['access_token'] ?? null;
            // Если есть OAuth токен, используем Partner API
            if ($accessToken) {
                return 'yookassa';
            }
        }

        if (!empty($organizationPaymentSettings['enabled_gateways'][0])) {
            return strtolower((string) $organizationPaymentSettings['enabled_gateways'][0]);
        }

        return PaymentGatewayFactory::guessProviderFromGatewayClass($paymentMethod->gateway);
    }

    protected function getOrganizationPaymentSettings(?Organization $organization): array
    {
        if ($organization && $organization->yookassaPartnerMerchant && $organization->yookassaPartnerMerchant->credentials) {
            $merchant = $organization->yookassaPartnerMerchant;
            $credentials = is_array($merchant->credentials) ? $merchant->credentials : [];
            $merchantSettings = is_array($merchant->settings) ? $merchant->settings : [];
            $isTestMode = (bool) data_get($merchantSettings, 'is_test_mode', data_get($credentials, 'is_test_mode', false));

            return [
                'credentials' => [
                    'yookassa' => $credentials,
                ],
                'options' => [
                    'yookassa' => [
                        'is_test_mode' => $isTestMode,
                    ],
                ],
                'enabled_gateways' => ['yookassa'],
                'test_mode' => $isTestMode,
            ];
        }

        $raw = $organization?->settings?->payment_settings;

        if (!is_array($raw)) {
            return [];
        }

        return (new PaymentSettingsNormalizer())->normalize($raw);
    }

    protected function applyProviderCredentials(PaymentMethod $paymentMethod, string $provider, array $organizationSettings, array $requestData = []): PaymentMethod
    {
        $settings = $paymentMethod->settings ?? [];

        $credentials = $organizationSettings['credentials'][$provider] ?? null;
        if (is_array($credentials)) {
            $settings = array_replace_recursive($settings, $credentials);
        }

        $options = $organizationSettings['options'][$provider] ?? null;
        if (is_array($options)) {
            $settings = array_replace_recursive($settings, $options);
        }

        if (!empty($requestData['gateway_overrides']) && is_array($requestData['gateway_overrides'])) {
            $settings = array_replace_recursive($settings, $requestData['gateway_overrides']);
        }

        $paymentMethod->setAttribute('settings', $settings);
        $testMode = $organizationSettings['test_mode'] ?? $paymentMethod->is_test_mode ?? false;
        if (isset($organizationSettings['options'][$provider]['is_test_mode'])) {
            $testMode = filter_var($organizationSettings['options'][$provider]['is_test_mode'], FILTER_VALIDATE_BOOLEAN);
        } elseif (isset($settings['is_test_mode'])) {
            $testMode = filter_var($settings['is_test_mode'], FILTER_VALIDATE_BOOLEAN);
        }

        $paymentMethod->setAttribute('is_test_mode', (bool) $testMode);

        return $paymentMethod;
    }

    protected function completeTestPayment(PaymentTransaction $transaction): void
    {
        DB::transaction(function () use ($transaction) {
            $transaction->refresh();

            $testMeta = [
                'test_mode' => true,
                'auto_completed_at' => now()->toIso8601String(),
                'amount' => $transaction->amount,
                'amount_rubles' => Money::toRubles($transaction->amount),
            ];

            if (!$transaction->isCompleted()) {
                $transaction->update([
                    'status' => PaymentTransaction::STATUS_COMPLETED,
                    'paid_at' => $transaction->paid_at ?? now(),
                    'gateway_response' => array_replace_recursive(
                        $transaction->gateway_response ?? [],
                        ['test' => $testMeta]
                    ),
                ]);

                PaymentLog::createLog(
                    $transaction->id,
                    PaymentLog::ACTION_COMPLETED,
                    'Тестовый платеж автоматически помечен как оплаченный',
                    PaymentLog::LEVEL_INFO,
                    $testMeta
                );
            } else {
                $transaction->update([
                    'gateway_response' => array_replace_recursive(
                        $transaction->gateway_response ?? [],
                        ['test' => $testMeta]
                    ),
                ]);
            }

            $this->ensureDonationForTransaction($transaction);
        });
    }

    public function ensureDonationForTransaction(PaymentTransaction $transaction): void
    {
        DB::transaction(function () use ($transaction) {
            $transaction->refresh();

            if (!$transaction->isCompleted()) {
                Log::info('Transaction is not completed, skipping donation creation', [
                    'transaction_id' => $transaction->id,
                    'transaction_status' => $transaction->status,
                ]);
                return;
            }

            $existingDonation = Donation::where('payment_transaction_id', $transaction->id)->first();

            if ($existingDonation) {
                Log::info('Donation already exists for transaction', [
                    'transaction_id' => $transaction->id,
                    'donation_id' => $existingDonation->id,
                ]);

                return;
            }

            try {
                $donation = $this->createDonation($transaction);

                Log::info('Donation created successfully', [
                    'transaction_id' => $transaction->id,
                    'donation_id' => $donation->id,
                    'amount' => $transaction->amount,
                    'organization_id' => $transaction->organization_id,
                ]);

                $this->updateDonationAggregates($transaction);

                PaymentLog::createLog(
                    $transaction->id,
                    PaymentLog::ACTION_COMPLETED,
                    'Донат создан на основе успешного платежа',
                    PaymentLog::LEVEL_INFO,
                    [
                        'donation_id' => $donation->id,
                        'amount' => $transaction->amount,
                        'amount_rubles' => Money::toRubles($transaction->amount),
                    ]
                );
            } catch (\Exception $e) {
                Log::error('Failed to create donation from transaction', [
                    'transaction_id' => $transaction->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                throw $e;
            }
        });
    }

    protected function updateDonationAggregates(PaymentTransaction $transaction): void
    {
        $transaction->loadMissing('project', 'fundraiser', 'organization');

        try {
            // Обновляем агрегаты проекта
            if ($transaction->project) {
                $projectDonations = $transaction->project->donations()->completed();
                $transaction->project->update([
                    'collected_amount' => $projectDonations->sum('amount'),
                    'donations_count' => $projectDonations->count(),
                ]);

                Log::info('Project aggregates updated', [
                    'project_id' => $transaction->project->id,
                    'collected_amount' => $projectDonations->sum('amount'),
                    'donations_count' => $projectDonations->count(),
                ]);
            }

            // Обновляем агрегаты фандрайзера
            if ($transaction->fundraiser) {
                $fundraiserDonations = $transaction->fundraiser->donations()->completed();
                $transaction->fundraiser->update([
                    'collected_amount' => $fundraiserDonations->sum('amount'),
                ]);

                Log::info('Fundraiser aggregates updated', [
                    'fundraiser_id' => $transaction->fundraiser->id,
                    'collected_amount' => $fundraiserDonations->sum('amount'),
                ]);
            }

            // Обновляем агрегаты организации (needs_collected_amount)
            // Это сумма всех завершенных донатов организации
            if ($transaction->organization) {
                $organizationDonations = $transaction->organization->donations()
                    ->where('status', 'completed')
                    ->sum('amount');

                $transaction->organization->update([
                    'needs_collected_amount' => $organizationDonations,
                ]);

                // Очищаем кэш виджета для этой организации
                Cache::forget("donation_widget_subscribers_count_{$transaction->organization->id}");

                // Очищаем кеш виджетов всех сайтов организации
                $organization = $transaction->organization;
                $sites = Site::where('organization_id', $organization->id)->pluck('id');
                foreach ($sites as $siteId) {
                    Cache::forget("site_widgets_config_{$siteId}");
                    Cache::forget("site_widget_settings_{$siteId}");
                }

                Log::info('Organization aggregates updated', [
                    'organization_id' => $transaction->organization->id,
                    'needs_collected_amount' => $organizationDonations,
                    'sites_cache_cleared' => $sites->count(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('Failed to update donation aggregates', [
                'transaction_id' => $transaction->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Создание доната после успешного платежа
     */
    public function createDonation(PaymentTransaction $transaction): Donation
    {
        $donation = Donation::create([
            'organization_id' => $transaction->organization_id,
            'fundraiser_id' => $transaction->fundraiser_id,
            'project_id' => $transaction->project_id,
            'project_stage_id' => $transaction->project_stage_id,
            'payment_transaction_id' => $transaction->id,
            'amount' => $transaction->amount,
            'currency' => $transaction->currency,
            'status' => 'completed',
            'payment_method' => $transaction->payment_method_slug,
            'payment_id' => $transaction->external_id,
            'transaction_id' => $transaction->transaction_id,
            'is_anonymous' => $transaction->payment_details['is_anonymous'] ?? false,
            'donor_name' => $transaction->payment_details['donor_name'] ?? null,
            'donor_email' => $transaction->payment_details['donor_email'] ?? null,
            'donor_phone' => $transaction->payment_details['donor_phone'] ?? null,
            'donor_message' => $transaction->payment_details['donor_message'] ?? null,
            'send_receipt' => $transaction->payment_details['send_receipt'] ?? true,
            'payment_details' => $transaction->payment_details,
            'webhook_data' => $transaction->webhook_data,
            'paid_at' => $transaction->paid_at,
            // переносим реферера, если был захвачен при создании платежа
            'referrer_user_id' => $transaction->payment_details['referrer_user_id'] ?? null,
        ]);

        // Сбрасываем кеш количества подписчиков для организации
        // Проверяем, является ли это регулярным пожертвованием
        $isRecurring = isset($transaction->payment_details['is_recurring'])
            && ($transaction->payment_details['is_recurring'] === true
                || $transaction->payment_details['is_recurring'] === 'true'
                || $transaction->payment_details['is_recurring'] === 1)
            || isset($transaction->payment_details['recurring_period']);

        if ($isRecurring) {
            Cache::forget("donation_widget_subscribers_count_{$transaction->organization_id}");
        }

        return $donation;
    }

    /**
     * Валидация данных платежа
     */
    private function validatePaymentData(array $data): void
    {
        $required = ['organization_id', 'amount', 'payment_method_slug'];

        foreach ($required as $field) {
            if (!isset($data[$field])) {
                throw new \InvalidArgumentException("Required field missing: {$field}");
            }
        }

        // Проверяем организацию
        Organization::findOrFail($data['organization_id']);

        // Проверяем фандрайзер или проект
        if (isset($data['fundraiser_id'])) {
            Fundraiser::findOrFail($data['fundraiser_id']);
        }

        if (isset($data['project_id'])) {
            Project::findOrFail($data['project_id']);
        }

        if (isset($data['project_stage_id'])) {
            $stage = ProjectStage::with('project')->findOrFail($data['project_stage_id']);

            if (isset($data['project_id']) && (int) $stage->project_id !== (int) $data['project_id']) {
                throw new \InvalidArgumentException('Project stage does not belong to the specified project');
            }

            if ($stage->project && (int) $stage->project->organization_id !== (int) $data['organization_id']) {
                throw new \InvalidArgumentException('Project stage does not belong to the specified organization');
            }
        }

        // Проверяем сумму
        if ($data['amount'] <= 0) {
            throw new \InvalidArgumentException('Amount must be positive');
        }
    }

    /**
     * Получение доступных методов платежа
     */
    public function getAvailablePaymentMethods(): array
    {
        return PaymentGatewayFactory::getAvailablePaymentMethods();
    }

    /**
     * Получение статистики платежей
     */
    public function getPaymentStatistics(int $organizationId, array $filters = []): array
    {
        $query = PaymentTransaction::forOrganization($organizationId);

        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $transactions = $query->get();

        $totalAmount = $transactions->sum('amount');
        $completedAmount = $transactions
            ->where('status', PaymentTransaction::STATUS_COMPLETED)
            ->sum('amount');

        return [
            'total_transactions' => $transactions->count(),
            'total_amount' => $totalAmount,
            'total_amount_rubles' => Money::toRubles($totalAmount),
            'total_amount_formatted' => Money::format($totalAmount),
            'completed_transactions' => $transactions->where('status', PaymentTransaction::STATUS_COMPLETED)->count(),
            'completed_amount' => $completedAmount,
            'completed_amount_rubles' => Money::toRubles($completedAmount),
            'completed_amount_formatted' => Money::format($completedAmount),
            'failed_transactions' => $transactions->where('status', PaymentTransaction::STATUS_FAILED)->count(),
            'pending_transactions' => $transactions->where('status', PaymentTransaction::STATUS_PENDING)->count(),
            'by_payment_method' => $transactions->groupBy('payment_method_slug')->map(function ($group) {
                $sum = $group->sum('amount');
                $completedSum = $group
                    ->where('status', PaymentTransaction::STATUS_COMPLETED)
                    ->sum('amount');

                return [
                    'count' => $group->count(),
                    'amount' => $sum,
                    'amount_rubles' => Money::toRubles($sum),
                    'amount_formatted' => Money::format($sum),
                    'completed_count' => $group->where('status', PaymentTransaction::STATUS_COMPLETED)->count(),
                    'completed_amount' => $completedSum,
                    'completed_amount_rubles' => Money::toRubles($completedSum),
                    'completed_amount_formatted' => Money::format($completedSum),
                ];
            })->toArray(),
        ];
    }

    /**
     * Генерация SVG-кода QR для переданной строки (ссылки / payload).
     * Используем BaconQrCode, который уже подключен через composer.
     */
    private function generateQrSvg(string $payload): ?string
    {
        try {
            $renderer = new ImageRenderer(
                new RendererStyle(256),
                new SvgImageBackEnd()
            );

            $writer = new Writer($renderer);

            return $writer->writeString($payload);
        } catch (\Throwable $e) {
            Log::error('Failed to generate QR SVG', [
                'payload' => $payload,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }
}

<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Donation;
use App\Models\PaymentTransaction;
use App\Services\Payment\PaymentService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ProcessRecurringDonations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'donations:process-recurring';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Обработка регулярных пожертвований - создание повторных платежей';

    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        parent::__construct();
        $this->paymentService = $paymentService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Начинаем обработку регулярных пожертвований...');

        // Находим все завершенные регулярные пожертвования
        $recurringDonations = $this->getActiveRecurringDonations();

        $this->info("Найдено активных регулярных подписок: " . $recurringDonations->count());

        $processed = 0;
        $created = 0;
        $errors = 0;

        foreach ($recurringDonations as $donation) {
            $processed++;

            try {
                // Проверяем, нужно ли создать следующий платеж
                if ($this->shouldCreateNextPayment($donation)) {
                    $result = $this->createRecurringPayment($donation);

                    if ($result['success']) {
                        $created++;
                        $this->info("✓ Создан платеж для подписки #{$donation->id}");
                    } else {
                        $errors++;
                        $this->error("✗ Ошибка создания платежа для подписки #{$donation->id}: " . ($result['error'] ?? 'Неизвестная ошибка'));
                    }
                }
            } catch (\Exception $e) {
                $errors++;
                $this->error("✗ Исключение при обработке подписки #{$donation->id}: " . $e->getMessage());
                Log::error('Ошибка обработки регулярного пожертвования', [
                    'donation_id' => $donation->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        }

        $this->info("\nОбработка завершена:");
        $this->info("  Обработано: {$processed}");
        $this->info("  Создано платежей: {$created}");
        $this->info("  Ошибок: {$errors}");

        return Command::SUCCESS;
    }

    /**
     * Получить активные регулярные пожертвования
     */
    private function getActiveRecurringDonations()
    {
        return Donation::query()
            ->join('payment_transactions', 'donations.payment_transaction_id', '=', 'payment_transactions.id')
            ->where('donations.status', 'completed')
            ->where('payment_transactions.status', 'completed')
            ->where(function ($query) {
                $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(payment_transactions.payment_details, '$.is_recurring')) = 'true'")
                    ->orWhereRaw("JSON_EXTRACT(payment_transactions.payment_details, '$.is_recurring') = 1")
                    ->orWhereRaw("JSON_EXTRACT(payment_transactions.payment_details, '$.is_recurring') = true")
                    ->orWhereRaw("JSON_EXTRACT(payment_transactions.payment_details, '$.recurring_period') IS NOT NULL");
            })
            ->whereNotNull(DB::raw("JSON_EXTRACT(payment_transactions.payment_details, '$.saved_payment_method_id')"))
            ->select('donations.*')
            ->with(['paymentTransaction', 'organization'])
            ->get()
            ->filter(function ($donation) {
                // Фильтруем только те, у которых есть сохраненный способ оплаты
                $paymentDetails = $donation->paymentTransaction->payment_details ?? [];
                return isset($paymentDetails['saved_payment_method_id']) && !empty($paymentDetails['saved_payment_method_id']);
            });
    }

    /**
     * Проверить, нужно ли создать следующий платеж
     */
    private function shouldCreateNextPayment(Donation $donation): bool
    {
        $paymentDetails = $donation->paymentTransaction->payment_details ?? [];
        $recurringPeriod = $paymentDetails['recurring_period'] ?? null;

        if (!$recurringPeriod) {
            return false;
        }

        // Находим последний платеж по этой подписке
        $lastPayment = $this->getLastPaymentForSubscription($donation);
        
        if (!$lastPayment) {
            // Если нет последнего платежа, используем оригинальный
            $lastPayment = $donation->paymentTransaction;
        }

        $lastPaymentDate = $lastPayment->paid_at ?? $lastPayment->created_at;
        $nextPaymentDate = $this->calculateNextPaymentDate(Carbon::parse($lastPaymentDate), $recurringPeriod);

        // Проверяем, не создан ли уже платеж на эту дату
        $existingPayment = $this->getExistingPaymentForDate($donation, $nextPaymentDate);

        // Если дата следующего платежа наступила и платеж еще не создан
        return $nextPaymentDate->isPast() && !$existingPayment;
    }

    /**
     * Получить последний платеж по подписке
     */
    private function getLastPaymentForSubscription(Donation $originalDonation): ?PaymentTransaction
    {
        $paymentDetails = $originalDonation->paymentTransaction->payment_details ?? [];
        $savedPaymentMethodId = $paymentDetails['saved_payment_method_id'] ?? null;

        if (!$savedPaymentMethodId) {
            return $originalDonation->paymentTransaction;
        }

        // Находим последний платеж с тем же saved_payment_method_id
        return PaymentTransaction::query()
            ->where('organization_id', $originalDonation->organization_id)
            ->whereRaw("JSON_EXTRACT(payment_details, '$.saved_payment_method_id') = ?", [$savedPaymentMethodId])
            ->where('status', 'completed')
            ->orderBy('paid_at', 'desc')
            ->orderBy('created_at', 'desc')
            ->first();
    }

    /**
     * Вычислить дату следующего платежа
     */
    private function calculateNextPaymentDate(Carbon $lastPaymentDate, string $period): Carbon
    {
        return match ($period) {
            'daily' => $lastPaymentDate->copy()->addDay(),
            'weekly' => $lastPaymentDate->copy()->addWeek(),
            'monthly' => $lastPaymentDate->copy()->addMonth(),
            default => $lastPaymentDate->copy()->addMonth(),
        };
    }

    /**
     * Проверить, существует ли уже платеж на эту дату
     */
    private function getExistingPaymentForDate(Donation $donation, Carbon $date): ?PaymentTransaction
    {
        $paymentDetails = $donation->paymentTransaction->payment_details ?? [];
        $savedPaymentMethodId = $paymentDetails['saved_payment_method_id'] ?? null;

        if (!$savedPaymentMethodId) {
            return null;
        }

        // Проверяем, есть ли платеж с тем же saved_payment_method_id в этот день
        return PaymentTransaction::query()
            ->where('organization_id', $donation->organization_id)
            ->whereRaw("JSON_EXTRACT(payment_details, '$.saved_payment_method_id') = ?", [$savedPaymentMethodId])
            ->whereDate('created_at', $date->toDateString())
            ->where('status', '!=', 'cancelled')
            ->first();
    }

    /**
     * Создать повторный платеж
     */
    private function createRecurringPayment(Donation $originalDonation): array
    {
        $originalTransaction = $originalDonation->paymentTransaction;
        $paymentDetails = $originalTransaction->payment_details ?? [];
        $savedPaymentMethodId = $paymentDetails['saved_payment_method_id'] ?? null;

        if (!$savedPaymentMethodId) {
            return [
                'success' => false,
                'error' => 'Отсутствует saved_payment_method_id',
            ];
        }

        // Подготавливаем данные для нового платежа
        $paymentData = [
            'organization_id' => $originalDonation->organization_id,
            'fundraiser_id' => $originalDonation->fundraiser_id,
            'project_id' => $originalDonation->project_id,
            'project_stage_id' => $originalDonation->project_stage_id,
            'payment_method_slug' => $originalTransaction->payment_method_slug,
            'amount' => $originalDonation->amount,
            'currency' => $originalDonation->currency,
            'description' => $originalDonation->is_anonymous
                ? 'Регулярное анонимное пожертвование'
                : "Регулярное пожертвование от {$originalDonation->donor_name}",
            'donor_name' => $originalDonation->is_anonymous ? 'Анонимный донор' : $originalDonation->donor_name,
            'donor_email' => $originalDonation->donor_email,
            'donor_phone' => $originalDonation->donor_phone,
            'donor_message' => $originalDonation->donor_message,
            'is_anonymous' => $originalDonation->is_anonymous,
            'send_receipt' => $originalDonation->send_receipt,
            'is_recurring' => true,
            'recurring_period' => $paymentDetails['recurring_period'] ?? null,
            'payment_details' => [
                'is_recurring' => true,
                'recurring_period' => $paymentDetails['recurring_period'] ?? null,
                'saved_payment_method_id' => $savedPaymentMethodId,
                'original_donation_id' => $originalDonation->id,
                'original_transaction_id' => $originalTransaction->id,
            ],
            'success_url' => url('/donation/success'),
            'failure_url' => url('/donation/failure'),
        ];

        try {
            $result = $this->paymentService->createPayment($paymentData);

            if ($result['success']) {
                Log::info('Создан повторный платеж для регулярного пожертвования', [
                    'original_donation_id' => $originalDonation->id,
                    'new_transaction_id' => $result['transaction_id'] ?? null,
                ]);
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('Ошибка создания повторного платежа', [
                'original_donation_id' => $originalDonation->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}


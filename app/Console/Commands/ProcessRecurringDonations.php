<?php

namespace App\Console\Commands;

use App\Models\Donation;
use App\Services\Recurring\RecurringPaymentProcessor;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessRecurringDonations extends Command
{
    protected $signature = 'donations:process-recurring
        {--dry-run : Только показать, какие платежи были бы созданы, без реального списания}';

    protected $description = 'Обработка регулярных пожертвований - создание повторных платежей';

    public function __construct(
        private readonly RecurringPaymentProcessor $processor
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');
        if ($dryRun) {
            $this->warn('Режим DRY-RUN: реальные платежи НЕ создаются.');
        }

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
                if ($this->processor->shouldCreateNextPayment($donation)) {
                    if ($dryRun) {
                        $amountRub = round(($donation->amount ?? 0) / 100, 2);
                        $this->line("  [DRY-RUN] Подписка #{$donation->id}: сумма {$amountRub} ₽, org_id={$donation->organization_id}");
                        $created++;
                        continue;
                    }

                    $result = $this->processor->createRecurringPayment($donation);

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
            ->whereNotNull(DB::raw("JSON_UNQUOTE(JSON_EXTRACT(payment_transactions.payment_details, '$.saved_payment_method_id'))"))
            ->where(DB::raw("JSON_UNQUOTE(JSON_EXTRACT(payment_transactions.payment_details, '$.saved_payment_method_id'))"), '!=', '')
            ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(payment_transactions.payment_details, '$.saved_payment_method_id')) NOT LIKE 'legacy_%'")
            ->select('donations.*')
            ->with(['paymentTransaction', 'organization'])
            ->get()
            ->filter(function ($donation) {
                $paymentDetails = $donation->paymentTransaction->payment_details ?? [];
                $savedId = $paymentDetails['saved_payment_method_id'] ?? '';
                return $savedId !== '' && strpos($savedId, 'legacy_') !== 0;
            });
    }
}


<?php

namespace App\Console\Commands;

use App\Models\Donation;
use App\Services\Recurring\RecurringPaymentProcessor;
use App\Support\PhoneNumber;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Тестовый автоплатеж: один раз за запуск, только для указанного номера телефона.
 * Не затрагивает остальные подписки. Запуск: раз в сутки по крону или вручную.
 */
class ProcessRecurringDonationsTestCommand extends Command
{
    protected $signature = 'donations:process-recurring-test
        {--phone= : Номер телефона (иначе из config payments.recurring.autopayment_test_phone)}
        {--dry-run : Только проверить, без создания платежа}';

    protected $description = 'Тестовый автоплатеж по одному номеру телефона (раз в сутки или вручную)';

    public function __construct(
        private readonly RecurringPaymentProcessor $processor
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $phone = $this->option('phone') ?: (config('payments.recurring.autopayment_test_phone') ?? '');

        if ($phone === '') {
            $this->comment('Тестовый автоплатеж отключён: не задан AUTOPAYMENT_TEST_PHONE и не передан --phone.');
            return Command::SUCCESS;
        }

        $variants = $this->phoneMatchVariants($phone);
        if (empty($variants)) {
            $this->warn("Некорректный номер: {$phone}");
            return Command::FAILURE;
        }

        $donation = $this->findRecurringDonationByPhone($variants);
        if (!$donation) {
            $this->comment('Подписка для указанного номера не найдена или не активна.');
            return Command::SUCCESS;
        }

        if ($this->option('dry-run')) {
            $amountRub = round($donation->amount / 100, 2);
            $this->line("[DRY-RUN] Был бы создан платёж: donation #{$donation->id}, {$amountRub} ₽");
            return Command::SUCCESS;
        }

        if (!$this->processor->shouldCreateNextPayment($donation)) {
            $this->comment('Следующий платёж по расписанию ещё не положен (уже был сегодня или период не наступил).');
            return Command::SUCCESS;
        }

        $result = $this->processor->createRecurringPayment($donation);

        if ($result['success']) {
            $this->info("✓ Создан тестовый платёж для подписки #{$donation->id}");
            return Command::SUCCESS;
        }

        $this->error('Ошибка: ' . ($result['error'] ?? 'неизвестная'));
        return Command::FAILURE;
    }

    /**
     * Варианты номера для поиска в БД (нормализованный и типичные формы).
     *
     * @return array<int, string>
     */
    private function phoneMatchVariants(string $input): array
    {
        $normalized = PhoneNumber::normalize($input);
        if ($normalized === null) {
            return [];
        }

        $digits = preg_replace('/\D+/', '', $normalized);
        $variants = array_unique([
            $normalized,
            $digits,
            ltrim($digits, '7'), // 10 цифр
        ]);

        return array_values(array_filter($variants));
    }

    private function findRecurringDonationByPhone(array $phoneVariants): ?Donation
    {
        $base = Donation::query()
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
            ->whereIn('donations.donor_phone', $phoneVariants)
            ->select('donations.*')
            ->with(['paymentTransaction', 'organization']);

        $donation = $base->first();

        if (!$donation) {
            return null;
        }

        $details = $donation->paymentTransaction->payment_details ?? [];
        $savedId = $details['saved_payment_method_id'] ?? '';
        if ($savedId === '' || str_starts_with($savedId, 'legacy_')) {
            return null;
        }

        return $donation;
    }
}

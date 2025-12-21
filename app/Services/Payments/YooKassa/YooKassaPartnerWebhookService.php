<?php

namespace App\Services\Payments\YooKassa;

use App\Models\Payments\YooKassaPartnerEvent;
use App\Models\Payments\YooKassaPartnerMerchant;
use App\Services\Payment\PaymentService;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class YooKassaPartnerWebhookService
{
  public function __construct(
    protected YooKassaPartnerMerchantService $merchantService,
    protected YooKassaPartnerPaymentService $paymentService,
    protected PaymentService $paymentServiceMain,
  ) {}

  public function registerEvent(array $payload): YooKassaPartnerEvent
  {
    return YooKassaPartnerEvent::create([
      'event_type' => Arr::get($payload, 'event_type', 'unknown'),
      'object_id' => Arr::get($payload, 'object.id'),
      'object_type' => Arr::get($payload, 'object.type'),
      'payload' => $payload,
    ]);
  }

  public function handle(YooKassaPartnerEvent $event): void
  {
    if ($event->processing_status === YooKassaPartnerEvent::STATUS_PROCESSED) {
      return;
    }

    $event->update(['processing_status' => YooKassaPartnerEvent::STATUS_PROCESSING]);

    DB::beginTransaction();
    try {
      $objectType = $event->object_type;
      $payload = $event->payload ?? [];

      if ($objectType === 'merchant') {
        $this->handleMerchantEvent($payload);
      } elseif ($objectType === 'payment') {
        $this->handlePaymentEvent($payload);
      }

      $event->update([
        'processing_status' => YooKassaPartnerEvent::STATUS_PROCESSED,
        'processed_at' => now(),
      ]);

      DB::commit();
    } catch (\Throwable $e) {
      DB::rollBack();
      Log::error('YooKassa partner webhook processing failed', [
        'event_id' => $event->id,
        'error' => $e->getMessage(),
      ]);

      $event->update([
        'processing_status' => YooKassaPartnerEvent::STATUS_FAILED,
        'processing_error' => $e->getMessage(),
      ]);
    }
  }

  protected function handleMerchantEvent(array $payload): void
  {
    $externalId = Arr::get($payload, 'id');
    if (!$externalId) {
      return;
    }

    $merchant = YooKassaPartnerMerchant::where('external_id', $externalId)->first();

    if (!$merchant) {
      Log::warning('YooKassa merchant event received for unknown merchant', ['external_id' => $externalId]);
      return;
    }

    $merchant->update([
      'status' => Arr::get($payload, 'status', $merchant->status),
      'documents' => Arr::get($payload, 'documents', $merchant->documents),
      'payout_status' => Arr::get($payload, 'payout_account.status', $merchant->payout_status),
      'contract_id' => Arr::get($payload, 'contract_id', $merchant->contract_id),
      'activated_at' => Arr::get($payload, 'status') === YooKassaPartnerMerchant::STATUS_ACTIVE
        ? now()
        : $merchant->activated_at,
      'last_synced_at' => now(),
    ]);
  }

  protected function handlePaymentEvent(array $payload): void
  {
    // В Partner API webhook'е merchant.id может быть в object.merchant.id или в корне payload
    $merchantId = Arr::get($payload, 'object.merchant.id')
      ?? Arr::get($payload, 'merchant.id')
      ?? Arr::get($payload, 'object.id'); // Для некоторых событий может быть в object.id

    if (!$merchantId) {
      Log::warning('YooKassa payment event: merchant ID not found', [
        'payload_keys' => array_keys($payload),
        'object_keys' => array_keys(Arr::get($payload, 'object', [])),
      ]);
      return;
    }

    $merchant = YooKassaPartnerMerchant::where('external_id', $merchantId)->first();
    if (!$merchant) {
      Log::warning('YooKassa payment event for unknown merchant', [
        'external_id' => $merchantId,
        'payment_id' => Arr::get($payload, 'object.id') ?? Arr::get($payload, 'id'),
      ]);
      return;
    }

    // Получаем объект платежа из payload (может быть в object или в корне)
    $paymentObject = Arr::get($payload, 'object', $payload);

    // Сохраняем платеж и получаем транзакцию
    $detail = $this->paymentService->storePayment($merchant, $paymentObject);
    $transaction = $detail->transaction;

    if ($transaction) {
      // Определяем, был ли платеж создан через наш сайт
      $paymentDetails = $transaction->payment_details ?? [];
      $isCreatedViaOurSite = $paymentDetails['created_via_our_site'] ?? false;

      // Обновляем webhook_data для отслеживания
      $transaction->update([
        'webhook_data' => array_merge($transaction->webhook_data ?? [], [
          'webhook_received_at' => now()->toIso8601String(),
          'event_type' => Arr::get($payload, 'event_type'),
          'created_via_our_site' => $isCreatedViaOurSite,
        ]),
      ]);

      // Создаем или обновляем Donation для всех статусов (не только succeeded)
      // Это нужно для отчетов и отслеживания всех платежей
      // Обрабатываем все платежи от OAuth-связанных мерчантов, независимо от источника создания
      try {
        $this->paymentServiceMain->ensureDonationForTransaction($transaction);
        Log::info('Transaction processed from YooKassa Partner webhook', [
          'transaction_id' => $transaction->id,
          'payment_id' => Arr::get($paymentObject, 'id'),
          'status' => $transaction->status,
          'organization_id' => $transaction->organization_id,
          'created_via_our_site' => $isCreatedViaOurSite,
          'note' => $isCreatedViaOurSite
            ? 'Платеж создан через наш сайт, пользователь вернется к нам'
            : 'Платеж создан не через наш сайт, пользователь вернется на сайт магазина',
        ]);
      } catch (\Exception $e) {
        Log::error('Failed to process transaction from YooKassa Partner webhook', [
          'transaction_id' => $transaction->id,
          'error' => $e->getMessage(),
        ]);
      }
    }
  }
}

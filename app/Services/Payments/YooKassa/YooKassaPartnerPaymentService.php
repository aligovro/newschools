<?php

namespace App\Services\Payments\YooKassa;

use App\Models\Payments\YooKassaPartnerMerchant;
use App\Models\Payments\YooKassaPartnerPaymentDetail;
use App\Models\PaymentTransaction;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class YooKassaPartnerPaymentService
{
  public function __construct(
    protected YooKassaPartnerClientFactory $clientFactory
  ) {}

  public function syncMerchantPayments(YooKassaPartnerMerchant $merchant, array $params = []): void
  {
    if (!$merchant->external_id) {
      return;
    }

    $client = $this->clientFactory->forOrganization($merchant->organization);
    $response = $client->listPayments(array_merge([
      'merchant_id' => $merchant->external_id,
      'limit' => 50,
    ], $params));

    $items = Arr::get($response, 'items', []);

    foreach ($items as $item) {
      $this->storePayment($merchant, $item);
    }
  }

  public function storePayment(YooKassaPartnerMerchant $merchant, array $payload): YooKassaPartnerPaymentDetail
  {
    return DB::transaction(function () use ($merchant, $payload) {
      $externalId = Arr::get($payload, 'id');

      $detail = YooKassaPartnerPaymentDetail::firstOrNew([
        'external_payment_id' => $externalId,
      ]);

      $metadata = Arr::get($payload, 'metadata', []);
      $transactionId = Arr::get($metadata, 'transaction_id', uniqid('txn_', true));

      /**
       * Определяем, был ли платеж создан через наш сайт.
       *
       * Если в metadata есть transaction_id и organization_id, значит платеж создан через наш сайт.
       * В таком случае пользователь вернется на наш сайт после оплаты (return_url из запроса имеет приоритет).
       *
       * Если платеж создан НЕ через наш сайт (например, напрямую через сайт магазина 4licey-fond.ru),
       * пользователь вернется на сайт магазина, но webhook все равно придет к нам для фиксации платежа.
       */
      $isCreatedViaOurSite = !empty($metadata['transaction_id']) && !empty($metadata['organization_id']);

      $transaction = $detail->transaction ?: PaymentTransaction::firstOrCreate(
        [
          'transaction_id' => $transactionId,
        ],
        [
          'organization_id' => $merchant->organization_id,
          'fundraiser_id' => Arr::get($metadata, 'fundraiser_id'),
          'project_id' => Arr::get($metadata, 'project_id'),
          'project_stage_id' => Arr::get($metadata, 'project_stage_id'),
          'amount' => (int) round((float) Arr::get($payload, 'amount.value', 0) * 100),
          'currency' => Arr::get($payload, 'amount.currency', 'RUB'),
          'status' => $this->mapStatus(Arr::get($payload, 'status')),
          'payment_method_slug' => Arr::get($payload, 'payment_method.type', 'bankcard'),
          'payment_provider' => 'yookassa',
          'payment_details' => array_merge(
            $this->extractPaymentDetails($payload, $metadata),
            ['created_via_our_site' => $isCreatedViaOurSite]
          ),
        ]
      );

      // Обновляем транзакцию с актуальными данными
      $updateData = [
        'status' => $this->mapStatus(Arr::get($payload, 'status')),
        'external_id' => $externalId,
        'gateway_response' => $payload,
        'paid_at' => Arr::get($payload, 'status') === 'succeeded' ? now() : $transaction->paid_at,
      ];

      // Обновляем связи, если они были в metadata, но не были сохранены
      if (!$transaction->fundraiser_id && Arr::get($metadata, 'fundraiser_id')) {
        $updateData['fundraiser_id'] = Arr::get($metadata, 'fundraiser_id');
      }
      if (!$transaction->project_id && Arr::get($metadata, 'project_id')) {
        $updateData['project_id'] = Arr::get($metadata, 'project_id');
      }
      if (!$transaction->project_stage_id && Arr::get($metadata, 'project_stage_id')) {
        $updateData['project_stage_id'] = Arr::get($metadata, 'project_stage_id');
      }

      // Обновляем payment_details, сохраняя существующие и добавляя новые
      $existingPaymentDetails = $transaction->payment_details ?? [];
      $newPaymentDetails = $this->extractPaymentDetails($payload, $metadata);
      // Сохраняем флаг created_via_our_site, если он уже был установлен
      if (isset($existingPaymentDetails['created_via_our_site'])) {
        $newPaymentDetails['created_via_our_site'] = $existingPaymentDetails['created_via_our_site'];
      } else {
        $newPaymentDetails['created_via_our_site'] = $isCreatedViaOurSite;
      }
      $updateData['payment_details'] = array_merge($existingPaymentDetails, $newPaymentDetails);

      $transaction->update($updateData);

      $detail->fill([
        'payment_transaction_id' => $transaction->id,
        'yookassa_partner_merchant_id' => $merchant->id,
        'status' => Arr::get($payload, 'status'),
        'payload' => $payload,
      ]);

      $detail->save();

      return $detail;
    });
  }

  protected function mapStatus(?string $status): string
  {
    return match ($status) {
      'succeeded' => PaymentTransaction::STATUS_COMPLETED,
      'canceled' => PaymentTransaction::STATUS_CANCELLED,
      'waiting_for_capture', 'pending' => PaymentTransaction::STATUS_PENDING,
      default => PaymentTransaction::STATUS_PENDING,
    };
  }

  /**
   * Извлекает payment_details из payload и metadata
   */
  protected function extractPaymentDetails(array $payload, array $metadata): array
  {
    $details = [];

    // Извлекаем данные донора из metadata (если были переданы при создании платежа)
    if (isset($metadata['donor_name'])) {
      $details['donor_name'] = $metadata['donor_name'];
    }
    if (isset($metadata['donor_email'])) {
      $details['donor_email'] = $metadata['donor_email'];
    }
    if (isset($metadata['donor_phone'])) {
      $details['donor_phone'] = $metadata['donor_phone'];
    }
    if (isset($metadata['donor_message'])) {
      $details['donor_message'] = $metadata['donor_message'];
    }
    if (isset($metadata['is_anonymous'])) {
      $details['is_anonymous'] = $metadata['is_anonymous'];
    }
    if (isset($metadata['send_receipt'])) {
      $details['send_receipt'] = $metadata['send_receipt'];
    }
    if (isset($metadata['is_recurring'])) {
      $details['is_recurring'] = $metadata['is_recurring'];
    }
    if (isset($metadata['recurring_period'])) {
      $details['recurring_period'] = $metadata['recurring_period'];
    }
    if (isset($metadata['referrer_user_id'])) {
      $details['referrer_user_id'] = $metadata['referrer_user_id'];
    }

    // Извлекаем информацию о способе оплаты из payload
    if (isset($payload['payment_method'])) {
      $details['payment_method_type'] = Arr::get($payload['payment_method'], 'type');
      $details['payment_method_id'] = Arr::get($payload['payment_method'], 'id');
      $details['saved_payment_method_id'] = Arr::get($payload['payment_method'], 'saved')
        ? Arr::get($payload['payment_method'], 'id')
        : null;
    }

    return $details;
  }
}

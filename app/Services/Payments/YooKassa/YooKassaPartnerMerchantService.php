<?php

namespace App\Services\Payments\YooKassa;

use App\Models\Organization;
use App\Models\Payments\YooKassaPartnerMerchant;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class YooKassaPartnerMerchantService
{
  public function __construct(
    protected YooKassaPartnerClientFactory $clientFactory
  ) {}

  public function createDraft(Organization $organization, array $payload = []): YooKassaPartnerMerchant
  {
    return DB::transaction(function () use ($organization, $payload) {
      $merchant = $organization->yookassaPartnerMerchant()->firstOrNew([]);

      $merchant->fill([
        'status' => YooKassaPartnerMerchant::STATUS_DRAFT,
        'settings' => array_merge($merchant->settings ?? [], Arr::get($payload, 'settings', [])),
      ]);
      $merchant->save();

      $organization->update(['yookassa_partner_merchant_id' => $merchant->id]);

      return $merchant;
    });
  }

  public function submitOnboarding(YooKassaPartnerMerchant $merchant, array $data): YooKassaPartnerMerchant
  {
    $client = $this->clientFactory->forOrganization($merchant->organization);

    $response = $client->createMerchant($data);

    $merchant->update([
      'status' => Arr::get($response, 'status', YooKassaPartnerMerchant::STATUS_PENDING),
      'external_id' => Arr::get($response, 'id'),
      'onboarding_id' => Arr::get($response, 'onboarding_id'),
      'credentials' => $this->mergeCredentials($merchant->credentials, Arr::get($response, 'credentials', [])),
      'documents' => Arr::get($response, 'documents'),
      'last_synced_at' => now(),
    ]);

    return $merchant;
  }

  public function sync(YooKassaPartnerMerchant $merchant): YooKassaPartnerMerchant
  {
    if (!$merchant->external_id) {
      throw new RuntimeException('Merchant does not have external_id. Submit onboarding first.');
    }

    $client = $this->clientFactory->forOrganization($merchant->organization);
    $response = $client->getMerchant($merchant->external_id);

    $merchant->update([
      'status' => Arr::get($response, 'status', $merchant->status),
      'contract_id' => Arr::get($response, 'contract_id', $merchant->contract_id),
      'payout_account_id' => Arr::get($response, 'payout_account.id', $merchant->payout_account_id),
      'payout_status' => Arr::get($response, 'payout_account.status', $merchant->payout_status),
      'credentials' => $this->mergeCredentials($merchant->credentials, Arr::get($response, 'credentials', [])),
      'documents' => Arr::get($response, 'documents', $merchant->documents),
      'activated_at' => Arr::get($response, 'activated_at') ? now() : $merchant->activated_at,
      'last_synced_at' => now(),
    ]);

    return $merchant;
  }

  public function deactivate(YooKassaPartnerMerchant $merchant, string $reason = null): YooKassaPartnerMerchant
  {
    $merchant->update([
      'status' => YooKassaPartnerMerchant::STATUS_BLOCKED,
      'settings' => array_merge($merchant->settings ?? [], ['blocked_reason' => $reason]),
    ]);

    Log::warning('YooKassa partner merchant deactivated', [
      'merchant_id' => $merchant->id,
      'reason' => $reason,
    ]);

    return $merchant;
  }

  /**
   * Синхронизирует список авторизованных магазинов из YooKassa API
   * Использует credentials приложения (не OAuth токены магазинов)
   */
  public function syncAuthorizedMerchants(): array
  {
    $client = $this->clientFactory->forSettings([
      'client_id' => config('services.yookassa_partner.client_id'),
      'secret_key' => config('services.yookassa_partner.secret_key'),
      'base_url' => config('services.yookassa_partner.base_url', 'https://api.yookassa.ru'),
    ]);

    $response = $client->listMerchants();
    $merchants = Arr::get($response, 'items', []);

    $synced = [];
    $errors = [];

    foreach ($merchants as $merchantData) {
      try {
        $externalId = Arr::get($merchantData, 'id');
        if (!$externalId) {
          continue;
        }

        // Ищем существующий мерчант по external_id
        $merchant = YooKassaPartnerMerchant::where('external_id', $externalId)->first();

        if ($merchant) {
          // Обновляем существующий мерчант
          $merchant->update([
            'status' => Arr::get($merchantData, 'status', $merchant->status),
            'contract_id' => Arr::get($merchantData, 'contract_id', $merchant->contract_id),
            'payout_account_id' => Arr::get($merchantData, 'payout_account.id', $merchant->payout_account_id),
            'payout_status' => Arr::get($merchantData, 'payout_account.status', $merchant->payout_status),
            'credentials' => $this->mergeCredentials($merchant->credentials, Arr::get($merchantData, 'credentials', [])),
            'documents' => Arr::get($merchantData, 'documents', $merchant->documents),
            'last_synced_at' => now(),
          ]);

          $synced[] = [
            'merchant_id' => $merchant->id,
            'external_id' => $externalId,
            'action' => 'updated',
            'organization_id' => $merchant->organization_id,
          ];
        } else {
          // Создаем новый мерчант (но без привязки к организации)
          // Пользователь должен будет вручную привязать его к организации
          $merchant = YooKassaPartnerMerchant::create([
            'organization_id' => null, // Будет привязано вручную
            'status' => Arr::get($merchantData, 'status', YooKassaPartnerMerchant::STATUS_ACTIVE),
            'external_id' => $externalId,
            'contract_id' => Arr::get($merchantData, 'contract_id'),
            'payout_account_id' => Arr::get($merchantData, 'payout_account.id'),
            'payout_status' => Arr::get($merchantData, 'payout_account.status'),
            'credentials' => Arr::get($merchantData, 'credentials', []),
            'documents' => Arr::get($merchantData, 'documents'),
            'last_synced_at' => now(),
          ]);

          $synced[] = [
            'merchant_id' => $merchant->id,
            'external_id' => $externalId,
            'action' => 'created',
            'organization_id' => null,
            'note' => 'Требуется привязка к организации вручную',
          ];
        }
      } catch (\Exception $e) {
        Log::error('Failed to sync merchant from YooKassa', [
          'merchant_data' => $merchantData,
          'error' => $e->getMessage(),
        ]);

        $errors[] = [
          'external_id' => Arr::get($merchantData, 'id'),
          'error' => $e->getMessage(),
        ];
      }
    }

    return [
      'synced' => $synced,
      'errors' => $errors,
      'total' => count($merchants),
      'synced_count' => count($synced),
      'errors_count' => count($errors),
    ];
  }

  protected function mergeCredentials(?array $existing, array $incoming): array
  {
    $existing = $existing ?? [];

    if (!$incoming) {
      return $existing;
    }

    return array_merge($existing, array_filter($incoming));
  }
}

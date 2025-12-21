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
    public YooKassaPartnerClientFactory $clientFactory
  ) {}

  public function createDraft(Organization $organization, array $payload = []): YooKassaPartnerMerchant
  {
    return DB::transaction(function () use ($organization, $payload) {
      $merchant = $organization->yookassaPartnerMerchant()->firstOrNew([]);

      $merchant->fill([
        'organization_id' => $organization->id,
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

    $credentials = $merchant->credentials ?? [];
    $accessToken = $credentials['access_token'] ?? null;

    // Endpoint /v3/merchants/{id} требует OAuth токен конкретного магазина
    // Если токена нет, используем /v3/me для получения информации о текущем мерчанте
    if (!$accessToken) {
      Log::warning('Cannot sync merchant: OAuth token not available', [
        'merchant_id' => $merchant->id,
        'external_id' => $merchant->external_id,
      ]);

      // Обновляем только last_synced_at, чтобы показать, что попытка была
      $merchant->update(['last_synced_at' => now()]);

      throw new RuntimeException('Для синхронизации мерчанта необходим OAuth токен. Пожалуйста, пройдите OAuth авторизацию.');
    }

    try {
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
    } catch (\Exception $e) {
      // Если endpoint недоступен, пробуем использовать /v3/me как альтернативу
      if (str_contains($e->getMessage(), 'no processor') || str_contains($e->getMessage(), 'invalid_request')) {
        Log::info('getMerchant endpoint not available, trying /v3/me instead', [
          'merchant_id' => $merchant->id,
          'external_id' => $merchant->external_id,
        ]);

        try {
          $client = $this->clientFactory->forOrganization($merchant->organization);
          $meInfo = $client->getMe();

          // Обновляем данные из /v3/me (ограниченная информация)
          $merchant->update([
            'external_id' => $meInfo['id'] ?? $meInfo['merchant_id'] ?? $meInfo['account_id'] ?? $merchant->external_id,
            'last_synced_at' => now(),
          ]);

          Log::info('Merchant synced using /v3/me', [
            'merchant_id' => $merchant->id,
          ]);

          return $merchant;
        } catch (\Exception $meException) {
          Log::error('Failed to sync merchant using /v3/me', [
            'merchant_id' => $merchant->id,
            'error' => $meException->getMessage(),
          ]);

          // Обновляем только last_synced_at
          $merchant->update(['last_synced_at' => now()]);

          throw new RuntimeException('Не удалось синхронизировать мерчант. Endpoint недоступен или требует дополнительных прав. Ошибка: ' . $e->getMessage());
        }
      }

      // Для других ошибок просто пробрасываем исключение
      throw $e;
    }
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
   * ВАЖНО: YooKassa Partner API не предоставляет endpoint для получения списка всех магазинов
   * Этот метод синхронизирует только те магазины, которые уже есть в нашей базе данных
   * Для получения новых магазинов нужно использовать OAuth авторизацию
   */
  public function syncAuthorizedMerchants(): array
  {
    // Получаем все мерчанты из нашей базы, которые имеют external_id
    $localMerchants = YooKassaPartnerMerchant::whereNotNull('external_id')->get();

    $synced = [];
    $errors = [];

    // Создаем клиент для синхронизации
    $client = $this->clientFactory->forSettings([
      'client_id' => config('services.yookassa_partner.client_id'),
      'secret_key' => config('services.yookassa_partner.secret_key'),
      'base_url' => config('services.yookassa_partner.base_url', 'https://api.yookassa.ru'),
    ]);

    foreach ($localMerchants as $merchant) {
      try {
        // Синхронизируем каждый мерчант через getMerchant
        $merchantData = $client->getMerchant($merchant->external_id);

        // Обновляем данные мерчанта
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
          'external_id' => $merchant->external_id,
          'action' => 'updated',
          'organization_id' => $merchant->organization_id,
        ];
      } catch (\Exception $e) {
        Log::error('Failed to sync merchant from YooKassa', [
          'merchant_id' => $merchant->id,
          'external_id' => $merchant->external_id,
          'error' => $e->getMessage(),
        ]);

        $errors[] = [
          'merchant_id' => $merchant->id,
          'external_id' => $merchant->external_id,
          'error' => $e->getMessage(),
        ];
      }
    }

    return [
      'synced' => $synced,
      'errors' => $errors,
      'total' => $localMerchants->count(),
      'synced_count' => count($synced),
      'errors_count' => count($errors),
      'note' => 'Синхронизированы только магазины, которые уже есть в базе. Для добавления новых используйте OAuth авторизацию.',
    ];
  }

  public function mergeCredentials(?array $existing, array $incoming): array
  {
    $existing = $existing ?? [];

    if (!$incoming) {
      return $existing;
    }

    return array_merge($existing, array_filter($incoming));
  }
}

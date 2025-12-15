<?php

namespace App\Http\Controllers\Dashboard\YooKassa;

use App\Http\Controllers\Controller;
use App\Http\Requests\YooKassa\CreateMerchantRequest;
use App\Http\Requests\YooKassa\SyncMerchantRequest;
use App\Http\Resources\YooKassa\MerchantResource;
use App\Models\Organization;
use App\Models\Payments\YooKassaPartnerMerchant;
use App\Services\Payments\YooKassa\YooKassaPartnerMerchantService;
use App\Services\Payments\YooKassa\YooKassaPartnerPaymentService;
use App\Services\Payments\YooKassa\YooKassaPartnerPayoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;

class MerchantController extends Controller
{
  public function __construct(
    protected YooKassaPartnerMerchantService $merchantService,
    protected YooKassaPartnerPaymentService $paymentService,
    protected YooKassaPartnerPayoutService $payoutService
  ) {
    $this->middleware(['auth', 'verified']);
  }

  public function index(Request $request)
  {
    $query = YooKassaPartnerMerchant::query()->with('organization');

    if ($request->filled('status')) {
      $query->where('status', $request->string('status'));
    }

    if ($request->filled('organization')) {
      $query->where('organization_id', $request->integer('organization'));
    }

    $merchants = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 15));

    return MerchantResource::collection($merchants);
  }

  public function show(YooKassaPartnerMerchant $merchant)
  {
    $merchant->load('organization');

    return MerchantResource::make($merchant);
  }

  public function store(CreateMerchantRequest $request, Organization $organization)
  {
    $merchant = $this->merchantService->createDraft($organization, $request->validated());

    if ($request->boolean('submit')) {
      $merchant = $this->merchantService->submitOnboarding($merchant, $request->validated());
    }

    return MerchantResource::make($merchant);
  }

  public function sync(SyncMerchantRequest $request, YooKassaPartnerMerchant $merchant)
  {
    $merchant = $this->merchantService->sync($merchant);

    if ($request->boolean('with_payments')) {
      $this->paymentService->syncMerchantPayments($merchant);
    }

    if ($request->boolean('with_payouts')) {
      $this->payoutService->syncMerchantPayouts($merchant);
    }

    return MerchantResource::make($merchant);
  }

  public function getByOrganization(Organization $organization)
  {
    $merchant = $organization->yookassaPartnerMerchant;

    if (!$merchant) {
      return response()->json([
        'data' => null,
      ]);
    }

    $merchant->load('organization');

    return MerchantResource::make($merchant);
  }

  /**
   * Привязывает мерчант к организации
   */
  public function attachToOrganization(Request $request, YooKassaPartnerMerchant $merchant, Organization $organization)
  {
    if ($merchant->organization_id && $merchant->organization_id !== $organization->id) {
      return response()->json([
        'error' => 'Мерчант уже привязан к другой организации',
      ], 400);
    }

    // Проверяем, нет ли у организации уже другого мерчанта
    $existingMerchant = $organization->yookassaPartnerMerchant;
    if ($existingMerchant && $existingMerchant->id !== $merchant->id) {
      return response()->json([
        'error' => 'У организации уже есть привязанный мерчант',
      ], 400);
    }

    $merchant->update([
      'organization_id' => $organization->id,
    ]);

    // Обновляем связь в организации
    $organization->update([
      'yookassa_partner_merchant_id' => $merchant->id,
    ]);

    $merchant->load('organization');

    return MerchantResource::make($merchant);
  }

  /**
   * Синхронизация авторизованных магазинов из YooKassa API
   */
  public function syncAuthorizedMerchants()
  {
    try {
      $result = $this->merchantService->syncAuthorizedMerchants();

      return response()->json([
        'data' => $result,
        'message' => "Синхронизировано {$result['synced_count']} из {$result['total']} магазинов",
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'error' => 'Ошибка синхронизации: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Привязывает магазин к организации по external_id
   * Получает информацию о магазине через Partner API и создает/обновляет мерчант
   */
  public function attachByExternalId(Request $request, Organization $organization)
  {
    $request->validate([
      'external_id' => 'required|string',
    ]);

    $externalId = $request->input('external_id');

    try {
      // Проверяем, есть ли уже мерчант с таким external_id
      $existingMerchant = YooKassaPartnerMerchant::where('external_id', $externalId)->first();

      if ($existingMerchant && $existingMerchant->organization_id !== $organization->id) {
        return response()->json([
          'error' => 'Этот магазин уже привязан к другой организации',
        ], 400);
      }

      // Пытаемся получить информацию о магазине через API
      $clientFactory = app(\App\Services\Payments\YooKassa\YooKassaPartnerClientFactory::class);
      $client = $clientFactory->forSettings([
        'client_id' => config('services.yookassa_partner.client_id'),
        'secret_key' => config('services.yookassa_partner.secret_key'),
        'base_url' => config('services.yookassa_partner.base_url', 'https://api.yookassa.ru'),
      ]);

      $merchantInfo = $client->getMerchant($externalId);

      // Создаем или обновляем мерчант
      if ($existingMerchant) {
        // Обновляем существующий мерчант
        $existingMerchant->update([
          'organization_id' => $organization->id,
          'status' => Arr::get($merchantInfo, 'status', $existingMerchant->status),
          'contract_id' => Arr::get($merchantInfo, 'contract_id', $existingMerchant->contract_id),
          'payout_account_id' => Arr::get($merchantInfo, 'payout_account.id', $existingMerchant->payout_account_id),
          'payout_status' => Arr::get($merchantInfo, 'payout_account.status', $existingMerchant->payout_status),
          'credentials' => $this->merchantService->mergeCredentials($existingMerchant->credentials, Arr::get($merchantInfo, 'credentials', [])),
          'documents' => Arr::get($merchantInfo, 'documents', $existingMerchant->documents),
          'last_synced_at' => now(),
        ]);

        $merchant = $existingMerchant;
      } else {
        // Создаем новый мерчант
        $merchant = $this->merchantService->createDraft($organization);
        $merchant->update([
          'external_id' => $externalId,
          'status' => Arr::get($merchantInfo, 'status', YooKassaPartnerMerchant::STATUS_ACTIVE),
          'contract_id' => Arr::get($merchantInfo, 'contract_id'),
          'payout_account_id' => Arr::get($merchantInfo, 'payout_account.id'),
          'payout_status' => Arr::get($merchantInfo, 'payout_account.status'),
          'credentials' => Arr::get($merchantInfo, 'credentials', []),
          'documents' => Arr::get($merchantInfo, 'documents'),
          'last_synced_at' => now(),
        ]);
      }

      // Обновляем связь в организации
      $organization->update([
        'yookassa_partner_merchant_id' => $merchant->id,
      ]);

      $merchant->load('organization');

      Log::info('Merchant attached to organization by external_id', [
        'organization_id' => $organization->id,
        'merchant_id' => $merchant->id,
        'external_id' => $externalId,
      ]);

      return response()->json([
        'data' => MerchantResource::make($merchant),
        'message' => 'Магазин успешно привязан к организации',
      ]);
    } catch (\Exception $e) {
      Log::error('Failed to attach merchant by external_id', [
        'organization_id' => $organization->id,
        'external_id' => $externalId,
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'error' => 'Не удалось привязать магазин: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Восстанавливает/создает мерчант для организации после OAuth авторизации
   * Используется, если callback не сработал, но авторизация прошла успешно
   */
  public function restoreFromOAuth(Request $request, Organization $organization)
  {
    try {
      // Проверяем, есть ли уже мерчант
      $merchant = $organization->yookassaPartnerMerchant;

      if (!$merchant) {
        // Создаем новый мерчант
        $merchant = $this->merchantService->createDraft($organization);
      }

      // Если есть external_id в запросе, используем его
      $externalId = $request->input('external_id');

      if ($externalId) {
        // Пытаемся получить информацию о магазине через API
        try {
          $clientFactory = app(\App\Services\Payments\YooKassa\YooKassaPartnerClientFactory::class);
          $client = $clientFactory->forSettings([
            'client_id' => config('services.yookassa_partner.client_id'),
            'secret_key' => config('services.yookassa_partner.secret_key'),
            'base_url' => config('services.yookassa_partner.base_url', 'https://api.yookassa.ru'),
          ]);

          // Если у мерчанта есть OAuth токен, используем его
          $credentials = $merchant->credentials ?? [];
          $accessToken = $credentials['access_token'] ?? null;

          if ($accessToken) {
            $clientWithToken = $clientFactory->forSettings([
              'client_id' => config('services.yookassa_partner.client_id'),
              'secret_key' => config('services.yookassa_partner.secret_key'),
              'base_url' => config('services.yookassa_partner.base_url', 'https://api.yookassa.ru'),
              'access_token' => $accessToken,
            ]);

            $merchantInfo = $clientWithToken->getMerchant($externalId);

            // Обновляем мерчант с информацией из API
            $merchant->update([
              'external_id' => $externalId,
              'status' => \App\Models\Payments\YooKassaPartnerMerchant::STATUS_ACTIVE,
              'contract_id' => $merchantInfo['contract_id'] ?? $merchant->contract_id,
              'payout_account_id' => $merchantInfo['payout_account']['id'] ?? $merchant->payout_account_id,
              'payout_status' => $merchantInfo['payout_account']['status'] ?? $merchant->payout_status,
              'last_synced_at' => now(),
            ]);
          } else {
            // Если нет токена, просто сохраняем external_id
            $merchant->update([
              'external_id' => $externalId,
              'status' => \App\Models\Payments\YooKassaPartnerMerchant::STATUS_ACTIVE,
            ]);
          }
        } catch (\Exception $e) {
          // Если не удалось получить информацию, просто сохраняем external_id
          $merchant->update([
            'external_id' => $externalId,
            'status' => \App\Models\Payments\YooKassaPartnerMerchant::STATUS_ACTIVE,
          ]);

          Log::warning('Failed to get merchant info, saved external_id only', [
            'organization_id' => $organization->id,
            'external_id' => $externalId,
            'error' => $e->getMessage(),
          ]);
        }
      } else {
        // Если external_id не передан, просто активируем мерчант
        $merchant->update([
          'status' => \App\Models\Payments\YooKassaPartnerMerchant::STATUS_ACTIVE,
        ]);
      }

      $merchant->load('organization');

      return response()->json([
        'data' => MerchantResource::make($merchant),
        'message' => 'Мерчант успешно восстановлен',
      ]);
    } catch (\Exception $e) {
      Log::error('Failed to restore merchant from OAuth', [
        'organization_id' => $organization->id,
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'error' => 'Ошибка восстановления мерчанта: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Получение статистики для мерчанта
   */
  public function getStats(YooKassaPartnerMerchant $merchant)
  {
    // Получаем суммы платежей из связанных транзакций
    $succeededPayments = $merchant->paymentDetails()
      ->where('status', 'succeeded')
      ->with('transaction')
      ->get();

    $paymentsTotalAmount = $succeededPayments->sum(function ($payment) {
      return $payment->transaction?->amount ?? 0;
    });

    $stats = [
      'payments' => [
        'total' => $merchant->paymentDetails()->count(),
        'succeeded' => $merchant->paymentDetails()->where('status', 'succeeded')->count(),
        'pending' => $merchant->paymentDetails()->where('status', 'pending')->count(),
        'total_amount' => $paymentsTotalAmount,
      ],
      'payouts' => [
        'total' => $merchant->payouts()->count(),
        'succeeded' => $merchant->payouts()->where('status', 'succeeded')->count(),
        'pending' => $merchant->payouts()->where('status', 'pending')->count(),
        'total_amount' => (int) $merchant->payouts()
          ->where('status', 'succeeded')
          ->sum('amount'),
      ],
      'oauth' => [
        'authorized' => !empty($merchant->credentials['access_token']),
        'authorized_at' => $merchant->credentials['oauth_authorized_at'] ?? $merchant->settings['oauth_authorized_at'] ?? null,
        'token_expires_at' => $merchant->credentials['expires_at'] ?? null,
      ],
    ];

    return response()->json([
      'data' => $stats,
    ]);
  }
}

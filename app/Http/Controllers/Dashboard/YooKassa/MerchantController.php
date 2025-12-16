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

      // ВАЖНО: endpoint /v3/merchants/{id} работает ТОЛЬКО с OAuth токеном конкретного магазина
      // Credentials приложения (YOOKASSA_CLIENT_ID/YOOKASSA_CLIENT_SECRET) НЕ дают доступ к информации о магазинах
      // Если магазин уже авторизовал приложение через OAuth, но callback не сработал,
      // мы просто сохраняем Shop ID и помечаем как активный
      // Полную информацию о магазине можно будет получить позже через синхронизацию, когда будет OAuth токен

      $merchantInfo = null;

      // Пытаемся получить информацию о магазине через API только если есть OAuth токен этого магазина
      if ($existingMerchant && !empty($existingMerchant->credentials['access_token'])) {
        try {
          $clientFactory = app(\App\Services\Payments\YooKassa\YooKassaPartnerClientFactory::class);
          $client = $clientFactory->forSettings([
            'client_id' => config('services.yookassa_partner.client_id'),
            'secret_key' => config('services.yookassa_partner.secret_key'),
            'base_url' => config('services.yookassa_partner.base_url', 'https://api.yookassa.ru'),
            'access_token' => $existingMerchant->credentials['access_token'],
          ]);

          $merchantInfo = $client->getMerchant($externalId);
          Log::info('Got merchant info using OAuth token', [
            'external_id' => $externalId,
          ]);
        } catch (\Exception $e) {
          Log::warning('Failed to get merchant info with OAuth token, will save Shop ID only', [
            'external_id' => $externalId,
            'error' => $e->getMessage(),
          ]);
        }
      } else {
        // Если нет OAuth токена, просто сохраняем Shop ID без запроса к API
        // Это нормально, если магазин уже авторизовал приложение, но callback не сработал
        // Credentials приложения (YOOKASSA_CLIENT_ID/YOOKASSA_CLIENT_SECRET) не дают доступ к /v3/merchants/{id}
        Log::info('Saving Shop ID without API call (OAuth token not available, credentials app cannot access merchant info)', [
          'external_id' => $externalId,
          'organization_id' => $organization->id,
        ]);
      }

      // Создаем или обновляем мерчант
      if ($existingMerchant) {
        // Обновляем существующий мерчант
        $updateData = [
          'organization_id' => $organization->id,
          'external_id' => $externalId,
          'last_synced_at' => now(),
        ];

        // Если получили информацию через API, обновляем дополнительные поля
        if ($merchantInfo) {
          $updateData = array_merge($updateData, [
            'status' => Arr::get($merchantInfo, 'status', $existingMerchant->status),
            'contract_id' => Arr::get($merchantInfo, 'contract_id', $existingMerchant->contract_id),
            'payout_account_id' => Arr::get($merchantInfo, 'payout_account.id', $existingMerchant->payout_account_id),
            'payout_status' => Arr::get($merchantInfo, 'payout_account.status', $existingMerchant->payout_status),
            'credentials' => $this->merchantService->mergeCredentials($existingMerchant->credentials, Arr::get($merchantInfo, 'credentials', [])),
            'documents' => Arr::get($merchantInfo, 'documents', $existingMerchant->documents),
          ]);
        } else {
          // Если информации нет, но магазин авторизован, помечаем как активный
          if (empty($existingMerchant->status) || $existingMerchant->status === YooKassaPartnerMerchant::STATUS_DRAFT) {
            $updateData['status'] = YooKassaPartnerMerchant::STATUS_ACTIVE;
          }
        }

        $existingMerchant->update($updateData);
        $merchant = $existingMerchant;
      } else {
        // Создаем новый мерчант
        $merchant = $this->merchantService->createDraft($organization);

        $merchantData = [
          'external_id' => $externalId,
          'status' => YooKassaPartnerMerchant::STATUS_ACTIVE,
        ];

        // Если получили информацию через API, добавляем дополнительные поля
        if ($merchantInfo) {
          $merchantData = array_merge($merchantData, [
            'status' => Arr::get($merchantInfo, 'status', YooKassaPartnerMerchant::STATUS_ACTIVE),
            'contract_id' => Arr::get($merchantInfo, 'contract_id'),
            'payout_account_id' => Arr::get($merchantInfo, 'payout_account.id'),
            'payout_status' => Arr::get($merchantInfo, 'payout_account.status'),
            'credentials' => Arr::get($merchantInfo, 'credentials', []),
            'documents' => Arr::get($merchantInfo, 'documents'),
            'last_synced_at' => now(),
          ]);
        }

        $merchant->update($merchantData);
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
        'has_oauth_token' => !empty($merchant->credentials['access_token']),
      ]);

      $message = 'Магазин успешно привязан к организации';
      if (empty($merchant->credentials['access_token'])) {
        $message .= '. Для работы с API необходимо пройти OAuth авторизацию - создайте новую ссылку для авторизации.';
      }

      return response()->json([
        'data' => MerchantResource::make($merchant),
        'message' => $message,
        'requires_oauth' => empty($merchant->credentials['access_token']),
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
   * Сохраняет OAuth токен для мерчанта вручную
   * Используется, если токен был получен, но не сохранен через callback
   */
  public function saveOAuthToken(Request $request, Organization $organization)
  {
    $request->validate([
      'access_token' => 'required|string',
      'refresh_token' => 'nullable|string',
      'expires_in' => 'nullable|integer',
      'external_id' => 'nullable|string',
    ]);

    try {
      $merchant = $organization->yookassaPartnerMerchant;

      if (!$merchant) {
        $merchant = $this->merchantService->createDraft($organization);
      }

      // Если передан external_id, обновляем его
      if ($request->filled('external_id')) {
        $merchant->external_id = $request->input('external_id');
      }

      // Сохраняем OAuth токен
      $credentials = $merchant->credentials ?? [];
      $credentials = array_merge($credentials, [
        'access_token' => $request->input('access_token'),
        'refresh_token' => $request->input('refresh_token'),
        'expires_in' => $request->input('expires_in'),
        'token_type' => 'Bearer',
        'expires_at' => $request->filled('expires_in')
          ? now()->addSeconds($request->input('expires_in'))
          : null,
        'oauth_authorized_at' => now()->toIso8601String(),
      ]);

      // Пытаемся получить account_id через /v3/me
      $accountId = null;
      if ($request->filled('access_token')) {
        try {
          $clientFactory = app(\App\Services\Payments\YooKassa\YooKassaPartnerClientFactory::class);
          $client = $clientFactory->forSettings([
            'client_id' => config('services.yookassa_partner.client_id'),
            'secret_key' => config('services.yookassa_partner.secret_key'),
            'base_url' => config('services.yookassa_partner.base_url', 'https://api.yookassa.ru'),
            'access_token' => $request->input('access_token'),
          ]);

          $meInfo = $client->getMe();

          // Пробуем получить account_id из разных полей
          $accountId = $meInfo['account_id'] ?? $meInfo['id'] ?? $meInfo['merchant_id'] ?? null;

          // Преобразуем в строку если число
          if ($accountId && is_numeric($accountId)) {
            $accountId = (string) $accountId;
          }

          // Если не найден, используем external_id
          if (!$accountId) {
            $accountId = $merchant->external_id;
          }

          // Если external_id не был передан, используем account_id
          if (!$merchant->external_id && $accountId) {
            $merchant->external_id = $accountId;
          }

          Log::info('Got account_id from /v3/me', [
            'account_id' => $accountId,
            'external_id' => $merchant->external_id,
          ]);
        } catch (\Exception $e) {
          Log::warning('Failed to get account_id from /v3/me', [
            'error' => $e->getMessage(),
          ]);
          // Используем external_id как account_id, если он есть
          $accountId = $merchant->external_id;
        }
      }

      if ($accountId) {
        $credentials['account_id'] = $accountId;
      }

      $merchant->update([
        'status' => YooKassaPartnerMerchant::STATUS_ACTIVE,
        'credentials' => $credentials,
        'settings' => array_merge($merchant->settings ?? [], [
          'oauth_authorized' => true,
          'oauth_authorized_at' => now()->toIso8601String(),
        ]),
      ]);

      $merchant->load('organization');

      Log::info('OAuth token saved manually', [
        'organization_id' => $organization->id,
        'merchant_id' => $merchant->id,
        'external_id' => $merchant->external_id,
        'account_id' => $accountId,
      ]);

      return response()->json([
        'data' => MerchantResource::make($merchant),
        'message' => 'OAuth токен успешно сохранен. Магазин готов к работе с API.',
      ]);
    } catch (\Exception $e) {
      Log::error('Failed to save OAuth token', [
        'organization_id' => $organization->id,
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'error' => 'Не удалось сохранить OAuth токен: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Получает информацию о магазине через OAuth токен (endpoint /v3/me)
   * Используется, если магазин уже авторизован, но мы не знаем его ID
   */
  public function getMerchantByOAuthToken(Request $request, Organization $organization)
  {
    try {
      // Проверяем, есть ли OAuth токен в запросе
      $accessToken = $request->input('access_token');

      if (!$accessToken) {
        return response()->json([
          'error' => 'OAuth токен не предоставлен',
        ], 400);
      }

      // Создаем клиент с OAuth токеном
      $clientFactory = app(\App\Services\Payments\YooKassa\YooKassaPartnerClientFactory::class);
      $client = $clientFactory->forSettings([
        'client_id' => config('services.yookassa_partner.client_id'),
        'secret_key' => config('services.yookassa_partner.secret_key'),
        'base_url' => config('services.yookassa_partner.base_url', 'https://api.yookassa.ru'),
        'access_token' => $accessToken,
      ]);

      // Получаем информацию о текущем мерчанте
      $merchantInfo = $client->getMe();
      $externalId = $merchantInfo['id'] ?? $merchantInfo['merchant_id'] ?? null;

      if (!$externalId) {
        return response()->json([
          'error' => 'Не удалось получить ID магазина из ответа API',
          'response' => $merchantInfo,
        ], 400);
      }

      // Используем attachByExternalId для привязки
      $request->merge(['external_id' => $externalId]);
      return $this->attachByExternalId($request, $organization);
    } catch (\Exception $e) {
      Log::error('Failed to get merchant by OAuth token', [
        'organization_id' => $organization->id,
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'error' => 'Не удалось получить информацию о магазине: ' . $e->getMessage(),
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

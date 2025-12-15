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

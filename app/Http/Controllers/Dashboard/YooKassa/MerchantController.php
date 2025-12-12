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
}

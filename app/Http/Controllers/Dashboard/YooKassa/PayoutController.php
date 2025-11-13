<?php

namespace App\Http\Controllers\Dashboard\YooKassa;

use App\Http\Controllers\Controller;
use App\Http\Resources\YooKassa\PayoutResource;
use App\Models\Payments\YooKassaPartnerPayout;
use Illuminate\Http\Request;

class PayoutController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
    }

    public function index(Request $request)
    {
        $query = YooKassaPartnerPayout::query()->with('merchant.organization');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('merchant')) {
            $query->where('yookassa_partner_merchant_id', $request->integer('merchant'));
        }

        if ($request->filled('organization')) {
            $query->whereHas('merchant', function ($q) use ($request) {
                $q->where('organization_id', $request->integer('organization'));
            });
        }

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->date('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->date('to'));
        }

        $payouts = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 20));

        return PayoutResource::collection($payouts);
    }

    public function show(YooKassaPartnerPayout $payout)
    {
        $payout->load('merchant.organization');

        return PayoutResource::make($payout);
    }
}


<?php

namespace App\Http\Controllers\Dashboard\YooKassa;

use App\Http\Controllers\Controller;
use App\Http\Resources\YooKassa\PaymentResource;
use App\Models\Payments\YooKassaPartnerPaymentDetail;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
    }

    public function index(Request $request)
    {
        $query = YooKassaPartnerPaymentDetail::query()
            ->with(['transaction.organization', 'merchant']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('organization')) {
            $query->whereHas('transaction', function ($q) use ($request) {
                $q->where('organization_id', $request->integer('organization'));
            });
        }

        if ($request->filled('merchant')) {
            $query->where('yookassa_partner_merchant_id', $request->integer('merchant'));
        }

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->date('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->date('to'));
        }

        $payments = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 20));

        return PaymentResource::collection($payments);
    }

    public function show(YooKassaPartnerPaymentDetail $payment)
    {
        $payment->load(['transaction.organization', 'merchant']);

        return PaymentResource::make($payment);
    }
}


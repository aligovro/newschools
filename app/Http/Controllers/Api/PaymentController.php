<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Payment\PaymentService;
use App\Models\PaymentTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class PaymentController extends Controller
{
  protected PaymentService $paymentService;

  public function __construct(PaymentService $paymentService)
  {
    $this->paymentService = $paymentService;
  }

  /**
   * Создание платежа
   */
  public function create(Request $request): JsonResponse
  {
    try {
      $validated = $request->validate([
        'organization_id' => 'required|exists:organizations,id',
        'fundraiser_id' => 'nullable|exists:fundraisers,id',
        'project_id' => 'nullable|exists:projects,id',
        'amount' => 'required|integer|min:100', // минимум 1 рубль в копейках
        'currency' => 'nullable|string|size:3',
        'payment_method_slug' => 'required|string|exists:payment_methods,slug',
        'description' => 'nullable|string|max:1000',
        'return_url' => 'nullable|url',
        'success_url' => 'nullable|url',
        'failure_url' => 'nullable|url',
        'donor_name' => 'nullable|string|max:255',
        'donor_email' => 'nullable|email|max:255',
        'donor_phone' => 'nullable|string|max:20',
        'donor_message' => 'nullable|string|max:1000',
        'is_anonymous' => 'nullable|boolean',
      ]);

      // Пробуем захватить реферера из httpOnly cookie, если есть
      $referrerId = null;
      try {
        $cookieRef = $request->cookie('ref_user_id');
        if ($cookieRef) {
          $referrerId = (int) preg_replace('/\D/', '', (string) $cookieRef);
          if ($referrerId <= 0) {
            $referrerId = null;
          }
        }
      } catch (\Throwable $_) {
      }

      if ($referrerId) {
        $validated['payment_details'] = array_merge($request->input('payment_details', []), [
          'referrer_user_id' => $referrerId,
        ]);
      }

      $result = $this->paymentService->createPayment($validated);

      if ($result['success']) {
        return response()->json([
          'success' => true,
          'data' => [
            'transaction_id' => $result['transaction_id'],
            'payment_id' => $result['payment_id'],
            'redirect_url' => $result['redirect_url'],
            'qr_code' => $result['qr_code'] ?? null,
            'deep_link' => $result['deep_link'] ?? null,
            'confirmation_url' => $result['confirmation_url'] ?? null,
          ],
        ], 201);
      } else {
        return response()->json([
          'success' => false,
          'error' => $result['error'],
        ], 400);
      }
    } catch (ValidationException $e) {
      return response()->json([
        'success' => false,
        'error' => 'Validation failed',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'error' => 'Internal server error',
      ], 500);
    }
  }

  /**
   * Получение статуса платежа
   */
  public function status(string $transactionId): JsonResponse
  {
    try {
      $result = $this->paymentService->getPaymentStatus($transactionId);

      if ($result['success']) {
        return response()->json([
          'success' => true,
          'data' => $result,
        ]);
      } else {
        return response()->json([
          'success' => false,
          'error' => $result['error'],
        ], 400);
      }
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'error' => 'Internal server error',
      ], 500);
    }
  }

  /**
   * Отмена платежа
   */
  public function cancel(string $transactionId): JsonResponse
  {
    try {
      $result = $this->paymentService->cancelPayment($transactionId);

      return response()->json($result, $result['success'] ? 200 : 400);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'error' => 'Internal server error',
      ], 500);
    }
  }

  /**
   * Возврат платежа
   */
  public function refund(Request $request, string $transactionId): JsonResponse
  {
    try {
      $validated = $request->validate([
        'amount' => 'nullable|integer|min:1',
      ]);

      $result = $this->paymentService->refundPayment(
        $transactionId,
        $validated['amount'] ?? null
      );

      return response()->json($result, $result['success'] ? 200 : 400);
    } catch (ValidationException $e) {
      return response()->json([
        'success' => false,
        'error' => 'Validation failed',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'error' => 'Internal server error',
      ], 500);
    }
  }

  /**
   * Получение доступных методов платежа
   */
  public function methods(): JsonResponse
  {
    try {
      $methods = $this->paymentService->getAvailablePaymentMethods();

      return response()->json([
        'success' => true,
        'data' => $methods,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'error' => 'Internal server error',
      ], 500);
    }
  }

  /**
   * Получение статистики платежей
   */
  public function statistics(Request $request): JsonResponse
  {
    try {
      $validated = $request->validate([
        'organization_id' => 'required|exists:organizations,id',
        'date_from' => 'nullable|date',
        'date_to' => 'nullable|date|after_or_equal:date_from',
        'status' => 'nullable|string|in:pending,completed,failed,cancelled,refunded',
      ]);

      $statistics = $this->paymentService->getPaymentStatistics(
        $validated['organization_id'],
        $validated
      );

      return response()->json([
        'success' => true,
        'data' => $statistics,
      ]);
    } catch (ValidationException $e) {
      return response()->json([
        'success' => false,
        'error' => 'Validation failed',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'error' => 'Internal server error',
      ], 500);
    }
  }

  /**
   * Получение списка транзакций
   */
  public function transactions(Request $request): JsonResponse
  {
    try {
      $validated = $request->validate([
        'organization_id' => 'required|exists:organizations,id',
        'fundraiser_id' => 'nullable|exists:fundraisers,id',
        'project_id' => 'nullable|exists:projects,id',
        'status' => 'nullable|string|in:pending,completed,failed,cancelled,refunded',
        'payment_method' => 'nullable|string|exists:payment_methods,slug',
        'date_from' => 'nullable|date',
        'date_to' => 'nullable|date|after_or_equal:date_from',
        'per_page' => 'nullable|integer|min:1|max:100',
        'page' => 'nullable|integer|min:1',
      ]);

      $query = PaymentTransaction::forOrganization($validated['organization_id']);

      if (isset($validated['fundraiser_id'])) {
        $query->forFundraiser($validated['fundraiser_id']);
      }

      if (isset($validated['project_id'])) {
        $query->forProject($validated['project_id']);
      }

      if (isset($validated['status'])) {
        $query->where('status', $validated['status']);
      }

      if (isset($validated['payment_method'])) {
        $query->where('payment_method_slug', $validated['payment_method']);
      }

      if (isset($validated['date_from'])) {
        $query->where('created_at', '>=', $validated['date_from']);
      }

      if (isset($validated['date_to'])) {
        $query->where('created_at', '<=', $validated['date_to']);
      }

      $perPage = $validated['per_page'] ?? 20;
      $transactions = $query->with(['paymentMethod', 'organization', 'fundraiser', 'project'])
        ->orderBy('created_at', 'desc')
        ->paginate($perPage);

      return response()->json([
        'success' => true,
        'data' => $transactions,
      ]);
    } catch (ValidationException $e) {
      return response()->json([
        'success' => false,
        'error' => 'Validation failed',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'error' => 'Internal server error',
      ], 500);
    }
  }

  /**
   * Получение детальной информации о транзакции
   */
  public function show(string $transactionId): JsonResponse
  {
    try {
      $transaction = PaymentTransaction::where('transaction_id', $transactionId)
        ->with(['paymentMethod', 'organization', 'fundraiser', 'project', 'logs'])
        ->firstOrFail();

      return response()->json([
        'success' => true,
        'data' => [
          'transaction_id' => $transaction->transaction_id,
          'external_id' => $transaction->external_id,
          'amount' => $transaction->amount,
          'formatted_amount' => $transaction->formatted_amount,
          'currency' => $transaction->currency,
          'status' => $transaction->status,
          'payment_method' => $transaction->paymentMethod->name,
          'payment_method_slug' => $transaction->payment_method_slug,
          'description' => $transaction->description,
          'organization' => $transaction->organization->name,
          'fundraiser' => $transaction->fundraiser?->title,
          'project' => $transaction->project?->title,
          'created_at' => $transaction->created_at,
          'paid_at' => $transaction->paid_at,
          'failed_at' => $transaction->failed_at,
          'refunded_at' => $transaction->refunded_at,
          'expires_at' => $transaction->expires_at,
          'is_expired' => $transaction->isExpired(),
          'masked_payment_details' => $transaction->masked_payment_details,
          'logs' => $transaction->logs->map(function ($log) {
            return [
              'action' => $log->action,
              'level' => $log->level,
              'message' => $log->message,
              'context' => $log->context,
              'created_at' => $log->created_at,
            ];
          }),
        ],
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'error' => 'Transaction not found',
      ], 404);
    }
  }
}

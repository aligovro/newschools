<?php

namespace App\Http\Controllers;

use App\Models\PaymentTransaction;
use App\Services\Payment\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class PaymentReturnController extends Controller
{
  public function __construct(
    protected PaymentService $paymentService
  ) {}

  /**
   * Обработка возврата пользователя после оплаты
   */
  public function return(Request $request): Response
  {
    $transactionId = $request->query('transaction_id');

    if (!$transactionId) {
      Log::warning('Payment return: transaction_id missing', [
        'query' => $request->query(),
      ]);

      return Inertia::render('PaymentReturn', [
        'error' => 'Не указан ID транзакции',
        'transaction' => null,
      ]);
    }

    try {
      // Получаем транзакцию
      $transaction = PaymentTransaction::where('transaction_id', $transactionId)->first();

      if (!$transaction) {
        Log::warning('Payment return: transaction not found', [
          'transaction_id' => $transactionId,
        ]);

        return Inertia::render('PaymentReturn', [
          'error' => 'Транзакция не найдена',
          'transaction' => null,
        ]);
      }

      // Обновляем статус транзакции из платежной системы
      $statusResult = $this->paymentService->getPaymentStatus($transactionId);

      // Обновляем объект транзакции после проверки статуса
      $transaction->refresh();

      // Если платеж успешен, создаем Donation
      if ($transaction->isCompleted()) {
        try {
          $this->paymentService->ensureDonationForTransaction($transaction);
          Log::info('Donation created from payment return', [
            'transaction_id' => $transactionId,
            'transaction_status' => $transaction->status,
            'organization_id' => $transaction->organization_id,
          ]);
        } catch (\Exception $e) {
          Log::error('Failed to create donation from payment return', [
            'transaction_id' => $transactionId,
            'error' => $e->getMessage(),
          ]);
        }
      }

      // Логируем возврат
      Log::info('Payment return processed', [
        'transaction_id' => $transactionId,
        'transaction_status' => $transaction->status,
        'status_check_result' => $statusResult,
        'organization_id' => $transaction->organization_id,
      ]);

      // Определяем, успешен ли платеж
      $isSuccess = $transaction->isCompleted();
      $isPending = $transaction->isPending();
      $isFailed = $transaction->isFailed() || $transaction->isCancelled();

      // Получаем организацию для редиректа
      $organization = $transaction->organization;
      $organizationSlug = $organization?->slug;

      return Inertia::render('PaymentReturn', [
        'transaction' => [
          'id' => $transaction->id,
          'transaction_id' => $transaction->transaction_id,
          'status' => $transaction->status,
          'amount' => $transaction->amount,
          'amount_rubles' => $transaction->amount_rubles,
          'formatted_amount' => $transaction->formatted_amount,
          'currency' => $transaction->currency,
          'is_success' => $isSuccess,
          'is_pending' => $isPending,
          'is_failed' => $isFailed,
          'organization' => $organization ? [
            'id' => $organization->id,
            'name' => $organization->name,
            'slug' => $organization->slug,
          ] : null,
        ],
        'error' => null,
      ]);
    } catch (\Exception $e) {
      Log::error('Payment return error', [
        'transaction_id' => $transactionId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return Inertia::render('PaymentReturn', [
        'error' => 'Ошибка обработки возврата: ' . $e->getMessage(),
        'transaction' => null,
      ]);
    }
  }
}

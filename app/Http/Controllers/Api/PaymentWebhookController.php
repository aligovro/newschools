<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Payment\PaymentService;
use App\Models\PaymentTransaction;
use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentWebhookController extends Controller
{
  protected PaymentService $paymentService;

  public function __construct(PaymentService $paymentService)
  {
    $this->paymentService = $paymentService;
  }

  /**
   * Обработка webhook'а от платежной системы
   */
  public function handle(string $gatewaySlug, string $transactionId, Request $request): JsonResponse
  {
    try {
      // Логируем входящий webhook
      Log::info('Payment webhook received', [
        'gateway' => $gatewaySlug,
        'transaction_id' => $transactionId,
        'headers' => $request->headers->all(),
        'body' => $request->all(),
      ]);

      // Обрабатываем webhook
      $result = $this->paymentService->handleWebhook($gatewaySlug, $request);

      if ($result['success']) {
        $transaction = PaymentTransaction::find($result['transaction_id']);

        if ($transaction && $transaction->isCompleted()) {
          // Создаем донат после успешного платежа
          $this->createDonationFromTransaction($transaction);
        }

        return response()->json([
          'success' => true,
          'message' => 'Webhook processed successfully',
        ]);
      } else {
        return response()->json([
          'success' => false,
          'error' => $result['error'],
        ], 400);
      }
    } catch (\Exception $e) {
      Log::error('Webhook processing failed', [
        'gateway' => $gatewaySlug,
        'transaction_id' => $transactionId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'error' => 'Internal server error',
      ], 500);
    }
  }

  /**
   * Обработка webhook'а без привязки к конкретной транзакции
   */
  public function handleGeneral(string $gatewaySlug, Request $request): JsonResponse
  {
    try {
      // Логируем входящий webhook
      Log::info('General payment webhook received', [
        'gateway' => $gatewaySlug,
        'headers' => $request->headers->all(),
        'body' => $request->all(),
      ]);

      // Обрабатываем webhook
      $result = $this->paymentService->handleWebhook($gatewaySlug, $request);

      if ($result['success']) {
        $transaction = PaymentTransaction::find($result['transaction_id']);

        if ($transaction && $transaction->isCompleted()) {
          // Создаем донат после успешного платежа
          $this->createDonationFromTransaction($transaction);
        }

        return response()->json([
          'success' => true,
          'message' => 'Webhook processed successfully',
        ]);
      } else {
        return response()->json([
          'success' => false,
          'error' => $result['error'],
        ], 400);
      }
    } catch (\Exception $e) {
      Log::error('General webhook processing failed', [
        'gateway' => $gatewaySlug,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'error' => 'Internal server error',
      ], 500);
    }
  }

  /**
   * Создание доната из успешной транзакции
   */
  private function createDonationFromTransaction(PaymentTransaction $transaction): void
  {
    try {
      DB::beginTransaction();

      // Проверяем, не создан ли уже донат для этой транзакции
      $existingDonation = Donation::where('payment_transaction_id', $transaction->id)->first();

      if ($existingDonation) {
        DB::rollBack();
        Log::info('Donation already exists for transaction', [
          'transaction_id' => $transaction->id,
          'donation_id' => $existingDonation->id,
        ]);
        return;
      }

      // Создаем донат
      $donation = $this->paymentService->createDonation($transaction);

      // Обновляем статистику в проекте/фандрайзере
      $this->updateProjectStatistics($transaction);

      DB::commit();

      Log::info('Donation created from transaction', [
        'transaction_id' => $transaction->id,
        'donation_id' => $donation->id,
        'amount' => $transaction->amount,
      ]);
    } catch (\Exception $e) {
      DB::rollBack();

      Log::error('Failed to create donation from transaction', [
        'transaction_id' => $transaction->id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
    }
  }

  /**
   * Обновление статистики проекта/фандрайзера
   */
  private function updateProjectStatistics(PaymentTransaction $transaction): void
  {
    try {
      // Обновляем статистику проекта
      if ($transaction->project) {
        $projectDonations = $transaction->project->donations()->completed();

        $transaction->project->update([
          'collected_amount' => $projectDonations->sum('amount'),
          'donations_count' => $projectDonations->count(),
        ]);
      }

      // Обновляем статистику фандрайзера
      if ($transaction->fundraiser) {
        $fundraiserDonations = $transaction->fundraiser->donations()->completed();

        $transaction->fundraiser->update([
          'collected_amount' => $fundraiserDonations->sum('amount'),
        ]);
      }

      // Обновляем статистику организации
      $organizationDonations = $transaction->organization->donations()->completed();

      // Здесь можно добавить поле для общей статистики организации
      // $transaction->organization->update([
      //     'total_donations' => $organizationDonations->sum('amount'),
      //     'donations_count' => $organizationDonations->count(),
      // ]);

    } catch (\Exception $e) {
      Log::error('Failed to update project statistics', [
        'transaction_id' => $transaction->id,
        'error' => $e->getMessage(),
      ]);
    }
  }

  /**
   * Получение информации о webhook'ах для отладки
   */
  public function logs(string $gatewaySlug, Request $request): JsonResponse
  {
    try {
      $validated = $request->validate([
        'transaction_id' => 'nullable|string',
        'per_page' => 'nullable|integer|min:1|max:100',
        'page' => 'nullable|integer|min:1',
      ]);

      $query = \App\Models\PaymentLog::query();

      if (isset($validated['transaction_id'])) {
        $transaction = PaymentTransaction::where('transaction_id', $validated['transaction_id'])->first();
        if ($transaction) {
          $query->where('payment_transaction_id', $transaction->id);
        }
      }

      // Фильтруем по типу webhook'ов
      $query->where('action', 'LIKE', 'webhook_%');

      $perPage = $validated['per_page'] ?? 20;
      $logs = $query->with('paymentTransaction')
        ->orderBy('created_at', 'desc')
        ->paginate($perPage);

      return response()->json([
        'success' => true,
        'data' => $logs,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'error' => 'Internal server error',
      ], 500);
    }
  }

  /**
   * Тестовый endpoint для проверки webhook'ов
   */
  public function test(string $gatewaySlug, Request $request): JsonResponse
  {
    try {
      $validated = $request->validate([
        'transaction_id' => 'required|string',
        'status' => 'required|string|in:pending,completed,failed,cancelled,refunded',
      ]);

      $transaction = PaymentTransaction::where('transaction_id', $validated['transaction_id'])->firstOrFail();

      // Обновляем статус транзакции
      $transaction->update([
        'status' => $validated['status'],
        'paid_at' => $validated['status'] === 'completed' ? now() : null,
        'failed_at' => $validated['status'] === 'failed' ? now() : null,
      ]);

      // Создаем донат если платеж завершен
      if ($validated['status'] === 'completed') {
        $this->createDonationFromTransaction($transaction);
      }

      return response()->json([
        'success' => true,
        'message' => 'Test webhook processed successfully',
        'transaction_status' => $transaction->status,
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
}

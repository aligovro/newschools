<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\Donation;
use App\Models\PaymentTransaction;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use App\Http\Requests\Payments\CreatePaymentRequest;
use App\Http\Requests\Payments\RefundPaymentRequest;
use App\Http\Requests\Payments\TestPaymentRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\OrganizationDonationResource;
use App\Support\InertiaResource;

class OrganizationPaymentsController extends Controller
{
  public function __construct()
  {
    // Middleware применяется в маршрутах
    $this->middleware('auth');
  }

  /**
   * Страница управления платежами
   */
  public function index(Organization $organization)
  {
    $stats = $this->getPaymentStats($organization);
    $recentTransactions = InertiaResource::list(
      $organization->donations()->with(['member', 'paymentTransaction'])->latest()->limit(10)->get(),
      OrganizationDonationResource::class
    );
    $paymentMethods = PaymentMethod::where('is_active', true)->get();

    return Inertia::render('organization/admin/PaymentsIndex', [
      'organization' => (new OrganizationResource($organization))->toArray(request()),
      'stats' => $stats,
      'recentTransactions' => $recentTransactions,
      'paymentMethods' => $paymentMethods,
    ]);
  }

  /**
   * Получить транзакции
   */
  public function transactions(Request $request, Organization $organization): JsonResponse
  {
    $query = $organization->donations()
      ->with(['member', 'paymentTransaction', 'project'])
      ->latest();

    // Фильтрация по статусу
    if ($request->filled('status')) {
      $query->where('status', $request->status);
    }

    // Фильтрация по методу оплаты
    if ($request->filled('payment_method')) {
      $query->whereHas('paymentTransaction', function ($q) use ($request) {
        $q->where('payment_method', $request->payment_method);
      });
    }

    // Фильтрация по дате
    if ($request->filled('date_from')) {
      $query->whereDate('created_at', '>=', $request->date_from);
    }

    if ($request->filled('date_to')) {
      $query->whereDate('created_at', '<=', $request->date_to);
    }

    // Поиск
    if ($request->filled('search')) {
      $search = $request->search;
      $query->where(function ($q) use ($search) {
        $q->where('transaction_id', 'like', "%{$search}%")
          ->orWhereHas('member', function ($memberQuery) use ($search) {
            $memberQuery->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
          });
      });
    }

    $transactions = $query->paginate(20);

    return response()->json($transactions);
  }

  /**
   * Создать платеж
   */
  public function createPayment(CreatePaymentRequest $request, Organization $organization): JsonResponse
  {
    $validator = Validator::make($request->all(), [
      'amount' => 'required|numeric|min:1',
      'payment_method' => 'required|string',
      'member_id' => 'nullable|exists:members,id',
      'project_id' => 'nullable|exists:projects,id',
      'description' => 'nullable|string|max:500',
      'return_url' => 'nullable|url',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    try {
      $result = DB::transaction(function () use ($request, $organization) {
        // Optional client idempotency
        $idempotencyKey = $request->header('Idempotency-Key') ?? $request->get('idempotency_key');
        if ($idempotencyKey) {
          $existing = PaymentTransaction::where('organization_id', $organization->id)
            ->where('metadata->idempotency_key', $idempotencyKey)
            ->latest('id')
            ->first();
          if ($existing) {
            return [
              'donation' => $existing->donation,
              'transaction' => $existing,
              'payment_url' => $this->getPaymentUrl($existing, $existing->metadata['return_url'] ?? null),
            ];
          }
        }

        $donation = $organization->donations()->create([
          'member_id' => $request->member_id,
          'project_id' => $request->project_id,
          'amount' => (int) ($request->amount * 100), // minor units
          'status' => 'pending',
          'description' => $request->description,
          'payment_method' => $request->payment_method,
        ]);

        // Создаем транзакцию
        $data = $request->all();
        if ($idempotencyKey) {
          $data['idempotency_key'] = $idempotencyKey;
        }
        $transaction = $this->createPaymentTransaction($donation, $data);

        return [
          'donation' => $donation,
          'transaction' => $transaction,
          'payment_url' => $this->getPaymentUrl($transaction, $request->return_url),
        ];
      });

      return response()->json([
        'message' => 'Платеж создан',
        'donation' => $result['donation'],
        'transaction' => $result['transaction'],
        'payment_url' => $result['payment_url'],
      ]);
    } catch (\Exception $e) {
      Log::error('Payment creation failed', [
        'organization_id' => $organization->id,
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'message' => 'Ошибка создания платежа: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Обработка webhook от ЮKassa
   */
  public function yookassaWebhook(Request $request, Organization $organization): JsonResponse
  {
    try {
      $data = $request->all();
      Log::info('YooKassa webhook received', $data);

      // Проверяем подпись (в реальном проекте нужно добавить проверку)
      $transactionId = $data['object']['id'] ?? null;

      if (!$transactionId) {
        return response()->json(['message' => 'Invalid webhook data'], 400);
      }

      $processed = DB::transaction(function () use ($transactionId, $data) {
        $transaction = PaymentTransaction::where('external_id', $transactionId)->lockForUpdate()->first();
        if (!$transaction) {
          Log::warning('Transaction not found', ['transaction_id' => $transactionId]);
          return ['error' => 'not_found'];
        }

        $donation = $transaction->donation;
        $status = $data['object']['status'] ?? null;

        $target = match ($status) {
          'succeeded' => 'completed',
          'canceled' => 'failed',
          'waiting_for_capture' => 'pending',
          default => null,
        };

        if ($target === null) {
          return ['ok' => true];
        }

        // Idempotent: if already set, skip updates
        if ($transaction->status === $target && $donation->status === $target) {
          return ['ok' => true];
        }

        $donation->update(['status' => $target]);
        $transaction->update(['status' => $target]);

        return ['ok' => true, 'target' => $target, 'donation' => $donation];
      });

      if (isset($processed['error']) && $processed['error'] === 'not_found') {
        return response()->json(['message' => 'Transaction not found'], 404);
      }

      if (($processed['target'] ?? null) === 'completed' && isset($processed['donation'])) {
        $this->sendPaymentNotification($processed['donation'], 'success');
      } elseif (($processed['target'] ?? null) === 'failed' && isset($processed['donation'])) {
        $this->sendPaymentNotification($processed['donation'], 'failed');
      }

      return response()->json(['message' => 'Webhook processed']);
    } catch (\Exception $e) {
      Log::error('YooKassa webhook error', [
        'error' => $e->getMessage(),
        'data' => $request->all(),
      ]);

      return response()->json(['message' => 'Webhook processing failed'], 500);
    }
  }

  /**
   * Возврат платежа
   */
  public function refund(RefundPaymentRequest $request, Organization $organization, Donation $donation): JsonResponse
  {
    $validator = Validator::make($request->all(), [
      'amount' => 'nullable|numeric|min:1|max:' . ($donation->amount / 100),
      'reason' => 'nullable|string|max:500',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    if ($donation->status !== 'completed') {
      return response()->json([
        'message' => 'Можно вернуть только завершенные платежи'
      ], 400);
    }

    try {
      $result = DB::transaction(function () use ($request, $organization, $donation) {
        $refundAmount = $request->amount ? (int) ($request->amount * 100) : $donation->amount;

        // Здесь должен быть вызов API ЮKassa для создания возврата
        $refundData = $this->createYookassaRefund($donation, $refundAmount, $request->reason);

        // Создаем запись о возврате
        $refundDonation = $organization->donations()->create([
          'member_id' => $donation->member_id,
          'project_id' => $donation->project_id,
          'amount' => -$refundAmount, // Отрицательная сумма для возврата
          'status' => 'completed',
          'description' => 'Возврат: ' . ($request->reason ?? 'Без указания причины'),
          'payment_method' => $donation->payment_method,
          'parent_donation_id' => $donation->id,
        ]);

        return [
          'refund' => $refundDonation,
          'refund_data' => $refundData,
        ];
      });

      return response()->json([
        'message' => 'Возврат создан',
        'refund' => $result['refund'],
        'refund_data' => $result['refund_data'],
      ]);
    } catch (\Exception $e) {
      Log::error('Refund creation failed', [
        'donation_id' => $donation->id,
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'message' => 'Ошибка создания возврата: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Экспорт платежей
   */
  public function export(Request $request, Organization $organization)
  {
    $query = $organization->donations()
      ->with(['member', 'paymentTransaction', 'project']);

    // Применяем те же фильтры, что и в transactions
    if ($request->filled('status')) {
      $query->where('status', $request->status);
    }

    if ($request->filled('date_from')) {
      $query->whereDate('created_at', '>=', $request->date_from);
    }

    if ($request->filled('date_to')) {
      $query->whereDate('created_at', '<=', $request->date_to);
    }

    $donations = $query->latest()->get();

    $csvData = [];
    $csvData[] = [
      'ID',
      'Дата',
      'Участник',
      'Проект',
      'Сумма (₽)',
      'Статус',
      'Способ оплаты',
      'Описание',
      'Транзакция'
    ];

    foreach ($donations as $donation) {
      $csvData[] = [
        $donation->id,
        $donation->created_at->format('d.m.Y H:i'),
        $donation->member?->name ?? 'Аноним',
        $donation->project?->title ?? '-',
        number_format($donation->amount / 100, 2),
        $this->getStatusText($donation->status),
        $donation->payment_method,
        $donation->description ?? '-',
        $donation->paymentTransaction?->external_id ?? '-',
      ];
    }

    $filename = "payments_export_{$organization->slug}_" . now()->format('Y-m-d') . '.csv';

    return response()->streamDownload(function () use ($csvData) {
      $output = fopen('php://output', 'w');
      foreach ($csvData as $row) {
        fputcsv($output, $row, ';');
      }
      fclose($output);
    }, $filename, [
      'Content-Type' => 'text/csv; charset=utf-8',
      'Content-Disposition' => 'attachment; filename="' . $filename . '"',
    ]);
  }

  /**
   * Настройки платежей
   */
  public function settings(Organization $organization)
  {
    $settings = $organization->settings;
    $paymentSettings = $settings?->payment_settings ?? [];
    $integrationSettings = $settings?->integration_settings ?? [];

    return Inertia::render('organization/admin/PaymentSettings', [
      'organization' => (new OrganizationResource($organization))->toArray(request()),
      'paymentSettings' => $paymentSettings,
      'integrationSettings' => $integrationSettings,
      'availableMethods' => PaymentMethod::all(),
    ]);
  }

  /**
   * Обновить настройки платежей
   */
  public function updateSettings(Request $request, Organization $organization): JsonResponse
  {
    $validator = Validator::make($request->all(), [
      'payment_settings' => 'required|array',
      'integration_settings' => 'required|array',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    $settings = $organization->settings ?? $organization->settings()->create([]);

    $settings->update([
      'payment_settings' => $request->payment_settings,
      'integration_settings' => $request->integration_settings,
    ]);

    return response()->json([
      'message' => 'Настройки платежей обновлены',
      'settings' => $settings->fresh(),
    ]);
  }

  /**
   * Тестирование платежной системы
   */
  public function testPayment(TestPaymentRequest $request, Organization $organization): JsonResponse
  {
    $validator = Validator::make($request->all(), [
      'amount' => 'required|numeric|min:1|max:1000',
      'payment_method' => 'required|string',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    try {
      $result = DB::transaction(function () use ($request, $organization) {
        // Создаем тестовый платеж
        $donation = $organization->donations()->create([
          'amount' => (int) ($request->amount * 100),
          'status' => 'pending',
          'description' => 'Тестовый платеж',
          'payment_method' => $request->payment_method,
        ]);

        $transaction = $this->createPaymentTransaction($donation, $request->all());

        return [
          'donation' => $donation,
          'transaction' => $transaction,
        ];
      });

      return response()->json([
        'message' => 'Тестовый платеж создан',
        'donation' => $result['donation'],
        'transaction' => $result['transaction'],
        'payment_url' => $this->getPaymentUrl($result['transaction']),
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Ошибка создания тестового платежа: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Получить статистику платежей
   */
  private function getPaymentStats(Organization $organization): array
  {
    $currentMonth = now()->month;
    $currentYear = now()->year;

    return [
      'totalRevenue' => $organization->donations()->where('status', 'completed')->sum('amount'),
      'monthlyRevenue' => $organization->donations()
        ->where('status', 'completed')
        ->whereMonth('created_at', $currentMonth)
        ->whereYear('created_at', $currentYear)
        ->sum('amount'),
      'totalTransactions' => $organization->donations()->count(),
      'successfulTransactions' => $organization->donations()->where('status', 'completed')->count(),
      'failedTransactions' => $organization->donations()->where('status', 'failed')->count(),
      'pendingTransactions' => $organization->donations()->where('status', 'pending')->count(),
      'averageTransaction' => $organization->donations()
        ->where('status', 'completed')
        ->avg('amount') ?? 0,
    ];
  }

  /**
   * Получить последние транзакции
   */
  private function getRecentTransactions(Organization $organization): array
  {
    // Deprecated by Resource-based approach; kept for backward compatibility if used elsewhere.
    return InertiaResource::list(
      $organization->donations()->with(['member', 'paymentTransaction'])->latest()->limit(10)->get(),
      OrganizationDonationResource::class
    );
  }

  /**
   * Создать транзакцию платежа
   */
  private function createPaymentTransaction(Donation $donation, array $data): PaymentTransaction
  {
    $transaction = $donation->paymentTransaction()->create([
      'organization_id' => $donation->organization_id,
      'payment_method' => $data['payment_method'],
      'amount' => $donation->amount,
      'currency' => 'RUB',
      'status' => 'pending',
      'external_id' => $this->generateTransactionId(),
      'metadata' => [
        'description' => $data['description'] ?? null,
        'return_url' => $data['return_url'] ?? null,
      ],
    ]);

    return $transaction;
  }

  /**
   * Получить URL для оплаты
   */
  private function getPaymentUrl(PaymentTransaction $transaction, string $returnUrl = null): string
  {
    // В реальном проекте здесь должен быть вызов API ЮKassa
    return route('payment.process', $transaction->id) .
      ($returnUrl ? '?return_url=' . urlencode($returnUrl) : '');
  }

  /**
   * Создать возврат в ЮKassa
   */
  private function createYookassaRefund(Donation $donation, int $amount, string $reason = null): array
  {
    // Здесь должен быть реальный вызов API ЮKassa
    return [
      'refund_id' => 'refund_' . uniqid(),
      'amount' => $amount,
      'status' => 'succeeded',
      'reason' => $reason,
    ];
  }

  /**
   * Отправить уведомление о платеже
   */
  private function sendPaymentNotification(Donation $donation, string $type): void
  {
    // Здесь должна быть логика отправки уведомлений
    Log::info("Payment notification sent", [
      'donation_id' => $donation->id,
      'type' => $type,
    ]);
  }

  /**
   * Генерировать ID транзакции
   */
  private function generateTransactionId(): string
  {
    return 'txn_' . time() . '_' . str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
  }

  /**
   * Получить текст статуса
   */
  private function getStatusText(string $status): string
  {
    return match ($status) {
      'completed' => 'Завершен',
      'pending' => 'В ожидании',
      'failed' => 'Неуспешен',
      'refunded' => 'Возвращен',
      default => 'Неизвестен',
    };
  }
}

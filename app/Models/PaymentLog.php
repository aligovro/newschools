<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentLog extends Model
{
  use HasFactory;

  protected $fillable = [
    'payment_transaction_id',
    'action',
    'level',
    'message',
    'context',
    'ip_address',
    'user_agent',
  ];

  protected $casts = [
    'context' => 'array',
  ];

  /**
   * Уровни логирования
   */
  public const LEVEL_DEBUG = 'debug';
  public const LEVEL_INFO = 'info';
  public const LEVEL_WARNING = 'warning';
  public const LEVEL_ERROR = 'error';

  /**
   * Действия
   */
  public const ACTION_CREATED = 'created';
  public const ACTION_UPDATED = 'updated';
  public const ACTION_COMPLETED = 'completed';
  public const ACTION_FAILED = 'failed';
  public const ACTION_CANCELLED = 'cancelled';
  public const ACTION_REFUNDED = 'refunded';
  public const ACTION_WEBHOOK_RECEIVED = 'webhook_received';
  public const ACTION_WEBHOOK_PROCESSED = 'webhook_processed';
  public const ACTION_WEBHOOK_FAILED = 'webhook_failed';
  public const ACTION_STATUS_CHANGED = 'status_changed';

  /**
   * Связь с транзакцией
   */
  public function paymentTransaction(): BelongsTo
  {
    return $this->belongsTo(PaymentTransaction::class);
  }

  /**
   * Scope для уровня
   */
  public function scopeLevel($query, string $level)
  {
    return $query->where('level', $level);
  }

  /**
   * Scope для действия
   */
  public function scopeAction($query, string $action)
  {
    return $query->where('action', $action);
  }

  /**
   * Scope для транзакции
   */
  public function scopeForTransaction($query, int $transactionId)
  {
    return $query->where('payment_transaction_id', $transactionId);
  }

  /**
   * Scope для ошибок
   */
  public function scopeErrors($query)
  {
    return $query->where('level', self::LEVEL_ERROR);
  }

  /**
   * Scope для предупреждений
   */
  public function scopeWarnings($query)
  {
    return $query->where('level', self::LEVEL_WARNING);
  }

  /**
   * Scope для webhook'ов
   */
  public function scopeWebhooks($query)
  {
    return $query->where('action', 'LIKE', 'webhook_%');
  }

  /**
   * Создание лога
   */
  public static function createLog(
    int $transactionId,
    string $action,
    string $message,
    string $level = self::LEVEL_INFO,
    array $context = [],
    ?string $ipAddress = null,
    ?string $userAgent = null
  ): self {
    return self::create([
      'payment_transaction_id' => $transactionId,
      'action' => $action,
      'level' => $level,
      'message' => $message,
      'context' => $context,
      'ip_address' => $ipAddress,
      'user_agent' => $userAgent,
    ]);
  }

  /**
   * Создание лога ошибки
   */
  public static function createErrorLog(
    int $transactionId,
    string $action,
    string $message,
    array $context = [],
    ?string $ipAddress = null,
    ?string $userAgent = null
  ): self {
    return self::createLog($transactionId, $action, $message, self::LEVEL_ERROR, $context, $ipAddress, $userAgent);
  }

  /**
   * Создание лога webhook'а
   */
  public static function createWebhookLog(
    int $transactionId,
    string $action,
    string $message,
    array $webhookData = [],
    ?string $ipAddress = null,
    ?string $userAgent = null
  ): self {
    return self::createLog($transactionId, $action, $message, self::LEVEL_INFO, $webhookData, $ipAddress, $userAgent);
  }

  /**
   * Получение форматированного сообщения с контекстом
   */
  public function getFormattedMessageAttribute(): string
  {
    $message = $this->message;

    if ($this->context && count($this->context) > 0) {
      $message .= ' | Context: ' . json_encode($this->context, JSON_UNESCAPED_UNICODE);
    }

    return $message;
  }

  /**
   * Получение уровня с цветом для UI
   */
  public function getLevelColorAttribute(): string
  {
    return match ($this->level) {
      self::LEVEL_DEBUG => 'gray',
      self::LEVEL_INFO => 'blue',
      self::LEVEL_WARNING => 'yellow',
      self::LEVEL_ERROR => 'red',
      default => 'gray',
    };
  }

  /**
   * Получение иконки для уровня
   */
  public function getLevelIconAttribute(): string
  {
    return match ($this->level) {
      self::LEVEL_DEBUG => 'bug',
      self::LEVEL_INFO => 'info',
      self::LEVEL_WARNING => 'warning',
      self::LEVEL_ERROR => 'error',
      default => 'info',
    };
  }
}

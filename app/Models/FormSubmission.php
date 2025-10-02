<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormSubmission extends Model
{
  use HasFactory;

  protected $fillable = [
    'form_widget_id',
    'data',
    'ip_address',
    'user_agent',
    'referer',
    'status',
    'error_message',
    'actions_log',
  ];

  protected $casts = [
    'data' => 'array',
    'actions_log' => 'array',
  ];

  public function formWidget(): BelongsTo
  {
    return $this->belongsTo(FormWidget::class);
  }

  public function getFieldValue(string $fieldName)
  {
    return $this->data[$fieldName] ?? null;
  }

  public function markAsProcessed(): void
  {
    $this->update(['status' => 'processed']);
  }

  public function markAsFailed(string $errorMessage): void
  {
    $this->update([
      'status' => 'failed',
      'error_message' => $errorMessage,
    ]);
  }

  public function addActionLog(string $actionName, bool $success, ?string $message = null): void
  {
    $log = $this->actions_log ?? [];
    $log[] = [
      'action' => $actionName,
      'success' => $success,
      'message' => $message,
      'timestamp' => now()->toISOString(),
    ];

    $this->update(['actions_log' => $log]);
  }
}

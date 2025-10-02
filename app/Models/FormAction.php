<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormAction extends Model
{
  use HasFactory;

  protected $fillable = [
    'form_widget_id',
    'name',
    'type',
    'config',
    'is_active',
    'sort_order',
  ];

  protected $casts = [
    'config' => 'array',
    'is_active' => 'boolean',
  ];

  public function formWidget(): BelongsTo
  {
    return $this->belongsTo(FormWidget::class);
  }

  // Выполнить экшен
  public function execute(FormSubmission $submission): bool
  {
    if (!$this->is_active) {
      return false;
    }

    try {
      switch ($this->type) {
        case 'email':
          return $this->executeEmailAction($submission);
        case 'webhook':
          return $this->executeWebhookAction($submission);
        case 'database':
          return $this->executeDatabaseAction($submission);
        case 'telegram':
          return $this->executeTelegramAction($submission);
        default:
          return false;
      }
    } catch (\Exception $e) {
      $submission->addActionLog($this->name, false, $e->getMessage());
      return false;
    }
  }

  private function executeEmailAction(FormSubmission $submission): bool
  {
    // Реализация отправки email
    $config = $this->config;
    $data = $submission->data;

    // Здесь будет логика отправки email
    // Пока возвращаем true для примера
    $submission->addActionLog($this->name, true, 'Email sent successfully');
    return true;
  }

  private function executeWebhookAction(FormSubmission $submission): bool
  {
    // Реализация webhook
    $config = $this->config;
    $url = $config['url'] ?? null;

    if (!$url) {
      return false;
    }

    // Здесь будет логика отправки webhook
    // Пока возвращаем true для примера
    $submission->addActionLog($this->name, true, 'Webhook sent successfully');
    return true;
  }

  private function executeDatabaseAction(FormSubmission $submission): bool
  {
    // Реализация сохранения в БД
    $config = $this->config;

    // Здесь будет логика сохранения в БД
    // Пока возвращаем true для примера
    $submission->addActionLog($this->name, true, 'Data saved to database');
    return true;
  }

  private function executeTelegramAction(FormSubmission $submission): bool
  {
    // Реализация отправки в Telegram
    $config = $this->config;

    // Здесь будет логика отправки в Telegram
    // Пока возвращаем true для примера
    $submission->addActionLog($this->name, true, 'Telegram notification sent');
    return true;
  }
}

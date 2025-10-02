<?php

namespace App\Services;

use App\Models\FormSubmission;
use App\Services\FormActions\EmailActionService;
use App\Services\FormActions\WebhookActionService;
use App\Services\FormActions\DatabaseActionService;
use App\Services\FormActions\TelegramActionService;
use Illuminate\Support\Facades\Log;

class FormActionExecutorService
{
  protected $emailService;
  protected $webhookService;
  protected $databaseService;
  protected $telegramService;

  public function __construct(
    EmailActionService $emailService,
    WebhookActionService $webhookService,
    DatabaseActionService $databaseService,
    TelegramActionService $telegramService
  ) {
    $this->emailService = $emailService;
    $this->webhookService = $webhookService;
    $this->databaseService = $databaseService;
    $this->telegramService = $telegramService;
  }

  public function executeActions(FormSubmission $submission): array
  {
    $results = [];
    $formWidget = $submission->formWidget;

    if (!$formWidget || !$formWidget->actions) {
      Log::warning('No actions configured for form submission', [
        'submission_id' => $submission->id,
        'form_widget_id' => $submission->form_widget_id
      ]);
      return $results;
    }

    foreach ($formWidget->actions as $action) {
      if (!$action->is_active) {
        continue;
      }

      $result = $this->executeAction($submission, $action);
      $results[$action->id] = $result;

      // Логируем результат
      Log::info('Form action executed', [
        'submission_id' => $submission->id,
        'action_id' => $action->id,
        'action_type' => $action->type,
        'success' => $result['success'],
        'message' => $result['message']
      ]);
    }

    // Обновляем лог действий в submission
    $this->updateSubmissionActionsLog($submission, $results);

    return $results;
  }

  protected function executeAction(FormSubmission $submission, $action): array
  {
    try {
      $config = $action->config ?? [];
      $success = false;

      switch ($action->type) {
        case 'email':
          $success = $this->emailService->execute($submission, $config);
          break;

        case 'webhook':
          $success = $this->webhookService->execute($submission, $config);
          break;

        case 'database':
          $success = $this->databaseService->execute($submission, $config);
          break;

        case 'telegram':
          $success = $this->telegramService->execute($submission, $config);
          break;

        case 'custom':
          $success = $this->executeCustomAction($submission, $config);
          break;

        default:
          Log::warning('Unknown action type', [
            'action_id' => $action->id,
            'action_type' => $action->type
          ]);
          return [
            'success' => false,
            'message' => 'Unknown action type: ' . $action->type,
            'timestamp' => now()->toISOString()
          ];
      }

      return [
        'success' => $success,
        'message' => $success ? 'Action executed successfully' : 'Action execution failed',
        'timestamp' => now()->toISOString()
      ];
    } catch (\Exception $e) {
      Log::error('Action execution failed with exception', [
        'submission_id' => $submission->id,
        'action_id' => $action->id,
        'action_type' => $action->type,
        'error' => $e->getMessage()
      ]);

      return [
        'success' => false,
        'message' => 'Action execution failed: ' . $e->getMessage(),
        'timestamp' => now()->toISOString()
      ];
    }
  }

  protected function executeCustomAction(FormSubmission $submission, array $config): bool
  {
    $className = $config['class'] ?? null;
    $method = $config['method'] ?? 'execute';

    if (!$className || !class_exists($className)) {
      Log::error('Custom action class not found', [
        'submission_id' => $submission->id,
        'class' => $className
      ]);
      return false;
    }

    try {
      $instance = new $className();
      if (method_exists($instance, $method)) {
        return $instance->$method($submission, $config);
      } else {
        Log::error('Custom action method not found', [
          'submission_id' => $submission->id,
          'class' => $className,
          'method' => $method
        ]);
        return false;
      }
    } catch (\Exception $e) {
      Log::error('Custom action execution failed', [
        'submission_id' => $submission->id,
        'class' => $className,
        'error' => $e->getMessage()
      ]);
      return false;
    }
  }

  protected function updateSubmissionActionsLog(FormSubmission $submission, array $results): void
  {
    $actionsLog = $submission->actions_log ?? [];
    $actionsLog[] = [
      'timestamp' => now()->toISOString(),
      'results' => $results
    ];

    $submission->update(['actions_log' => $actionsLog]);
  }
}

<?php

namespace App\Jobs;

use App\Models\Organization;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SetupOrganizationDefaults implements ShouldQueue
{
  use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

  protected Organization $organization;

  /**
   * Create a new job instance.
   */
  public function __construct(Organization $organization)
  {
    $this->organization = $organization;
  }

  /**
   * Execute the job.
   */
  public function handle(): void
  {
    try {
      Log::info("Setting up defaults for organization: {$this->organization->name}", [
        'organization_id' => $this->organization->id,
      ]);

      // Здесь можно добавить дополнительные настройки по умолчанию
      // Например:
      // - Создание статистических записей
      // - Настройка интеграций
      // - Отправка уведомлений администраторам
      // - Создание резервных копий

      $this->createDefaultStatistics();
      $this->sendWelcomeNotifications();

      Log::info("Successfully set up defaults for organization: {$this->organization->name}");
    } catch (\Exception $e) {
      Log::error("Failed to set up defaults for organization: {$this->organization->name}", [
        'organization_id' => $this->organization->id,
        'error' => $e->getMessage(),
      ]);

      throw $e;
    }
  }

  /**
   * Создать статистические записи по умолчанию
   */
  private function createDefaultStatistics(): void
  {
    $this->organization->statistics()->create([
      'date' => now()->toDateString(),
      'page_views' => 0,
      'unique_visitors' => 0,
      'new_donations' => 0,
      'donation_amount' => 0,
      'new_projects' => 0,
      'new_members' => 0,
      'new_news' => 0,
    ]);
  }

  /**
   * Отправить приветственные уведомления
   */
  private function sendWelcomeNotifications(): void
  {
    // Здесь можно добавить логику отправки уведомлений
    // Например, email администраторам системы о создании новой организации
  }
}

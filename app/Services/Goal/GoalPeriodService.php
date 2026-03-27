<?php

namespace App\Services\Goal;

use App\Models\Organization;
use App\Models\Project;
use App\Models\Site;
use Illuminate\Support\Facades\Cache;

/**
 * Сервис сохранения периодических целей (месяц, неделя)
 * для организации, проекта и сайта.
 */
class GoalPeriodService
{
    public function __construct(
        protected GoalPeriodResolver $resolver,
    ) {}

    /**
     * Сохранить цель на период для организации.
     *
     * @param  string    $period     'monthly' | 'weekly'
     * @param  int|null  $goal       Цель в копейках; null — удалить
     * @param  int|null  $collected  Собрано в копейках; null — не менять/удалить
     */
    public function saveForOrganization(
        Organization $organization,
        string $period,
        ?int $goal,
        ?int $collected = null,
    ): void {
        $settings = $organization->settings?->payment_settings ?? [];
        $settings = $this->apply($settings, $period, $goal, $collected);

        app(\App\Services\Organizations\OrganizationSettingsService::class)
            ->updateSettings($organization, ['payment_settings' => $settings]);
    }

    /**
     * Сохранить цель на период для проекта.
     */
    public function saveForProject(
        Project $project,
        string $period,
        ?int $goal,
        ?int $collected = null,
    ): void {
        $settings = $this->apply($project->payment_settings ?? [], $period, $goal, $collected);
        $project->update(['payment_settings' => $settings]);
        $project->refresh();
    }

    /**
     * Сохранить цель на период для сайта.
     */
    public function saveForSite(
        Site $site,
        string $period,
        ?int $goal,
        ?int $collected = null,
    ): void {
        $settings = $this->apply($site->custom_settings ?? [], $period, $goal, $collected);
        $site->update(['custom_settings' => $settings]);
        Cache::forget("site_widgets_config_{$site->id}");
    }

    // ─────────────────────────────────────────────────────────────────────────

    private function apply(array $settings, string $period, ?int $goal, ?int $collected): array
    {
        $goalKey      = "{$period}_goal";
        $collectedKey = "{$period}_collected";

        if ($goal !== null && $goal > 0) {
            $settings[$goalKey] = $goal;
        } else {
            unset($settings[$goalKey]);
        }

        if ($collected !== null && $collected >= 0) {
            $settings[$collectedKey] = $collected;
        } else {
            unset($settings[$collectedKey]);
        }

        return $settings;
    }
}

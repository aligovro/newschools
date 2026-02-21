<?php

namespace App\Services\MonthlyGoal;

use App\Models\Organization;
use App\Models\Project;
use App\Models\Site;
use Illuminate\Support\Facades\Cache;

/**
 * Основной сервис для работы с целью на месяц
 */
class MonthlyGoalService
{
    public function __construct(
        protected MonthlyGoalResolver $resolver
    ) {
    }

    /**
     * Сохранить цель на месяц и опционально «Собрано» для организации.
     *
     * @param int|null $monthlyCollected Собрано в копейках; null — не менять/удалить
     */
    public function saveForOrganization(Organization $organization, ?int $monthlyGoal, ?int $monthlyCollected = null): void
    {
        $paymentSettings = $organization->settings?->payment_settings ?? [];

        if ($monthlyGoal !== null && $monthlyGoal > 0) {
            $paymentSettings['monthly_goal'] = $monthlyGoal;
        } else {
            unset($paymentSettings['monthly_goal']);
        }

        if ($monthlyCollected !== null && $monthlyCollected >= 0) {
            $paymentSettings['monthly_collected'] = $monthlyCollected;
        } else {
            unset($paymentSettings['monthly_collected']);
        }

        $settingsService = app(\App\Services\Organizations\OrganizationSettingsService::class);
        $settingsService->updateSettings($organization, [
            'payment_settings' => $paymentSettings,
        ]);
    }

    /**
     * Сохранить цель на месяц и опционально «Собрано» для проекта.
     */
    public function saveForProject(Project $project, ?int $monthlyGoal, ?int $monthlyCollected = null): void
    {
        $paymentSettings = $project->payment_settings ?? [];

        if ($monthlyGoal !== null && $monthlyGoal > 0) {
            $paymentSettings['monthly_goal'] = $monthlyGoal;
        } else {
            unset($paymentSettings['monthly_goal']);
        }

        if ($monthlyCollected !== null && $monthlyCollected >= 0) {
            $paymentSettings['monthly_collected'] = $monthlyCollected;
        } else {
            unset($paymentSettings['monthly_collected']);
        }

        $project->update(['payment_settings' => $paymentSettings]);
        $project->refresh();
    }

    /**
     * Сохранить цель на месяц и опционально «Собрано» для сайта.
     */
    public function saveForSite(Site $site, ?int $monthlyGoal, ?int $monthlyCollected = null): void
    {
        $customSettings = $site->custom_settings ?? [];

        if ($monthlyGoal !== null && $monthlyGoal > 0) {
            $customSettings['monthly_goal'] = $monthlyGoal;
        } else {
            unset($customSettings['monthly_goal']);
        }

        if ($monthlyCollected !== null && $monthlyCollected >= 0) {
            $customSettings['monthly_collected'] = $monthlyCollected;
        } else {
            unset($customSettings['monthly_collected']);
        }

        $site->update(['custom_settings' => $customSettings]);
        Cache::forget("site_widgets_config_{$site->id}");
    }

    /**
     * Получить цель на месяц с учетом иерархии
     * 
     * @param Organization $organization
     * @param int|null $projectId
     * @param int|null $siteId
     * @return int|null Цель в копейках или null если не задана
     */
    public function getMonthlyGoal(Organization $organization, ?int $projectId = null, ?int $siteId = null): ?int
    {
        return $this->resolver->resolve($organization, $projectId, $siteId);
    }
}

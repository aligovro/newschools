<?php

namespace App\Services\Goal;

use App\Models\Organization;
use App\Models\Project;
use App\Models\Site;

/**
 * Единый резолвер периодических целей (месяц, неделя) с иерархией проект → сайт → организация.
 *
 * Ключи в JSON-полях:
 *   monthly_goal / monthly_collected
 *   weekly_goal  / weekly_collected
 */
class GoalPeriodResolver
{
    /**
     * Получить цель на период.
     *
     * @param  string  $period  'monthly' | 'weekly'
     * @return int|null  Цель в копейках или null, если не задана
     */
    public function resolve(
        Organization $organization,
        string $period,
        ?int $projectId = null,
        ?int $siteId = null,
    ): ?int {
        $key = "{$period}_goal";

        // 1. Цель проекта
        if ($projectId) {
            $project = Project::where('organization_id', $organization->id)->find($projectId);
            $value   = $project && is_array($project->payment_settings)
                ? ($project->payment_settings[$key] ?? null)
                : null;
            if ($value !== null && (int) $value > 0) {
                return (int) $value;
            }
        }

        // 2. Цель сайта
        $site = $siteId
            ? Site::where('organization_id', $organization->id)->find($siteId)
            : Site::where('organization_id', $organization->id)->first();

        $value = $site && is_array($site->custom_settings)
            ? ($site->custom_settings[$key] ?? null)
            : null;
        if ($value !== null && (int) $value > 0) {
            return (int) $value;
        }

        // 3. Цель организации
        $ops   = $organization->settings?->payment_settings;
        $value = is_array($ops) ? ($ops[$key] ?? null) : null;
        if ($value !== null && (int) $value > 0) {
            return (int) $value;
        }

        return null;
    }

    /**
     * Получить вручную заданную сумму «Собрано» с той же иерархией.
     * null — автоматический расчёт по донациям за период.
     *
     * @return int|null  Сумма в копейках или null
     */
    public function resolveCollectedOverride(
        Organization $organization,
        string $period,
        ?int $projectId = null,
        ?int $siteId = null,
    ): ?int {
        $key = "{$period}_collected";

        if ($projectId) {
            $project = Project::where('organization_id', $organization->id)->find($projectId);
            $value   = $project && is_array($project->payment_settings)
                ? ($project->payment_settings[$key] ?? null)
                : null;
            if ($value !== null && $value !== '' && (int) $value >= 0) {
                return (int) $value;
            }
        }

        $site  = $siteId
            ? Site::where('organization_id', $organization->id)->find($siteId)
            : Site::where('organization_id', $organization->id)->first();
        $value = $site && is_array($site->custom_settings)
            ? ($site->custom_settings[$key] ?? null)
            : null;
        if ($value !== null && $value !== '' && (int) $value >= 0) {
            return (int) $value;
        }

        $ops   = $organization->settings?->payment_settings;
        $value = is_array($ops) ? ($ops[$key] ?? null) : null;
        if ($value !== null && $value !== '' && (int) $value >= 0) {
            return (int) $value;
        }

        return null;
    }
}

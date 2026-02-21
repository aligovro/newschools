<?php

namespace App\Services\MonthlyGoal;

use App\Models\Organization;
use App\Models\Project;
use App\Models\Site;

/**
 * Сервис для разрешения цели на месяц с учетом иерархии
 * Приоритет: проект > сайт > организация
 */
class MonthlyGoalResolver
{
    /**
     * Получить цель на месяц с учетом иерархии
     * Приоритет: проект > сайт > организация
     * 
     * @param Organization $organization
     * @param int|null $projectId
     * @param int|null $siteId
     * @return int|null Цель в копейках или null если не задана
     */
    public function resolve(Organization $organization, ?int $projectId = null, ?int $siteId = null): ?int
    {
        $monthlyGoal = null;

        // 1. Проверяем цель проекта (если указан projectId)
        if ($projectId) {
            $project = Project::where('organization_id', $organization->id)->find($projectId);
            if ($project && is_array($project->payment_settings)) {
                $ps = $project->payment_settings;
                $monthlyGoal = $monthlyGoal ?: ($ps['monthly_goal'] ?? null);
            }
        }

        // 2. Проверяем цель сайта организации (если указан siteId или берем первый)
        if ($monthlyGoal === null) {
            if ($siteId) {
                $site = Site::where('organization_id', $organization->id)->find($siteId);
            } else {
                $site = Site::where('organization_id', $organization->id)->first();
            }
            
            if ($site && is_array($site->custom_settings)) {
                $cs = $site->custom_settings;
                $monthlyGoal = $monthlyGoal ?: ($cs['monthly_goal'] ?? null);
            }
        }

        // 3. Проверяем цель организации (fallback)
        if ($monthlyGoal === null) {
            $orgSettings = $organization->settings;
            if ($orgSettings && is_array($orgSettings->payment_settings)) {
                $ops = $orgSettings->payment_settings;
                $monthlyGoal = $monthlyGoal ?: ($ops['monthly_goal'] ?? null);
            }
        }

        // Преобразуем в копейки если задано
        if ($monthlyGoal !== null) {
            $monthlyGoal = (int) $monthlyGoal;
            return $monthlyGoal > 0 ? $monthlyGoal : null;
        }

        return null;
    }

    /**
     * Получить вручную заданное «Собрано» с учётом иерархии (проект → сайт → организация).
     * Если задано — в виджете показывается оно; иначе считается по датам за месяц.
     *
     * @return int|null Сумма в копейках или null
     */
    public function resolveCollectedOverride(Organization $organization, ?int $projectId = null, ?int $siteId = null): ?int
    {
        if ($projectId) {
            $project = Project::where('organization_id', $organization->id)->find($projectId);
            if ($project && is_array($project->payment_settings)) {
                $v = $project->payment_settings['monthly_collected'] ?? null;
                if ($v !== null && $v !== '') {
                    $v = (int) $v;
                    if ($v >= 0) {
                        return $v;
                    }
                }
            }
        }

        $site = $siteId
            ? Site::where('organization_id', $organization->id)->find($siteId)
            : Site::where('organization_id', $organization->id)->first();
        if ($site && is_array($site->custom_settings)) {
            $v = $site->custom_settings['monthly_collected'] ?? null;
            if ($v !== null && $v !== '') {
                $v = (int) $v;
                if ($v >= 0) {
                    return $v;
                }
            }
        }

        $orgSettings = $organization->settings;
        if ($orgSettings && is_array($orgSettings->payment_settings)) {
            $v = $orgSettings->payment_settings['monthly_collected'] ?? null;
            if ($v !== null && $v !== '') {
                $v = (int) $v;
                if ($v >= 0) {
                    return $v;
                }
            }
        }

        return null;
    }
}

<?php

namespace App\Services\MonthlyGoal;

use App\Models\Organization;
use App\Services\Goal\GoalPeriodResolver;

/**
 * Резолвер цели на месяц. Делегирует в GoalPeriodResolver с period='monthly'.
 * Сохранён для обратной совместимости (используется MonthlyGoalService).
 */
class MonthlyGoalResolver
{
    public function __construct(
        protected GoalPeriodResolver $periodResolver,
    ) {}

    public function resolve(Organization $organization, ?int $projectId = null, ?int $siteId = null): ?int
    {
        return $this->periodResolver->resolve($organization, 'monthly', $projectId, $siteId);
    }

    public function resolveCollectedOverride(Organization $organization, ?int $projectId = null, ?int $siteId = null): ?int
    {
        return $this->periodResolver->resolveCollectedOverride($organization, 'monthly', $projectId, $siteId);
    }
}

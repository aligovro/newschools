/**
 * Обёртка для обратной совместимости.
 * Новый код должен использовать PeriodGoalSettings напрямую.
 */
import {
    PeriodGoalSettings,
    type GoalEntityType,
} from '@/components/dashboard/goal-settings/PeriodGoalSettings';
import React from 'react';

export interface MonthlyGoalSettingsProps {
    entityId: number;
    entityType: GoalEntityType;
    initialGoal?: number | null;
    initialCollected?: number | null;
    organizationGoal?: number | null;
    onSaved?: (goal: number | null) => void;
    /** @deprecated не используется, оставлен для совместимости */
    showInheritanceInfo?: boolean;
}

export const MonthlyGoalSettings: React.FC<MonthlyGoalSettingsProps> = ({
    entityId,
    entityType,
    initialGoal,
    initialCollected,
    organizationGoal,
    onSaved,
}) => (
    <PeriodGoalSettings
        entityId={entityId}
        entityType={entityType}
        period="monthly"
        initialGoal={initialGoal}
        initialCollected={initialCollected}
        parentGoal={organizationGoal}
        onSaved={onSaved}
    />
);

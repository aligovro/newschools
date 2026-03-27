import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GOAL_PERIODS, type GoalPeriod } from '@/lib/goal-periods';
import { CalendarDays } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { PeriodGoalForm, type GoalEntityType } from './PeriodGoalSettings';

export interface GoalPeriodsManagerProps {
    entityId: number;
    entityType: GoalEntityType;
    /**
     * Сырые настройки сущности (site.custom_settings / project.payment_settings).
     * Компонент сам извлекает {period}_goal и {period}_collected для каждого периода.
     */
    settings?: Record<string, any> | null;
    /**
     * Настройки родительской сущности (org.settings.payment_settings) — для хинта наследования.
     */
    parentSettings?: Record<string, any> | null;
}

/** Возвращает первый период, для которого задана цель; иначе 'monthly'. */
function defaultPeriod(settings: Record<string, any> | null | undefined): GoalPeriod {
    for (const p of GOAL_PERIODS) {
        if (settings?.[`${p.value}_goal`]) return p.value;
    }
    return 'monthly';
}

/**
 * Универсальный менеджер периодических целей.
 * Один Card с выбором периода в шапке и формой внутри — без вложенных карточек.
 * Открывает первую вкладку, у которой есть сохранённая цель.
 */
export const GoalPeriodsManager: React.FC<GoalPeriodsManagerProps> = ({
    entityId,
    entityType,
    settings,
    parentSettings,
}) => {
    const [activePeriod, setActivePeriod] = useState<GoalPeriod>(() => defaultPeriod(settings));

    const activeLabel = GOAL_PERIODS.find((p) => p.value === activePeriod)?.label ?? activePeriod;

    // Множество периодов, у которых есть сохранённая цель — для визуального индикатора
    const periodsWithGoal = useMemo(
        () => new Set(GOAL_PERIODS.filter((p) => settings?.[`${p.value}_goal`]).map((p) => p.value)),
        [settings],
    );

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Цели по периодам
                </CardTitle>
                <CardDescription>
                    {activeLabel}
                    {entityType !== 'organization' && (
                        <>. Если не задана — используется цель вышестоящей сущности.</>
                    )}
                </CardDescription>

                {/* Period selector */}
                <div className="flex flex-wrap gap-1 rounded-lg border bg-muted p-1 mt-2">
                    {GOAL_PERIODS.map((p) => {
                        const isActive  = activePeriod === p.value;
                        const hasGoal   = periodsWithGoal.has(p.value);
                        return (
                            <button
                                key={p.value}
                                type="button"
                                onClick={() => setActivePeriod(p.value)}
                                className={[
                                    'relative flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground',
                                ].join(' ')}
                            >
                                {p.shortLabel}
                                {hasGoal && (
                                    <span
                                        className={[
                                            'absolute top-1 right-1 h-1.5 w-1.5 rounded-full',
                                            isActive ? 'bg-primary-foreground/70' : 'bg-primary',
                                        ].join(' ')}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </CardHeader>

            <CardContent>
                {/* key сбрасывает состояние формы при смене периода */}
                <PeriodGoalForm
                    key={activePeriod}
                    entityId={entityId}
                    entityType={entityType}
                    period={activePeriod}
                    initialGoal={settings?.[`${activePeriod}_goal`] ?? null}
                    initialCollected={settings?.[`${activePeriod}_collected`] ?? null}
                    parentGoal={parentSettings?.[`${activePeriod}_goal`] ?? null}
                />
            </CardContent>
        </Card>
    );
};

/**
 * Список доступных периодов для задания цели сбора.
 * Единственный источник истины — используется во frontend и передаётся в API.
 */
export const GOAL_PERIODS = [
    { value: 'daily',       label: 'Цель на день',    shortLabel: 'День'    },
    { value: 'weekly',      label: 'Цель на неделю',  shortLabel: 'Неделя'  },
    { value: 'monthly',     label: 'Цель на месяц',   shortLabel: 'Месяц'   },
    { value: 'semi_annual', label: 'Цель на полгода', shortLabel: 'Полгода' },
    { value: 'annual',      label: 'Цель на год',     shortLabel: 'Год'     },
] as const;

export type GoalPeriod = (typeof GOAL_PERIODS)[number]['value'];
// 'daily' | 'weekly' | 'monthly' | 'semi_annual' | 'annual'

/** Возвращает label для периода */
export function getPeriodLabel(period: GoalPeriod): string {
    return GOAL_PERIODS.find((p) => p.value === period)?.label ?? period;
}

/** Возвращает shortLabel для периода */
export function getPeriodShortLabel(period: GoalPeriod): string {
    return GOAL_PERIODS.find((p) => p.value === period)?.shortLabel ?? period;
}

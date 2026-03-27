import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { widgetsSystemApi } from '@/lib/api/index';
import { type GoalPeriod, GOAL_PERIODS } from '@/lib/goal-periods';
import { CalendarDays, Loader2, Save } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

export type { GoalPeriod };
export type GoalEntityType = 'organization' | 'site' | 'project';

export interface PeriodGoalSettingsProps {
    entityId: number;
    entityType: GoalEntityType;
    period: GoalPeriod;
    initialGoal?: number | null;
    initialCollected?: number | null;
    /** Цель родительской сущности (для хинта наследования) */
    parentGoal?: number | null;
    onSaved?: (goal: number | null) => void;
}

const PERIOD_DESCRIPTIONS: Record<GoalPeriod, string> = {
    daily:       'Задайте цель сбора на текущий день.',
    weekly:      'Задайте цель сбора на текущую неделю.',
    monthly:     'Задайте цель сбора на текущий месяц.',
    semi_annual: 'Задайте цель сбора на текущее полугодие.',
    annual:      'Задайте цель сбора на текущий год.',
};

const ENTITY_LABELS: Record<GoalEntityType, string> = {
    organization: 'организации',
    site:         'сайта',
    project:      'проекта',
};

function kopecksToInput(kopecks: number | null | undefined): string {
    return kopecks != null && kopecks > 0 ? String(kopecks / 100) : '';
}

function inputToKopecks(value: string): number | null {
    const trimmed = value.trim().replace(',', '.');
    if (!trimmed) return null;
    const parsed = parseFloat(trimmed);
    return isNaN(parsed) ? null : Math.round(parsed * 100);
}

/**
 * Чистая форма без Card-обёртки.
 * Используется напрямую в GoalPeriodsManager внутри общего Card.
 */
export const PeriodGoalForm: React.FC<PeriodGoalSettingsProps> = ({
    entityId,
    entityType,
    period,
    initialGoal,
    initialCollected,
    parentGoal,
    onSaved,
}) => {
    const [goal, setGoal]          = useState(() => kopecksToInput(initialGoal));
    const [collected, setCollected] = useState(() => kopecksToInput(initialCollected));
    const [saving, setSaving]       = useState(false);
    const [error, setError]         = useState<string | null>(null);
    const [successMsg, setSuccess]  = useState<string | null>(null);

    useEffect(() => { setGoal(kopecksToInput(initialGoal)); },           [initialGoal]);
    useEffect(() => { setCollected(kopecksToInput(initialCollected)); }, [initialCollected]);

    const goalKopecks      = useMemo(() => inputToKopecks(goal),      [goal]);
    const collectedKopecks = useMemo(() => inputToKopecks(collected), [collected]);

    const showInheritedHint = useMemo(
        () => entityType !== 'organization' && !goalKopecks && parentGoal != null && parentGoal > 0,
        [entityType, goalKopecks, parentGoal],
    );

    const handleNumericChange = useCallback(
        (setter: React.Dispatch<React.SetStateAction<string>>) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const v = e.target.value;
                if (v === '' || /^\d*[.,]?\d*$/.test(v)) {
                    setter(v);
                    setError(null);
                    setSuccess(null);
                }
            },
        [],
    );

    const handleSave = useCallback(async () => {
        if (goalKopecks !== null && goalKopecks <= 0) {
            setError('Цель должна быть больше нуля');
            return;
        }
        if (collectedKopecks !== null && collectedKopecks < 0) {
            setError('Сумма «Собрано» не может быть отрицательной');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const result = await widgetsSystemApi.savePeriodGoal(entityType, entityId, {
                period,
                goal:      goalKopecks,
                collected: collectedKopecks,
            });

            if (!result.success) {
                setError(result.message ?? 'Ошибка при сохранении');
                return;
            }

            setSuccess('Сохранено');
            setTimeout(() => setSuccess(null), 3000);
            onSaved?.(goalKopecks);
        } catch {
            setError('Ошибка сети');
        } finally {
            setSaving(false);
        }
    }, [entityId, entityType, period, goalKopecks, collectedKopecks, onSaved]);

    return (
        <div className="space-y-4">
            {showInheritedHint && (
                <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                    Используется цель{' '}
                    {entityType === 'project' ? 'сайта или ' : ''}
                    организации:{' '}
                    <span className="font-semibold">
                        {((parentGoal ?? 0) / 100).toLocaleString('ru-RU', {
                            style: 'currency',
                            currency: 'RUB',
                            minimumFractionDigits: 0,
                        })}
                    </span>
                    <p className="mt-1 text-xs text-blue-600">
                        Задайте свою цель для {ENTITY_LABELS[entityType]}, чтобы переопределить.
                    </p>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor={`${period}-goal-${entityId}`}>Цель (₽)</Label>
                <Input
                    id={`${period}-goal-${entityId}`}
                    inputMode="decimal"
                    placeholder="Например: 100000"
                    value={goal}
                    onChange={handleNumericChange(setGoal)}
                    disabled={saving}
                />
                <p className="text-xs text-muted-foreground">
                    Оставьте пустым, чтобы использовать цель вышестоящей сущности.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor={`${period}-collected-${entityId}`}>
                    Собрано (₽) — необязательно
                </Label>
                <Input
                    id={`${period}-collected-${entityId}`}
                    inputMode="decimal"
                    placeholder="Оставьте пустым — считается по донациям"
                    value={collected}
                    onChange={handleNumericChange(setCollected)}
                    disabled={saving}
                />
                <p className="text-xs text-muted-foreground">
                    Если задано — показывается в виджете; иначе суммируется по донациям за период.
                </p>
            </div>

            {error && (
                <p className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</p>
            )}
            {successMsg && (
                <p className="rounded-md bg-green-50 p-3 text-sm text-green-800">{successMsg}</p>
            )}

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Сохранение...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Сохранить
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

/**
 * Standalone-вариант с Card-обёрткой (для прямого использования вне GoalPeriodsManager).
 */
export const PeriodGoalSettings: React.FC<PeriodGoalSettingsProps> = (props) => {
    const periodLabel = GOAL_PERIODS.find((p) => p.value === props.period)?.label ?? props.period;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    {periodLabel}
                </CardTitle>
                <CardDescription>
                    {PERIOD_DESCRIPTIONS[props.period]}
                    {props.entityType !== 'organization' && (
                        <> Если не задана — используется цель вышестоящей сущности (сайт → организация).</>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <PeriodGoalForm {...props} />
            </CardContent>
        </Card>
    );
};

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Save, Target } from 'lucide-react';
import React, { useCallback, useState, useMemo, useEffect } from 'react';

export interface MonthlyGoalSettingsProps {
    /** Идентификатор сущности (organizationId, projectId или siteId) */
    entityId: number;
    /** Тип сущности */
    entityType: 'organization' | 'project' | 'site';
    /** Начальное значение цели (в копейках) */
    initialGoal?: number | null;
    /** Начальное значение «Собрано» (в копейках); приоритет над расчётом по датам */
    initialCollected?: number | null;
    /** Цель организации для отображения как fallback */
    organizationGoal?: number | null;
    /** Callback при успешном сохранении */
    onSaved?: (goal: number | null) => void;
    /** Показывать ли информацию о наследовании от организации */
    showInheritanceInfo?: boolean;
}

/**
 * Универсальный компонент для редактирования цели на месяц
 * Используется в настройках организации, проектов и сайтов
 */
export const MonthlyGoalSettings: React.FC<MonthlyGoalSettingsProps> = ({
    entityId,
    entityType,
    initialGoal,
    initialCollected,
    organizationGoal,
    onSaved,
    showInheritanceInfo = true,
}) => {
    const goalInRubles = useMemo(() => {
        if (initialGoal != null && initialGoal > 0) return (initialGoal / 100).toString();
        return '';
    }, [initialGoal]);
    const collectedInRubles = useMemo(() => {
        if (initialCollected != null && initialCollected > 0) return (initialCollected / 100).toString();
        return '';
    }, [initialCollected]);

    const [goal, setGoal] = useState<string>(goalInRubles);
    const [collected, setCollected] = useState<string>(collectedInRubles);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        setGoal(initialGoal != null && initialGoal > 0 ? (initialGoal / 100).toString() : '');
    }, [initialGoal]);
    useEffect(() => {
        setCollected(initialCollected != null && initialCollected > 0 ? (initialCollected / 100).toString() : '');
    }, [initialCollected]);

    // Определяем, используется ли цель организации (fallback)
    const isUsingOrganizationGoal = useMemo(() => {
        if (entityType === 'organization' || !showInheritanceInfo) {
            return false;
        }
        
        const hasLocalGoal = goal.trim() !== '' && parseFloat(goal) > 0;
        
        return !hasLocalGoal && organizationGoal !== null && organizationGoal !== undefined && organizationGoal > 0;
    }, [goal, organizationGoal, entityType, showInheritanceInfo]);

    const handleGoalChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        if (v === '' || /^\d*[.,]?\d*$/.test(v)) {
            setGoal(v);
            setErrors([]);
            setSuccess(null);
        }
    }, []);
    const handleCollectedChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        if (v === '' || /^\d*[.,]?\d*$/.test(v)) {
            setCollected(v);
            setErrors([]);
            setSuccess(null);
        }
    }, []);

    const saveGoal = useCallback(async () => {
        setIsLoading(true);
        setErrors([]);
        setSuccess(null);

        try {
            const goalValue = goal.trim() === '' ? null : Math.round(parseFloat(goal.replace(',', '.')) * 100);
            if (goalValue !== null && goalValue <= 0) {
                setErrors(['Цель должна быть больше нуля']);
                setIsLoading(false);
                return;
            }
            const collectedValue = collected.trim() === '' ? null : Math.round(parseFloat(collected.replace(',', '.')) * 100);
            if (collectedValue !== null && collectedValue < 0) {
                setErrors(['Собрано не может быть отрицательным']);
                setIsLoading(false);
                return;
            }

            const url = entityType === 'organization'
                ? `/api/organizations/${entityId}/monthly-goal`
                : `/api/${entityType}s/${entityId}/monthly-goal`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({
                    monthly_goal: goalValue,
                    monthly_collected: collectedValue,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setErrors([
                    data.message || 'Ошибка при сохранении цели на месяц',
                ]);
                return;
            }

            setSuccess('Цель на месяц успешно сохранена');
            if (onSaved) {
                onSaved(goalValue);
            }

            // Очищаем сообщение об успехе через 3 секунды
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Error saving monthly goal:', error);
            setErrors(['Ошибка сети при сохранении цели на месяц']);
        } finally {
            setIsLoading(false);
        }
    }, [entityId, entityType, goal, collected, onSaved]);

    const displayGoal = useMemo(() => {
        // Если есть локальная цель - используем её
        if (goal.trim() !== '' && parseFloat(goal) > 0) {
            return parseFloat(goal);
        }
        
        // Иначе показываем цель организации (если есть)
        if (isUsingOrganizationGoal && organizationGoal) {
            return organizationGoal / 100;
        }
        
        return null;
    }, [goal, organizationGoal, isUsingOrganizationGoal]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Цель сбора в этом месяце
                </CardTitle>
                <CardDescription>
                    Установите цель на текущий месяц. При желании укажите вручную сумму «Собрано» — тогда в виджете донации будет показана она; иначе считается по датам за месяц.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isUsingOrganizationGoal && (
                    <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                        <p>
                            Используется цель организации:{' '}
                            <span className="font-semibold">
                                {displayGoal?.toLocaleString('ru-RU', {
                                    style: 'currency',
                                    currency: 'RUB',
                                    minimumFractionDigits: 0,
                                })}
                            </span>
                        </p>
                        <p className="mt-1 text-xs text-blue-600">
                            Задайте свою цель для {entityType === 'project' ? 'проекта' : 'сайта'}, чтобы переопределить цель организации.
                        </p>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="monthly-goal">Цель на месяц (₽)</Label>
                    <Input
                        id="monthly-goal"
                        type="text"
                        inputMode="decimal"
                        placeholder="Например: 1000000"
                        value={goal}
                        onChange={handleGoalChange}
                        disabled={isLoading}
                        className="text-lg"
                    />
                    <p className="text-xs text-gray-500">
                        Оставьте пустым, чтобы удалить цель или использовать цель организации.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="monthly-collected">Собрано (₽), необязательно</Label>
                    <Input
                        id="monthly-collected"
                        type="text"
                        inputMode="decimal"
                        placeholder="Например: 978933"
                        value={collected}
                        onChange={handleCollectedChange}
                        disabled={isLoading}
                        className="text-lg"
                    />
                    <p className="text-xs text-gray-500">
                        Если указано, в виджете показывается эта сумма. Иначе считается по оплатам за текущий месяц.
                    </p>
                </div>

                {errors.length > 0 && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                        <ul className="list-disc list-inside space-y-1">
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {success && (
                    <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                        {success}
                    </div>
                )}

                <div className="flex justify-end">
                    <Button
                        onClick={saveGoal}
                        disabled={isLoading}
                        className="min-w-[120px]"
                    >
                        {isLoading ? (
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
            </CardContent>
        </Card>
    );
};

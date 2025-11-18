import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useMemo } from 'react';

interface NeedsSectionProps {
    targetAmount: string;
    /**
     * Текущее значение собранной суммы (для отображения), редактировать его нельзя.
     */
    collectedAmount?: string;
    onTargetChange: (value: string) => void;
}

export function NeedsSection({
    targetAmount,
    collectedAmount,
    onTargetChange,
}: NeedsSectionProps) {
    const { target, collected, progress, formattedTarget, formattedCollected } =
        useMemo(() => {
            const normalize = (value?: string): number => {
                if (!value) return 0;
                const cleaned = value.replace(/\s+/g, '').replace(',', '.');
                const parsed = Number.parseFloat(cleaned);
                return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
            };

            const nextTarget = normalize(targetAmount);
            const nextCollected = normalize(collectedAmount);
            const nextProgress =
                nextTarget > 0
                    ? Math.min(
                          100,
                          Math.round((nextCollected / nextTarget) * 100),
                      )
                    : 0;

            const formatter = new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            });

            return {
                target: nextTarget,
                collected: nextCollected,
                progress: nextProgress,
                formattedTarget:
                    nextTarget > 0 ? formatter.format(nextTarget) : '—',
                formattedCollected:
                    nextCollected > 0 ? formatter.format(nextCollected) : '—',
            };
        }, [targetAmount, collectedAmount]);

    return (
        <div className="rounded-lg border bg-white p-4">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                    Нужды школы
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Укажите целевую сумму и сколько уже собрано, чтобы отображать
                    прогресс на карточках школы.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor="needs-target">Целевая сумма</Label>
                    <Input
                        id="needs-target"
                        type="number"
                        min={0}
                        step="1"
                        value={targetAmount}
                        onChange={(event) =>
                            onTargetChange(event.target.value.trim())
                        }
                        placeholder="Например, 500000"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Отображается на сайте как {formattedTarget}.
                    </p>
                </div>

                <div>
                    <Label htmlFor="needs-collected">Собрано средств</Label>
                    <div className="mt-2 rounded-md bg-gray-50 p-2 text-sm text-gray-700">
                        {formattedCollected}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        Считается автоматически по данным проектов и пожертвований.
                    </p>
                </div>
            </div>

            <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Прогресс по нуждам</span>
                    <span>{progress}%</span>
                </div>
                <Progress value={progress} />
                <div className="flex justify-between text-xs text-gray-500">
                    <span>Цель: {formattedTarget}</span>
                    <span>Собрано: {formattedCollected}</span>
                </div>
            </div>
        </div>
    );
}


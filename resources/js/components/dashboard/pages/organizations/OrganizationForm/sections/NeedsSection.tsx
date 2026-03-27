import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import type { MoneyAmount } from '@/types/money';
import { useMemo } from 'react';

interface NeedsSectionProps {
    targetAmount: string;
    manualCollectedAmount: string;
    autoCollected?: MoneyAmount | null;
    onTargetChange: (value: string) => void;
    onManualCollectedChange: (value: string) => void;
}

export function NeedsSection({
    targetAmount,
    manualCollectedAmount,
    autoCollected,
    onTargetChange,
    onManualCollectedChange,
}: NeedsSectionProps) {
    const { progress, formattedTarget, formattedEffective } =
        useMemo(() => {
            const normalize = (value?: string): number => {
                if (!value) return 0;
                const cleaned = value.replace(/\s+/g, '').replace(',', '.');
                const parsed = Number.parseFloat(cleaned);
                return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
            };

            const parseNonEmpty = (value: string): number | null => {
                const t = value.trim();
                if (t === '') return null;
                const cleaned = t.replace(/\s+/g, '').replace(',', '.');
                const parsed = Number.parseFloat(cleaned);
                if (!Number.isFinite(parsed) || parsed < 0) return null;
                return parsed;
            };

            const nextTarget = normalize(targetAmount);
            const manualParsed = parseNonEmpty(manualCollectedAmount);
            const autoRubles = autoCollected?.value ?? 0;
            const nextCollected =
                manualParsed !== null ? manualParsed : autoRubles;
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
                effectiveCollected: nextCollected,
                progress: nextProgress,
                formattedTarget:
                    nextTarget > 0 ? formatter.format(nextTarget) : '—',
                formattedEffective:
                    nextCollected > 0 ? formatter.format(nextCollected) : '—',
            };
        }, [targetAmount, manualCollectedAmount, autoCollected?.value]);

    const formattedAuto =
        autoCollected && autoCollected.value > 0
            ? autoCollected.formatted
            : '—';

    return (
        <div className="rounded-lg border bg-white p-4">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                    Нужды школы
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Укажите целевую сумму. Собрано по умолчанию считается по
                    завершённым пожертвованиям организации; при необходимости
                    задайте сумму вручную — она будет иметь приоритет.
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
                    <Label htmlFor="needs-collected-manual">
                        Собрано средств (необязательно)
                    </Label>
                    <Input
                        id="needs-collected-manual"
                        type="number"
                        min={0}
                        step="1"
                        value={manualCollectedAmount}
                        onChange={(event) =>
                            onManualCollectedChange(event.target.value.trim())
                        }
                        placeholder="Оставьте пустым для авто"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        По пожертвованиям: {formattedAuto}. Пустое поле — берётся
                        эта сумма.
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
                    <span>Собрано: {formattedEffective}</span>
                </div>
            </div>
        </div>
    );
}

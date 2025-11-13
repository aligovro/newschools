import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CURRENCY_SYMBOLS, RECURRING_PERIOD_LABELS } from './utils';

interface DonationRecurringSectionProps {
    enabled: boolean;
    isRecurring: boolean;
    onRecurringChange: (value: boolean) => void;
    recurringPeriod: 'daily' | 'weekly' | 'monthly';
    onRecurringPeriodChange: (value: 'daily' | 'weekly' | 'monthly') => void;
    recurringPeriods: string[];
    agreedToRecurring: boolean;
    onAgreedToRecurringChange: (value: boolean) => void;
    amount: number;
    currency: 'RUB' | 'USD' | 'EUR';
    borderRadiusClass: string;
}

export const DonationRecurringSection: React.FC<DonationRecurringSectionProps> =
    React.memo(
        ({
            agreedToRecurring,
            amount,
            borderRadiusClass,
            currency,
            enabled,
            isRecurring,
            onAgreedToRecurringChange,
            onRecurringChange,
            onRecurringPeriodChange,
            recurringPeriod,
            recurringPeriods,
        }) => {
            if (!enabled) {
                return null;
            }

            return (
                <div className="space-y-3 border-t pt-4">
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => onRecurringChange(false)}
                            className={`flex-1 px-4 py-2 ${borderRadiusClass} border transition-colors ${
                                !isRecurring
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Единоразово
                        </button>
                        <button
                            type="button"
                            onClick={() => onRecurringChange(true)}
                            className={`flex-1 px-4 py-2 ${borderRadiusClass} border transition-colors ${
                                isRecurring
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Регулярно
                        </button>
                    </div>

                    {isRecurring && (
                        <>
                            <div className="grid grid-cols-3 gap-2">
                                {recurringPeriods.map((period) => (
                                    <button
                                        key={period}
                                        type="button"
                                        onClick={() =>
                                            onRecurringPeriodChange(
                                                period as 'daily' | 'weekly' | 'monthly',
                                            )
                                        }
                                        className={`px-3 py-2 text-sm ${borderRadiusClass} border transition-colors ${
                                            recurringPeriod === period
                                                ? 'border-blue-600 bg-blue-600 text-white'
                                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {
                                            RECURRING_PERIOD_LABELS[
                                                period as keyof typeof RECURRING_PERIOD_LABELS
                                            ]
                                        }
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-start space-x-2">
                                <Checkbox
                                    id="agreed_to_recurring"
                                    checked={agreedToRecurring}
                                    onCheckedChange={(checked) =>
                                        onAgreedToRecurringChange(checked as boolean)
                                    }
                                    required={isRecurring}
                                />
                                <Label
                                    htmlFor="agreed_to_recurring"
                                    className="text-xs text-gray-600"
                                >
                                    Я согласен на подписку на платежи на сумму {amount}{' '}
                                    {CURRENCY_SYMBOLS[currency]}. Подписка будет списываться{' '}
                                    {RECURRING_PERIOD_LABELS[recurringPeriod]}
                                </Label>
                            </div>
                        </>
                    )}
                </div>
            );
        },
    );

DonationRecurringSection.displayName = 'DonationRecurringSection';


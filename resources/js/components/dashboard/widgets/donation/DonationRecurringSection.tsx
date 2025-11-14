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
    subscribersCount?: number | null;
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
            subscribersCount,
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
                            className={`donation-recurring-btn ${
                                !isRecurring
                                    ? 'donation-recurring-btn--active'
                                    : ''
                            }`}
                        >
                            Единоразово
                        </button>
                        <button
                            type="button"
                            onClick={() => onRecurringChange(true)}
                            className={`donation-recurring-btn ${
                                isRecurring
                                    ? 'donation-recurring-btn--active'
                                    : ''
                            }`}
                        >
                            Регулярно
                            {subscribersCount !== null &&
                                subscribersCount !== undefined &&
                                subscribersCount > 0 && (
                                    <span className="donation-recurring-btn__badge">
                                        <img
                                            src="/icons/heart-white.svg"
                                            alt=""
                                            className="donation-recurring-btn__badge-icon"
                                        />
                                        {subscribersCount}
                                    </span>
                                )}
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
                                        className={`donation-recurring-period-btn ${
                                            recurringPeriod === period
                                                ? 'donation-recurring-period-btn--active'
                                                : ''
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

                            <div className="donation-policy-checkbox">
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
                                    className="donation-policy-checkbox__label"
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


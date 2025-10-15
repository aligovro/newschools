import React, { useState } from 'react';
import { DonationOutputConfig, WidgetOutputProps } from './types';

export const DonationOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = widget.config as DonationOutputConfig;

    const {
        title = 'Поддержать проект',
        description = '',
        minAmount = 100,
        maxAmount = 0,
        suggestedAmounts = [500, 1000, 2000, 5000],
        currency = 'RUB',
        paymentMethods = ['card', 'yoomoney'],
        showProgress = false,
        targetAmount = 0,
        currentAmount = 0,
    } = config;

    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const progressPercentage =
        targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

    const handleAmountSelect = (amount: number) => {
        setSelectedAmount(amount);
        setCustomAmount('');
    };

    const handleCustomAmountChange = (value: string) => {
        setCustomAmount(value);
        setSelectedAmount(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const amount = selectedAmount || parseInt(customAmount);

        if (
            !amount ||
            amount < minAmount ||
            (maxAmount > 0 && amount > maxAmount)
        ) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Here you would typically integrate with your payment system
            console.log('Donation:', { amount, currency });

            // Simulate payment processing
            await new Promise((resolve) => setTimeout(resolve, 2000));

            setIsSubmitted(true);
        } catch (error) {
            console.error('Donation error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (isSubmitted) {
        return (
            <div
                className={`donation-output donation-output--success ${className || ''}`}
                style={style}
            >
                <div className="rounded-lg bg-green-50 p-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <svg
                            className="h-6 w-6 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-green-900">
                        Спасибо за вашу поддержку!
                    </h3>
                    <p className="text-green-700">
                        Ваше пожертвование поможет нам развивать проект.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`donation-output ${className || ''}`} style={style}>
            <div className="rounded-lg bg-white p-6 shadow-md">
                {title && (
                    <h2 className="mb-4 text-2xl font-bold text-gray-900">
                        {title}
                    </h2>
                )}

                {description && (
                    <p className="mb-6 text-gray-600">{description}</p>
                )}

                {/* Progress bar */}
                {showProgress && targetAmount > 0 && (
                    <div className="mb-6">
                        <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-gray-600">Собрано</span>
                            <span className="font-medium text-gray-900">
                                {formatCurrency(currentAmount)} из{' '}
                                {formatCurrency(targetAmount)}
                            </span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-gray-200">
                            <div
                                className="h-3 rounded-full bg-blue-600 transition-all duration-500"
                                style={{
                                    width: `${Math.min(progressPercentage, 100)}%`,
                                }}
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            {progressPercentage.toFixed(1)}% от цели
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Suggested amounts */}
                    <div>
                        <label className="mb-3 block text-sm font-medium text-gray-700">
                            Выберите сумму
                        </label>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {suggestedAmounts.map((amount) => (
                                <button
                                    key={amount}
                                    type="button"
                                    onClick={() => handleAmountSelect(amount)}
                                    className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                                        selectedAmount === amount
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {formatCurrency(amount)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom amount */}
                    <div>
                        <label
                            htmlFor="customAmount"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Или введите свою сумму
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                id="customAmount"
                                value={customAmount}
                                onChange={(e) =>
                                    handleCustomAmountChange(e.target.value)
                                }
                                min={minAmount}
                                max={maxAmount || undefined}
                                placeholder={`От ${formatCurrency(minAmount)}`}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-sm text-gray-500">
                                    {currency}
                                </span>
                            </div>
                        </div>
                        {minAmount > 0 && (
                            <p className="mt-1 text-xs text-gray-500">
                                Минимальная сумма: {formatCurrency(minAmount)}
                                {maxAmount > 0 &&
                                    `, максимальная: ${formatCurrency(maxAmount)}`}
                            </p>
                        )}
                    </div>

                    {/* Payment methods */}
                    {paymentMethods.length > 0 && (
                        <div>
                            <label className="mb-3 block text-sm font-medium text-gray-700">
                                Способ оплаты
                            </label>
                            <div className="space-y-2">
                                {paymentMethods.includes('card') && (
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="card"
                                            defaultChecked
                                            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            Банковская карта
                                        </span>
                                    </label>
                                )}
                                {paymentMethods.includes('yoomoney') && (
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="yoomoney"
                                            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            ЮMoney
                                        </span>
                                    </label>
                                )}
                                {paymentMethods.includes('qiwi') && (
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="qiwi"
                                            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            QIWI
                                        </span>
                                    </label>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={
                            isSubmitting || (!selectedAmount && !customAmount)
                        }
                        className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting
                            ? 'Обработка...'
                            : `Поддержать ${selectedAmount ? formatCurrency(selectedAmount) : customAmount ? formatCurrency(parseInt(customAmount)) : ''}`}
                    </button>
                </form>
            </div>
        </div>
    );
};

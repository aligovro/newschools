import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DonationPaymentData, PaymentMethod } from '@/lib/api/index';
import { AlertCircle, CheckCircle2, Heart, Loader2 } from 'lucide-react';
import React from 'react';
import { DonationPaymentMethods } from './DonationPaymentMethods';
import { DonationPaymentModal } from './DonationPaymentModal';
import { DonationProgressSection } from './DonationProgressSection';
import { DonationRecurringSection } from './DonationRecurringSection';
import type { DonationProgressData, DonationWidgetConfig } from './types';
import { CURRENCY_SYMBOLS } from './utils';

interface DonationPaymentModalState {
    visible: boolean;
    payment: DonationPaymentData | null;
    qrImageSrc: string | null;
    onClose: () => void;
}

interface DonationFormProps {
    amount: number;
    onAmountInputChange: (value: number) => void;
    onPresetAmountSelect: (value: number) => void;
    presetAmounts: number[];
    minAmount: number;
    maxAmount?: number;
    currency: 'RUB' | 'USD' | 'EUR';
    allowRecurring: boolean;
    recurringPeriods: string[];
    isRecurring: boolean;
    onRecurringChange: (value: boolean) => void;
    recurringPeriod: 'daily' | 'weekly' | 'monthly';
    onRecurringPeriodChange: (value: 'daily' | 'weekly' | 'monthly') => void;
    agreedToRecurring: boolean;
    onAgreedToRecurringChange: (value: boolean) => void;
    donorName: string;
    onDonorNameChange: (value: string) => void;
    donorEmail: string;
    onDonorEmailChange: (value: string) => void;
    donorPhone: string;
    onDonorPhoneChange: (value: string) => void;
    donorMessage: string;
    onDonorMessageChange: (value: string) => void;
    isAnonymous: boolean;
    onAnonymousChange: (value: boolean) => void;
    agreedToPolicy: boolean;
    onAgreedToPolicyChange: (value: boolean) => void;
    requireName: boolean;
    requireEmail: boolean;
    requirePhone: boolean;
    allowAnonymous: boolean;
    showMessageField: boolean;
    isProcessing: boolean;
    isSelectedMethodAvailable: boolean;
    error: string | null;
    success: string | null;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

interface DonationPaymentMethodsState {
    items: PaymentMethod[];
    selectedMethod: string;
    onSelect: (slug: string) => void;
    isMerchantActive: boolean;
}

interface DonationWidgetPublicViewProps {
    config: DonationWidgetConfig;
    title: string;
    description?: string;
    showTitle: boolean;
    progressData: DonationProgressData | null;
    borderRadiusClass: string;
    shadowClass: string;
    buttonStyleClass: string;
    buttonText: string;
    paymentModal: DonationPaymentModalState;
    form: DonationFormProps;
    paymentMethods: DonationPaymentMethodsState;
    subscribersCount?: number | null;
}

export const DonationWidgetPublicView: React.FC<DonationWidgetPublicViewProps> =
    React.memo(
        ({
            borderRadiusClass,
            buttonStyleClass,
            buttonText,
            config,
            description,
            form,
            paymentMethods,
            paymentModal,
            progressData,
            shadowClass,
            showTitle,
            subscribersCount,
            title,
        }) => {
            return (
                <>
                    <DonationPaymentModal
                        visible={paymentModal.visible}
                        payment={paymentModal.payment}
                        qrImageSrc={paymentModal.qrImageSrc}
                        onClose={paymentModal.onClose}
                    />
                    <div
                        className={`donation-widget ${borderRadiusClass} ${shadowClass}`}
                    >
                        <div className="p-6">
                            {(title && showTitle) || description ? (
                                <div className="donation-widget__header">
                                    {title && showTitle && (
                                        <h3 className="donation-widget__title">
                                            {title}
                                        </h3>
                                    )}
                                    {description && (
                                        <p className="text-sm text-gray-600">
                                            {description}
                                        </p>
                                    )}
                                </div>
                            ) : null}

                            <DonationProgressSection
                                progress={progressData}
                                showTargetAmount={
                                    config.show_target_amount ?? true
                                }
                                showCollectedAmount={
                                    config.show_collected_amount ?? true
                                }
                            />

                            <form
                                onSubmit={form.onSubmit}
                                className="space-y-4"
                            >
                                {form.requireName && (
                                    <div className="donation-name-field">
                                        <div className="donation-name-field__input-wrapper">
                                            <label
                                                htmlFor="donor_name"
                                                className="donation-name-field__label"
                                            >
                                                Ваше имя
                                            </label>
                                            <input
                                                id="donor_name"
                                                type="text"
                                                value={form.donorName}
                                                onChange={(e) =>
                                                    form.onDonorNameChange(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Александр"
                                                required={form.requireName}
                                                disabled={form.isAnonymous}
                                                className="donation-name-field__input"
                                            />
                                        </div>
                                        {form.allowAnonymous && (
                                            <div className="donation-name-field__anonymous">
                                                <Checkbox
                                                    id="is_anonymous"
                                                    checked={form.isAnonymous}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        form.onAnonymousChange(
                                                            checked as boolean,
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor="is_anonymous"
                                                    className="donation-name-field__anonymous-label"
                                                >
                                                    Анонимное пожертвование
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {form.requireEmail && (
                                    <div>
                                        <Label htmlFor="donor_email">
                                            Email
                                        </Label>
                                        <Input
                                            id="donor_email"
                                            type="email"
                                            value={form.donorEmail}
                                            onChange={(e) =>
                                                form.onDonorEmailChange(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="example@mail.ru"
                                            required={form.requireEmail}
                                        />
                                    </div>
                                )}

                                {form.requirePhone && (
                                    <div>
                                        <Label htmlFor="donor_phone">
                                            Телефон
                                        </Label>
                                        <Input
                                            id="donor_phone"
                                            type="tel"
                                            value={form.donorPhone}
                                            onChange={(e) =>
                                                form.onDonorPhoneChange(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="+7 (___) ___-__-__"
                                            required={form.requirePhone}
                                        />
                                    </div>
                                )}

                                {form.showMessageField && (
                                    <div>
                                        <Label htmlFor="donor_message">
                                            Комментарий
                                        </Label>
                                        <textarea
                                            id="donor_message"
                                            value={form.donorMessage}
                                            onChange={(e) =>
                                                form.onDonorMessageChange(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                            placeholder="Сообщение для организации"
                                            rows={3}
                                        ></textarea>
                                    </div>
                                )}

                                <div>
                                    <div className="donation-amount-field">
                                        <input
                                            id="amount"
                                            type="text"
                                            inputMode="numeric"
                                            value={
                                                form.amount
                                                    ? `${form.amount} ₽`
                                                    : ''
                                            }
                                            onChange={(e) => {
                                                const input = e.target;
                                                const cursorPos =
                                                    input.selectionStart || 0;
                                                const oldValue = form.amount
                                                    ? `${form.amount} ₽`
                                                    : '';

                                                // Извлекаем только цифры
                                                const value =
                                                    e.target.value.replace(
                                                        /[^\d]/g,
                                                        '',
                                                    );
                                                const numValue = value
                                                    ? Number.parseInt(value, 10)
                                                    : 0;
                                                form.onAmountInputChange(
                                                    numValue,
                                                );

                                                // Восстанавливаем позицию курсора
                                                setTimeout(() => {
                                                    const newText = numValue
                                                        ? `${numValue} ₽`
                                                        : '';
                                                    // Если курсор был перед символом ₽, оставляем его там
                                                    if (
                                                        cursorPos ===
                                                            oldValue.length -
                                                                1 &&
                                                        numValue
                                                    ) {
                                                        input.setSelectionRange(
                                                            newText.length - 2,
                                                            newText.length - 2,
                                                        );
                                                    } else if (
                                                        cursorPos <
                                                        oldValue.length - 2
                                                    ) {
                                                        // Если курсор был в середине числа, сохраняем позицию
                                                        const digitsBefore =
                                                            oldValue
                                                                .substring(
                                                                    0,
                                                                    cursorPos,
                                                                )
                                                                .replace(
                                                                    /[^\d]/g,
                                                                    '',
                                                                ).length;
                                                        const newPos = Math.min(
                                                            digitsBefore,
                                                            newText.length - 2,
                                                        );
                                                        input.setSelectionRange(
                                                            newPos,
                                                            newPos,
                                                        );
                                                    } else {
                                                        // Иначе ставим курсор перед символом ₽
                                                        input.setSelectionRange(
                                                            newText.length - 2,
                                                            newText.length - 2,
                                                        );
                                                    }
                                                }, 0);
                                            }}
                                            onKeyDown={(e) => {
                                                const input = e.currentTarget;
                                                const cursorPos =
                                                    input.selectionStart || 0;
                                                const value =
                                                    input.value.replace(
                                                        /[^\d]/g,
                                                        '',
                                                    );

                                                // Если пытаемся удалить символ ₽, удаляем последнюю цифру
                                                if (
                                                    e.key === 'Backspace' &&
                                                    cursorPos ===
                                                        input.value.length - 1
                                                ) {
                                                    e.preventDefault();
                                                    const newValue =
                                                        value.slice(0, -1);
                                                    form.onAmountInputChange(
                                                        newValue
                                                            ? Number.parseInt(
                                                                  newValue,
                                                                  10,
                                                              )
                                                            : 0,
                                                    );
                                                    setTimeout(() => {
                                                        const newText = newValue
                                                            ? `${newValue} ₽`
                                                            : '';
                                                        input.setSelectionRange(
                                                            newText.length - 2,
                                                            newText.length - 2,
                                                        );
                                                    }, 0);
                                                }

                                                // Запрещаем удаление символа ₽ через Delete
                                                if (
                                                    e.key === 'Delete' &&
                                                    cursorPos ===
                                                        input.value.length - 2
                                                ) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            required
                                            className="donation-amount-field__input"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                    {form.presetAmounts.map((presetAmount) => (
                                        <button
                                            key={presetAmount}
                                            type="button"
                                            onClick={() =>
                                                form.onPresetAmountSelect(
                                                    presetAmount,
                                                )
                                            }
                                            className={`donation-preset-amount-btn ${
                                                form.amount === presetAmount
                                                    ? 'donation-preset-amount-btn--active'
                                                    : ''
                                            }`}
                                        >
                                            {presetAmount}{' '}
                                            {CURRENCY_SYMBOLS[form.currency]}
                                        </button>
                                    ))}
                                </div>

                                <DonationRecurringSection
                                    enabled={form.allowRecurring}
                                    isRecurring={form.isRecurring}
                                    onRecurringChange={form.onRecurringChange}
                                    recurringPeriod={form.recurringPeriod}
                                    onRecurringPeriodChange={
                                        form.onRecurringPeriodChange
                                    }
                                    recurringPeriods={form.recurringPeriods}
                                    agreedToRecurring={form.agreedToRecurring}
                                    onAgreedToRecurringChange={
                                        form.onAgreedToRecurringChange
                                    }
                                    amount={form.amount}
                                    currency={form.currency}
                                    borderRadiusClass={borderRadiusClass}
                                    subscribersCount={subscribersCount}
                                />

                                <DonationPaymentMethods
                                    methods={paymentMethods.items}
                                    selectedMethod={
                                        paymentMethods.selectedMethod
                                    }
                                    onSelect={paymentMethods.onSelect}
                                    borderRadiusClass={borderRadiusClass}
                                    isMerchantActive={
                                        paymentMethods.isMerchantActive
                                    }
                                />

                                <div className="donation-policy-checkbox border-t pt-4">
                                    <Checkbox
                                        id="agreed_to_policy"
                                        checked={form.agreedToPolicy}
                                        onCheckedChange={(checked) =>
                                            form.onAgreedToPolicyChange(
                                                checked as boolean,
                                            )
                                        }
                                        required
                                    />
                                    <Label
                                        htmlFor="agreed_to_policy"
                                        className="donation-policy-checkbox__label"
                                    >
                                        Принимаю{' '}
                                        <a
                                            href="/policy/"
                                            target="_blank"
                                            className="donation-policy-checkbox__link"
                                        >
                                            условия обработки
                                        </a>{' '}
                                        персональных данных
                                    </Label>
                                </div>

                                {form.error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {form.error}
                                        </AlertDescription>
                                    </Alert>
                                )}
                                {form.success && (
                                    <Alert>
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <AlertDescription className="text-green-600">
                                            {form.success}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <button
                                    type="submit"
                                    disabled={
                                        form.isProcessing ||
                                        !form.isSelectedMethodAvailable
                                    }
                                    className={`btn-accent w-full px-6 py-3 ${borderRadiusClass} flex items-center justify-center gap-2 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${buttonStyleClass || ''}`}
                                >
                                    {form.isProcessing ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Обработка...
                                        </>
                                    ) : (
                                        <>
                                            <Heart className="h-5 w-5" />
                                            {buttonText}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </>
            );
        },
    );

DonationWidgetPublicView.displayName = 'DonationWidgetPublicView';

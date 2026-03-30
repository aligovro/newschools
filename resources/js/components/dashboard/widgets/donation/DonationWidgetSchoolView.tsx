import { Alert, AlertDescription } from '@/components/ui/alert';
import RussianPhoneInput from '@/components/ui/RussianPhoneInput';
import type { DonationPaymentData, PaymentMethod } from '@/lib/api/index';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import React from 'react';
import { BankRequisitesTab } from './BankRequisitesTab';
import { DonationPaymentModal } from './DonationPaymentModal';
import type {
    BankRequisites,
    DonationProgressData,
    DonationWidgetConfig,
} from './types';
import {
    CURRENCY_SYMBOLS,
    RECURRING_PERIOD_LABELS,
    normalizePaymentSlug,
} from './utils';

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
    donorPhoneFromProfile?: string;
    donorMessage: string;
    onDonorMessageChange: (value: string) => void;
    isAnonymous: boolean;
    onAnonymousChange: (value: boolean) => void;
    agreedToPolicy: boolean;
    onAgreedToPolicyChange: (value: boolean) => void;
    requireName: boolean;
    requireEmail: boolean;
    allowAnonymous: boolean;
    showMessageField: boolean;
    isProcessing: boolean;
    isSelectedMethodAvailable: boolean;
    error: string | null;
    success: string | null;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onGenerateBankRequisitesPdf?: (
        event: React.FormEvent<HTMLFormElement>,
    ) => void;
}

interface DonationPaymentMethodsState {
    items: PaymentMethod[];
    selectedMethod: string;
    onSelect: (slug: string) => void;
    isMerchantActive: boolean;
}

interface DonationWidgetSchoolViewProps {
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
    bankRequisites?: BankRequisites | null;
    averageDonation?: number;
}

/** Путь к иконкам шаблона school (public/icons/school-template) */
const SCHOOL_ICONS = '/icons/school-template';

const getPaymentMeta = (method: PaymentMethod) => {
    const slug = (
        method.slug ||
        method.type ||
        method.name ||
        ''
    ).toLowerCase();
    if (slug.includes('sbp') || slug === 'sbp' || slug.includes('qr')) {
        return {
            title: 'Через СПБ по QR-коду',
            icon: `${SCHOOL_ICONS}/sbp-qr.svg`,
        };
    }
    if (slug.includes('sber')) {
        return {
            title: 'Оплата SberPay',
            icon: `${SCHOOL_ICONS}/sber.svg`,
        };
    }
    if (
        slug.includes('tinkoff') ||
        slug.includes('tpay') ||
        slug.includes('t-pay')
    ) {
        return {
            title: 'Оплата T-Pay',
            icon: `${SCHOOL_ICONS}/t-bank.svg`,
        };
    }

    return {
        title: method.name || 'Банковской картой',
        icon: `${SCHOOL_ICONS}/card.svg`,
    };
};

export const DonationWidgetSchoolView: React.FC<DonationWidgetSchoolViewProps> =
    React.memo(
        ({
            bankRequisites,
            buttonText,
            form,
            paymentMethods,
            paymentModal,
            subscribersCount,
            title,
            averageDonation,
        }) => {
            const hasRequisitesText = !!bankRequisites?.text;

            // В шаблоне school "Выставить счет" - это просто один из методов оплаты.
            // Мы будем перехватывать его выбор.
            const BANK_REQUISITES_SLUG = 'bank_requisites';

            const isBankRequisitesSelected =
                paymentMethods.selectedMethod === BANK_REQUISITES_SLUG;

            const handleMethodSelect = (slug: string) => {
                paymentMethods.onSelect(slug);
            };

            // Подготавливаем список методов для отображения
            const displayMethods = paymentMethods.items.filter(
                (method, idx, arr) => {
                    const slugKey = normalizePaymentSlug(method).toLowerCase();
                    if (slugKey.includes('cash')) return false;
                    return (
                        arr.findIndex(
                            (item) =>
                                normalizePaymentSlug(item).toLowerCase() ===
                                slugKey,
                        ) === idx
                    );
                },
            );

            return (
                <>
                    <DonationPaymentModal
                        visible={paymentModal.visible}
                        payment={paymentModal.payment}
                        qrImageSrc={paymentModal.qrImageSrc}
                        onClose={paymentModal.onClose}
                    />
                    <div className="donation-form-card">
                        <div className="mb-6 flex items-start justify-between">
                            <h3 className="donation-form-card__title m-0">
                                {title || 'Поддержать'}
                            </h3>
                            {averageDonation !== undefined &&
                                averageDonation > 0 && (
                                    <div className="donation-form-card__hint">
                                        Средняя сумма
                                        <br />
                                        помощи —{' '}
                                        <strong>
                                            {Math.round(averageDonation / 100)}{' '}
                                            ₽
                                        </strong>
                                    </div>
                                )}
                        </div>

                        <form
                            onSubmit={(e) => {
                                if (
                                    isBankRequisitesSelected &&
                                    form.onGenerateBankRequisitesPdf
                                ) {
                                    form.onGenerateBankRequisitesPdf(e);
                                } else {
                                    form.onSubmit(e);
                                }
                            }}
                        >
                            {form.allowRecurring && (
                                <div className="mb-6">
                                    <div className="donation-form-card__type-tabs">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                form.onRecurringChange(false)
                                            }
                                            className={`donation-form-card__type-tab ${
                                                !form.isRecurring
                                                    ? 'donation-form-card__type-tab--active'
                                                    : 'donation-form-card__type-tab--inactive'
                                            }`}
                                        >
                                            Единоразово
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                form.onRecurringChange(true)
                                            }
                                            className={`donation-form-card__type-tab ${
                                                form.isRecurring
                                                    ? 'donation-form-card__type-tab--active'
                                                    : 'donation-form-card__type-tab--inactive'
                                            }`}
                                        >
                                            Автоплатёж
                                            {subscribersCount !== null &&
                                                subscribersCount !==
                                                    undefined &&
                                                subscribersCount > 0 && (
                                                    <span className="donation-form-card__type-badge">
                                                        {subscribersCount}
                                                        <img
                                                            src="/icons/heart-white.svg"
                                                            alt=""
                                                            className="donation-form-card__type-badge-icon"
                                                        />
                                                    </span>
                                                )}
                                        </button>
                                    </div>

                                    {form.isRecurring && (
                                        <>
                                            <div className="donation-form-card__frequency">
                                                {form.recurringPeriods.map(
                                                    (period) => (
                                                        <label
                                                            key={period}
                                                            className="donation-form-card__frequency-item"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="recurring_period"
                                                                value={period}
                                                                checked={
                                                                    form.recurringPeriod ===
                                                                    period
                                                                }
                                                                onChange={() =>
                                                                    form.onRecurringPeriodChange(
                                                                        period as any,
                                                                    )
                                                                }
                                                                className="sr-only"
                                                            />
                                                            <div
                                                                className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                                                                    form.recurringPeriod ===
                                                                    period
                                                                        ? 'border-[#1A1A1A] bg-[#1A1A1A]'
                                                                        : 'border-[#B5B9C3] bg-transparent'
                                                                }`}
                                                            >
                                                                {form.recurringPeriod ===
                                                                    period && (
                                                                    <svg
                                                                        width="10"
                                                                        height="8"
                                                                        viewBox="0 0 10 8"
                                                                        fill="none"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                    >
                                                                        <path
                                                                            d="M1 4L3.5 6.5L9 1"
                                                                            stroke="white"
                                                                            strokeWidth="2"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                        />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            {
                                                                RECURRING_PERIOD_LABELS[
                                                                    period as keyof typeof RECURRING_PERIOD_LABELS
                                                                ]
                                                            }
                                                        </label>
                                                    ),
                                                )}
                                            </div>

                                            <div className="mt-4 flex items-center gap-2 px-0">
                                                <div
                                                    className={`flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border ${
                                                        form.agreedToRecurring
                                                            ? 'border-black bg-black'
                                                            : 'border-gray-300'
                                                    }`}
                                                    onClick={() =>
                                                        form.onAgreedToRecurringChange(
                                                            !form.agreedToRecurring,
                                                        )
                                                    }
                                                >
                                                    {form.agreedToRecurring && (
                                                        <svg
                                                            width="10"
                                                            height="8"
                                                            viewBox="0 0 10 8"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                d="M1 4L3.5 6.5L9 1"
                                                                stroke="white"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    )}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        form.agreedToRecurring
                                                    }
                                                    onChange={(e) =>
                                                        form.onAgreedToRecurringChange(
                                                            e.target.checked,
                                                        )
                                                    }
                                                    className="sr-only"
                                                    required
                                                />
                                                <div className="donation-form-card__legal m-0 text-left">
                                                    Согласен на регулярные
                                                    списания{' '}
                                                    {
                                                        RECURRING_PERIOD_LABELS[
                                                            form.recurringPeriod
                                                        ]
                                                    }{' '}
                                                    по {form.amount}{' '}
                                                    {
                                                        CURRENCY_SYMBOLS[
                                                            form.currency
                                                        ]
                                                    }
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="mb-4">
                                <div className="donation-form-card__amount-wrapper">
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
                                            const value =
                                                e.target.value.replace(
                                                    /[^\d]/g,
                                                    '',
                                                );
                                            const numValue = value
                                                ? Number.parseInt(value, 10)
                                                : 0;
                                            form.onAmountInputChange(numValue);
                                        }}
                                        required
                                        className="donation-form-card__amount-input"
                                    />
                                    <div className="donation-form-card__presets">
                                        {form.presetAmounts
                                            .slice(0, 3)
                                            .map((presetAmount) => (
                                                <button
                                                    key={presetAmount}
                                                    type="button"
                                                    onClick={() =>
                                                        form.onPresetAmountSelect(
                                                            presetAmount,
                                                        )
                                                    }
                                                    className={`donation-form-card__preset ${
                                                        form.amount ===
                                                        presetAmount
                                                            ? 'donation-form-card__preset--active'
                                                            : ''
                                                    }`}
                                                >
                                                    {presetAmount}{' '}
                                                    {
                                                        CURRENCY_SYMBOLS[
                                                            form.currency
                                                        ]
                                                    }
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            </div>

                            <div className="donation-form-card__payment-methods">
                                {displayMethods.map((method) => {
                                    const slug = normalizePaymentSlug(method);
                                    const checked =
                                        paymentMethods.selectedMethod === slug;
                                    const disabled =
                                        !paymentMethods.isMerchantActive &&
                                        method.available === false;
                                    const meta = getPaymentMeta(method);

                                    return (
                                        <button
                                            key={slug}
                                            type="button"
                                            disabled={disabled}
                                            onClick={() =>
                                                handleMethodSelect(slug)
                                            }
                                            className={`donation-form-card__payment-method ${
                                                checked
                                                    ? 'donation-form-card__payment-method--active'
                                                    : ''
                                            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                                        >
                                            <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                                                <img
                                                    src={meta.icon}
                                                    alt=""
                                                    className="max-h-4 w-auto object-contain"
                                                />
                                            </div>
                                            <span className="text-left leading-tight">
                                                {meta.title}
                                            </span>
                                        </button>
                                    );
                                })}

                                {hasRequisitesText && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleMethodSelect(
                                                BANK_REQUISITES_SLUG,
                                            )
                                        }
                                        className={`donation-form-card__payment-method ${
                                            isBankRequisitesSelected
                                                ? 'donation-form-card__payment-method--active'
                                                : ''
                                        }`}
                                    >
                                        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                                            <img
                                                src={`${SCHOOL_ICONS}/bank.svg`}
                                                alt=""
                                                className="max-h-4 w-auto object-contain"
                                            />
                                        </div>
                                        <span className="text-left leading-tight">
                                            Выставить счет
                                        </span>
                                    </button>
                                )}
                            </div>

                            {isBankRequisitesSelected &&
                                bankRequisites &&
                                (bankRequisites.sber_card ||
                                    bankRequisites.tinkoff_card) && (
                                    <div className="mb-4">
                                        <BankRequisitesTab
                                            requisites={{
                                                sber_card:
                                                    bankRequisites.sber_card,
                                                tinkoff_card:
                                                    bankRequisites.tinkoff_card,
                                                card_recipient:
                                                    bankRequisites.card_recipient,
                                            }}
                                        />
                                    </div>
                                )}

                            <div className="mb-4 space-y-2">
                                {form.requireName && (
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={form.donorName}
                                            onChange={(e) =>
                                                form.onDonorNameChange(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Ваше имя"
                                            required={form.requireName}
                                            disabled={form.isAnonymous}
                                            className="donation-form-card__input"
                                        />
                                        {form.allowAnonymous && (
                                            <label className="absolute right-4 top-1/2 flex -translate-y-1/2 cursor-pointer items-center gap-2">
                                                <span className="text-xs font-medium text-gray-400">
                                                    Анонимно
                                                </span>
                                                <div
                                                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                                                        form.isAnonymous
                                                            ? 'border-black bg-black'
                                                            : 'border-gray-300'
                                                    }`}
                                                >
                                                    {form.isAnonymous && (
                                                        <svg
                                                            width="10"
                                                            height="8"
                                                            viewBox="0 0 10 8"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                d="M1 4L3.5 6.5L9 1"
                                                                stroke="white"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    )}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={form.isAnonymous}
                                                    onChange={(e) =>
                                                        form.onAnonymousChange(
                                                            e.target.checked,
                                                        )
                                                    }
                                                    className="sr-only"
                                                />
                                            </label>
                                        )}
                                    </div>
                                )}

                                {form.donorPhoneFromProfile ? (
                                    <div className="relative">
                                        <RussianPhoneInput
                                            id="donor_phone"
                                            value={form.donorPhone}
                                            onValueChange={() => {}}
                                            disabled
                                            readOnly
                                            className="donation-form-card__input opacity-70"
                                        />
                                    </div>
                                ) : (
                                    <RussianPhoneInput
                                        id="donor_phone"
                                        value={form.donorPhone}
                                        onValueChange={(val) =>
                                            form.onDonorPhoneChange(val)
                                        }
                                        className="donation-form-card__input"
                                        placeholder="Номер телефона"
                                    />
                                )}

                                {form.requireEmail && (
                                    <input
                                        type="email"
                                        value={form.donorEmail}
                                        onChange={(e) =>
                                            form.onDonorEmailChange(
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Email"
                                        required={form.requireEmail}
                                        className="donation-form-card__input"
                                    />
                                )}
                            </div>

                            {form.error && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        {form.error}
                                    </AlertDescription>
                                </Alert>
                            )}
                            {form.success && (
                                <Alert className="mb-4">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-600">
                                        {form.success}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="mb-4 flex items-center gap-2 px-2">
                                <div
                                    className={`flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border ${
                                        form.agreedToPolicy
                                            ? 'border-black bg-black'
                                            : 'border-gray-300'
                                    }`}
                                    onClick={() =>
                                        form.onAgreedToPolicyChange(
                                            !form.agreedToPolicy,
                                        )
                                    }
                                >
                                    {form.agreedToPolicy && (
                                        <svg
                                            width="10"
                                            height="8"
                                            viewBox="0 0 10 8"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M1 4L3.5 6.5L9 1"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={form.agreedToPolicy}
                                    onChange={(e) =>
                                        form.onAgreedToPolicyChange(
                                            e.target.checked,
                                        )
                                    }
                                    className="sr-only"
                                    required
                                />
                                <div className="donation-form-card__legal m-0 text-left">
                                    Принимаю{' '}
                                    <a href="/policy/" target="_blank">
                                        условия обработки
                                    </a>{' '}
                                    персональных данных
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={
                                    form.isProcessing ||
                                    (!isBankRequisitesSelected &&
                                        !form.isSelectedMethodAvailable)
                                }
                                className="donation-form-card__submit"
                            >
                                {form.isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Обработка...
                                    </>
                                ) : isBankRequisitesSelected ? (
                                    'Создать счет'
                                ) : (
                                    buttonText
                                )}
                            </button>
                        </form>
                    </div>
                </>
            );
        },
    );

DonationWidgetSchoolView.displayName = 'DonationWidgetSchoolView';

import { Alert, AlertDescription } from '@/components/ui/alert';
import type { PaymentMethod } from '@/lib/api/index';
import { Check } from 'lucide-react';
import React from 'react';
import { normalizePaymentSlug } from './utils';

interface DonationPaymentMethodsProps {
    methods: PaymentMethod[];
    selectedMethod: string;
    onSelect: (slug: string) => void;
    borderRadiusClass?: string;
    isMerchantActive: boolean;
}

const getPaymentMeta = (method: PaymentMethod) => {
    const slug = (
        method.slug ||
        method.type ||
        method.name ||
        ''
    ).toLowerCase();
    if (slug.includes('sbp') || slug === 'sbp' || slug.includes('qr')) {
        return {
            title: 'По QR коду через СБП',
            description: 'Через приложение вашего банка',
            icon: '/icons/spb-qr.svg',
        };
    }
    if (slug.includes('sber')) {
        return {
            title: 'Оплата через SberPay',
            description: 'В приложении банка',
            icon: '/icons/sber.svg',
        };
    }
    if (
        slug.includes('tinkoff') ||
        slug.includes('tpay') ||
        slug.includes('t-pay')
    ) {
        return {
            title: 'Оплата через T‑Pay',
            description: 'В приложении банка',
            icon: '/icons/t-bank.svg',
        };
    }

    return {
        title: method.name || 'Банковская карта',
        description: 'Visa, Mastercard, МИР и другие',
        icon: '/icons/cards.svg',
    };
};

export const DonationPaymentMethods: React.FC<DonationPaymentMethodsProps> =
    React.memo(({ methods, onSelect, selectedMethod, isMerchantActive }) => {
        return (
            <div className="border-t pt-4">
                <label className="mb-3 block text-sm font-medium text-gray-700">
                    Способ оплаты
                </label>
                {!isMerchantActive && (
                    <Alert className="mb-3 border-yellow-300 bg-yellow-50 text-yellow-700">
                        <AlertDescription>
                            Приём платежей временно недоступен. Попробуйте позже
                            или выберите другой способ, когда магазин будет
                            активирован.
                        </AlertDescription>
                    </Alert>
                )}
                <div className="space-y-2">
                    {methods.length > 0 ? (
                        methods
                            .filter((method, idx, arr) => {
                                const slugKey =
                                    normalizePaymentSlug(method).toLowerCase();
                                // Исключаем метод "cash" (наличные)
                                if (slugKey.includes('cash')) {
                                    return false;
                                }
                                return (
                                    arr.findIndex(
                                        (item) =>
                                            normalizePaymentSlug(
                                                item,
                                            ).toLowerCase() === slugKey,
                                    ) === idx
                                );
                            })
                            .map((method) => {
                                const slug = normalizePaymentSlug(method);
                                const checked = selectedMethod === slug;
                                const disabled =
                                    !isMerchantActive &&
                                    method.available === false;
                                const meta = getPaymentMeta(method);

                                return (
                                    <label
                                        key={slug}
                                        className={`donation-payment-methods__item ${
                                            checked
                                                ? 'donation-payment-methods__item--checked'
                                                : 'donation-payment-methods__item--unchecked'
                                        } ${
                                            disabled
                                                ? 'donation-payment-methods__item--disabled'
                                                : 'cursor-pointer'
                                        }`}
                                    >
                                        <img
                                            src={meta.icon}
                                            alt={meta.title}
                                            className="donation-payment-methods__icon"
                                        />
                                        <div className="donation-payment-methods__content">
                                            <div className="donation-payment-methods__title">
                                                {meta.title}
                                            </div>
                                            <div className="donation-payment-methods__description">
                                                {meta.description}
                                            </div>
                                            {disabled && (
                                                <div className="mt-1 text-xs text-yellow-700">
                                                    Недоступно для текущего
                                                    магазина
                                                </div>
                                            )}
                                        </div>
                                        <div
                                            className={`donation-payment-methods__checkbox ${
                                                checked
                                                    ? 'donation-payment-methods__checkbox--checked'
                                                    : 'donation-payment-methods__checkbox--unchecked'
                                            }`}
                                        >
                                            {checked && (
                                                <Check
                                                    className="text-white"
                                                    size={16}
                                                    strokeWidth={3}
                                                />
                                            )}
                                        </div>
                                        <input
                                            type="checkbox"
                                            role="checkbox"
                                            value={slug}
                                            aria-checked={checked}
                                            checked={checked}
                                            onChange={() =>
                                                !disabled && onSelect(slug)
                                            }
                                            className="sr-only"
                                            disabled={disabled}
                                        />
                                    </label>
                                );
                            })
                    ) : (
                        <div className="py-4 text-center text-gray-500">
                            Загрузка способов оплаты...
                        </div>
                    )}
                </div>
            </div>
        );
    });

DonationPaymentMethods.displayName = 'DonationPaymentMethods';

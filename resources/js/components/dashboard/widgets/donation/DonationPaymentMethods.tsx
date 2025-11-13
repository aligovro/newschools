import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ApiPaymentMethod } from '@/lib/api/index';
import { CreditCard, QrCode, Smartphone } from 'lucide-react';
import { normalizePaymentSlug } from './utils';

interface DonationPaymentMethodsProps {
    methods: ApiPaymentMethod[];
    selectedMethod: string;
    onSelect: (slug: string) => void;
    borderRadiusClass: string;
    isMerchantActive: boolean;
}

const getPaymentMeta = (method: ApiPaymentMethod) => {
    const slug = (method.slug || method.type || method.name || '').toLowerCase();
    if (slug.includes('sbp') || slug === 'sbp' || slug.includes('qr')) {
        return {
            title: 'По QR коду через СБП',
            description: 'Через приложение вашего банка',
            icon: <QrCode className="h-5 w-5 text-gray-400" />,
        };
    }
    if (slug.includes('sber')) {
        return {
            title: 'Оплата через SberPay',
            description: 'В приложении банка',
            icon: <Smartphone className="h-5 w-5 text-gray-400" />,
        };
    }
    if (slug.includes('tinkoff') || slug.includes('tpay') || slug.includes('t-pay')) {
        return {
            title: 'Оплата через T‑Pay',
            description: 'В приложении банка',
            icon: <Smartphone className="h-5 w-5 text-gray-400" />,
        };
    }

    return {
        title: method.name || 'Банковской картой',
        description: 'Visa, Mastercard, МИР и другие',
        icon: <CreditCard className="h-5 w-5 text-gray-400" />,
    };
};

export const DonationPaymentMethods: React.FC<DonationPaymentMethodsProps> =
    React.memo(({ methods, onSelect, selectedMethod, borderRadiusClass, isMerchantActive }) => {
        return (
            <div className="border-t pt-4">
                <label className="mb-3 block text-sm font-medium text-gray-700">
                    Способ оплаты
                </label>
                {!isMerchantActive && (
                    <Alert className="mb-3 border-yellow-300 bg-yellow-50 text-yellow-700">
                        <AlertDescription>
                            Приём платежей временно недоступен. Попробуйте позже или выберите другой
                            способ, когда магазин будет активирован.
                        </AlertDescription>
                    </Alert>
                )}
                <div className="space-y-2">
                    {methods.length > 0 ? (
                        methods
                            .filter((method, idx, arr) => {
                                const slugKey = normalizePaymentSlug(method).toLowerCase();
                                return (
                                    arr.findIndex(
                                        (item) =>
                                            normalizePaymentSlug(item).toLowerCase() === slugKey,
                                    ) === idx
                                );
                            })
                            .map((method) => {
                                const slug = normalizePaymentSlug(method);
                                const checked = selectedMethod === slug;
                                const disabled =
                                    !isMerchantActive && method.available === false;
                                const meta = getPaymentMeta(method);

                                return (
                                    <label
                                        key={slug}
                                        className={`flex items-center gap-3 border p-3 ${borderRadiusClass} transition-colors ${
                                            checked
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-300 bg-white hover:bg-gray-50'
                                        } ${
                                            disabled
                                                ? 'cursor-not-allowed opacity-50'
                                                : 'cursor-pointer'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            role="checkbox"
                                            value={slug}
                                            aria-checked={checked}
                                            checked={checked}
                                            onChange={() => onSelect(slug)}
                                            className="text-blue-600"
                                            disabled={disabled}
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium">{meta.title}</div>
                                            <div className="text-xs text-gray-600">
                                                {meta.description}
                                            </div>
                                            {disabled && (
                                                <div className="mt-1 text-xs text-yellow-700">
                                                    Недоступно для текущего магазина
                                                </div>
                                            )}
                                        </div>
                                        {meta.icon}
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


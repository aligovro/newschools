import React from 'react';
import type { DonationPaymentData } from '@/lib/api/index';
import { X } from 'lucide-react';

interface DonationPaymentModalProps {
    visible: boolean;
    payment: DonationPaymentData | null;
    qrImageSrc: string | null;
    onClose: () => void;
}

export const DonationPaymentModal: React.FC<DonationPaymentModalProps> = React.memo(
    ({ visible, payment, qrImageSrc, onClose }) => {
        if (!visible || !payment) {
            return null;
        }

        const hasSvg = Boolean(payment.qr_code_svg);

        return (
            <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 px-4">
                <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-3 top-3 rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                        aria-label="Закрыть"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        Отсканируйте QR-код
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">
                        Используйте приложение банка, чтобы завершить оплату.
                    </p>
                    {hasSvg ? (
                        <div className="mx-auto h-64 w-64 rounded-lg border border-gray-200 p-2">
                            <div
                                className="flex h-full w-full items-center justify-center [&_svg]:h-full [&_svg]:w-full [&_svg]:max-h-full [&_svg]:max-w-full"
                                // SVG генерируется на нашем бэке (BaconQrCode),
                                // поэтому мы считаем этот HTML доверенным.
                                dangerouslySetInnerHTML={{
                                    __html: payment.qr_code_svg as string,
                                }}
                            />
                        </div>
                    ) : qrImageSrc ? (
                        <img
                            src={qrImageSrc}
                            alt="QR код для оплаты"
                            className="mx-auto h-64 w-64 rounded-lg border border-gray-200 object-contain p-2"
                        />
                    ) : (
                        <div className="mb-4 rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-600">
                            Перейдите по ссылке ниже, чтобы завершить оплату.
                        </div>
                    )}
                    <div className="mt-4 space-y-2">
                        {payment.confirmation_url && (
                            <a
                                href={payment.confirmation_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                Открыть страницу оплаты
                            </a>
                        )}
                        {payment.deep_link && (
                            <a
                                href={payment.deep_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex w-full justify-center rounded-md border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                            >
                                Открыть в приложении банка
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    },
);

DonationPaymentModal.displayName = 'DonationPaymentModal';

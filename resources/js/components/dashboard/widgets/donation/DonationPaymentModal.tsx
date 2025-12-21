import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import type { DonationPaymentData } from '@/lib/api/index';
import { CheckCircle2, Loader2, X, XCircle } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface DonationPaymentModalProps {
    visible: boolean;
    payment: DonationPaymentData | null;
    qrImageSrc: string | null;
    onClose: () => void;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

type PaymentStatus =
    | 'pending'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'checking';

export const DonationPaymentModal: React.FC<DonationPaymentModalProps> =
    React.memo(
        ({ visible, payment, qrImageSrc, onClose, onSuccess, onError }) => {
            const [status, setStatus] = useState<PaymentStatus>('pending');
            const [isChecking, setIsChecking] = useState(false);
            const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
            const maxPollingAttempts = 60; // 5 минут (60 * 5 секунд)
            const pollingAttemptsRef = useRef(0);

            // Очистка интервала при размонтировании или закрытии
            useEffect(() => {
                if (!visible) {
                    if (pollingIntervalRef.current) {
                        clearInterval(pollingIntervalRef.current);
                        pollingIntervalRef.current = null;
                    }
                    setStatus('pending');
                    pollingAttemptsRef.current = 0;
                }
            }, [visible]);

            // Запуск polling при открытии модалки
            useEffect(() => {
                if (!visible || !payment?.transaction_id) {
                    return;
                }

                const checkPaymentStatus = async () => {
                    if (pollingAttemptsRef.current >= maxPollingAttempts) {
                        if (pollingIntervalRef.current) {
                            clearInterval(pollingIntervalRef.current);
                            pollingIntervalRef.current = null;
                        }
                        return;
                    }

                    try {
                        setIsChecking(true);
                        const response = await apiClient.get<{
                            success: boolean;
                            data?: {
                                status: string;
                                transaction_id: string;
                            };
                            error?: string;
                        }>(`/api/payments/status/${payment.transaction_id}`);

                        if (response.data.success && response.data.data) {
                            // API возвращает { success: true, data: { status, transaction_id, ... } }
                            const paymentStatus = response.data.data.status;
                            pollingAttemptsRef.current++;

                            if (paymentStatus === 'completed') {
                                setStatus('completed');
                                if (pollingIntervalRef.current) {
                                    clearInterval(pollingIntervalRef.current);
                                    pollingIntervalRef.current = null;
                                }
                                // Вызываем callback успеха через небольшую задержку для показа статуса
                                setTimeout(() => {
                                    onSuccess?.();
                                    onClose();
                                }, 2000);
                            } else if (
                                paymentStatus === 'failed' ||
                                paymentStatus === 'cancelled'
                            ) {
                                setStatus('failed');
                                if (pollingIntervalRef.current) {
                                    clearInterval(pollingIntervalRef.current);
                                    pollingIntervalRef.current = null;
                                }
                                onError?.('Платеж не был выполнен');
                            } else {
                                setStatus('pending');
                            }
                        }
                    } catch (error) {
                        console.error('Error checking payment status:', error);
                        // Продолжаем polling даже при ошибке
                    } finally {
                        setIsChecking(false);
                    }
                };

                // Первая проверка сразу
                checkPaymentStatus();

                // Затем каждые 5 секунд
                pollingIntervalRef.current = setInterval(
                    checkPaymentStatus,
                    5000,
                );

                return () => {
                    if (pollingIntervalRef.current) {
                        clearInterval(pollingIntervalRef.current);
                        pollingIntervalRef.current = null;
                    }
                };
            }, [visible, payment?.transaction_id, onSuccess, onError, onClose]);

            if (!visible || !payment) {
                return null;
            }

            const hasSvg = Boolean(payment.qr_code_svg);
            const showSuccess = status === 'completed';
            const showError = status === 'failed';

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
                        {showSuccess ? (
                            <>
                                <div className="mb-4 flex items-center justify-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                                    </div>
                                </div>
                                <h3 className="mb-2 text-center text-lg font-semibold text-gray-900">
                                    Платеж успешно выполнен!
                                </h3>
                                <p className="mb-4 text-center text-sm text-gray-600">
                                    Спасибо за ваше пожертвование!
                                </p>
                            </>
                        ) : showError ? (
                            <>
                                <div className="mb-4 flex items-center justify-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                        <XCircle className="h-8 w-8 text-red-600" />
                                    </div>
                                </div>
                                <h3 className="mb-2 text-center text-lg font-semibold text-gray-900">
                                    Платеж не выполнен
                                </h3>
                                <p className="mb-4 text-center text-sm text-gray-600">
                                    К сожалению, платеж не был завершен.
                                    Пожалуйста, попробуйте еще раз.
                                </p>
                            </>
                        ) : (
                            <>
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                    Отсканируйте QR-код
                                </h3>
                                <p className="mb-4 text-sm text-gray-600">
                                    Используйте приложение банка, чтобы
                                    завершить оплату.
                                    {isChecking && (
                                        <span className="ml-2 inline-flex items-center text-blue-600">
                                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                            Проверяем статус...
                                        </span>
                                    )}
                                </p>
                            </>
                        )}
                        {!showSuccess && !showError && (
                            <>
                                {hasSvg ? (
                                    <div className="mx-auto h-64 w-64 rounded-lg border border-gray-200 p-2">
                                        <div
                                            className="flex h-full w-full items-center justify-center [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full"
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
                                        Перейдите по ссылке ниже, чтобы
                                        завершить оплату.
                                    </div>
                                )}
                            </>
                        )}
                        {!showSuccess && !showError && (
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
                        )}
                        {(showSuccess || showError) && (
                            <div className="mt-4">
                                <Button onClick={onClose} className="w-full">
                                    Закрыть
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            );
        },
    );

DonationPaymentModal.displayName = 'DonationPaymentModal';

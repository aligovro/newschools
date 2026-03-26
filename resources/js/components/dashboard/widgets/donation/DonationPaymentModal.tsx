import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import type { DonationPaymentData } from '@/lib/api/index';
import * as DialogPrimitive from '@radix-ui/react-dialog';
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

/**
 * Модальное окно QR/статуса оплаты.
 *
 * Ранее использовало createPortal(overlay, document.body), что выводило его
 * за пределы DOM-дерева Radix Dialog. Radix в modal-режиме обрабатывает клики
 * вне своего контента через DismissableLayer в capture-фазе — портал в body
 * оказывался «снаружи», его кнопки не получали клики.
 *
 * Теперь компонент сам является вложенным Radix Dialog (через DialogPrimitive.*),
 * поэтому Radix корректно стекует dismiss-слои обоих диалогов: внутренний слой
 * обрабатывает события первым, внешний не вмешивается.
 */
export const DonationPaymentModal: React.FC<DonationPaymentModalProps> =
    React.memo(
        ({ visible, payment, qrImageSrc, onClose, onSuccess, onError }) => {
            const [status, setStatus] = useState<PaymentStatus>('pending');
            const [isChecking, setIsChecking] = useState(false);
            const [checkCount, setCheckCount] = useState(0);
            const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
            const maxPollingAttempts = 60; // 5 минут (60 * 5 секунд)
            const pollingAttemptsRef = useRef(0);
            const lastCheckTimeRef = useRef<number>(0);

            // Очистка интервала и состояния при закрытии
            useEffect(() => {
                if (!visible) {
                    if (pollingIntervalRef.current) {
                        clearInterval(pollingIntervalRef.current);
                        pollingIntervalRef.current = null;
                    }
                    setStatus('pending');
                    setIsChecking(false);
                    setCheckCount(0);
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

                    // Предотвращаем слишком частые запросы (минимум 3 секунды между запросами)
                    const now = Date.now();
                    if (now - lastCheckTimeRef.current < 3000) {
                        return;
                    }
                    lastCheckTimeRef.current = now;

                    try {
                        // Показываем индикатор только при первой проверке и каждые 5 проверок
                        if (
                            pollingAttemptsRef.current === 0 ||
                            pollingAttemptsRef.current % 5 === 0
                        ) {
                            setIsChecking(true);
                        }

                        const response = await apiClient.get<{
                            success: boolean;
                            data?: {
                                status: string;
                                transaction_id: string;
                            };
                            error?: string;
                        }>(`/payments/status/${payment.transaction_id}`);

                        if (response.data.success && response.data.data) {
                            const paymentStatus = response.data.data.status;
                            pollingAttemptsRef.current++;
                            setCheckCount(pollingAttemptsRef.current);

                            if (paymentStatus === 'completed') {
                                setStatus('completed');
                                setIsChecking(false);
                                if (pollingIntervalRef.current) {
                                    clearInterval(pollingIntervalRef.current);
                                    pollingIntervalRef.current = null;
                                }
                                setTimeout(() => {
                                    onSuccess?.();
                                    window.location.reload();
                                }, 2000);
                            } else if (
                                paymentStatus === 'failed' ||
                                paymentStatus === 'cancelled'
                            ) {
                                setStatus('failed');
                                setIsChecking(false);
                                if (pollingIntervalRef.current) {
                                    clearInterval(pollingIntervalRef.current);
                                    pollingIntervalRef.current = null;
                                }
                                onError?.('Платеж не был выполнен');
                            } else {
                                setStatus('pending');
                                setTimeout(() => setIsChecking(false), 500);
                            }
                        }
                    } catch (error) {
                        console.error('Error checking payment status:', error);
                        setIsChecking(false);
                    }
                };

                // Первая проверка через 3 секунды
                setTimeout(() => {
                    checkPaymentStatus();
                }, 3000);

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

            const hasSvg = payment ? Boolean(payment.qr_code_svg) : false;
            const showSuccess = status === 'completed';
            const showError = status === 'failed';

            return (
                <DialogPrimitive.Root
                    open={visible}
                    onOpenChange={(open) => {
                        if (!open) onClose();
                    }}
                >
                    <DialogPrimitive.Portal>
                        {/*
                         * Оверлей вложенного диалога — тонирует фон поверх основной модалки.
                         * z-index выше z-50 основного Dialog: последний портал в DOM
                         * и без z-index уже бы выиграл, но явный z-[60] даёт гарантию.
                         */}
                        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                        <DialogPrimitive.Content
                            className="fixed left-1/2 top-1/2 z-[60] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl outline-none duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                            // Клик мимо QR-модалки (на форму пожертвования) не закрывает её —
                            // пользователь может закрыть только явно через кнопку.
                            onPointerDownOutside={(e) => e.preventDefault()}
                            // aria-describedby нет — описание есть в контенте
                            aria-describedby={undefined}
                        >
                            <DialogPrimitive.Title className="sr-only">
                                {showSuccess
                                    ? 'Платёж выполнен'
                                    : showError
                                      ? 'Ошибка платежа'
                                      : 'Оплата по QR-коду'}
                            </DialogPrimitive.Title>

                            <DialogPrimitive.Close
                                className="absolute right-3 top-3 rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                                aria-label="Закрыть"
                            >
                                <X className="h-5 w-5" />
                            </DialogPrimitive.Close>

                            {payment && (
                                <>
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
                                                К сожалению, платеж не был
                                                завершен. Пожалуйста, попробуйте
                                                еще раз.
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                                Отсканируйте QR-код
                                            </h3>
                                            <p className="mb-4 text-sm text-gray-600">
                                                Используйте приложение банка,
                                                чтобы завершить оплату.
                                            </p>
                                            {checkCount > 0 && (
                                                <div className="mb-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                                                    {isChecking ? (
                                                        <>
                                                            <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                                                            <span>
                                                                Проверяем
                                                                статус...
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span>
                                                            Ожидаем
                                                            подтверждения
                                                            оплаты...
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {hasSvg ? (
                                                <div className="mx-auto h-64 w-64 rounded-lg border border-gray-200 p-2">
                                                    <div
                                                        className="flex h-full w-full items-center justify-center [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full"
                                                        // SVG генерируется на нашем бэке (BaconQrCode) — доверенный HTML
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
                                                    Перейдите по ссылке ниже,
                                                    чтобы завершить оплату.
                                                </div>
                                            )}
                                            <div className="mt-4 space-y-2">
                                                {payment.confirmation_url && (
                                                    <a
                                                        href={
                                                            payment.confirmation_url
                                                        }
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
                                                        Открыть в приложении
                                                        банка
                                                    </a>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {(showSuccess || showError) && (
                                        <div className="mt-4">
                                            <Button
                                                onClick={onClose}
                                                className="w-full"
                                            >
                                                Закрыть
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </DialogPrimitive.Content>
                    </DialogPrimitive.Portal>
                </DialogPrimitive.Root>
            );
        },
    );

DonationPaymentModal.displayName = 'DonationPaymentModal';

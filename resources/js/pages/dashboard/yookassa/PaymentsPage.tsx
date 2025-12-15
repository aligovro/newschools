import MerchantStatusBadge from '@/components/dashboard/yookassa/MerchantStatusBadge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { yookassaApi, type YooKassaPayment } from '@/lib/api/yookassa';
import { CURRENCY_SYMBOLS } from '@/lib/constants';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';

type PaymentResponse = {
    data: YooKassaPayment[];
    meta: {
        total?: number;
    };
};

const formatCurrency = (
    amount?: number,
    amountRubles?: number,
    currency?: string,
) => {
    const value =
        typeof amountRubles === 'number'
            ? amountRubles
            : typeof amount === 'number'
              ? amount / 100
              : undefined;
    if (typeof value !== 'number') return '—';
    const symbol = CURRENCY_SYMBOLS[currency || 'RUB'] || currency || 'RUB';
    return `${value.toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
    })} ${symbol}`;
};

const PaymentsPage: React.FC = () => {
    const [payments, setPayments] = useState<PaymentResponse>({
        data: [],
        meta: {},
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPayments = async () => {
            try {
                setIsLoading(true);
                // Получаем параметр merchant из URL
                const urlParams = new URLSearchParams(window.location.search);
                const merchantId = urlParams.get('merchant');

                const params: Record<string, unknown> = { per_page: 20 };
                if (merchantId) {
                    params.merchant = merchantId;
                }

                const response = await yookassaApi.listPayments(params);
                setPayments({
                    data: response.data,
                    meta: response.meta ?? {},
                });
            } catch (err) {
                console.error(err);
                setError('Не удалось загрузить платежи');
            } finally {
                setIsLoading(false);
            }
        };

        loadPayments();
    }, []);

    return (
        <>
            <Head title="ЮKassa — платежи" />
            <Card>
                <CardHeader>
                    <CardTitle>
                        Платежи ({payments.meta.total ?? payments.data.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="overflow-hidden rounded-lg border border-gray-200">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Транзакция</TableHead>
                                    <TableHead>Магазин</TableHead>
                                    <TableHead>Сумма</TableHead>
                                    <TableHead>Статус</TableHead>
                                    <TableHead>Дата</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            Загрузка...
                                        </TableCell>
                                    </TableRow>
                                ) : payments.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center text-sm text-gray-500"
                                        >
                                            Платежей пока нет
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    payments.data.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="text-sm text-gray-700">
                                                <div className="font-medium">
                                                    {payment.transaction
                                                        ?.transaction_id || '—'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {payment.external_id || '—'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {payment.merchant ? (
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-medium">
                                                            {
                                                                payment.merchant
                                                                    .organization
                                                                    .name
                                                            }
                                                        </div>
                                                        <MerchantStatusBadge
                                                            status={
                                                                payment.merchant
                                                                    .status
                                                            }
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">
                                                        —
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(
                                                    payment.amount,
                                                    payment.amount_rubles,
                                                    payment.currency,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">
                                                    {payment.status || '—'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                {payment.created_at
                                                    ? format(
                                                          new Date(
                                                              payment.created_at,
                                                          ),
                                                          'd MMMM yyyy, HH:mm',
                                                          { locale: ru },
                                                      )
                                                    : '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

PaymentsPage.layout = (page: React.ReactNode) => (
    <AppLayout title="ЮKassa — платежи">{page}</AppLayout>
);

export default PaymentsPage;

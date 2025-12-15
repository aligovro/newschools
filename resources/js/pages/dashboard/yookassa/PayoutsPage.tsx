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
import { yookassaApi, type YooKassaPayout } from '@/lib/api/yookassa';
import { CURRENCY_SYMBOLS } from '@/lib/constants';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';

type PayoutResponse = {
    data: YooKassaPayout[];
    meta: {
        total?: number;
    };
};

const formatMoney = (
    amount: number,
    amountRubles: number | undefined,
    currency: string,
) => {
    const value =
        typeof amountRubles === 'number' ? amountRubles : amount / 100;
    const symbol = CURRENCY_SYMBOLS[currency] || currency || 'RUB';
    return `${value.toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
    })} ${symbol}`;
};

const PayoutsPage: React.FC = () => {
    const [payouts, setPayouts] = useState<PayoutResponse>({
        data: [],
        meta: {},
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPayouts = async () => {
            try {
                setIsLoading(true);
                // Получаем параметр merchant из URL
                const urlParams = new URLSearchParams(window.location.search);
                const merchantId = urlParams.get('merchant');

                const params: Record<string, unknown> = { per_page: 20 };
                if (merchantId) {
                    params.merchant = merchantId;
                }

                const response = await yookassaApi.listPayouts(params);
                setPayouts({
                    data: response.data,
                    meta: response.meta ?? {},
                });
            } catch (err) {
                console.error(err);
                setError('Не удалось загрузить выплаты');
            } finally {
                setIsLoading(false);
            }
        };

        loadPayouts();
    }, []);

    return (
        <>
            <Head title="ЮKassa — выплаты" />
            <Card>
                <CardHeader>
                    <CardTitle>
                        Выплаты ({payouts.meta.total ?? payouts.data.length})
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
                                    <TableHead>Выплата</TableHead>
                                    <TableHead>Магазин</TableHead>
                                    <TableHead>Сумма</TableHead>
                                    <TableHead>Статус</TableHead>
                                    <TableHead>Запланировано</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            Загрузка...
                                        </TableCell>
                                    </TableRow>
                                ) : payouts.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center text-sm text-gray-500"
                                        >
                                            Выплат пока нет
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    payouts.data.map((payout) => (
                                        <TableRow key={payout.id}>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {payout.external_id || '—'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Создана:{' '}
                                                    {payout.created_at
                                                        ? format(
                                                              new Date(
                                                                  payout.created_at,
                                                              ),
                                                              'd MMMM yyyy, HH:mm',
                                                              { locale: ru },
                                                          )
                                                        : '—'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium">
                                                    {
                                                        payout.merchant
                                                            .organization.name
                                                    }
                                                </div>
                                                <MerchantStatusBadge
                                                    status={
                                                        payout.merchant.status
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {formatMoney(
                                                    payout.amount,
                                                    payout.amount_rubles,
                                                    payout.currency,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="rounded-full bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-600">
                                                    {payout.status || '—'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                {payout.scheduled_at
                                                    ? format(
                                                          new Date(
                                                              payout.scheduled_at,
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

PayoutsPage.layout = (page: React.ReactNode) => (
    <AppLayout title="ЮKassa — выплаты">{page}</AppLayout>
);

export default PayoutsPage;

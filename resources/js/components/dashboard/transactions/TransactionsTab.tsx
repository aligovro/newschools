import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { organizationPaymentsApi, type TransactionRow } from '@/lib/api/organizationPayments';
import { toast } from 'sonner';

const formatDate = (s: string | null) =>
    s ? new Date(s).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const formatAmount = (amount: number) =>
    amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₽';

const statusLabel: Record<string, string> = {
    completed: 'Завершён',
    pending: 'В ожидании',
    failed: 'Неуспешен',
    refunded: 'Возвращён',
};

interface TransactionsTabProps {
    organizationId: number;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({ organizationId }) => {
    const [data, setData] = useState<TransactionRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchTransactions = useCallback(
        async (page: number) => {
            setLoading(true);
            try {
                const res = await organizationPaymentsApi.getTransactions(organizationId, {
                    page,
                    per_page: 20,
                });
                setData(res.data);
                setCurrentPage(res.meta.current_page);
                setLastPage(res.meta.last_page);
                setTotal(res.meta.total);
            } catch {
                toast.error('Не удалось загрузить транзакции');
            } finally {
                setLoading(false);
            }
        },
        [organizationId]
    );

    useEffect(() => {
        void fetchTransactions(1);
    }, [fetchTransactions]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Транзакции {total > 0 && `(${total})`}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading && data.length === 0 ? (
                    <div className="flex min-h-[200px] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : data.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                        <p className="text-lg font-medium">Нет транзакций</p>
                        <p className="mt-2 text-sm">Платежи появятся здесь после поступления донатов.</p>
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Дата</TableHead>
                                    <TableHead>Донор</TableHead>
                                    <TableHead className="text-right">Сумма</TableHead>
                                    <TableHead>Статус</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="text-muted-foreground">
                                            {formatDate(row.paid_at ?? row.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            {row.donor_name || row.donor_phone || 'Анонимное пожертвование'}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatAmount(row.amount_rubles)}
                                        </TableCell>
                                        <TableCell>
                                            {statusLabel[row.status] ?? row.status}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {lastPage > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Страница {currentPage} из {lastPage}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => void fetchTransactions(currentPage - 1)}
                                        disabled={currentPage <= 1 || loading}
                                        className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                                    >
                                        Назад
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void fetchTransactions(currentPage + 1)}
                                        disabled={currentPage >= lastPage || loading}
                                        className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                                    >
                                        Вперёд
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

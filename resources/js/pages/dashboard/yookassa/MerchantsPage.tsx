import MerchantStatusBadge from '@/components/dashboard/yookassa/MerchantStatusBadge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { yookassaApi, type YooKassaMerchant } from '@/lib/api/yookassa';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Head } from '@inertiajs/react';
import { RefreshCw } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

type MerchantResponse = {
    data: YooKassaMerchant[];
    meta: {
        current_page?: number;
        last_page?: number;
        total?: number;
    };
};

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
    { value: 'all', label: 'Все' },
    { value: 'active', label: 'Активные' },
    { value: 'pending', label: 'На модерации' },
    { value: 'draft', label: 'Черновики' },
    { value: 'blocked', label: 'Заблокированные' },
    { value: 'rejected', label: 'Отклонённые' },
];

const MerchantsPage: React.FC = () => {
    const [merchants, setMerchants] = useState<MerchantResponse>({
        data: [],
        meta: {},
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [isSyncing, setIsSyncing] = useState<number | null>(null);

    const loadMerchants = useCallback(
        async (pageNumber = 1, status = statusFilter) => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await yookassaApi.listMerchants({
                    page: pageNumber,
                    status: status !== 'all' ? status : undefined,
                });

                setMerchants({
                    data: response.data,
                    meta: response.meta ?? {},
                });
                setPage(pageNumber);
            } catch (err) {
                console.error(err);
                setError('Не удалось загрузить список магазинов');
            } finally {
                setIsLoading(false);
            }
        },
        [statusFilter],
    );

    useEffect(() => {
        loadMerchants(1, statusFilter);
    }, [statusFilter, loadMerchants]);

    const handleSync = async (merchantId: number) => {
        try {
            setIsSyncing(merchantId);
            await yookassaApi.syncMerchant(merchantId, {});
            await loadMerchants(page, statusFilter);
        } catch (err) {
            console.error(err);
            setError('Не удалось обновить данные магазина');
        } finally {
            setIsSyncing(null);
        }
    };

    const totalMerchants = merchants.meta.total ?? merchants.data.length;

    const subtitle = useMemo(() => {
        const option = STATUS_OPTIONS.find(
            (item) => item.value === statusFilter,
        );
        return option?.label ?? 'Все';
    }, [statusFilter]);

    return (
        <>
            <Head title="ЮKassa — магазины" />
            <Card>
                <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <CardTitle>Магазины ЮKassa</CardTitle>
                        <CardDescription>
                            {subtitle} • Всего: {totalMerchants}
                        </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {STATUS_OPTIONS.map((option) => (
                            <Button
                                key={option.value}
                                variant={
                                    statusFilter === option.value
                                        ? 'default'
                                        : 'outline'
                                }
                                onClick={() => setStatusFilter(option.value)}
                                size="sm"
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
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
                                    <TableHead>Организация</TableHead>
                                    <TableHead>Статус</TableHead>
                                    <TableHead>Идентификаторы</TableHead>
                                    <TableHead>Синхронизация</TableHead>
                                    <TableHead className="text-right">
                                        Действия
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            Загрузка...
                                        </TableCell>
                                    </TableRow>
                                ) : merchants.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center text-sm text-gray-500"
                                        >
                                            Магазины не найдены
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    merchants.data.map((merchant) => (
                                        <TableRow key={merchant.id}>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {
                                                        merchant.organization
                                                            .name
                                                    }
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    ID:{' '}
                                                    {merchant.organization.id}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <MerchantStatusBadge
                                                    status={merchant.status}
                                                />
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                <div>
                                                    <span className="text-xs text-gray-500">
                                                        merchant_id:
                                                    </span>{' '}
                                                    {merchant.external_id ||
                                                        '—'}
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">
                                                        contract:
                                                    </span>{' '}
                                                    {merchant.contract_id || '—'}
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">
                                                        payout account:
                                                    </span>{' '}
                                                    {merchant.payout_account_id ||
                                                        '—'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                {merchant.last_synced_at ? (
                                                    formatDistanceToNow(
                                                        new Date(
                                                            merchant.last_synced_at,
                                                        ),
                                                        {
                                                            addSuffix: true,
                                                            locale: ru,
                                                        },
                                                    )
                                                ) : (
                                                    <span className="text-gray-400">
                                                        ещё не синхронизировано
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleSync(merchant.id)
                                                    }
                                                    disabled={
                                                        isSyncing ===
                                                        merchant.id
                                                    }
                                                >
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    {isSyncing === merchant.id
                                                        ? 'Обновление...'
                                                        : 'Обновить'}
                                                </Button>
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

MerchantsPage.layout = (page: React.ReactNode) => (
    <AppLayout title="ЮKassa — магазины">{page}</AppLayout>
);

export default MerchantsPage;


import MerchantStatusBadge from '@/components/dashboard/yookassa/MerchantStatusBadge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Head, Link } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
    CheckCircle2,
    CreditCard,
    DollarSign,
    ExternalLink,
    MoreVertical,
    RefreshCw,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

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

type MerchantStats = {
    payments: {
        total: number;
        succeeded: number;
        pending: number;
        total_amount: number;
    };
    payouts: {
        total: number;
        succeeded: number;
        pending: number;
        total_amount: number;
    };
    oauth: {
        authorized: boolean;
        authorized_at: string | null;
        token_expires_at: string | null;
    };
};

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
    const [merchantStats, setMerchantStats] = useState<
        Record<number, MerchantStats>
    >({});
    const [loadingStats, setLoadingStats] = useState<Set<number>>(new Set());
    const [isSyncingAuthorized, setIsSyncingAuthorized] = useState(false);

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

    const loadMerchantStats = useCallback(
        async (merchantId: number) => {
            if (merchantStats[merchantId] || loadingStats.has(merchantId)) {
                return;
            }

            try {
                setLoadingStats((prev) => new Set(prev).add(merchantId));
                const response = await yookassaApi.getMerchantStats(merchantId);
                setMerchantStats((prev) => ({
                    ...prev,
                    [merchantId]: response.data,
                }));
            } catch (err) {
                console.error('Failed to load merchant stats:', err);
            } finally {
                setLoadingStats((prev) => {
                    const next = new Set(prev);
                    next.delete(merchantId);
                    return next;
                });
            }
        },
        [merchantStats, loadingStats],
    );

    const handleSync = async (
        merchantId: number,
        options?: { with_payments?: boolean; with_payouts?: boolean },
    ) => {
        try {
            setIsSyncing(merchantId);
            await yookassaApi.syncMerchant(merchantId, options || {});
            await loadMerchants(page, statusFilter);
            // Обновляем статистику после синхронизации
            if (merchantStats[merchantId]) {
                delete merchantStats[merchantId];
                await loadMerchantStats(merchantId);
            }
            toast.success('Данные магазина обновлены');
        } catch (err) {
            console.error(err);
            setError('Не удалось обновить данные магазина');
            toast.error('Не удалось обновить данные магазина');
        } finally {
            setIsSyncing(null);
        }
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 2,
        }).format(amount / 100);
    };

    const handleSyncAuthorized = async () => {
        try {
            setIsSyncingAuthorized(true);
            setError(null);
            const response = await yookassaApi.syncAuthorizedMerchants();
            toast.success(
                response.message ||
                    `Синхронизировано ${response.data.synced_count} магазинов`,
            );
            await loadMerchants(page, statusFilter);

            if (response.data.errors_count > 0) {
                toast.warning(
                    `Ошибок при синхронизации: ${response.data.errors_count}`,
                );
            }
        } catch (err) {
            console.error(err);
            setError('Не удалось синхронизировать магазины');
            toast.error('Не удалось синхронизировать магазины из YooKassa');
        } finally {
            setIsSyncingAuthorized(false);
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
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleSyncAuthorized}
                            disabled={isSyncingAuthorized}
                        >
                            <RefreshCw
                                className={`mr-2 h-4 w-4 ${isSyncingAuthorized ? 'animate-spin' : ''}`}
                            />
                            {isSyncingAuthorized
                                ? 'Синхронизация...'
                                : 'Синхронизировать из YooKassa'}
                        </Button>
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
                                    <TableHead>OAuth</TableHead>
                                    <TableHead>Идентификаторы</TableHead>
                                    <TableHead>Статистика</TableHead>
                                    <TableHead>Синхронизация</TableHead>
                                    <TableHead className="text-right">
                                        Действия
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7}>
                                            Загрузка...
                                        </TableCell>
                                    </TableRow>
                                ) : merchants.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center text-sm text-gray-500"
                                        >
                                            Магазины не найдены
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    merchants.data.map((merchant) => {
                                        const stats =
                                            merchantStats[merchant.id];
                                        const isOAuthAuthorized =
                                            merchant.oauth?.authorized ?? false;

                                        return (
                                            <TableRow
                                                key={merchant.id}
                                                onMouseEnter={() => {
                                                    if (
                                                        !stats &&
                                                        !loadingStats.has(
                                                            merchant.id,
                                                        )
                                                    ) {
                                                        loadMerchantStats(
                                                            merchant.id,
                                                        );
                                                    }
                                                }}
                                            >
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {
                                                            merchant
                                                                .organization
                                                                .name
                                                        }
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        ID:{' '}
                                                        {
                                                            merchant
                                                                .organization.id
                                                        }
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <MerchantStatusBadge
                                                        status={merchant.status}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {isOAuthAuthorized ? (
                                                        <Badge
                                                            variant="default"
                                                            className="bg-green-600"
                                                        >
                                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                                            Авторизован
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">
                                                            Не авторизован
                                                        </Badge>
                                                    )}
                                                    {merchant.oauth
                                                        ?.authorized_at && (
                                                        <div className="mt-1 text-xs text-gray-500">
                                                            {formatDistanceToNow(
                                                                new Date(
                                                                    merchant.oauth.authorized_at,
                                                                ),
                                                                {
                                                                    addSuffix: true,
                                                                    locale: ru,
                                                                },
                                                            )}
                                                        </div>
                                                    )}
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
                                                        {merchant.contract_id ||
                                                            '—'}
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-gray-500">
                                                            payout account:
                                                        </span>{' '}
                                                        {merchant.payout_account_id ||
                                                            '—'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {loadingStats.has(
                                                        merchant.id,
                                                    ) ? (
                                                        <div className="text-xs text-gray-400">
                                                            Загрузка...
                                                        </div>
                                                    ) : stats ? (
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <CreditCard className="h-3 w-3 text-blue-600" />
                                                                <span className="text-xs">
                                                                    Платежей:{' '}
                                                                    {
                                                                        stats
                                                                            .payments
                                                                            .succeeded
                                                                    }
                                                                    /
                                                                    {
                                                                        stats
                                                                            .payments
                                                                            .total
                                                                    }
                                                                </span>
                                                            </div>
                                                            {stats.payments
                                                                .total_amount >
                                                                0 && (
                                                                <div className="text-xs font-medium text-green-600">
                                                                    {formatAmount(
                                                                        stats
                                                                            .payments
                                                                            .total_amount,
                                                                    )}
                                                                </div>
                                                            )}
                                                            <div className="mt-1 flex items-center gap-2">
                                                                <DollarSign className="h-3 w-3 text-purple-600" />
                                                                <span className="text-xs">
                                                                    Выплат:{' '}
                                                                    {
                                                                        stats
                                                                            .payouts
                                                                            .succeeded
                                                                    }
                                                                    /
                                                                    {
                                                                        stats
                                                                            .payouts
                                                                            .total
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-gray-400">
                                                            Наведите для
                                                            загрузки
                                                        </div>
                                                    )}
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
                                                            ещё не
                                                            синхронизировано
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled={
                                                                        isSyncing ===
                                                                        merchant.id
                                                                    }
                                                                >
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleSync(
                                                                            merchant.id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isSyncing ===
                                                                        merchant.id
                                                                    }
                                                                >
                                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                                    Обновить
                                                                    данные
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleSync(
                                                                            merchant.id,
                                                                            {
                                                                                with_payments: true,
                                                                            },
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isSyncing ===
                                                                        merchant.id
                                                                    }
                                                                >
                                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                                    Синхронизировать
                                                                    платежи
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleSync(
                                                                            merchant.id,
                                                                            {
                                                                                with_payouts: true,
                                                                            },
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isSyncing ===
                                                                        merchant.id
                                                                    }
                                                                >
                                                                    <DollarSign className="mr-2 h-4 w-4" />
                                                                    Синхронизировать
                                                                    выплаты
                                                                </DropdownMenuItem>
                                                                {merchant.external_id && (
                                                                    <>
                                                                        <DropdownMenuItem
                                                                            asChild
                                                                        >
                                                                            <Link
                                                                                href={`/dashboard/yookassa/payments?merchant=${merchant.id}`}
                                                                                className="flex items-center"
                                                                            >
                                                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                                                Платежи
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            asChild
                                                                        >
                                                                            <Link
                                                                                href={`/dashboard/yookassa/payouts?merchant=${merchant.id}`}
                                                                                className="flex items-center"
                                                                            >
                                                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                                                Выплаты
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
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

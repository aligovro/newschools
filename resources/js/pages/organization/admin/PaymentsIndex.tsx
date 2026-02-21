import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AutopaymentsTab } from '@/components/dashboard/autopayments/AutopaymentsTab';
import { TransactionsTab } from '@/components/dashboard/transactions/TransactionsTab';

const getInitialTab = (): string => {
    if (typeof window === 'undefined') return 'transactions';
    const tab = new URLSearchParams(window.location.search).get('tab');
    return tab === 'autopayments' ? 'autopayments' : 'transactions';
};

interface PaymentsIndexProps {
    organization: {
        id: number;
        name: string;
        [key: string]: unknown;
    };
    stats: {
        totalRevenue: number;
        monthlyRevenue: number;
        totalTransactions: number;
        successfulTransactions: number;
        failedTransactions: number;
        pendingTransactions: number;
        averageTransaction: number;
    };
    recentTransactions: unknown[];
    paymentMethods: unknown[];
}

const PaymentsIndex: React.FC<PaymentsIndexProps> = ({
    organization,
    stats,
    recentTransactions,
    paymentMethods,
}) => {
    const [activeTab, setActiveTab] = useState(getInitialTab);

    return (
        <AppLayout>
            <Head title={`Платежи — ${organization.name}`} />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Платежи</h1>
                    <p className="text-muted-foreground">
                        Управление платежами и автоплатежами организации
                    </p>
                </div>

                {/* Статистика */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Общая выручка
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {(stats.totalRevenue / 100).toLocaleString('ru-RU', {
                                    minimumFractionDigits: 2,
                                })}{' '}
                                ₽
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Выручка за месяц
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {(stats.monthlyRevenue / 100).toLocaleString('ru-RU', {
                                    minimumFractionDigits: 2,
                                })}{' '}
                                ₽
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Всего транзакций
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalTransactions}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Успешных транзакций
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.successfulTransactions}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Табы */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="transactions">Транзакции</TabsTrigger>
                        <TabsTrigger value="autopayments">Автоплатежи</TabsTrigger>
                    </TabsList>
                    <TabsContent value="transactions" className="space-y-4">
                        <TransactionsTab organizationId={organization.id} />
                    </TabsContent>
                    <TabsContent value="autopayments" className="space-y-4">
                        <AutopaymentsTab organizationId={organization.id} />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
};

export default PaymentsIndex;

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface PaymentReturnProps {
    transaction?: {
        id: number;
        transaction_id: string;
        status: string;
        amount: number;
        amount_rubles: number;
        formatted_amount: string;
        currency: string;
        is_success: boolean;
        is_pending: boolean;
        is_failed: boolean;
        organization?: {
            id: number;
            name: string;
            slug: string;
        } | null;
    } | null;
    error?: string | null;
}

export default function PaymentReturn({
    transaction,
    error,
}: PaymentReturnProps) {
    if (error) {
        return (
            <>
                <Head title="Ошибка обработки платежа" />
                <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
                    <div className="flex w-full max-w-md flex-col gap-6">
                        <Card className="rounded-xl">
                            <CardHeader className="px-10 pb-0 pt-8 text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <CardTitle className="text-xl">
                                    Ошибка обработки платежа
                                </CardTitle>
                                <CardDescription>{error}</CardDescription>
                            </CardHeader>
                            <CardContent className="px-10 py-8">
                                <div className="flex flex-col gap-4">
                                    <Button asChild className="w-full">
                                        <Link href="/">
                                            Вернуться на главную
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </>
        );
    }

    if (!transaction) {
        return (
            <>
                <Head title="Платеж не найден" />
                <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
                    <div className="flex w-full max-w-md flex-col gap-6">
                        <Card className="rounded-xl">
                            <CardHeader className="px-10 pb-0 pt-8 text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                                </div>
                                <CardTitle className="text-xl">
                                    Платеж не найден
                                </CardTitle>
                                <CardDescription>
                                    Транзакция с указанным ID не найдена в
                                    системе
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-10 py-8">
                                <div className="flex flex-col gap-4">
                                    <Button asChild className="w-full">
                                        <Link href="/">
                                            Вернуться на главную
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </>
        );
    }

    const getStatusIcon = () => {
        if (transaction.is_success) {
            return <CheckCircle2 className="h-6 w-6 text-green-600" />;
        }
        if (transaction.is_pending) {
            return <Clock className="h-6 w-6 text-yellow-600" />;
        }
        if (transaction.is_failed) {
            return <XCircle className="h-6 w-6 text-red-600" />;
        }
        return <AlertCircle className="h-6 w-6 text-gray-600" />;
    };

    const getStatusTitle = () => {
        if (transaction.is_success) {
            return 'Платеж успешно выполнен';
        }
        if (transaction.is_pending) {
            return 'Платеж обрабатывается';
        }
        if (transaction.is_failed) {
            return 'Платеж не выполнен';
        }
        return 'Статус платежа неизвестен';
    };

    const getStatusDescription = () => {
        if (transaction.is_success) {
            return `Спасибо за ваше пожертвование! Сумма ${transaction.formatted_amount} успешно зачислена.`;
        }
        if (transaction.is_pending) {
            return `Ваш платеж на сумму ${transaction.formatted_amount} обрабатывается. Мы уведомим вас, когда платеж будет завершен.`;
        }
        if (transaction.is_failed) {
            return `К сожалению, платеж на сумму ${transaction.formatted_amount} не был выполнен. Пожалуйста, попробуйте еще раз.`;
        }
        return 'Не удалось определить статус платежа.';
    };

    const getStatusColor = () => {
        if (transaction.is_success) {
            return 'bg-green-100 text-green-600';
        }
        if (transaction.is_pending) {
            return 'bg-yellow-100 text-yellow-600';
        }
        if (transaction.is_failed) {
            return 'bg-red-100 text-red-600';
        }
        return 'bg-gray-100 text-gray-600';
    };

    return (
        <>
            <Head title={getStatusTitle()} />
            <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
                <div className="flex w-full max-w-md flex-col gap-6">
                    <Card className="rounded-xl">
                        <CardHeader className="px-10 pb-0 pt-8 text-center">
                            <div
                                className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${getStatusColor()}`}
                            >
                                {getStatusIcon()}
                            </div>
                            <CardTitle className="text-xl">
                                {getStatusTitle()}
                            </CardTitle>
                            <CardDescription>
                                {getStatusDescription()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-10 py-8">
                            <div className="flex flex-col gap-4">
                                <div className="bg-muted rounded-lg p-4">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Сумма:
                                            </span>
                                            <span className="font-medium">
                                                {transaction.formatted_amount}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Статус:
                                            </span>
                                            <span className="font-medium capitalize">
                                                {transaction.status}
                                            </span>
                                        </div>
                                        {transaction.organization && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Организация:
                                                </span>
                                                <span className="font-medium">
                                                    {
                                                        transaction.organization
                                                            .name
                                                    }
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                ID транзакции:
                                            </span>
                                            <span className="font-mono text-xs">
                                                {transaction.transaction_id}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {transaction.organization && (
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <Link
                                                href={`/organization/${transaction.organization.slug}`}
                                            >
                                                Вернуться на страницу
                                                организации
                                            </Link>
                                        </Button>
                                    )}
                                    <Button asChild className="w-full">
                                        <Link href="/">
                                            Вернуться на главную
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { yookassaApi, type YooKassaMerchant } from '@/lib/api/yookassa';
import {
    Check,
    CheckCircle2,
    Copy,
    ExternalLink,
    Loader2,
    Shield,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface YooKassaOAuthBlockProps {
    organizationId: number;
}

export default function YooKassaOAuthBlock({
    organizationId,
}: YooKassaOAuthBlockProps) {
    const [authorizationUrl, setAuthorizationUrl] = useState<string | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [merchant, setMerchant] = useState<YooKassaMerchant | null>(null);
    const [isLoadingMerchant, setIsLoadingMerchant] = useState(true);

    useEffect(() => {
        loadMerchantStatus();
    }, [organizationId]);

    const loadMerchantStatus = async () => {
        setIsLoadingMerchant(true);
        try {
            const response =
                await yookassaApi.getMerchantByOrganization(organizationId);
            setMerchant(response.data);
        } catch (error) {
            console.error('Failed to load merchant status:', error);
        } finally {
            setIsLoadingMerchant(false);
        }
    };

    const isAuthorized =
        (merchant?.credentials?.oauth_authorized_at !== undefined &&
            merchant.credentials.oauth_authorized_at !== null) ||
        merchant?.settings?.oauth_authorized === true ||
        (merchant?.credentials?.access_token && merchant?.status === 'active');

    const authorizedAt =
        merchant?.credentials?.oauth_authorized_at ||
        merchant?.settings?.oauth_authorized_at;

    const handleGenerateLink = async () => {
        setIsLoading(true);
        try {
            const response =
                await yookassaApi.getAuthorizationUrl(organizationId);
            setAuthorizationUrl(response.authorization_url);
            toast.success('Ссылка для авторизации создана');
        } catch (error) {
            console.error('Failed to generate authorization URL:', error);
            toast.error('Не удалось создать ссылку для авторизации');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefreshStatus = async () => {
        await loadMerchantStatus();
        toast.success('Статус обновлен');
    };

    const handleCopyLink = async () => {
        if (!authorizationUrl) return;

        try {
            await navigator.clipboard.writeText(authorizationUrl);
            setIsCopied(true);
            toast.success('Ссылка скопирована в буфер обмена');
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy link:', error);
            toast.error('Не удалось скопировать ссылку');
        }
    };

    const handleOpenLink = () => {
        if (authorizationUrl) {
            window.open(authorizationUrl, '_blank');
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-yellow-600" />
                        <CardTitle>Авторизация YooKassa Partner</CardTitle>
                    </div>
                    {isLoadingMerchant ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : isAuthorized ? (
                        <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Авторизован
                        </Badge>
                    ) : null}
                </div>
                <CardDescription>
                    {isAuthorized
                        ? 'Магазин авторизован в системе YooKassa Partner API'
                        : 'Создайте ссылку для авторизации магазина в системе YooKassa Partner API'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isAuthorized && authorizedAt && (
                    <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600 dark:text-green-400" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                    Магазин успешно авторизован
                                </p>
                                <p className="mt-1 text-xs text-green-700 dark:text-green-300">
                                    Авторизация получена:{' '}
                                    {new Date(authorizedAt).toLocaleString(
                                        'ru-RU',
                                    )}
                                </p>
                                {merchant?.status && (
                                    <p className="mt-1 text-xs text-green-700 dark:text-green-300">
                                        Статус: {merchant.status}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {!authorizationUrl ? (
                    <Button
                        onClick={handleGenerateLink}
                        disabled={isLoading}
                        className="w-full"
                        variant="default"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Создание ссылки...
                            </>
                        ) : (
                            <>
                                <Shield className="mr-2 h-4 w-4" />
                                Создать ссылку для авторизации
                            </>
                        )}
                    </Button>
                ) : (
                    <div className="space-y-3">
                        <div className="bg-muted rounded-md p-3">
                            <p className="mb-1 text-xs font-medium text-muted-foreground">
                                Ссылка для авторизации:
                            </p>
                            <p className="break-all font-mono text-sm text-foreground">
                                {authorizationUrl}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleCopyLink}
                                variant="outline"
                                className="flex-1"
                                disabled={isCopied}
                            >
                                {isCopied ? (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Скопировано
                                    </>
                                ) : (
                                    <>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Копировать ссылку
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleOpenLink}
                                variant="default"
                                className="flex-1"
                            >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Открыть
                            </Button>
                        </div>
                        <Button
                            onClick={() => {
                                setAuthorizationUrl(null);
                                setIsCopied(false);
                            }}
                            variant="ghost"
                            className="w-full"
                            size="sm"
                        >
                            Создать новую ссылку
                        </Button>
                    </div>
                )}
                {isAuthorized && (
                    <Button
                        onClick={handleRefreshStatus}
                        variant="outline"
                        className="w-full"
                        size="sm"
                        disabled={isLoadingMerchant}
                    >
                        {isLoadingMerchant ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Обновление...
                            </>
                        ) : (
                            'Обновить статус'
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

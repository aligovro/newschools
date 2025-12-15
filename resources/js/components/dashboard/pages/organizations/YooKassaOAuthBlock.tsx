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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
    const [oauthToken, setOAuthToken] = useState('');
    const [oauthRefreshToken, setOAuthRefreshToken] = useState('');
    const [oauthExpiresIn, setOAuthExpiresIn] = useState('');
    const [isSavingToken, setIsSavingToken] = useState(false);

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

    const handleSaveOAuthToken = async () => {
        if (!oauthToken.trim()) {
            toast.error('Введите OAuth токен');
            return;
        }

        setIsSavingToken(true);
        try {
            await yookassaApi.saveOAuthToken(organizationId, {
                access_token: oauthToken.trim(),
                refresh_token: oauthRefreshToken.trim() || undefined,
                expires_in: oauthExpiresIn
                    ? parseInt(oauthExpiresIn, 10)
                    : undefined,
                external_id: merchant?.external_id || undefined,
            });
            await loadMerchantStatus();
            setIsTokenDialogOpen(false);
            setOAuthToken('');
            setOAuthRefreshToken('');
            setOAuthExpiresIn('');
            toast.success(
                'OAuth токен успешно сохранен. Магазин готов к работе с API.',
            );
        } catch (error: unknown) {
            console.error('Failed to save OAuth token:', error);
            const errorMessage =
                (error as { response?: { data?: { error?: string } } })
                    ?.response?.data?.error ||
                'Не удалось сохранить OAuth токен';
            toast.error(errorMessage);
        } finally {
            setIsSavingToken(false);
        }
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
                {!merchant && !isLoadingMerchant && (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Мерчант не найден в базе данных. Если вы уже
                            авторизовали приложение в YooKassa, вы можете
                            привязать магазин по его ID.
                        </p>
                        <Dialog
                            open={isTokenDialogOpen}
                            onOpenChange={setIsTokenDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button variant="default" className="w-full">
                                    <Shield className="mr-2 h-4 w-4" />
                                    Ввести OAuth токен
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Ввести OAuth токен для привязки магазина
                                    </DialogTitle>
                                    <DialogDescription>
                                        Введите OAuth токен, полученный при
                                        авторизации магазина в YooKassa. Shop ID
                                        будет автоматически получен из токена.
                                        <br />
                                        <br />
                                        <strong>Где найти OAuth токен:</strong>
                                        <br />
                                        • После успешной OAuth авторизации токен
                                        возвращается в ответе callback
                                        <br />• Или создайте новую ссылку для
                                        авторизации и пройдите процесс заново
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="oauth-token">
                                            Access Token (обязательно)
                                        </Label>
                                        <Input
                                            id="oauth-token"
                                            type="password"
                                            placeholder="Введите access_token"
                                            value={oauthToken}
                                            onChange={(e) =>
                                                setOAuthToken(e.target.value)
                                            }
                                            disabled={isSavingToken}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="oauth-refresh-token">
                                            Refresh Token (необязательно)
                                        </Label>
                                        <Input
                                            id="oauth-refresh-token"
                                            type="password"
                                            placeholder="Введите refresh_token"
                                            value={oauthRefreshToken}
                                            onChange={(e) =>
                                                setOAuthRefreshToken(
                                                    e.target.value,
                                                )
                                            }
                                            disabled={isSavingToken}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="oauth-expires-in">
                                            Срок действия (секунды,
                                            необязательно)
                                        </Label>
                                        <Input
                                            id="oauth-expires-in"
                                            type="number"
                                            placeholder="Например: 157680000"
                                            value={oauthExpiresIn}
                                            onChange={(e) =>
                                                setOAuthExpiresIn(
                                                    e.target.value,
                                                )
                                            }
                                            disabled={isSavingToken}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsTokenDialogOpen(false);
                                            setOAuthToken('');
                                            setOAuthRefreshToken('');
                                            setOAuthExpiresIn('');
                                        }}
                                        disabled={isSavingToken}
                                    >
                                        Отмена
                                    </Button>
                                    <Button
                                        onClick={handleSaveOAuthToken}
                                        disabled={
                                            isSavingToken || !oauthToken.trim()
                                        }
                                    >
                                        {isSavingToken ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Сохранение...
                                            </>
                                        ) : (
                                            'Сохранить токен'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
                {merchant && !isAuthorized && merchant.external_id && (
                    <div className="space-y-3 rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950">
                        <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                            Магазин привязан, но требуется OAuth авторизация
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                            Для работы с API необходимо пройти OAuth авторизацию
                            или ввести OAuth токен вручную.
                        </p>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleGenerateLink}
                                variant="default"
                                className="flex-1"
                                size="sm"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Создание...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="mr-2 h-4 w-4" />
                                        Создать ссылку OAuth
                                    </>
                                )}
                            </Button>
                            <Dialog
                                open={isTokenDialogOpen}
                                onOpenChange={setIsTokenDialogOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        Ввести токен
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Ввести OAuth токен вручную
                                        </DialogTitle>
                                        <DialogDescription>
                                            Если у вас есть OAuth токен,
                                            полученный при авторизации магазина,
                                            введите его здесь. Shop ID будет
                                            автоматически получен из токена.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="oauth-token-existing">
                                                Access Token (обязательно)
                                            </Label>
                                            <Input
                                                id="oauth-token-existing"
                                                type="password"
                                                placeholder="Введите access_token"
                                                value={oauthToken}
                                                onChange={(e) =>
                                                    setOAuthToken(
                                                        e.target.value,
                                                    )
                                                }
                                                disabled={isSavingToken}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="oauth-refresh-token-existing">
                                                Refresh Token (необязательно)
                                            </Label>
                                            <Input
                                                id="oauth-refresh-token-existing"
                                                type="password"
                                                placeholder="Введите refresh_token"
                                                value={oauthRefreshToken}
                                                onChange={(e) =>
                                                    setOAuthRefreshToken(
                                                        e.target.value,
                                                    )
                                                }
                                                disabled={isSavingToken}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="oauth-expires-in-existing">
                                                Срок действия (секунды,
                                                необязательно)
                                            </Label>
                                            <Input
                                                id="oauth-expires-in-existing"
                                                type="number"
                                                placeholder="Например: 157680000"
                                                value={oauthExpiresIn}
                                                onChange={(e) =>
                                                    setOAuthExpiresIn(
                                                        e.target.value,
                                                    )
                                                }
                                                disabled={isSavingToken}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsTokenDialogOpen(false);
                                                setOAuthToken('');
                                                setOAuthRefreshToken('');
                                                setOAuthExpiresIn('');
                                            }}
                                            disabled={isSavingToken}
                                        >
                                            Отмена
                                        </Button>
                                        <Button
                                            onClick={handleSaveOAuthToken}
                                            disabled={
                                                isSavingToken ||
                                                !oauthToken.trim()
                                            }
                                        >
                                            {isSavingToken ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Сохранение...
                                                </>
                                            ) : (
                                                'Сохранить токен'
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
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

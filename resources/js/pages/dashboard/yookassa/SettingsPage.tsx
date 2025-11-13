import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import {
    yookassaApi,
    type YooKassaSettingsPayload,
} from '@/lib/api/yookassa';
import { Head } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

const SettingsPage: React.FC = () => {
    const [form, setForm] = useState<YooKassaSettingsPayload>({
        credentials: {
            client_id: '',
            secret_key: '',
            account_id: '',
            base_url: '',
        },
        options: {},
        webhook: {},
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                setIsLoading(true);
                const response = await yookassaApi.getSettings();
                if (response.data) {
                    setForm({
                        credentials: {
                            client_id:
                                response.data.credentials.client_id || '',
                            secret_key:
                                response.data.credentials.secret_key || '',
                            account_id:
                                response.data.credentials.account_id || '',
                            base_url:
                                response.data.credentials.base_url || '',
                        },
                        options: response.data.options || {},
                        webhook: response.data.webhook || {},
                    });
                }
            } catch (err) {
                console.error(err);
                setError('Не удалось загрузить настройки');
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, []);

    const handleChange = (
        field: keyof YooKassaSettingsPayload['credentials'],
    ) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({
            ...prev,
            credentials: {
                ...prev.credentials,
                [field]: event.target.value,
            },
        }));
    };

    const handleWebhookChange = (field: 'url' | 'secret') =>
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setForm((prev) => ({
                ...prev,
                webhook: {
                    ...prev.webhook,
                    [field]: event.target.value,
                },
            }));
        };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSaving(true);
        setError(null);
        setMessage(null);

        try {
            await yookassaApi.updateSettings(form);
            setMessage('Настройки успешно сохранены');
        } catch (err) {
            console.error(err);
            setError('Не удалось сохранить настройки');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Head title="ЮKassa — настройки" />
            <Card>
                <CardHeader>
                    <CardTitle>Настройки платформы ЮKassa</CardTitle>
                    <CardDescription>
                        Управление ключами доступа и webhook-уведомлениями
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {message && (
                        <Alert className="mb-4 border-green-200 bg-green-50 text-green-700">
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <fieldset disabled={isLoading} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="client_id">
                                        Partner Client ID
                                    </Label>
                                    <Input
                                        id="client_id"
                                        value={form.credentials.client_id}
                                        onChange={handleChange('client_id')}
                                        required
                                        placeholder="pk_..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="secret_key">
                                        Partner Secret Key
                                    </Label>
                                    <Input
                                        id="secret_key"
                                        type="password"
                                        value={form.credentials.secret_key}
                                        onChange={handleChange('secret_key')}
                                        required
                                        placeholder="sk_..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="account_id">
                                        Account ID (опционально)
                                    </Label>
                                    <Input
                                        id="account_id"
                                        value={form.credentials.account_id}
                                        onChange={handleChange('account_id')}
                                        placeholder="acc_..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="base_url">
                                        Базовый URL API (опционально)
                                    </Label>
                                    <Input
                                        id="base_url"
                                        value={form.credentials.base_url}
                                        onChange={handleChange('base_url')}
                                        placeholder="https://api.yookassa.ru"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="webhook_url">
                                        Webhook URL
                                    </Label>
                                    <Input
                                        id="webhook_url"
                                        value={form.webhook?.url || ''}
                                        onChange={handleWebhookChange('url')}
                                        placeholder="https://example.com/webhook/yookassa/partner"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="webhook_secret">
                                        Webhook секрет
                                    </Label>
                                    <Input
                                        id="webhook_secret"
                                        value={form.webhook?.secret || ''}
                                        onChange={handleWebhookChange('secret')}
                                        placeholder="секретная строка для проверки"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? 'Сохранение...' : 'Сохранить'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </>
    );
};

SettingsPage.layout = (page: React.ReactNode) => (
    <AppLayout title="ЮKassa — настройки">{page}</AppLayout>
);

export default SettingsPage;


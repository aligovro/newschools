import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save } from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface PaymentSettingsData {
    gateway?: 'sbp' | 'yookassa' | 'tinkoff';
    credentials?: Record<string, string>;
    options?: Record<string, any>;
    donation_min_amount?: number;
    donation_max_amount?: number;
    currency?: string;
    test_mode?: boolean;
}

interface PaymentSettingsProps {
    siteId: number;
    initialSettings?: PaymentSettingsData;
}

const PaymentSettings: React.FC<PaymentSettingsProps> = ({
    siteId,
    initialSettings = {},
}) => {
    const [settings, setSettings] = useState<PaymentSettingsData>({
        gateway: initialSettings.gateway ?? 'yookassa',
        credentials: initialSettings.credentials ?? {},
        options: initialSettings.options ?? {},
        donation_min_amount: initialSettings.donation_min_amount ?? 100,
        donation_max_amount: initialSettings.donation_max_amount ?? 0,
        currency: initialSettings.currency ?? 'RUB',
        test_mode: initialSettings.test_mode ?? true,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const update = useCallback((key: keyof PaymentSettingsData, value: any) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
        setErrors([]);
    }, []);

    const updateCredential = useCallback((key: string, value: string) => {
        setSettings((prev) => ({
            ...prev,
            credentials: { ...(prev.credentials || {}), [key]: value },
        }));
    }, []);

    const save = useCallback(async () => {
        setIsLoading(true);
        setErrors([]);
        try {
            const res = await fetch(`/api/sites/${siteId}/settings/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify(settings),
            });
            const data = await res.json();
            if (!data.success) {
                setErrors([
                    data.message || 'Ошибка при сохранении платежных настроек',
                ]);
            }
        } catch (e) {
            setErrors(['Ошибка сети при сохранении платежных настроек']);
        } finally {
            setIsLoading(false);
        }
    }, [siteId, settings]);

    const renderGatewayFields = () => {
        switch (settings.gateway) {
            case 'yookassa':
                return (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="yk-shop">Shop ID</Label>
                            <Input
                                id="yk-shop"
                                value={settings.credentials?.shop_id || ''}
                                onChange={(e) =>
                                    updateCredential('shop_id', e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="yk-key">Secret Key</Label>
                            <Input
                                id="yk-key"
                                value={settings.credentials?.secret_key || ''}
                                onChange={(e) =>
                                    updateCredential(
                                        'secret_key',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>
                );
            case 'tinkoff':
                return (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="tk-terminal">Terminal Key</Label>
                            <Input
                                id="tk-terminal"
                                value={settings.credentials?.terminal_key || ''}
                                onChange={(e) =>
                                    updateCredential(
                                        'terminal_key',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="tk-password">Password</Label>
                            <Input
                                id="tk-password"
                                value={settings.credentials?.password || ''}
                                onChange={(e) =>
                                    updateCredential('password', e.target.value)
                                }
                            />
                        </div>
                    </div>
                );
            case 'sbp':
                return (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="sbp-merchant">Merchant ID</Label>
                            <Input
                                id="sbp-merchant"
                                value={settings.credentials?.merchant_id || ''}
                                onChange={(e) =>
                                    updateCredential(
                                        'merchant_id',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="sbp-secret">Secret Key</Label>
                            <Input
                                id="sbp-secret"
                                value={settings.credentials?.secret_key || ''}
                                onChange={(e) =>
                                    updateCredential(
                                        'secret_key',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Платежные настройки
                    <Button onClick={save} disabled={isLoading} size="sm">
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {isLoading ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {errors.length > 0 && (
                    <div className="rounded border border-red-200 bg-red-50 p-3">
                        <ul className="space-y-1 text-sm text-red-600">
                            {errors.map((err, i) => (
                                <li key={i}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <Label>Платежный шлюз</Label>
                        <Select
                            value={settings.gateway || 'yookassa'}
                            onValueChange={(v) => update('gateway', v as any)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите шлюз" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yookassa">ЮKassa</SelectItem>
                                <SelectItem value="tinkoff">Tinkoff</SelectItem>
                                <SelectItem value="sbp">СБП</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="currency">Валюта</Label>
                        <Input
                            id="currency"
                            value={settings.currency || 'RUB'}
                            onChange={(e) =>
                                update('currency', e.target.value.toUpperCase())
                            }
                        />
                    </div>
                    <div className="flex items-center space-x-3">
                        <Switch
                            checked={!!settings.test_mode}
                            onCheckedChange={(v) => update('test_mode', v)}
                            id="test-mode"
                        />
                        <Label htmlFor="test-mode">Тестовый режим</Label>
                    </div>
                </div>

                {renderGatewayFields()}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="min-amount">
                            Мин. сумма пожертвования (в копейках)
                        </Label>
                        <Input
                            id="min-amount"
                            type="number"
                            value={settings.donation_min_amount ?? 0}
                            onChange={(e) =>
                                update(
                                    'donation_min_amount',
                                    Number(e.target.value),
                                )
                            }
                        />
                    </div>
                    <div>
                        <Label htmlFor="max-amount">
                            Макс. сумма пожертвования (0 = без ограничений)
                        </Label>
                        <Input
                            id="max-amount"
                            type="number"
                            value={settings.donation_max_amount ?? 0}
                            onChange={(e) =>
                                update(
                                    'donation_max_amount',
                                    Number(e.target.value),
                                )
                            }
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default PaymentSettings;

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface TelegramSettingsData {
    enabled?: boolean;
    bot_token?: string;
    chat_id?: string;
    notifications?: Record<string, boolean>;
}

interface TelegramSettingsProps {
    siteId: number;
    initialSettings?: TelegramSettingsData;
}

const TelegramSettings: React.FC<TelegramSettingsProps> = ({
    siteId,
    initialSettings = {},
}) => {
    const [settings, setSettings] = useState<TelegramSettingsData>({
        enabled: initialSettings.enabled ?? false,
        bot_token: initialSettings.bot_token ?? '',
        chat_id: initialSettings.chat_id ?? '',
        notifications: initialSettings.notifications ?? {
            donations: true,
            errors: true,
        },
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const update = useCallback(
        (
            key: keyof TelegramSettingsData,
            value: string | boolean | Record<string, boolean>,
        ) => {
            setSettings((prev) => ({ ...prev, [key]: value }));
            setErrors([]);
        },
        [],
    );

    const save = useCallback(async () => {
        setIsLoading(true);
        setErrors([]);
        try {
            const res = await fetch(`/api/sites/${siteId}/settings/telegram`, {
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
                    data.message || 'Ошибка при сохранении настроек Telegram',
                ]);
            }
        } catch {
            setErrors(['Ошибка сети при сохранении настроек Telegram']);
        } finally {
            setIsLoading(false);
        }
    }, [siteId, settings]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Telegram бот
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
            <CardContent className="space-y-4">
                {errors.length > 0 && (
                    <div className="rounded border border-red-200 bg-red-50 p-3">
                        <ul className="space-y-1 text-sm text-red-600">
                            {errors.map((err, i) => (
                                <li key={i}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="flex items-center space-x-3">
                    <Switch
                        checked={!!settings.enabled}
                        onCheckedChange={(v) => update('enabled', v)}
                        id="tg-enabled"
                    />
                    <Label htmlFor="tg-enabled">
                        Включить уведомления в Telegram
                    </Label>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="tg-token">Bot Token</Label>
                        <Input
                            id="tg-token"
                            value={settings.bot_token || ''}
                            onChange={(e) =>
                                update('bot_token', e.target.value)
                            }
                            placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                        />
                    </div>
                    <div>
                        <Label htmlFor="tg-chat">Chat ID</Label>
                        <Input
                            id="tg-chat"
                            value={settings.chat_id || ''}
                            onChange={(e) => update('chat_id', e.target.value)}
                            placeholder="@my_channel или 123456789"
                        />
                    </div>
                </div>

                <div>
                    <Label>Типы уведомлений</Label>
                    <div className="mt-2 space-y-2">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                className="rounded"
                                checked={!!settings.notifications?.donations}
                                onChange={(e) =>
                                    update('notifications', {
                                        ...(settings.notifications || {}),
                                        donations: e.target.checked,
                                    })
                                }
                            />
                            <span>Новые пожертвования</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                className="rounded"
                                checked={!!settings.notifications?.errors}
                                onChange={(e) =>
                                    update('notifications', {
                                        ...(settings.notifications || {}),
                                        errors: e.target.checked,
                                    })
                                }
                            />
                            <span>Ошибки/сбои платежей</span>
                        </label>
                    </div>
                </div>

                <div>
                    <Label htmlFor="tg-note">Примечание</Label>
                    <Textarea
                        id="tg-note"
                        placeholder="Например, как настроить доступ к чату: пригласить бота как администратора и т.д."
                        rows={2}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default TelegramSettings;

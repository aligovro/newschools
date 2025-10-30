import PaymentGatewaysSettings, {
    type PaymentGatewaysSettingsValue,
} from '@/components/payments/PaymentGatewaysSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sitesApi } from '@/lib/api/index';
import { Loader2, Save } from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface PaymentSettingsData {
    [key: string]: unknown;
    gateway?: 'sbp' | 'yookassa' | 'tinkoff';
    enabled_gateways?: Array<'sbp' | 'yookassa' | 'tinkoff'>;
    credentials?:
        | Record<string, string>
        | Record<string, Record<string, string>>;
    options?: Record<string, unknown>;
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
    const initialEnabled: Array<'yookassa' | 'tinkoff' | 'sbp'> = Array.isArray(
        initialSettings.enabled_gateways,
    )
        ? (initialSettings.enabled_gateways as Array<
              'yookassa' | 'tinkoff' | 'sbp'
          >)
        : initialSettings.gateway
          ? [initialSettings.gateway]
          : ['yookassa'];

    const [settings, setSettings] = useState<PaymentSettingsData>({
        gateway: initialSettings.gateway ?? 'yookassa',
        enabled_gateways: initialEnabled,
        credentials: initialSettings.credentials ?? {},
        options: (initialSettings.options as Record<string, unknown>) ?? {},
        donation_min_amount: initialSettings.donation_min_amount ?? 100,
        donation_max_amount: initialSettings.donation_max_amount ?? 0,
        currency: initialSettings.currency ?? 'RUB',
        test_mode: initialSettings.test_mode ?? true,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const update = useCallback(
        (key: keyof PaymentSettingsData, value: unknown) => {
            setSettings((prev) => ({ ...prev, [key]: value }));
            setErrors([]);
        },
        [],
    );

    const save = useCallback(async () => {
        setIsLoading(true);
        setErrors([]);
        try {
            const data = await sitesApi.savePaymentSettings(siteId, settings);
            if (!data.success) {
                setErrors([
                    data.message || 'Ошибка при сохранении платежных настроек',
                ]);
            }
        } catch {
            setErrors(['Ошибка сети при сохранении платежных настроек']);
        } finally {
            setIsLoading(false);
        }
    }, [siteId, settings]);

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

                <PaymentGatewaysSettings
                    value={settings as PaymentGatewaysSettingsValue}
                    onChange={(k, v) =>
                        update(k as keyof PaymentSettingsData, v)
                    }
                />
            </CardContent>
        </Card>
    );
};

export default PaymentSettings;

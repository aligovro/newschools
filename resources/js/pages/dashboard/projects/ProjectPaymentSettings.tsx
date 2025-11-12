import PaymentGatewaysSettings, {
    type PaymentGatewaysSettingsValue,
} from '@/components/dashboard/payments/PaymentGatewaysSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { projectsApi } from '@/lib/api/index';
import { Loader2, Save } from 'lucide-react';
import React from 'react';

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

interface ProjectPaymentSettingsProps {
    projectId: number;
    initialSettings?: PaymentSettingsData;
}

const ProjectPaymentSettings: React.FC<ProjectPaymentSettingsProps> = ({
    projectId,
    initialSettings,
}) => {
    const safe =
        initialSettings && typeof initialSettings === 'object'
            ? initialSettings
            : {};

    const initialEnabled: Array<'yookassa' | 'tinkoff' | 'sbp'> = Array.isArray(
        safe.enabled_gateways,
    )
        ? (safe.enabled_gateways as Array<'yookassa' | 'tinkoff' | 'sbp'>)
        : safe.gateway
          ? [safe.gateway]
          : ['yookassa'];

    const [settings, setSettings] = React.useState<PaymentSettingsData>({
        gateway: (safe as PaymentSettingsData).gateway ?? 'yookassa',
        enabled_gateways: initialEnabled,
        credentials: (safe as PaymentSettingsData).credentials ?? {},
        options:
            ((safe as PaymentSettingsData).options as Record<
                string,
                unknown
            >) ?? {},
        donation_min_amount:
            (safe as PaymentSettingsData).donation_min_amount ?? 100,
        donation_max_amount:
            (safe as PaymentSettingsData).donation_max_amount ?? 0,
        currency: (safe as PaymentSettingsData).currency ?? 'RUB',
        test_mode: (safe as PaymentSettingsData).test_mode ?? true,
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [errors, setErrors] = React.useState<string[]>([]);

    const update = React.useCallback(
        (key: keyof PaymentSettingsData, value: unknown) => {
            setSettings((prev) => {
                const next: PaymentSettingsData = { ...prev, [key]: value };

                if (key === 'enabled_gateways') {
                    const list = Array.isArray(value) ? value : [];
                    if (list.length > 0) {
                        next.gateway = list[0];
                    } else {
                        delete next.gateway;
                    }
                }

                return next;
            });
            setErrors([]);
        },
        [],
    );

    const save = React.useCallback(async () => {
        setIsLoading(true);
        setErrors([]);
        try {
            const data = await projectsApi.savePaymentSettings(
                projectId,
                settings,
            );
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
    }, [projectId, settings]);

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
                    onChange={(key, val) =>
                        update(key as keyof PaymentSettingsData, val)
                    }
                />
            </CardContent>
        </Card>
    );
};

export default ProjectPaymentSettings;

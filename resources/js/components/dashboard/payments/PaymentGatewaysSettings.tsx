import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type Gateway = 'yookassa' | 'tinkoff' | 'sbp';

export interface PaymentGatewaysSettingsValue {
    enabled_gateways?: Gateway[];
    credentials?: Record<string, any>;
    currency?: string;
    test_mode?: boolean;
    donation_min_amount?: number;
    donation_max_amount?: number;
}

interface PaymentGatewaysSettingsProps {
    value: PaymentGatewaysSettingsValue;
    onChange: (key: keyof PaymentGatewaysSettingsValue, value: unknown) => void;
}

export function PaymentGatewaysSettings({
    value,
    onChange,
}: PaymentGatewaysSettingsProps) {
    const enabled = new Set(
        (value.enabled_gateways as string[] | undefined) || ['yookassa'],
    );

    const toggleGateway = (gw: Gateway, checked: boolean) => {
        const next = new Set(enabled);
        if (checked) next.add(gw);
        else next.delete(gw);
        onChange('enabled_gateways', Array.from(next));
    };

    const readCred = (gw: Gateway, key: string): string => {
        const creds = (value.credentials || {}) as any;
        return creds[gw]?.[key] ?? creds[key] ?? '';
    };

    const writeCred = (gw: Gateway, key: string, v: string) => {
        const creds = { ...(value.credentials || {}) } as any;
        const gwCreds = { ...(creds[gw] || {}) };
        gwCreds[key] = v;
        creds[gw] = gwCreds;
        onChange('credentials', creds);
    };

    return (
        <div className="space-y-6">
            {/* Группы шлюзов */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* ЮKassa */}
                <div className="rounded-lg border p-4">
                    <label className="mb-3 flex items-center gap-2">
                        <Checkbox
                            checked={enabled.has('yookassa')}
                            onCheckedChange={(v) =>
                                toggleGateway('yookassa', !!v)
                            }
                        />
                        <span className="font-medium">ЮKassa</span>
                    </label>
                    {enabled.has('yookassa') && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="create-organization__field">
                                <Label htmlFor="yk-shop">Shop ID</Label>
                                <Input
                                    id="yk-shop"
                                    value={readCred('yookassa', 'shop_id')}
                                    onChange={(e) =>
                                        writeCred(
                                            'yookassa',
                                            'shop_id',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="create-organization__field">
                                <Label htmlFor="yk-key">Secret Key</Label>
                                <Input
                                    id="yk-key"
                                    value={readCred('yookassa', 'secret_key')}
                                    onChange={(e) =>
                                        writeCred(
                                            'yookassa',
                                            'secret_key',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Tinkoff */}
                <div className="rounded-lg border p-4">
                    <label className="mb-3 flex items-center gap-2">
                        <Checkbox
                            checked={enabled.has('tinkoff')}
                            onCheckedChange={(v) =>
                                toggleGateway('tinkoff', !!v)
                            }
                        />
                        <span className="font-medium">Tinkoff</span>
                    </label>
                    {enabled.has('tinkoff') && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="create-organization__field">
                                <Label htmlFor="tk-terminal">
                                    Terminal Key
                                </Label>
                                <Input
                                    id="tk-terminal"
                                    value={readCred('tinkoff', 'terminal_key')}
                                    onChange={(e) =>
                                        writeCred(
                                            'tinkoff',
                                            'terminal_key',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="create-organization__field">
                                <Label htmlFor="tk-password">Password</Label>
                                <Input
                                    id="tk-password"
                                    value={readCred('tinkoff', 'password')}
                                    onChange={(e) =>
                                        writeCred(
                                            'tinkoff',
                                            'password',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* СБП */}
                <div className="rounded-lg border p-4">
                    <label className="mb-3 flex items-center gap-2">
                        <Checkbox
                            checked={enabled.has('sbp')}
                            onCheckedChange={(v) => toggleGateway('sbp', !!v)}
                        />
                        <span className="font-medium">СБП</span>
                    </label>
                    {enabled.has('sbp') && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="create-organization__field">
                                <Label htmlFor="sbp-merchant">
                                    Merchant ID
                                </Label>
                                <Input
                                    id="sbp-merchant"
                                    value={readCred('sbp', 'merchant_id')}
                                    onChange={(e) =>
                                        writeCred(
                                            'sbp',
                                            'merchant_id',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="create-organization__field">
                                <Label htmlFor="sbp-secret">Secret Key</Label>
                                <Input
                                    id="sbp-secret"
                                    value={readCred('sbp', 'secret_key')}
                                    onChange={(e) =>
                                        writeCred(
                                            'sbp',
                                            'secret_key',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Общие настройки */}
            <div className="create-organization__field-group create-organization__field-group--three-columns grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="create-organization__field">
                    <Label htmlFor="currency">Валюта</Label>
                    <Input
                        id="currency"
                        value={value.currency || 'RUB'}
                        onChange={(e) =>
                            onChange('currency', e.target.value.toUpperCase())
                        }
                    />
                </div>
                <div className="create-organization__field flex items-center gap-3">
                    <Switch
                        checked={!!value.test_mode}
                        onCheckedChange={(v) => onChange('test_mode', v)}
                        id="test-mode"
                    />
                    <Label htmlFor="test-mode">Тестовый режим</Label>
                </div>
            </div>

            <div className="create-organization__field-group create-organization__field-group--two-columns">
                <div className="create-organization__field">
                    <Label htmlFor="min-amount">
                        Мин. сумма пожертвования (в копейках)
                    </Label>
                    <Input
                        id="min-amount"
                        type="number"
                        value={value.donation_min_amount ?? 0}
                        onChange={(e) =>
                            onChange(
                                'donation_min_amount',
                                Number(e.target.value),
                            )
                        }
                    />
                </div>
                <div className="create-organization__field">
                    <Label htmlFor="max-amount">
                        Макс. сумма пожертвования (0 = без ограничений)
                    </Label>
                    <Input
                        id="max-amount"
                        type="number"
                        value={value.donation_max_amount ?? 0}
                        onChange={(e) =>
                            onChange(
                                'donation_max_amount',
                                Number(e.target.value),
                            )
                        }
                    />
                </div>
            </div>
        </div>
    );
}

export default PaymentGatewaysSettings;

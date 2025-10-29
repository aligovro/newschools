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
import { CreditCard } from 'lucide-react';
import type { PaymentSettingsSectionProps } from './types';

export function PaymentSettingsSection({
    paymentSettings,
    onPaymentChange,
    onCredentialChange,
}: PaymentSettingsSectionProps) {
    return (
        <div className="create-organization__section">
            <div className="create-organization__section-header flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CreditCard className="create-organization__section-icon" />
                    <h2 className="create-organization__section-title">
                        Платежные настройки
                    </h2>
                </div>
            </div>
            <div className="create-organization__section-content space-y-6">
                <div className="create-organization__field-group create-organization__field-group--three-columns grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="create-organization__field">
                        <Label>Платежный шлюз</Label>
                        <Select
                            value={paymentSettings.gateway || 'yookassa'}
                            onValueChange={(v) =>
                                onPaymentChange(
                                    'gateway',
                                    v as PaymentSettings['gateway'],
                                )
                            }
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
                    <div className="create-organization__field">
                        <Label htmlFor="currency">Валюта</Label>
                        <Input
                            id="currency"
                            value={paymentSettings.currency || 'RUB'}
                            onChange={(e) =>
                                onPaymentChange(
                                    'currency',
                                    e.target.value.toUpperCase(),
                                )
                            }
                        />
                    </div>
                    <div className="create-organization__field flex items-center gap-3">
                        <Switch
                            checked={!!paymentSettings.test_mode}
                            onCheckedChange={(v) =>
                                onPaymentChange('test_mode', v)
                            }
                            id="test-mode"
                        />
                        <Label htmlFor="test-mode">Тестовый режим</Label>
                    </div>
                </div>

                {/* Credentials by gateway */}
                {paymentSettings.gateway === 'yookassa' && (
                    <div className="create-organization__field-group create-organization__field-group--two-columns">
                        <div className="create-organization__field">
                            <Label htmlFor="yk-shop">Shop ID</Label>
                            <Input
                                id="yk-shop"
                                value={
                                    paymentSettings.credentials?.shop_id || ''
                                }
                                onChange={(e) =>
                                    onCredentialChange(
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
                                value={
                                    paymentSettings.credentials?.secret_key ||
                                    ''
                                }
                                onChange={(e) =>
                                    onCredentialChange(
                                        'secret_key',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>
                )}

                {paymentSettings.gateway === 'tinkoff' && (
                    <div className="create-organization__field-group create-organization__field-group--two-columns">
                        <div className="create-organization__field">
                            <Label htmlFor="tk-terminal">Terminal Key</Label>
                            <Input
                                id="tk-terminal"
                                value={
                                    paymentSettings.credentials?.terminal_key ||
                                    ''
                                }
                                onChange={(e) =>
                                    onCredentialChange(
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
                                value={
                                    paymentSettings.credentials?.password || ''
                                }
                                onChange={(e) =>
                                    onCredentialChange(
                                        'password',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>
                )}

                {paymentSettings.gateway === 'sbp' && (
                    <div className="create-organization__field-group create-organization__field-group--two-columns">
                        <div className="create-organization__field">
                            <Label htmlFor="sbp-merchant">Merchant ID</Label>
                            <Input
                                id="sbp-merchant"
                                value={
                                    paymentSettings.credentials?.merchant_id ||
                                    ''
                                }
                                onChange={(e) =>
                                    onCredentialChange(
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
                                value={
                                    paymentSettings.credentials?.secret_key ||
                                    ''
                                }
                                onChange={(e) =>
                                    onCredentialChange(
                                        'secret_key',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>
                )}

                <div className="create-organization__field-group create-organization__field-group--two-columns">
                    <div className="create-organization__field">
                        <Label htmlFor="min-amount">
                            Мин. сумма пожертвования (в копейках)
                        </Label>
                        <Input
                            id="min-amount"
                            type="number"
                            value={paymentSettings.donation_min_amount ?? 0}
                            onChange={(e) =>
                                onPaymentChange(
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
                            value={paymentSettings.donation_max_amount ?? 0}
                            onChange={(e) =>
                                onPaymentChange(
                                    'donation_max_amount',
                                    Number(e.target.value),
                                )
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

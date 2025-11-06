import { memo } from 'react';
import PaymentGatewaysSettings, {
    type PaymentGatewaysSettingsValue,
} from '@/components/dashboard/payments/PaymentGatewaysSettings';
import { Label } from '@/components/ui/label';

interface PaymentSettingsSectionProps {
    value: PaymentGatewaysSettingsValue;
    onChange: (key: keyof PaymentGatewaysSettingsValue, value: unknown) => void;
}

export const PaymentSettingsSection = memo(
    function PaymentSettingsSection({
        value,
        onChange,
    }: PaymentSettingsSectionProps) {
        return (
            <div className="rounded-lg border bg-white p-4">
                <Label className="mb-2 block">Платежные настройки</Label>
                <PaymentGatewaysSettings
                    value={value}
                    onChange={(k, v) => onChange(k, v)}
                />
            </div>
        );
    },
);


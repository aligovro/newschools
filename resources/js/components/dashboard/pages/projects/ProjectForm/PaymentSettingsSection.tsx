import PaymentGatewaysSettings from '@/components/dashboard/payments/PaymentGatewaysSettings';
import { CreditCard } from 'lucide-react';
import type { PaymentSettingsSectionProps } from './types';

export function PaymentSettingsSection({
    paymentSettings,
    onPaymentChange,
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
                <PaymentGatewaysSettings
                    value={paymentSettings as any}
                    onChange={(key, val) => onPaymentChange(key as any, val)}
                />
            </div>
        </div>
    );
}

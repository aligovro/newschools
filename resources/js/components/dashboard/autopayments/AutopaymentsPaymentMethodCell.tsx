import React from 'react';
import { TableCell } from '@/components/ui/table';
import type { AutopaymentRow } from '@/types/autopayments';

interface AutopaymentsPaymentMethodCellProps {
    item: AutopaymentRow;
}

export const AutopaymentsPaymentMethodCell: React.FC<AutopaymentsPaymentMethodCellProps> = ({ item }) => {
    const getPaymentMethodLabel = (slug: string | null): string => {
        if (!slug) return '—';
        
        const labels: Record<string, string> = {
            'sbp': 'СБП',
            'bank_card': 'Банковская карта',
            'yoo_money': 'ЮMoney',
        };
        
        return labels[slug] || slug;
    };

    return (
        <TableCell>
            <div className="space-y-1">
                <div className="text-sm">{getPaymentMethodLabel(item.payment_method_slug)}</div>
                <div className="text-xs text-muted-foreground font-mono">
                    {item.subscription_key_masked}
                </div>
            </div>
        </TableCell>
    );
};

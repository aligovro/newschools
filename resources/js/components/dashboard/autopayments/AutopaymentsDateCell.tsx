import React from 'react';
import { TableCell } from '@/components/ui/table';
import type { AutopaymentRow } from '@/types/autopayments';

interface AutopaymentsDateCellProps {
    item: AutopaymentRow;
}

export const AutopaymentsDateCell: React.FC<AutopaymentsDateCellProps> = ({ item }) => {
    return (
        <TableCell className="text-muted-foreground">
            {item.first_payment_at || '—'}
        </TableCell>
    );
};

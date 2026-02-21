import React from 'react';
import { TableCell } from '@/components/ui/table';
import type { AutopaymentRow } from '@/types/autopayments';

interface AutopaymentsPeriodCellProps {
    item: AutopaymentRow;
}

export const AutopaymentsPeriodCell: React.FC<AutopaymentsPeriodCellProps> = ({ item }) => {
    return (
        <TableCell>
            {item.recurring_period_label}
        </TableCell>
    );
};

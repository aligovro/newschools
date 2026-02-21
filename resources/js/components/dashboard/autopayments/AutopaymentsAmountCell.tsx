import React from 'react';
import { TableCell } from '@/components/ui/table';
import type { AutopaymentRow } from '@/types/autopayments';

interface AutopaymentsAmountCellProps {
    item: AutopaymentRow;
}

export const AutopaymentsAmountCell: React.FC<AutopaymentsAmountCellProps> = ({ item }) => {
    return (
        <TableCell>
            {item.amount_formatted}
        </TableCell>
    );
};

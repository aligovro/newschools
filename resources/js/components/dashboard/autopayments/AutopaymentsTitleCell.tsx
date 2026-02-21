import React from 'react';
import { TableCell } from '@/components/ui/table';
import type { AutopaymentRow } from '@/types/autopayments';

interface AutopaymentsTitleCellProps {
    item: AutopaymentRow;
}

export const AutopaymentsTitleCell: React.FC<AutopaymentsTitleCellProps> = ({ item }) => {
    return (
        <TableCell className="font-medium">
            {item.title}
        </TableCell>
    );
};

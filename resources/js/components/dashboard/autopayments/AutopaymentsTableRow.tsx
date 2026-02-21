import React from 'react';
import { TableRow } from '@/components/ui/table';
import type { AutopaymentRow } from '@/types/autopayments';
import { AutopaymentsTitleCell } from './AutopaymentsTitleCell';
import { AutopaymentsAmountCell } from './AutopaymentsAmountCell';
import { AutopaymentsPeriodCell } from './AutopaymentsPeriodCell';
import { AutopaymentsPaymentsCell } from './AutopaymentsPaymentsCell';
import { AutopaymentsDateCell } from './AutopaymentsDateCell';
import { AutopaymentsPaymentMethodCell } from './AutopaymentsPaymentMethodCell';

interface AutopaymentsTableRowProps {
    item: AutopaymentRow;
}

export const AutopaymentsTableRow: React.FC<AutopaymentsTableRowProps> = ({ item }) => {
    return (
        <TableRow>
            <AutopaymentsTitleCell item={item} />
            <AutopaymentsAmountCell item={item} />
            <AutopaymentsPeriodCell item={item} />
            <AutopaymentsPaymentsCell item={item} />
            <AutopaymentsDateCell item={item} />
            <AutopaymentsPaymentMethodCell item={item} />
        </TableRow>
    );
};

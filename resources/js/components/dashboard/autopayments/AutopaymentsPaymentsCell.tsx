import React, { useState } from 'react';
import { TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { AutopaymentRow } from '@/types/autopayments';

interface AutopaymentsPaymentsCellProps {
    item: AutopaymentRow;
}

export const AutopaymentsPaymentsCell: React.FC<AutopaymentsPaymentsCellProps> = ({ item }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const payments = item.payments || [];
    const visiblePayments = isExpanded ? payments : payments.slice(0, 3);
    const hasMore = payments.length > 3;

    if (payments.length === 0) {
        return <TableCell className="text-muted-foreground">Нет платежей</TableCell>;
    }

    return (
        <TableCell>
            <div className="space-y-1">
                {visiblePayments.map((payment, index) => (
                    <div key={index} className="text-sm">
                        {payment.date && (
                            <span className="text-muted-foreground">{payment.date}</span>
                        )}
                        {payment.date && ' • '}
                        <span>{payment.label}</span>
                    </div>
                ))}
                {hasMore && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="mr-1 h-3 w-3" />
                                Скрыть
                            </>
                        ) : (
                            <>
                                <ChevronDown className="mr-1 h-3 w-3" />
                                Ещё {payments.length - 3}
                            </>
                        )}
                    </Button>
                )}
            </div>
        </TableCell>
    );
};

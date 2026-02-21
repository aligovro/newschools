import React from 'react';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { AutopaymentRow } from '@/types/autopayments';
import { AutopaymentsTableRow } from './AutopaymentsTableRow';

interface AutopaymentsTableProps {
    items: AutopaymentRow[];
}

export const AutopaymentsTable: React.FC<AutopaymentsTableProps> = ({ items }) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Заголовок</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Период платежа</TableHead>
                    <TableHead>Платежи</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>ID способа оплаты</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map((item, index) => (
                    <AutopaymentsTableRow key={index} item={item} />
                ))}
            </TableBody>
        </Table>
    );
};

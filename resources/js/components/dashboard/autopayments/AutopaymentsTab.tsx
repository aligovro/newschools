import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { organizationPaymentsApi } from '@/lib/api/organizationPayments';
import type { AutopaymentRow, AutopaymentsListFilters } from '@/types/autopayments';
import { AutopaymentsTable } from './AutopaymentsTable';
import { AutopaymentsEmpty } from './AutopaymentsEmpty';
import { AutopaymentsPagination } from './AutopaymentsPagination';
import { toast } from 'sonner';

interface AutopaymentsTabProps {
    organizationId: number;
}

export const AutopaymentsTab: React.FC<AutopaymentsTabProps> = ({ organizationId }) => {
    const [data, setData] = useState<AutopaymentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchAutopayments = useCallback(
        async (page: number, filters: AutopaymentsListFilters = {}) => {
            setLoading(true);
            try {
                const response = await organizationPaymentsApi.getAutopayments(organizationId, {
                    ...filters,
                    page,
                    per_page: 20,
                });
                setData(response.data);
                setCurrentPage(response.meta.current_page);
                setLastPage(response.meta.last_page);
                setTotal(response.meta.total);
            } catch (error) {
                console.error('Failed to fetch autopayments:', error);
                toast.error('Не удалось загрузить автоплатежи');
            } finally {
                setLoading(false);
            }
        },
        [organizationId]
    );

    useEffect(() => {
        void fetchAutopayments(1);
    }, [fetchAutopayments]);

    const handlePageChange = useCallback(
        (page: number) => {
            if (page >= 1 && page <= lastPage) {
                void fetchAutopayments(page);
            }
        },
        [fetchAutopayments, lastPage]
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Автоплатежи {total > 0 && `(${total})`}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading && data.length === 0 ? (
                    <div className="flex min-h-[200px] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : data.length === 0 ? (
                    <AutopaymentsEmpty />
                ) : (
                    <div className="space-y-4">
                        <AutopaymentsTable items={data} />
                        <AutopaymentsPagination
                            currentPage={currentPage}
                            lastPage={lastPage}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

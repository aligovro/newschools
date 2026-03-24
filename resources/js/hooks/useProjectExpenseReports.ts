import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';

export interface ExpenseReportItem {
    id: number;
    title: string;
    amount_kopecks: number;
    formatted_amount: string;
    status: string;
    status_label: string;
    report_date: string;
    formatted_date: string;
    pdf_url: string | null;
    pdf_file_size: number | null;
    formatted_file_size: string | null;
    created_at: string | null;
}

export interface ExpenseReportFormData {
    title: string;
    amount_kopecks: number;
    status: 'paid' | 'pending';
    report_date: string;
    pdf_file: File | null;
}

interface Options {
    organizationId: number;
    projectId: number;
    initialReports?: ExpenseReportItem[];
    initialHasMore?: boolean;
}

const getCsrf = (): string =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

const BASE = (orgId: number, projId: number) =>
    `/dashboard/organizations/${orgId}/projects/${projId}/expense-reports`;

export function useProjectExpenseReports({
    organizationId,
    projectId,
    initialReports = [],
    initialHasMore = false,
}: Options) {
    const [reportList, setReportList] = useState<ExpenseReportItem[]>(initialReports);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialHasMore);

    const fetchPage = useCallback(
        async (page: number) => {
            try {
                const res = await fetch(
                    `${BASE(organizationId, projectId)}?page=${page}&per_page=20`,
                    { headers: { Accept: 'application/json' } },
                );
                const data = await res.json();
                if (page === 1) {
                    setReportList(data.data ?? []);
                } else {
                    setReportList((prev) => [...prev, ...(data.data ?? [])]);
                }
                setHasMore(
                    (data.pagination?.current_page ?? 1) < (data.pagination?.last_page ?? 1),
                );
            } catch (e) {
                console.error('Error fetching expense reports:', e);
            }
        },
        [organizationId, projectId],
    );

    const loadMore = useCallback(() => {
        const next = currentPage + 1;
        setCurrentPage(next);
        fetchPage(next);
    }, [currentPage, fetchPage]);

    const submitReport = useCallback(
        async (form: ExpenseReportFormData, editingId: number | null): Promise<boolean> => {
            const fd = new FormData();
            fd.append('title', form.title);
            fd.append('amount_kopecks', String(form.amount_kopecks));
            fd.append('status', form.status);
            fd.append('report_date', form.report_date);
            if (form.pdf_file instanceof File) {
                fd.append('pdf_file', form.pdf_file);
            }

            const url = editingId
                ? `${BASE(organizationId, projectId)}/${editingId}`
                : BASE(organizationId, projectId);

            if (editingId) fd.append('_method', 'PUT');

            try {
                const res = await fetch(url, {
                    method: 'POST',
                    body: fd,
                    headers: {
                        'X-CSRF-TOKEN': getCsrf(),
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                });

                if (!res.ok) throw new Error('Failed to save expense report');
                router.reload();
                return true;
            } catch (e) {
                console.error('Error saving expense report:', e);
                return false;
            }
        },
        [organizationId, projectId],
    );

    const deleteReport = useCallback(
        async (id: number): Promise<boolean> => {
            try {
                const res = await fetch(`${BASE(organizationId, projectId)}/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': getCsrf(),
                        Accept: 'application/json',
                    },
                    credentials: 'same-origin',
                });

                if (!res.ok) throw new Error('Failed to delete expense report');
                router.reload();
                return true;
            } catch (e) {
                console.error('Error deleting expense report:', e);
                return false;
            }
        },
        [organizationId, projectId],
    );

    return { reportList, hasMore, loadMore, submitReport, deleteReport };
}

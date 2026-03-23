import { useCallback, useState } from 'react';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface ClubApplicationItem {
    id: number;
    club_id: number | null;
    club_name: string;
    applicant_name: string;
    phone: string;
    comment: string | null;
    status: ApplicationStatus;
    status_label: string;
    status_color: string;
    reviewed_at: string | null;
    created_at: string;
}

interface UseClubApplicationsOptions {
    organizationId: number;
    initialApplications?: ClubApplicationItem[];
    initialHasMore?: boolean;
}

function getCsrfToken(): string {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

export function useClubApplications({
    organizationId,
    initialApplications = [],
    initialHasMore = false,
}: UseClubApplicationsOptions) {
    const [items, setItems] = useState<ClubApplicationItem[]>(initialApplications);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const baseUrl = `/dashboard/organizations/${organizationId}/club-applications`;

    const fetchApplications = useCallback(
        async (page = 1, status?: ApplicationStatus | '') => {
            setLoading(true);
            try {
                const url = new URL(baseUrl, window.location.origin);
                url.searchParams.set('page', String(page));
                url.searchParams.set('per_page', '20');
                if (status) url.searchParams.set('status', status);

                const res = await fetch(url.toString(), {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });
                const data = await res.json();

                const list: ClubApplicationItem[] = data.data ?? [];
                setItems((prev) => (page === 1 ? list : [...prev, ...list]));
                setHasMore(
                    (data.pagination?.current_page ?? 1) < (data.pagination?.last_page ?? 1),
                );
            } catch (e) {
                console.error('Error fetching applications:', e);
            } finally {
                setLoading(false);
            }
        },
        [baseUrl],
    );

    const loadMore = useCallback(
        (status?: ApplicationStatus | '') => {
            const next = currentPage + 1;
            setCurrentPage(next);
            fetchApplications(next, status);
        },
        [currentPage, fetchApplications],
    );

    const updateStatus = useCallback(
        async (id: number, status: 'approved' | 'rejected'): Promise<ClubApplicationItem | null> => {
            try {
                const res = await fetch(`${baseUrl}/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({ status }),
                });

                if (!res.ok) throw new Error('Failed to update status');

                const data = await res.json();
                const updated: ClubApplicationItem = data.data;

                setItems((prev) =>
                    prev.map((item) => (item.id === id ? updated : item)),
                );

                return updated;
            } catch (e) {
                console.error('Error updating application status:', e);
                return null;
            }
        },
        [baseUrl],
    );

    return { items, hasMore, loading, fetchApplications, loadMore, updateStatus };
}

import { Button } from '@/components/ui/button';

import type { SuggestedOrganizationsMeta } from './types';

interface PaginationControlsProps {
    meta: SuggestedOrganizationsMeta;
    loading?: boolean;
    onPageChange: (page: number) => void;
}

const getRangeLabel = (meta: SuggestedOrganizationsMeta): string => {
    if (meta.total === 0) {
        return '0 из 0';
    }

    const from = meta.from ?? (meta.currentPage - 1) * meta.perPage + 1;
    const to =
        meta.to ??
        Math.min(meta.currentPage * meta.perPage, meta.total ?? meta.perPage);

    return `${from} – ${to} из ${meta.total}`;
};

export const PaginationControls = ({
    meta,
    loading = false,
    onPageChange,
}: PaginationControlsProps) => {
    const hasPrevious = meta.currentPage > 1;
    const hasNext = meta.currentPage < meta.lastPage;

    return (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-4 text-sm text-gray-600 md:flex-row">
            <div>{getRangeLabel(meta)}</div>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasPrevious || loading}
                    onClick={() => onPageChange(meta.currentPage - 1)}
                >
                    Назад
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasNext || loading}
                    onClick={() => onPageChange(meta.currentPage + 1)}
                >
                    Вперед
                </Button>
            </div>
        </div>
    );
};



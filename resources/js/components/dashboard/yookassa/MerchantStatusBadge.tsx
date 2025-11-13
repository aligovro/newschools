import React from 'react';

interface MerchantStatusBadgeProps {
    status?: string | null;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
    draft: { label: 'Черновик', className: 'bg-gray-100 text-gray-700' },
    pending: { label: 'На модерации', className: 'bg-yellow-100 text-yellow-700' },
    active: { label: 'Активен', className: 'bg-green-100 text-green-700' },
    rejected: { label: 'Отклонён', className: 'bg-red-100 text-red-700' },
    blocked: { label: 'Заблокирован', className: 'bg-red-100 text-red-700' },
};

export const MerchantStatusBadge: React.FC<MerchantStatusBadgeProps> = ({
    status,
}) => {
    const normalized = (status || 'draft').toLowerCase();
    const meta = STATUS_LABELS[normalized] ?? STATUS_LABELS.draft;

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}
        >
            {meta.label}
        </span>
    );
};

export default MerchantStatusBadge;


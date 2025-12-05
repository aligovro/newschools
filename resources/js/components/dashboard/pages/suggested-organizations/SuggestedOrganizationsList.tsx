import { Fragment } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

import { SuggestedOrganizationCard } from './SuggestedOrganizationCard';
import type {
    SuggestedOrganization,
    SuggestedOrganizationsStatus,
} from './types';

interface SuggestedOrganizationsListProps {
    items: SuggestedOrganization[];
    loading: boolean;
    processingId?: number | null;
    onUpdateStatus: (
        organization: SuggestedOrganization,
        status: SuggestedOrganizationsStatus,
    ) => Promise<void> | void;
    onEdit: (organization: SuggestedOrganization) => void;
    onDelete: (organization: SuggestedOrganization) => void;
}

const LoadingState = () => (
    <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
            <div
                key={`suggested-org-skeleton-${index}`}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
                <div className="flex flex-col gap-3">
                    <Skeleton className="h-5 w-56" />
                    <Skeleton className="h-4 w-72" />
                    <Skeleton className="h-4 w-96" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-28" />
                        <Skeleton className="h-9 w-32" />
                        <Skeleton className="h-9 w-32" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export const SuggestedOrganizationsList = ({
    items,
    loading,
    processingId = null,
    onUpdateStatus,
    onEdit,
    onDelete,
}: SuggestedOrganizationsListProps) => {
    if (loading) {
        return <LoadingState />;
    }

    if (items.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center text-gray-500">
                Предложенных школ пока нет
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((organization) => (
                <Fragment key={organization.id}>
                    <SuggestedOrganizationCard
                        organization={organization}
                        disableActions={processingId === organization.id}
                        onUpdateStatus={onUpdateStatus}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                </Fragment>
            ))}
        </div>
    );
};



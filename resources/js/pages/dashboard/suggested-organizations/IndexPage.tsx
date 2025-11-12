import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    FiltersBar,
    PaginationControls,
    SuggestedOrganizationEditDialog,
    SuggestedOrganizationsList,
    useSuggestedOrganizations,
    type SuggestedOrganization,
    type SuggestedOrganizationsFiltersState,
    type SuggestedOrganizationsStatus,
} from '@/components/dashboard/pages/suggested-organizations';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import {
    suggestedOrganizationsApi,
    type SuggestedOrganizationFilters,
} from '@/lib/api/suggested-organizations';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { toast } from 'sonner';

interface SuggestedOrganizationsPageProps {
    initialFilters: Partial<SuggestedOrganizationFilters>;
    options: {
        statuses: SuggestedOrganizationsStatus[];
        sortableFields: string[];
        perPageOptions: number[];
    };
}

const normalizeNumber = (value: unknown, fallback: number): number => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
        const parsed = Number.parseInt(value, 10);
        if (!Number.isNaN(parsed)) {
            return parsed;
        }
    }

    return fallback;
};

const normalizeSortDirection = (value: unknown): 'asc' | 'desc' =>
    value === 'asc' ? 'asc' : 'desc';

const normalizeFilters = (
    payload: Partial<SuggestedOrganizationFilters>,
): SuggestedOrganizationsFiltersState => {
    const filters: SuggestedOrganizationsFiltersState = {
        sort_by: (payload.sort_by as string) ?? 'created_at',
        sort_direction: normalizeSortDirection(payload.sort_direction),
        per_page: normalizeNumber(payload.per_page, 15),
        page: normalizeNumber(payload.page, 1),
    };

    if (payload.search && typeof payload.search === 'string') {
        filters.search = payload.search;
    }

    if (
        payload.status &&
        ['pending', 'approved', 'rejected'].includes(payload.status)
    ) {
        filters.status = payload.status as SuggestedOrganizationsStatus;
    }

    if (payload.city_id !== undefined && payload.city_id !== null) {
        const cityId = normalizeNumber(payload.city_id, NaN);
        if (!Number.isNaN(cityId)) {
            filters.city_id = cityId;
        }
    }

    return filters;
};

const sortOptionValue = (field: string, direction: 'asc' | 'desc'): string =>
    `${field}:${direction}`;

const sortLabels: Record<string, string> = {
    'created_at:desc': 'Новые сначала',
    'created_at:asc': 'Старые сначала',
    'name:asc': 'По названию (А-Я)',
    'name:desc': 'По названию (Я-А)',
    'status:asc': 'По статусу (A-Z)',
    'status:desc': 'По статусу (Z-A)',
};

export default function SuggestedOrganizationsPage({
    initialFilters,
    options,
}: SuggestedOrganizationsPageProps) {
    const defaultFilters = useMemo(
        () => normalizeFilters(initialFilters),
        [initialFilters],
    );

    const [filters, setFilters] =
        useState<SuggestedOrganizationsFiltersState>(defaultFilters);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedOrganization, setSelectedOrganization] =
        useState<SuggestedOrganization | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const { items, meta, loading, error, support, fetch } =
        useSuggestedOrganizations();

    const breadcrumbs = useMemo<BreadcrumbItem[]>(
        () => [
            {
                title: 'Админ панель',
                href: dashboard().url,
            },
            {
                title: 'Предложенные школы',
                href: '/dashboard/suggested-organizations',
            },
        ],
        [],
    );

    const sortOptions = useMemo(() => {
        const fields = new Set([
            ...options.sortableFields,
            ...support.sortableFields,
        ]);

        const directionPairs: Array<[string, 'asc' | 'desc']> = [];

        fields.forEach((field) => {
            if (field === 'created_at') {
                directionPairs.push(
                    ['created_at', 'desc'],
                    ['created_at', 'asc'],
                );
                return;
            }

            if (field === 'name') {
                directionPairs.push(['name', 'asc'], ['name', 'desc']);
                return;
            }

            if (field === 'status') {
                directionPairs.push(['status', 'asc'], ['status', 'desc']);
                return;
            }

            directionPairs.push([field, 'asc'], [field, 'desc']);
        });

        return directionPairs
            .map(([field, direction]) => {
                const value = sortOptionValue(field, direction);
                return {
                    value,
                    label: sortLabels[value] ?? `${field} (${direction})`,
                };
            })
            .filter(
                (option, index, array) =>
                    array.findIndex((item) => item.value === option.value) ===
                    index,
            );
    }, [options.sortableFields, support.sortableFields]);

    const statusOptions = useMemo(() => {
        const statuses = new Set([...options.statuses, ...support.statuses]);
        return Array.from(statuses);
    }, [options.statuses, support.statuses]);

    useEffect(() => {
        fetch(filters);
    }, [filters, fetch]);

    const handleFiltersChange = useCallback(
        (next: Partial<SuggestedOrganizationsFiltersState>) => {
            setFilters((prev) => {
                const updated = { ...prev, ...next };
                return updated;
            });
        },
        [],
    );

    const handleResetFilters = useCallback(() => {
        setFilters({ ...defaultFilters });
    }, [defaultFilters]);

    const handlePageChange = useCallback(
        (page: number) => {
            if (page < 1 || page > meta.lastPage) {
                return;
            }
            setFilters((prev) => ({ ...prev, page }));
        },
        [meta.lastPage],
    );

    const handleEditOrganization = useCallback(
        (organization: SuggestedOrganization) => {
            setSelectedOrganization(organization);
            setEditDialogOpen(true);
        },
        [],
    );

    const handleUpdateStatus = useCallback(
        async (
            organization: SuggestedOrganization,
            status: SuggestedOrganizationsStatus,
        ) => {
            setProcessingId(organization.id);
            try {
                await suggestedOrganizationsApi.update(organization.id, {
                    status,
                });
                toast.success(
                    status === 'approved'
                        ? `Школа «${organization.name}» одобрена`
                        : `Школа «${organization.name}» отклонена`,
                );
                await fetch(filters);
            } catch (updateError) {
                const message =
                    updateError instanceof Error
                        ? updateError.message
                        : 'Не удалось обновить статус школы';
                toast.error(message);
            } finally {
                setProcessingId(null);
            }
        },
        [fetch, filters],
    );

    const handleDelete = useCallback(
        async (organization: SuggestedOrganization) => {
            const confirmation = window.confirm(
                `Удалить предложенную школу «${organization.name}»? Действие невозможно отменить.`,
            );

            if (!confirmation) {
                return;
            }

            setProcessingId(organization.id);
            try {
                await suggestedOrganizationsApi.delete(organization.id);
                toast.success(`Школа «${organization.name}» удалена`);
                await fetch(filters);
            } catch (deleteError) {
                const message =
                    deleteError instanceof Error
                        ? deleteError.message
                        : 'Не удалось удалить школу';
                toast.error(message);
            } finally {
                setProcessingId(null);
            }
        },
        [fetch, filters],
    );

    const handleSubmitEdit = useCallback(
        async (
            organizationId: number,
            payload: Parameters<typeof suggestedOrganizationsApi.update>[1],
        ) => {
            setIsSaving(true);
            try {
                await suggestedOrganizationsApi.update(organizationId, payload);
                toast.success('Изменения сохранены');
                await fetch(filters);
                setEditDialogOpen(false);
                setSelectedOrganization(null);
            } catch (editError) {
                const message =
                    editError instanceof Error
                        ? editError.message
                        : 'Не удалось сохранить изменения';
                toast.error(message);
            } finally {
                setIsSaving(false);
            }
        },
        [fetch, filters],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Предложенные школы" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Предложенные школы
                    </h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Управляйте школами, предложенными через публичный
                        виджет. Одобряйте, отклоняйте и оставляйте заметки для
                        команды.
                    </p>
                </div>

                <FiltersBar
                    filters={filters}
                    statuses={statusOptions}
                    sortOptions={sortOptions}
                    perPageOptions={options.perPageOptions}
                    onChange={handleFiltersChange}
                    onReset={handleResetFilters}
                />

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <SuggestedOrganizationsList
                    items={items}
                    loading={loading}
                    processingId={processingId}
                    onUpdateStatus={handleUpdateStatus}
                    onEdit={handleEditOrganization}
                    onDelete={handleDelete}
                />

                <PaginationControls
                    meta={meta}
                    loading={loading}
                    onPageChange={handlePageChange}
                />
            </div>

            <SuggestedOrganizationEditDialog
                open={editDialogOpen}
                onOpenChange={(open) => {
                    setEditDialogOpen(open);
                    if (!open) {
                        setSelectedOrganization(null);
                    }
                }}
                organization={selectedOrganization}
                statuses={statusOptions}
                isSubmitting={isSaving}
                onSubmit={handleSubmitEdit}
            />
        </AppLayout>
    );
}

import RegionFilters from '@/components/dashboard/geo/RegionFilters';
import RegionForm from '@/components/dashboard/geo/RegionForm';
import RegionTable from '@/components/dashboard/geo/RegionTable';
import { Button } from '@/components/ui/button';
import { FederalDistrict, Region, RegionFilters as RegionFiltersType } from '@/types/geo';
import { router, usePage } from '@inertiajs/react';
import { MapPin, Plus } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

interface PaginatedRegions {
    data: Region[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

interface Props {
    initialRegions: PaginatedRegions;
    initialFilters: RegionFiltersType;
    federalDistricts: FederalDistrict[];
}

const RegionManagement: React.FC<Props> = ({
    initialRegions,
    initialFilters,
    federalDistricts,
}) => {
    const [showForm, setShowForm] = useState(false);
    const [editingRegion, setEditingRegion] = useState<Region | null>(null);
    const [filters, setFilters] = useState<RegionFiltersType>(
        initialFilters || { per_page: 50, page: 1 },
    );

    const { props } = usePage<{ regions: PaginatedRegions }>();
    const currentRegions = props.regions || initialRegions;
    const regions = useMemo(() => currentRegions?.data || [], [currentRegions]);
    const pagination = currentRegions?.meta || {
        total: 0,
        current_page: 1,
        last_page: 1,
        per_page: 50,
    };

    // Синхронизируем редактируемый регион с актуальными данными из props
    const syncedEditingRegion = useMemo(() => {
        if (!editingRegion) return null;
        return regions.find((r) => r.id === editingRegion.id) ?? editingRegion;
    }, [editingRegion, regions]);

    const navigate = useCallback((newFilters: RegionFiltersType) => {
        setFilters(newFilters);
        router.get('/dashboard/admin/geo/regions', newFilters as Record<string, unknown>, {
            preserveState: true,
            preserveScroll: true,
            only: ['regions', 'filters'],
        });
    }, []);

    const handleFiltersChange = useCallback(
        (f: RegionFiltersType) => navigate({ ...filters, ...f, page: 1 }),
        [filters, navigate],
    );

    const handleOpenCreate = () => {
        setEditingRegion(null);
        setShowForm(true);
    };

    const handleEdit = (region: Region) => {
        setEditingRegion(region);
        setShowForm(true);
    };

    const handleClose = () => {
        setShowForm(false);
        setEditingRegion(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Управление регионами
                    </h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Редактирование ГЕО данных: регионы, флаги, статус активности
                    </p>
                </div>
                <Button onClick={handleOpenCreate} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Создать регион
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                    <div className="flex items-center">
                        <MapPin className="h-8 w-8 text-blue-500" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Всего регионов
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {pagination.total}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                    <div className="flex items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {pagination.current_page}
                            </span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Страница
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                из {pagination.last_page}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <RegionFilters
                filters={filters}
                federalDistricts={federalDistricts}
                onFiltersChange={handleFiltersChange}
            />

            <RegionTable
                regions={regions}
                pagination={pagination}
                onEdit={handleEdit}
                onPageChange={(page) => navigate({ ...filters, page })}
                onPerPageChange={(per_page) => navigate({ ...filters, per_page, page: 1 })}
            />

            {showForm && (
                <RegionForm
                    key={syncedEditingRegion?.id ?? 'new'}
                    region={syncedEditingRegion}
                    federalDistricts={federalDistricts}
                    onClose={handleClose}
                />
            )}
        </div>
    );
};

export default RegionManagement;

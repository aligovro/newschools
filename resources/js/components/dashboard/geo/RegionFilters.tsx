import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FederalDistrict, RegionFilters as RegionFiltersType } from '@/types/geo';
import { Search, X } from 'lucide-react';
import React from 'react';

interface Props {
    filters: RegionFiltersType;
    federalDistricts: FederalDistrict[];
    onFiltersChange: (filters: RegionFiltersType) => void;
}

const RegionFilters: React.FC<Props> = ({ filters, federalDistricts, onFiltersChange }) => {
    const hasActiveFilters = !!(
        filters.search ||
        filters.federal_district_id ||
        filters.sort_by
    );

    const handleSortChange = (value: string) => {
        const lastIdx = value.lastIndexOf('_');
        const sort_by = value.slice(0, lastIdx);
        const sort_direction = value.slice(lastIdx + 1) as 'asc' | 'desc';
        onFiltersChange({ ...filters, sort_by, sort_direction, page: 1 });
    };

    return (
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Поиск по названию, коду, столице..."
                            value={filters.search || ''}
                            onChange={(e) =>
                                onFiltersChange({
                                    ...filters,
                                    search: e.target.value || undefined,
                                    page: 1,
                                })
                            }
                            className="pl-10"
                        />
                    </div>

                    <Select
                        value={String(filters.federal_district_id || 'all')}
                        onValueChange={(v) =>
                            onFiltersChange({
                                ...filters,
                                federal_district_id: v === 'all' ? undefined : Number(v),
                                page: 1,
                            })
                        }
                    >
                        <SelectTrigger className="w-full md:w-[220px]">
                            <SelectValue placeholder="Федеральный округ" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все округа</SelectItem>
                            {federalDistricts.map((fd) => (
                                <SelectItem key={fd.id} value={String(fd.id)}>
                                    {fd.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={
                            filters.sort_by && filters.sort_direction
                                ? `${filters.sort_by}_${filters.sort_direction}`
                                : 'name_asc'
                        }
                        onValueChange={handleSortChange}
                    >
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="Сортировка" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name_asc">Название (А-Я)</SelectItem>
                            <SelectItem value="name_desc">Название (Я-А)</SelectItem>
                            <SelectItem value="code_asc">Код (А-Я)</SelectItem>
                            <SelectItem value="code_desc">Код (Я-А)</SelectItem>
                            <SelectItem value="population_desc">Население (убыв.)</SelectItem>
                            <SelectItem value="population_asc">Население (возр.)</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={String(filters.per_page || 50)}
                        onValueChange={(v) =>
                            onFiltersChange({ ...filters, per_page: parseInt(v, 10), page: 1 })
                        }
                    >
                        <SelectTrigger className="w-full md:w-[150px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="25">25 на странице</SelectItem>
                            <SelectItem value="50">50 на странице</SelectItem>
                            <SelectItem value="100">100 на странице</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        onClick={() =>
                            onFiltersChange({ per_page: filters.per_page || 50, page: 1 })
                        }
                        className="flex items-center gap-2"
                    >
                        <X className="h-4 w-4" />
                        Очистить
                    </Button>
                )}
            </div>
        </div>
    );
};

export default RegionFilters;

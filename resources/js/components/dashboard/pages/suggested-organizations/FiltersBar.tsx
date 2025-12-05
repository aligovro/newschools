import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import { Search } from 'lucide-react';

import type {
    SuggestedOrganizationsFiltersState,
    SuggestedOrganizationsStatus,
} from './types';

interface SortOption {
    value: string;
    label: string;
}

interface FiltersBarProps {
    filters: SuggestedOrganizationsFiltersState;
    statuses: SuggestedOrganizationsStatus[];
    sortOptions: SortOption[];
    perPageOptions: number[];
    onChange: (nextFilters: Partial<SuggestedOrganizationsFiltersState>) => void;
    onReset: () => void;
}

const sortOptionValue = (field: string, direction: 'asc' | 'desc'): string =>
    `${field}:${direction}`;

export const FiltersBar = ({
    filters,
    statuses,
    sortOptions,
    perPageOptions,
    onChange,
    onReset,
}: FiltersBarProps) => {
    const [searchInput, setSearchInput] = useState(filters.search ?? '');
    const debouncedSearch = useDebounce(searchInput, 400);

    useEffect(() => {
        setSearchInput(filters.search ?? '');
    }, [filters.search]);

    useEffect(() => {
        const normalizedCurrent = filters.search ?? '';
        const normalizedNext = debouncedSearch.trim();

        if (normalizedCurrent === normalizedNext) {
            return;
        }

        onChange({
            search: normalizedNext.length > 0 ? normalizedNext : undefined,
            page: 1,
        });
    }, [debouncedSearch, filters.search, onChange]);

    const sortValue = useMemo(
        () => sortOptionValue(filters.sort_by, filters.sort_direction),
        [filters.sort_by, filters.sort_direction],
    );

    return (
        <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:gap-3">
                <div className="relative flex-1 md:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Поиск по названию, городу или адресу"
                        className="pl-9"
                    />
                </div>

                <Select
                    value={filters.status ?? 'all'}
                    onValueChange={(value) =>
                        onChange({
                            status:
                                value === 'all'
                                    ? undefined
                                    : (value as SuggestedOrganizationsStatus),
                            page: 1,
                        })
                    }
                >
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все статусы</SelectItem>
                        {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                                {status === 'pending'
                                    ? 'Ожидает рассмотрения'
                                    : status === 'approved'
                                    ? 'Одобрена'
                                    : 'Отклонена'}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={sortValue}
                    onValueChange={(value) => {
                        const [field, direction] = value.split(':');
                        onChange({
                            sort_by: field,
                            sort_direction: direction === 'asc' ? 'asc' : 'desc',
                            page: 1,
                        });
                    }}
                >
                    <SelectTrigger className="w-full md:w-[220px]">
                        <SelectValue placeholder="Сортировка" />
                    </SelectTrigger>
                    <SelectContent>
                        {sortOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={String(filters.per_page)}
                    onValueChange={(value) =>
                        onChange({
                            per_page: Number.parseInt(value, 10),
                            page: 1,
                        })
                    }
                >
                    <SelectTrigger className="w-full md:w-[140px]">
                        <SelectValue placeholder="На странице" />
                    </SelectTrigger>
                    <SelectContent>
                        {perPageOptions.map((option) => (
                            <SelectItem key={option} value={String(option)}>
                                {option} на странице
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" onClick={onReset}>
                    Сбросить
                </Button>
            </div>
        </div>
    );
};



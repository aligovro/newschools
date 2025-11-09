import { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ReportTypeDefinition } from '../types';

interface ReportsFiltersBarProps {
    reportTypes: ReportTypeDefinition[];
    statuses: string[];
    value: {
        report_type?: string;
        status?: string;
        search?: string;
    };
    onChange: (value: ReportsFiltersBarProps['value']) => void;
}

export function ReportsFiltersBar({
    reportTypes,
    statuses,
    value,
    onChange,
}: ReportsFiltersBarProps) {
    const typeOptions = useMemo(
        () => reportTypes.map((type) => ({ value: type.id, label: type.name })),
        [reportTypes],
    );

    const handleTypeChange = useCallback(
        (next: string) => {
            onChange({ ...value, report_type: next || undefined });
        },
        [onChange, value],
    );

    const handleStatusChange = useCallback(
        (next: string) => {
            onChange({ ...value, status: next || undefined });
        },
        [onChange, value],
    );

    const handleSearchChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onChange({ ...value, search: event.target.value || undefined });
        },
        [onChange, value],
    );

    const handleReset = useCallback(() => {
        onChange({});
    }, [onChange]);

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-3">
                <div className="min-w-[180px]">
                    <Select
                        value={value.report_type ?? 'all'}
                        onValueChange={handleTypeChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Тип отчета" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все типы</SelectItem>
                            {typeOptions.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="min-w-[180px]">
                    <Select
                        value={value.status ?? 'all'}
                        onValueChange={handleStatusChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Статус" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все статусы</SelectItem>
                            {statuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-1 min-w-[200px]">
                    <Input
                        placeholder="Поиск по названию"
                        value={value.search ?? ''}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleReset}>
                    Сбросить
                </Button>
            </div>
        </div>
    );
}



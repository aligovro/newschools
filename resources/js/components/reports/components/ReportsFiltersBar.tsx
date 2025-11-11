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
import { ReportTypeDefinition, SiteOption } from '../types';

interface ReportsFiltersBarProps {
    reportTypes: ReportTypeDefinition[];
    statuses: string[];
    sites?: SiteOption[];
    organizations?: Array<{ id: number; name: string }>;
    value: {
        report_type?: string;
        status?: string;
        search?: string;
        site_id?: string;
        organization_id?: string;
    };
    onChange: (value: ReportsFiltersBarProps['value']) => void;
}

export function ReportsFiltersBar({
    reportTypes,
    statuses,
    sites = [],
    organizations = [],
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

    const handleOrganizationChange = useCallback(
        (next: string) => {
            onChange({
                ...value,
                organization_id: next,
            });
        },
        [onChange, value],
    );

    const handleStatusChange = useCallback(
        (next: string) => {
            onChange({ ...value, status: next || undefined });
        },
        [onChange, value],
    );

    const handleSiteChange = useCallback(
        (next: string) => {
            onChange({ ...value, site_id: next || undefined });
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
                {organizations.length > 0 && (
                    <div className="min-w-[200px]">
                        <Select
                            value={value.organization_id ?? 'all'}
                            onValueChange={(next) =>
                                handleOrganizationChange(next || 'all')
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Организация" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все организации</SelectItem>
                                {organizations.map((organization) => (
                                    <SelectItem
                                        key={organization.id}
                                        value={String(organization.id)}
                                    >
                                        {organization.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

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

                <div className="min-w-[180px]">
                    <Select
                        value={value.site_id ?? 'all'}
                        onValueChange={handleSiteChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Сайт" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все сайты</SelectItem>
                            {sites.map((site) => (
                                <SelectItem key={site.id} value={String(site.id)}>
                                    {site.name}
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



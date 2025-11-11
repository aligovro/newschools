import { ReportsFiltersBar } from '@/components/reports/components/ReportsFiltersBar';
import {
    Paginated,
    Report,
    ReportTypeDefinition,
    SiteOption,
} from '@/components/reports/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import reportsRoutes from '@/routes/reports';
import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface FiltersProps {
    availableStatuses: string[];
    query: Record<string, string | undefined>;
}

interface OrganizationOption {
    id: number;
    name: string;
}

interface ReportsOverviewPageProps {
    reportTypes: ReportTypeDefinition[];
    reports: Paginated<Report>;
    filters: FiltersProps;
    organizations: OrganizationOption[];
    sites: SiteOption[];
}

export default function ReportsOverviewPage({
    reportTypes,
    reports,
    filters,
    organizations,
    sites,
}: ReportsOverviewPageProps) {
    const [filtersState, setFiltersState] = useState(filters.query ?? {});

    useEffect(() => {
        setFiltersState(filters.query ?? {});
    }, [filters.query]);

    const handleFiltersChange = useCallback(
        (next: typeof filtersState) => {
            const hasOrganizationChanged =
                (filtersState.organization_id ?? 'all') !==
                (next.organization_id ?? 'all');

            const organizationValue = next.organization_id ?? 'all';
            const adjustedFilters = {
                ...next,
                site_id:
                    organizationValue === 'all'
                        ? undefined
                        : hasOrganizationChanged
                          ? undefined
                          : next.site_id,
            };

            setFiltersState(adjustedFilters);

            router.visit(reportsRoutes.index.url(), {
                method: 'get',
                data: sanitizeFilters(adjustedFilters),
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['reports', 'filters', 'sites'],
            });
        },
        [filtersState.organization_id],
    );

    const handlePaginate = useCallback((url: string | null) => {
        if (!url) return;
        router.visit(url, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['reports'],
        });
    }, []);

    const currentReports = useMemo(() => reports.data ?? [], [reports.data]);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Админ панель', href: '/dashboard' },
                { title: 'Отчеты', href: '#' },
            ]}
        >
            <Head title="Отчеты — обзор" />

            <div className="space-y-6">
                <ReportsFiltersBar
                    reportTypes={reportTypes}
                    statuses={filters.availableStatuses}
                    organizations={organizations}
                    sites={sites}
                    value={filtersState}
                    onChange={handleFiltersChange}
                />

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            Все сохраненные отчеты
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {currentReports.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Пока нет сохраненных отчетов, удовлетворяющих
                                условиям фильтра.
                            </p>
                        ) : (
                            <div className="relative max-h-[600px] overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Название</TableHead>
                                            <TableHead>Организация</TableHead>
                                            <TableHead>Сайт</TableHead>
                                            <TableHead>Тип</TableHead>
                                            <TableHead className="text-center">
                                                Статус
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Последний запуск
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Обновлено
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentReports.map((report) => (
                                            <TableRow key={report.id}>
                                                <TableCell className="font-medium">
                                                    {report.title}
                                                </TableCell>
                                                <TableCell>
                                                    {report.organization
                                                        ?.name ?? '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {report.site?.name ??
                                                        'Все сайты'}
                                                </TableCell>
                                                <TableCell className="capitalize">
                                                    {report.report_type}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {renderStatusBadge(
                                                        report.status,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">
                                                    {report.latest_run
                                                        ?.generated_at
                                                        ? new Date(
                                                              report.latest_run.generated_at,
                                                          ).toLocaleString(
                                                              'ru-RU',
                                                          )
                                                        : '—'}
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">
                                                    {new Date(
                                                        report.updated_at,
                                                    ).toLocaleString('ru-RU')}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {reports.links?.length > 1 && (
                    <PaginationControls
                        links={reports.links}
                        onNavigate={handlePaginate}
                    />
                )}
            </div>
        </AppLayout>
    );
}

function renderStatusBadge(status: string) {
    switch (status) {
        case 'ready':
            return <Badge className="bg-green-500 text-white">Готов</Badge>;
        case 'draft':
            return <Badge variant="secondary">Черновик</Badge>;
        case 'archived':
            return <Badge variant="outline">Архив</Badge>;
        default:
            return (
                <Badge variant="secondary" className="capitalize">
                    {status}
                </Badge>
            );
    }
}

function sanitizeFilters(filters: Record<string, string | undefined>) {
    return Object.fromEntries(
        Object.entries(filters).filter(
            ([, value]) =>
                value !== undefined && value !== 'all' && value !== '',
        ),
    );
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationControlsProps {
    links: PaginationLink[];
    onNavigate: (url: string | null) => void;
}

function PaginationControls({ links, onNavigate }: PaginationControlsProps) {
    return (
        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
            {links.map((link, index) => {
                const label = decodeHtml(link.label);
                return (
                    <button
                        key={`${label}-${index}`}
                        type="button"
                        onClick={() => onNavigate(link.url)}
                        disabled={!link.url}
                        className={`inline-flex min-w-[32px] items-center justify-center rounded-md border px-2 py-1 text-xs ${
                            link.active
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'hover:bg-muted/60 border-input text-muted-foreground'
                        } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}

function decodeHtml(html: string): string {
    if (typeof window === 'undefined') return html;
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
}

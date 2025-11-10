import { useCallback, useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { ReportsFiltersBar } from '@/features/reports/components/ReportsFiltersBar';
import { ReportsList } from '@/features/reports/components/ReportsList';
import { ReportBuilderPanel } from '@/features/reports/components/ReportBuilderPanel';
import { ReportPreviewPanel } from '@/features/reports/components/ReportPreviewPanel';
import { RecentRunsList } from '@/features/reports/components/RecentRunsList';
import { ReportSaveDialog } from '@/features/reports/components/ReportSaveDialog';
import { reportsApi } from '@/features/reports/api';
import {
    Paginated,
    ProjectOption,
    Report,
    ReportRun,
    ReportTypeDefinition,
} from '@/features/reports/types';

interface Organization {
    id: number;
    name: string;
    slug: string;
}

interface FiltersProps {
    availableStatuses: string[];
    availablePeriods: string[];
    query: Record<string, string | undefined>;
}

interface ReportsPageProps {
    organization: Organization;
    reportTypes: ReportTypeDefinition[];
    reports: Paginated<Report>;
    recentRuns: ReportRun[];
    filters: FiltersProps;
    projects: ProjectOption[];
}

export default function ReportsIndex({
    organization,
    reportTypes,
    reports,
    recentRuns,
    filters,
    projects,
}: ReportsPageProps) {
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [filtersState, setFiltersState] = useState(filters.query ?? {});
    const [previewPayload, setPreviewPayload] = useState<Record<string, unknown> | null>(
        null,
    );
    const handlePaginate = useCallback(
        (url: string | null) => {
            if (!url) return;
            router.visit(url, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['reports'],
            });
        },
        [],
    );
    const [isExporting, setIsExporting] = useState(false);
    const [processingReportId, setProcessingReportId] = useState<number | null>(null);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [savePayload, setSavePayload] = useState<Record<string, unknown> | null>(null);
    const handleSaveDialogToggle = useCallback((open: boolean) => {
        setSaveDialogOpen(open);
        if (!open) {
            setSavePayload(null);
        }
    }, []);


    const handleFiltersChange = useCallback(
        (next: typeof filtersState) => {
            setFiltersState(next);
            router.visit(route('organization.reports.index', organization.id), {
                method: 'get',
                data: sanitizeFilters(next),
                preserveState: true,
                replace: true,
                only: ['reports', 'filters', 'recentRuns'],
            });
        },
        [organization.id],
    );

    const handleRunReport = useCallback((report: Report) => {
        setSelectedReport(report);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleReportGenerated = useCallback(
        (
            payload: Record<string, unknown>,
            _run: ReportRun | null,
            persistedReport: Report | null,
        ) => {
            setPreviewPayload(payload);
            setProcessingReportId(null);

            if (persistedReport) {
                toast.success('Отчет обновлен');
                setSelectedReport(persistedReport);
                router.reload({ only: ['reports', 'recentRuns'] });
            }
        },
        [],
    );

    const handleSaveAs = useCallback((payload: Record<string, unknown>) => {
        setSavePayload(payload);
        setSaveDialogOpen(true);
    }, []);

    const handleProcessingChange = useCallback(
        (isProcessing: boolean) => {
            setProcessingReportId(isProcessing ? selectedReport?.id ?? null : null);
        },
        [selectedReport],
    );

    const handleSaveSubmit = useCallback(
        async (data: {
            title: string;
            description?: string;
            visibility: string;
            status: string;
        }) => {
            if (!savePayload) return;

            const filtersPayload = (savePayload.filters ??
                {}) as Record<string, unknown>;
            const meta = (savePayload.meta ?? {}) as Record<string, unknown>;

            await reportsApi.create(organization.id, {
                title: data.title,
                description: data.description,
                visibility: data.visibility,
                status: data.status,
                report_type: savePayload.type,
                filters: filtersPayload,
                meta,
                summary: savePayload.summary,
                project_id: meta.project_id ?? undefined,
                project_stage_id: meta.project_stage_id ?? undefined,
            });

            toast.success('Отчет сохранен');
            setSavePayload(null);
            router.reload({ only: ['reports', 'recentRuns'] });
        },
        [organization.id, savePayload],
    );

    const handleDeleteReport = useCallback(
        async (report: Report) => {
            if (!confirm(`Удалить отчет "${report.title}"?`)) return;
            try {
                await reportsApi.destroy(organization.id, report.id);
                toast.success('Отчет удален');
                router.reload({ only: ['reports', 'recentRuns'] });
            } catch (error) {
                console.error(error);
                toast.error('Не удалось удалить отчет');
            }
        },
        [organization.id],
    );

    const handleExport = useCallback(
        async (format: 'csv' | 'pdf' | 'excel') => {
            if (!previewPayload) return;
            setIsExporting(true);
            try {
                const response = await reportsApi.export(organization.id, {
                    report_type: previewPayload.type,
                    format,
                    data: previewPayload.data,
                    filters: previewPayload.filters,
                    summary: previewPayload.summary,
                    filename: `report_${previewPayload.type}_${Date.now()}.${format}`,
                });

                if (format === 'csv') {
                    const blob = new Blob([response.data], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download =
                        (response.headers['x-filename'] as string) ||
                        `report.${format}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                } else {
                    toast.info(response.data.message ?? 'Экспорт недоступен');
                }
            } catch (error) {
                console.error(error);
                toast.error('Не удалось экспортировать отчет');
            } finally {
                setIsExporting(false);
            }
        },
        [organization.id, previewPayload],
    );

    const handleSelectReport = useCallback((report: Report) => {
        setSelectedReport(report);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const currentReportList = useMemo(() => reports.data ?? [], [reports.data]);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Админ панель', href: '/dashboard' },
                {
                    title: organization.name,
                    href: `/dashboard/organization/${organization.id}/admin`,
                },
                { title: 'Отчеты', href: '#' },
            ]}
        >
            <Head title={`Отчеты — ${organization.name}`} />

            <div className="space-y-6">
                <ReportsFiltersBar
                    reportTypes={reportTypes}
                    statuses={filters.availableStatuses}
                    value={filtersState}
                    onChange={handleFiltersChange}
                />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                    <div className="space-y-6">
                        <ReportBuilderPanel
                            organizationId={organization.id}
                            reportTypes={reportTypes}
                            periods={filters.availablePeriods}
                            projects={projects}
                            initialReport={selectedReport}
                            onGenerated={handleReportGenerated}
                            onSaveAs={handleSaveAs}
                            onProcessingChange={handleProcessingChange}
                        />

                        <ReportsList
                            reports={currentReportList}
                            onRun={handleRunReport}
                            onEdit={handleSelectReport}
                            onDelete={handleDeleteReport}
                            processingReportId={processingReportId}
                        />
                        {reports.links?.length > 1 && (
                            <PaginationControls
                                links={reports.links}
                                onNavigate={handlePaginate}
                            />
                        )}
                    </div>

                    <div className="space-y-6">
                        <ReportPreviewPanel
                            payload={previewPayload}
                            onExport={handleExport}
                            isExporting={isExporting}
                        />

                        <RecentRunsList runs={recentRuns} />
                    </div>
                </div>
            </div>

            <ReportSaveDialog
                open={saveDialogOpen}
                onOpenChange={handleSaveDialogToggle}
                reportType={(savePayload?.type as string) ?? ''}
                onSubmit={handleSaveSubmit}
            />
        </AppLayout>
    );
}

function sanitizeFilters(filters: Record<string, string | undefined>) {
    return Object.fromEntries(
        Object.entries(filters).filter(
            ([, value]) => value !== undefined && value !== 'all' && value !== '',
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
                                : 'border-input text-muted-foreground hover:bg-muted/60'
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



import { reportsApi } from '@/components/reports/api';
import { RecentRunsList } from '@/components/reports/components/RecentRunsList';
import { ReportBuilderPanel } from '@/components/reports/components/ReportBuilderPanel';
import { ReportPreviewPanel } from '@/components/reports/components/ReportPreviewPanel';
import { ReportSaveDialog } from '@/components/reports/components/ReportSaveDialog';
import { ReportsFiltersBar } from '@/components/reports/components/ReportsFiltersBar';
import { ReportsList } from '@/components/reports/components/ReportsList';
import {
    Paginated,
    ProjectOption,
    Report,
    ReportRun,
    ReportTypeDefinition,
    SiteOption,
} from '@/components/reports/types';
import AppLayout from '@/layouts/app-layout';
import reportsRoutes from '@/routes/organizations/reports';
import { Head, router } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

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
    sites: SiteOption[];
}

export default function ReportsIndex({
    organization,
    reportTypes,
    reports,
    recentRuns,
    filters,
    projects,
    sites,
}: ReportsPageProps) {
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [filtersState, setFiltersState] = useState(filters.query ?? {});
    const [previewPayload, setPreviewPayload] = useState<Record<
        string,
        unknown
    > | null>(null);
    const handlePaginate = useCallback((url: string | null) => {
        if (!url) return;
        router.visit(url, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['reports'],
        });
    }, []);
    const [isExporting, setIsExporting] = useState(false);
    const [processingReportId, setProcessingReportId] = useState<number | null>(
        null,
    );
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [savePayload, setSavePayload] = useState<Record<
        string,
        unknown
    > | null>(null);
    const handleSaveDialogToggle = useCallback((open: boolean) => {
        setSaveDialogOpen(open);
        if (!open) {
            setSavePayload(null);
        }
    }, []);

    const handleFiltersChange = useCallback(
        (next: typeof filtersState) => {
            setFiltersState(next);
            router.visit(reportsRoutes.index.url(organization.id), {
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
            setProcessingReportId(
                isProcessing ? (selectedReport?.id ?? null) : null,
            );
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

            const filtersPayload = (savePayload.filters ?? {}) as Record<
                string,
                unknown
            >;
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
                site_id: meta.site_id ?? undefined,
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
        async (format: 'pdf' | 'excel') => {
            if (!previewPayload) return;
            setIsExporting(true);
            try {
                const extension = format === 'excel' ? 'xlsx' : format;
                const defaultFilename = `report_${previewPayload.type}_${Date.now()}.${extension}`;
                const response = await reportsApi.export(organization.id, {
                    report_type: previewPayload.type,
                    format,
                    data: previewPayload.data,
                    filters: previewPayload.filters,
                    summary: previewPayload.summary,
                    filename: defaultFilename,
                });

                const mimeType =
                    format === 'excel'
                        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        : format === 'pdf'
                          ? 'application/pdf'
                          : 'text/csv;charset=utf-8;';

                const blob =
                    response.data instanceof Blob
                        ? response.data.type
                            ? response.data
                            : new Blob([response.data], { type: mimeType })
                        : new Blob([response.data], { type: mimeType });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const fallbackName = defaultFilename;
                link.download =
                    (response.headers['x-filename'] as string) ?? fallbackName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
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
                    href: `/dashboard/organizations/${organization.id}`,
                },
                { title: 'Отчеты', href: '#' },
            ]}
        >
            <Head title={`Отчеты — ${organization.name}`} />

            <div className="space-y-6">
                <ReportsFiltersBar
                    reportTypes={reportTypes}
                    statuses={filters.availableStatuses}
                    sites={sites}
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
                            sites={sites}
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

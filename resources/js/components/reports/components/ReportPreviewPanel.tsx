import { memo, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate, formatNumber } from '@/lib/helpers';

interface ReportPreviewPanelProps {
    payload: Record<string, unknown> | null;
    onExport?: (format: 'pdf' | 'excel') => void;
    isExporting?: boolean;
}

type SummaryRow = {
    label: string;
    value: string;
};

type SummarySection = {
    title?: string;
    rows: SummaryRow[];
};

const PERIOD_LABELS: Record<string, string> = {
    day: 'День',
    week: 'Неделя',
    month: 'Месяц',
    quarter: 'Квартал',
    year: 'Год',
    custom: 'Произвольный период',
};

const GROUP_LABELS: Record<string, string> = {
    day: 'По дням',
    week: 'По неделям',
    month: 'По месяцам',
    quarter: 'По кварталам',
    year: 'По годам',
    project: 'По проектам',
    payment_method: 'По способам оплаты',
};

const PROJECT_STATUS_LABELS: Record<string, string> = {
    all: 'Все статусы',
    active: 'Активные',
    completed: 'Завершённые',
    failed: 'Неуспешные',
    cancelled: 'Отменённые',
};

const REPORT_TYPE_LABELS: Record<string, string> = {
    revenue: 'Отчет по доходам',
    members: 'Отчет по участникам',
    projects: 'Отчет по проектам',
    comprehensive: 'Комплексный отчет',
    custom: 'Пользовательский отчет',
};

export const ReportPreviewPanel = memo(function ReportPreviewPanel({
    payload,
    onExport,
    isExporting = false,
}: ReportPreviewPanelProps) {
    // Все хуки должны быть вызваны до любых условных возвратов
    const reportType = String(payload?.type ?? '');
    const meta = (payload?.meta as Record<string, unknown>) ?? {};
    const filters = (payload?.filters as Record<string, unknown>) ?? {};

    const summarySections = useMemo(
        () => (payload ? buildSummarySections(reportType, payload.summary) : []),
        [reportType, payload],
    );

    const parameterRows = useMemo(
        () => buildParameterRows(meta, filters),
        [meta, filters],
    );

    const dataContent = useMemo(
        () => (payload ? renderDataContent(reportType, payload.data, meta) : null),
        [reportType, payload, meta],
    );

    if (!payload) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">
                        Превью отчета
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Сформируйте отчет, чтобы увидеть результаты и выгрузить данные.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const cardTitle =
        (payload.title as string) ?? REPORT_TYPE_LABELS[reportType] ?? 'Отчет';

    const periodLabel = resolvePeriodLabel(
        filters.period as string | undefined,
        filters.date_from as string | undefined,
        filters.date_to as string | undefined,
    );

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle className="text-base font-semibold">
                        {cardTitle}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        {periodLabel}
                    </p>
                </div>
                {onExport && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onExport('pdf')}
                            disabled={isExporting}
                        >
                            Экспорт PDF
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onExport('excel')}
                            disabled={isExporting}
                        >
                            Экспорт Excel
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-5">
                {summarySections.length > 0 &&
                    summarySections.map((section, index) => (
                        <div key={`summary-${section.title ?? index}`}>
                            {section.title && (
                        <h3 className="text-sm font-semibold text-foreground">
                                    {section.title}
                        </h3>
                            )}
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                {section.rows.map((row) => (
                                    <li
                                        key={`${row.label}-${row.value}`}
                                        className="flex items-center justify-between gap-4"
                                    >
                                        <span className="text-muted-foreground">
                                            {row.label}
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {row.value}
                                        </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    ))}

                {parameterRows.length > 0 && (
                    <>
                        <Separator />
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">
                                Параметры отчета
                            </h3>
                            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                                {parameterRows.map((row) => (
                                    <li
                                        key={`${row.label}-${row.value}`}
                                        className="flex items-center justify-between gap-4"
                                    >
                                        <span>{row.label}</span>
                                        <span className="font-medium text-foreground">
                                            {row.value}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                )}

                <Separator />

                {dataContent ?? (
                    <p className="text-sm text-muted-foreground">
                        Нет данных для отображения.
                    </p>
                )}
            </CardContent>
        </Card>
    );
});

function buildSummarySections(
    reportType: string,
    summary: unknown,
): SummarySection[] {
    if (!summary || typeof summary !== 'object') {
        return [];
    }

    if (reportType === 'revenue') {
        const data = summary as Record<string, unknown>;
        return [
            {
                rows: [
                    {
                        label: 'Общая сумма пожертвований',
                        value: formatCurrencyFromMinor(data.total_amount, data.total_amount_rubles),
                    },
                    {
                        label: 'Количество пожертвований',
                        value: formatNumberFromUnknown(data.total_transactions),
                    },
                    {
                        label: 'Средний чек',
                        value: formatCurrencyFromMinor(data.average_transaction),
                    },
                ].filter((row) => row.value !== ''),
            },
        ];
    }

    if (reportType === 'members') {
        const data = summary as Record<string, unknown>;
        return [
            {
                rows: [
                    {
                        label: 'Новых участников',
                        value: formatNumberFromUnknown(data.new_members),
                    },
                    {
                        label: 'Активных участников',
                        value: formatNumberFromUnknown(data.active_members),
                    },
                    {
                        label: 'Основной источник привлечения',
                        value: formatTextValue(data.top_source),
                    },
                ].filter((row) => row.value !== ''),
            },
        ];
    }

    if (reportType === 'projects') {
        const data = summary as Record<string, unknown>;
        return [
            {
                rows: [
                    {
                        label: 'Количество проектов',
                        value: formatNumberFromUnknown(data.total_projects),
                    },
                    {
                        label: 'Цель финансирования',
                        value: formatCurrencyFromMinor(data.total_target),
                    },
                    {
                        label: 'Собрано средств',
                        value: formatCurrencyFromMinor(data.total_collected),
                    },
                    {
                        label: 'Общий прогресс',
                        value: formatPercentage(data.overall_progress),
                    },
                ].filter((row) => row.value !== ''),
            },
        ];
    }

    if (reportType === 'comprehensive' && summary && typeof summary === 'object') {
        const sections: SummarySection[] = [];
        Object.entries(summary as Record<string, unknown>).forEach(([key, value]) => {
            if (!value || typeof value !== 'object') {
                return;
            }

            const nested = buildSummarySections(key, value);
            if (nested.length > 0) {
                const title = COMPREHENSIVE_SECTION_TITLES[key] ?? humanizeKey(key);
                sections.push(
                    ...nested.map((section) => ({
                        title,
                        rows: section.rows,
                    })),
                );
            }
        });
        return sections;
    }

    if (Array.isArray(summary)) {
        return [
            {
                rows: summary.map((value, index) => ({
                    label: `Метрика ${index + 1}`,
                    value: formatTextValue(value),
                })),
            },
        ];
    }

    return [
        {
            rows: Object.entries(summary as Record<string, unknown>).map(
                ([key, value]) => ({
                    label: humanizeKey(key),
                    value: formatTextValue(value),
                }),
            ),
        },
    ];
}

function buildParameterRows(
    meta: Record<string, unknown>,
    filters: Record<string, unknown>,
): SummaryRow[] {
    const rows: SummaryRow[] = [];

    const period = filters.period as string | undefined;
    if (period) {
        rows.push({
            label: 'Период',
            value: PERIOD_LABELS[period] ?? humanizeKey(period),
        });
    }

    const groupBy = (meta.group_by ?? filters.group_by) as string | undefined;
    if (groupBy) {
        rows.push({
            label: 'Группировка',
            value: GROUP_LABELS[groupBy] ?? humanizeKey(groupBy),
        });
    }

    const status = (meta.status ?? filters.status) as string | undefined;
    if (status && status !== 'all') {
        rows.push({
            label: 'Статус проектов',
            value: PROJECT_STATUS_LABELS[status] ?? humanizeKey(status),
        });
    }

    const dateFrom = (meta.date_from ?? filters.date_from) as string | undefined;
    if (dateFrom) {
        rows.push({
            label: 'Дата начала',
            value: formatDate(dateFrom),
        });
    }

    const dateTo = (meta.date_to ?? filters.date_to) as string | undefined;
    if (dateTo) {
        rows.push({
            label: 'Дата завершения',
            value: formatDate(dateTo),
        });
    }

    const siteId = meta.site_id as string | number | undefined;
    rows.push({
        label: 'Сайт',
        value: siteId ? `ID ${siteId}` : 'Все сайты',
    });

    const projectId = meta.project_id as string | number | undefined;
    rows.push({
        label: 'Проект',
        value: projectId ? `ID ${projectId}` : 'Все проекты',
    });

    const stageId = meta.project_stage_id as string | number | undefined;
    if (stageId) {
        rows.push({
            label: 'Этап проекта',
            value: `ID ${stageId}`,
        });
    }

    return rows;
}

function renderDataContent(
    reportType: string,
    data: unknown,
    meta: Record<string, unknown>,
): React.ReactNode {
    switch (reportType) {
        case 'revenue':
            return renderRevenueData(data, meta.group_by as string | undefined);
        case 'members':
            return renderMembersData(data);
        case 'projects':
            return renderProjectsData(data);
        case 'comprehensive':
            return renderComprehensiveData(data, meta);
        case 'custom':
            return renderCustomData(data, meta);
        default:
            return renderGenericData(data);
    }
}

function renderRevenueData(
    data: unknown,
    groupBy: string | undefined,
): React.ReactNode {
    if (!Array.isArray(data) || data.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Нет данных о пожертвованиях за выбранный период.
            </p>
        );
    }

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
                Детализация по периодам
            </h3>
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader className="bg-muted/40">
                        <TableRow>
                            <TableHead className="w-1/3">Период</TableHead>
                            <TableHead className="text-right">Сумма</TableHead>
                            <TableHead className="text-right">
                                Количество пожертвований
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row) => {
                            if (
                                !row ||
                                typeof row !== 'object' ||
                                !('period' in row)
                            ) {
                                return null;
                            }
                            const period = formatRevenuePeriod(
                                String(row.period),
                                groupBy,
                            );
                            const total =
                                'total_rubles' in row
                                    ? formatCurrency(
                                          Number((row as Record<string, unknown>)
                                              .total_rubles ?? 0),
                                      )
                                    : formatCurrencyFromMinor(
                                          (row as Record<string, unknown>).total,
                                      );
                            const count = formatNumberFromUnknown(
                                (row as Record<string, unknown>).count,
                            );
                            return (
                                <TableRow key={`revenue-${row.period}-${count}`}>
                                    <TableCell>{period}</TableCell>
                                    <TableCell className="text-right font-medium text-foreground">
                                        {total}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {count}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function renderMembersData(data: unknown): React.ReactNode {
    if (!data || typeof data !== 'object') {
        return (
            <p className="text-sm text-muted-foreground">
                Нет данных об участниках за выбранный период.
            </p>
        );
    }

    const entries = data as Record<string, unknown>;
    const daily = Array.isArray(entries.daily_registrations)
        ? entries.daily_registrations
        : [];
    const sources = Array.isArray(entries.members_by_source)
        ? entries.members_by_source
        : [];
    const activeMembers = entries.active_members;

    return (
        <div className="space-y-5">
            {daily.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">
                        Прирост участников по дням
                    </h3>
                    <div className="overflow-hidden rounded-md border">
                        <Table>
                            <TableHeader className="bg-muted/40">
                                <TableRow>
                                    <TableHead>Дата</TableHead>
                                    <TableHead className="text-right">
                                        Количество
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {daily.map((item) => {
                                    if (
                                        !item ||
                                        typeof item !== 'object' ||
                                        !('date' in item)
                                    ) {
                                        return null;
                                    }
                                    return (
                                        <TableRow key={`members-date-${item.date}`}>
                                            <TableCell>
                                                {formatDate(
                                                    String(
                                                        (item as Record<string, unknown>).date,
                                                    ),
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatNumberFromUnknown(
                                                    (item as Record<string, unknown>).count,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {sources.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">
                        Источники привлечения
                    </h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                        {sources.map((item) => {
                            if (
                                !item ||
                                typeof item !== 'object' ||
                                !('source' in item)
                            ) {
                                return null;
                            }
                            return (
                                <li
                                    key={`members-source-${(item as Record<string, unknown>).source}`}
                                    className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                                >
                                    <span>
                                        {formatSourceLabel(
                                            String(
                                                (item as Record<string, unknown>).source,
                                            ),
                                        )}
                                    </span>
                                    <span className="font-medium text-foreground">
                                        {formatNumberFromUnknown(
                                            (item as Record<string, unknown>).count,
                                        )}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {typeof activeMembers === 'number' && (
                <div className="rounded-md bg-muted/40 p-3">
                    <p className="text-sm text-muted-foreground">
                        Активных участников за период:{' '}
                        <span className="font-semibold text-foreground">
                            {formatNumber(activeMembers)}
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
}

function renderProjectsData(data: unknown): React.ReactNode {
    if (!data || typeof data !== 'object') {
        return (
            <p className="text-sm text-muted-foreground">
                Нет данных по проектам за выбранный период.
            </p>
        );
    }

    const entries = data as Record<string, unknown>;
    const byStatus = Array.isArray(entries.projects_by_status)
        ? entries.projects_by_status
        : [];
    const funding = Array.isArray(entries.funding_progress)
        ? entries.funding_progress
        : [];

    return (
        <div className="space-y-5">
            {byStatus.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">
                        Проекты по статусам
                    </h3>
                    <div className="overflow-hidden rounded-md border">
                        <Table>
                            <TableHeader className="bg-muted/40">
                                <TableRow>
                                    <TableHead>Статус</TableHead>
                                    <TableHead className="text-right">
                                        Количество
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {byStatus.map((item) => {
                                    if (
                                        !item ||
                                        typeof item !== 'object' ||
                                        !('status' in item)
                                    ) {
                                        return null;
                                    }
                                    const status = String(
                                        (item as Record<string, unknown>).status ?? '—',
                                    );
                                    return (
                                        <TableRow key={`project-status-${status}`}>
                                            <TableCell>
                                                {PROJECT_STATUS_LABELS[status] ??
                                                    humanizeKey(status)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatNumberFromUnknown(
                                                    (item as Record<string, unknown>).count,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {funding.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">
                        Финансирование проектов
                    </h3>
                    <div className="overflow-hidden rounded-md border">
                        <Table>
                            <TableHeader className="bg-muted/40">
                                <TableRow>
                                    <TableHead>Проект</TableHead>
                                    <TableHead className="text-right">Цель</TableHead>
                                    <TableHead className="text-right">
                                        Собрано
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Прогресс
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {funding.map((item) => {
                                    if (
                                        !item ||
                                        typeof item !== 'object' ||
                                        !('title' in item)
                                    ) {
                                        return null;
                                    }
                                    const record = item as Record<string, unknown>;
                                    return (
                                        <TableRow key={`project-funding-${record.project_id}`}>
                                            <TableCell>
                                                {String(record.title ?? 'Без названия')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrencyFromMinor(record.target_amount)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrencyFromMinor(
                                                    record.collected_amount,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatPercentage(record.progress_percentage)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}

function renderComprehensiveData(
    data: unknown,
    meta: Record<string, unknown>,
): React.ReactNode {
    if (!data || typeof data !== 'object') {
        return renderGenericData(data);
    }

    const sections: React.ReactNode[] = [];
    Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
        const title = COMPREHENSIVE_SECTION_TITLES[key] ?? humanizeKey(key);
        let content: React.ReactNode = null;

        if (key === 'revenue') {
            content = renderRevenueData(
                Array.isArray(value) ? value : value,
                meta.group_by as string | undefined,
            );
        } else if (key === 'members') {
            content = renderMembersData(value);
        } else if (key === 'projects') {
            content = renderProjectsData(value);
        } else {
            content = renderGenericData(value);
        }

        if (content) {
            sections.push(
                <div key={`comprehensive-${key}`} className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                    {content}
                </div>,
            );
        }
    });

    if (sections.length === 0) {
        return renderGenericData(data);
    }

    return <div className="space-y-5">{sections}</div>;
}

function renderCustomData(
    data: unknown,
    meta: Record<string, unknown>,
): React.ReactNode {
    if (!data || typeof data !== 'object') {
        return renderGenericData(data);
    }

    const entries = data as Record<string, unknown>;
    if (entries.revenue) {
        return renderRevenueData(entries.revenue, meta.group_by as string | undefined);
    }

    return renderGenericData(data);
}

function renderGenericData(data: unknown): React.ReactNode {
    if (!data) {
        return (
            <p className="text-sm text-muted-foreground">
                Нет данных для отображения.
            </p>
        );
    }

    if (Array.isArray(data)) {
        if (data.length === 0) {
            return (
                <p className="text-sm text-muted-foreground">
                    Нет записей, удовлетворяющих условиям фильтра.
                </p>
            );
        }

        if (data.every((item) => typeof item === 'object')) {
            const keys = Array.from(
                new Set(
                    data.flatMap((item) =>
                        item && typeof item === 'object'
                            ? Object.keys(item as Record<string, unknown>)
                            : [],
                    ),
                ),
            );

            return (
                <div className="overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                {keys.map((key) => (
                                    <TableHead key={`generic-head-${key}`}>
                                        {humanizeKey(key)}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item, index) => (
                                <TableRow key={`generic-row-${index}`}>
                                    {keys.map((key) => (
                                        <TableCell key={`generic-cell-${key}-${index}`}>
                                            {formatTextValue(
                                                item && typeof item === 'object'
                                                    ? (item as Record<string, unknown>)[key]
                                                    : '',
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            );
        }

        return (
            <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                {data.map((item, index) => (
                    <li key={`generic-item-${index}`}>{formatTextValue(item)}</li>
                ))}
            </ul>
        );
    }

    if (typeof data === 'object') {
        return (
            <ul className="space-y-2 text-sm text-muted-foreground">
                {Object.entries(data as Record<string, unknown>).map(([key, value]) => (
                    <li key={`generic-object-${key}`} className="flex flex-col gap-1">
                        <span className="font-medium text-foreground">
                            {humanizeKey(key)}
                        </span>
                        <span>{formatTextValue(value)}</span>
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <pre className="overflow-auto rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
            {JSON.stringify(data, null, 2)}
        </pre>
    );
}

function resolvePeriodLabel(
    period: string | undefined,
    dateFrom: string | undefined,
    dateTo: string | undefined,
): string {
    if (period === 'custom' && dateFrom && dateTo) {
        return `Период: ${formatDate(dateFrom)} — ${formatDate(dateTo)}`;
    }

    if (period && PERIOD_LABELS[period]) {
        return `Период: ${PERIOD_LABELS[period]}`;
    }

    if (dateFrom && dateTo) {
        return `Период: ${formatDate(dateFrom)} — ${formatDate(dateTo)}`;
    }

    return 'Период не указан';
}

function formatRevenuePeriod(period: string, groupBy: string | undefined): string {
    if (!groupBy) {
        return period;
    }

    if (groupBy === 'month' && /^\d{4}-\d{2}$/.test(period)) {
        const [year, month] = period.split('-').map(Number);
        const date = new Date(year, month - 1, 1);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
        });
    }

    if (groupBy === 'quarter' && /^\d{4}-Q\d$/.test(period)) {
        const [year, quarter] = period.split('-Q');
        return `${quarter}-й квартал ${year} года`;
    }

    if (groupBy === 'day' && /^\d{4}-\d{2}-\d{2}$/.test(period)) {
        return formatDate(period);
    }

    if (groupBy === 'week') {
        const year = period.slice(0, 4);
        const week = period.slice(4);
        return `Неделя ${week} ${year} года`;
    }

    return humanizeKey(period);
}

function formatCurrencyFromMinor(
    value: unknown,
    fallbackRubles?: unknown,
): string {
    const fallbackNumber =
        typeof fallbackRubles === 'number'
            ? fallbackRubles
            : typeof fallbackRubles === 'string'
            ? Number(fallbackRubles)
            : NaN;

    if (!Number.isNaN(fallbackNumber)) {
        return formatCurrency(fallbackNumber);
    }

    const minor =
        typeof value === 'number'
            ? value
            : typeof value === 'string'
            ? Number(value)
            : NaN;

    if (!Number.isNaN(minor)) {
        return formatCurrency(minor / 100);
    }

    return '';
}

function formatNumberFromUnknown(value: unknown): string {
    if (typeof value === 'number') {
        return formatNumber(value);
    }

    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
        return formatNumber(numeric);
    }

    return '';
}

function formatPercentage(value: unknown): string {
    if (typeof value === 'number') {
        return `${value}%`;
    }
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
        return `${numeric}%`;
    }
    return '';
}

function formatTextValue(value: unknown): string {
    if (value === null || value === undefined) {
        return '—';
    }
    if (typeof value === 'number') {
        return formatNumber(value);
    }
    if (typeof value === 'boolean') {
        return value ? 'Да' : 'Нет';
    }
    if (typeof value === 'string') {
        return value.trim() !== '' ? value : '—';
    }

    try {
    return JSON.stringify(value);
    } catch {
        return String(value);
    }
}

function humanizeKey(key: string): string {
    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatSourceLabel(source: string): string {
    if (!source || source === 'unknown') {
        return 'Не указан';
    }
    return humanizeKey(source);
}

const COMPREHENSIVE_SECTION_TITLES: Record<string, string> = {
    revenue: 'Финансовые показатели',
    members: 'Участники',
    projects: 'Проекты',
    analytics: 'Аналитика',
};


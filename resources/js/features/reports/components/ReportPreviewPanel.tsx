import { memo, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ReportPreviewPanelProps {
    payload: Record<string, unknown> | null;
    onExport?: (format: 'csv' | 'pdf' | 'excel') => void;
    isExporting?: boolean;
}

export const ReportPreviewPanel = memo(function ReportPreviewPanel({
    payload,
    onExport,
    isExporting = false,
}: ReportPreviewPanelProps) {
    const summaryEntries = useMemo(() => {
        if (!payload?.summary || typeof payload.summary !== 'object') {
            return [];
        }

        return Object.entries(payload.summary as Record<string, unknown>);
    }, [payload]);

    const metadataEntries = useMemo(() => {
        if (!payload?.meta || typeof payload.meta !== 'object') {
            return [];
        }

        return Object.entries(payload.meta as Record<string, unknown>);
    }, [payload]);

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
                        Сформируйте отчет, чтобы увидеть результат и выгрузить данные.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const reportTitle =
        (payload.title as string) ?? `Отчет по типу ${(payload.type as string) ?? ''}`;
    const period =
        typeof payload?.filters === 'object'
            ? (payload.filters as Record<string, unknown>).period
            : undefined;

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle className="text-base font-semibold">
                        {reportTitle}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Период: {period ?? 'не указан'}
                    </p>
                </div>
                {onExport && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onExport('csv')}
                            disabled={isExporting}
                        >
                            Экспорт CSV
                        </Button>
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
            <CardContent className="space-y-4">
                {summaryEntries.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">
                            Сводка
                        </h3>
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                            {summaryEntries.map(([key, value]) => (
                                <li key={key} className="flex items-center justify-between">
                                    <span className="capitalize">{normalizeLabel(key)}</span>
                                    <span>{formatValue(value)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {metadataEntries.length > 0 && (
                    <>
                        <Separator />
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">
                                Параметры
                            </h3>
                            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                                {metadataEntries.map(([key, value]) => (
                                    <li key={key} className="flex items-center justify-between">
                                        <span className="capitalize">
                                            {normalizeLabel(key)}
                                        </span>
                                        <span>{value as string}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                )}

                <Separator />
                <div className="overflow-hidden rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                    <pre className="max-h-56 overflow-auto">
                        {JSON.stringify(payload.data, null, 2)}
                    </pre>
                </div>
            </CardContent>
        </Card>
    );
});

function normalizeLabel(label: string): string {
    return label.replace(/_/g, ' ');
}

function formatValue(value: unknown): string {
    if (typeof value === 'number') {
        return Math.round(value * 100) / 100 + '';
    }
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'boolean') {
        return value ? 'Да' : 'Нет';
    }
    if (value === null || value === undefined) {
        return '—';
    }
    return JSON.stringify(value);
}



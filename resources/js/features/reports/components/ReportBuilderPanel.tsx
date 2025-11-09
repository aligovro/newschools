import { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useReportBuilder } from '../hooks/useReportBuilder';
import {
    ProjectOption,
    Report,
    ReportRun,
    ReportTypeDefinition,
} from '../types';

interface ReportBuilderPanelProps {
    organizationId: number;
    reportTypes: ReportTypeDefinition[];
    periods: string[];
    projects: ProjectOption[];
    initialReport?: Report | null;
    onGenerated?: (
        payload: Record<string, unknown>,
        run?: ReportRun | null,
        persistedReport?: Report | null,
    ) => void;
    onPersisted?: (report: Report) => void;
    onSaveAs?: (payload: Record<string, unknown>) => void;
    onProcessingChange?: (isProcessing: boolean) => void;
}

const projectStatuses = ['all', 'active', 'completed', 'failed', 'cancelled'];

export function ReportBuilderPanel({
    organizationId,
    reportTypes,
    periods,
    projects,
    initialReport = null,
    onGenerated,
    onPersisted,
    onSaveAs,
    onProcessingChange,
}: ReportBuilderPanelProps) {
    const {
        state,
        setField,
        generate,
        reset,
        isLoading,
        error,
        payload,
        lastRun,
        selectedReportType,
        projectOptions,
        stageOptions,
    } = useReportBuilder({
        organizationId,
        reportTypes,
        projects,
        initialReport,
    });

    const groupByOptions = useMemo(() => selectedReportType?.groupings ?? [], [selectedReportType]);

    const handleGenerate = useCallback(async () => {
        onProcessingChange?.(true);
        const result = await generate({
            persist: Boolean(initialReport),
            reportId: initialReport?.id ?? undefined,
        });
        onProcessingChange?.(false);

        if (result && onGenerated) {
            onGenerated(result.payload, result.run ?? null, result.report ?? null);
        }

        if (result?.report && onPersisted) {
            onPersisted(result.report);
        }
    }, [generate, initialReport, onGenerated, onPersisted, onProcessingChange]);

    const handleSaveAs = useCallback(async () => {
        onProcessingChange?.(true);
        const result = await generate({ persist: false });
        onProcessingChange?.(false);
        if (result && onGenerated) {
            onGenerated(result.payload, result.run ?? null, null);
        }
        if (result?.payload && onSaveAs) {
            onSaveAs(result.payload);
        }
    }, [generate, onGenerated, onSaveAs, onProcessingChange]);

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle className="text-xl font-semibold">
                        Конструктор отчета
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Настройте параметры и сформируйте точный отчет
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={reset}>
                    Сбросить
                </Button>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Тип отчета</Label>
                        <Select
                            value={state.reportType}
                            onValueChange={(value) =>
                                setField({
                                    reportType: value as Report['report_type'],
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите тип" />
                            </SelectTrigger>
                            <SelectContent>
                                {reportTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.id}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Период</Label>
                        <Select
                            value={state.period}
                            onValueChange={(value) => setField({ period: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите период" />
                            </SelectTrigger>
                            <SelectContent>
                                {periods.map((period) => (
                                    <SelectItem key={period} value={period}>
                                        {period}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {state.period === 'custom' && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Дата от</Label>
                            <Input
                                type="date"
                                value={state.dateFrom ?? ''}
                                onChange={(event) =>
                                    setField({ dateFrom: event.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Дата до</Label>
                            <Input
                                type="date"
                                value={state.dateTo ?? ''}
                                onChange={(event) =>
                                    setField({ dateTo: event.target.value })
                                }
                            />
                        </div>
                    </div>
                )}

                {groupByOptions.length > 0 && (
                    <div className="space-y-2">
                        <Label>Группировка</Label>
                        <Select
                            value={state.groupBy ?? undefined}
                            onValueChange={(value) => setField({ groupBy: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите группировку" />
                            </SelectTrigger>
                            <SelectContent>
                                {groupByOptions.map((option) => (
                                    <SelectItem key={option} value={option as string}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {state.reportType === 'projects' && (
                    <div className="space-y-2">
                        <Label>Статус проекта</Label>
                        <Select
                            value={state.status ?? 'all'}
                            onValueChange={(value) => setField({ status: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {projectStatuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Проект</Label>
                        <Select
                            value={state.projectId ? String(state.projectId) : undefined}
                            onValueChange={(value) =>
                                setField({
                                    projectId: value ? Number(value) : null,
                                    projectStageId: null,
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Все проекты" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Все проекты</SelectItem>
                                {projectOptions.map((project) => (
                                    <SelectItem key={project.id} value={String(project.id)}>
                                        {project.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Этап проекта</Label>
                        <Select
                            value={
                                state.projectStageId
                                    ? String(state.projectStageId)
                                    : undefined
                            }
                            onValueChange={(value) =>
                                setField({
                                    projectStageId: value ? Number(value) : null,
                                })
                            }
                            disabled={!stageOptions.length}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Все этапы" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Все этапы</SelectItem>
                                {stageOptions.map((stage) => (
                                    <SelectItem
                                        key={stage.id}
                                        value={String(stage.id)}
                                    >
                                        {stage.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {state.reportType === 'members' && (
                    <div className="flex items-center justify-between rounded-md border border-muted p-3">
                        <Label htmlFor="includeInactive" className="text-sm">
                            Включать неактивных участников
                        </Label>
                        <Switch
                            id="includeInactive"
                            checked={state.includeInactive}
                            onCheckedChange={(checked) =>
                                setField({ includeInactive: checked })
                            }
                        >
                            <SwitchThumb />
                        </Switch>
                    </div>
                )}

                {state.reportType === 'comprehensive' && (
                    <div className="grid grid-cols-1 gap-3 rounded-md border border-muted p-4 sm:grid-cols-2">
                        <ToggleRow
                            label="Доходы"
                            checked={state.includeRevenue}
                            onChange={(checked) => setField({ includeRevenue: checked })}
                        />
                        <ToggleRow
                            label="Участники"
                            checked={state.includeMembers}
                            onChange={(checked) => setField({ includeMembers: checked })}
                        />
                        <ToggleRow
                            label="Проекты"
                            checked={state.includeProjects}
                            onChange={(checked) => setField({ includeProjects: checked })}
                        />
                        <ToggleRow
                            label="Аналитика"
                            checked={state.includeAnalytics}
                            onChange={(checked) =>
                                setField({ includeAnalytics: checked })
                            }
                        />
                    </div>
                )}

                {error && (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                    <Button onClick={handleGenerate} disabled={isLoading}>
                        {isLoading ? 'Формирование...' : 'Сформировать'}
                    </Button>
                    {initialReport ? (
                        <Button
                            variant="outline"
                            onClick={handleGenerate}
                            disabled={isLoading}
                        >
                            Сохранить изменения
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={handleSaveAs}
                            disabled={isLoading}
                        >
                            Сохранить как отчет
                        </Button>
                    )}
                </div>

                {(payload || lastRun) && (
                    <div className="rounded-md bg-muted/40 p-4 text-sm text-muted-foreground">
                        <div className="font-medium text-foreground">
                            Последний результат:
                        </div>
                        {payload?.summary && (
                            <pre className="mt-2 max-h-40 overflow-auto rounded bg-background/80 p-2">
                                {JSON.stringify(payload.summary, null, 2)}
                            </pre>
                        )}
                        {lastRun && (
                            <div className="mt-2 text-xs">
                                Сохраненный запуск: {new Date(lastRun.generated_at).toLocaleString('ru-RU')}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface ToggleRowProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
    return (
        <div className="flex items-center justify-between rounded-md border border-muted/50 bg-background p-3">
            <span className="text-sm">{label}</span>
            <Switch checked={checked} onCheckedChange={onChange} />
        </div>
    );
}



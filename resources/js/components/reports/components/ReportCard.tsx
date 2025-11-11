import { memo, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BarChart3, MoreHorizontal, Play, RefreshCw } from 'lucide-react';
import { Report } from '../types';

interface ReportCardProps {
    report: Report;
    onRun: (report: Report) => void;
    onEdit: (report: Report) => void;
    onDelete: (report: Report) => void;
    isProcessing?: boolean;
}

export const ReportCard = memo(function ReportCard({
    report,
    onRun,
    onEdit,
    onDelete,
    isProcessing = false,
}: ReportCardProps) {
    const statusBadge = useMemo(() => {
        switch (report.status) {
            case 'draft':
                return (
                    <Badge variant="secondary" className="capitalize">
                        Черновик
                    </Badge>
                );
            case 'ready':
                return (
                    <Badge className="capitalize bg-green-500 text-white">
                        Готов
                    </Badge>
                );
            case 'archived':
                return (
                    <Badge variant="outline" className="capitalize">
                        Архив
                    </Badge>
                );
            default:
                return (
                    <Badge variant="secondary" className="capitalize">
                        {report.status}
                    </Badge>
                );
        }
    }, [report.status]);

    const summaryText = useMemo(() => {
        const parts: string[] = [];
        const summary = report.summary ?? {};

        if (summary.total_amount_rubles) {
            parts.push(
                `Сумма: ${(summary.total_amount_rubles as number).toLocaleString(
                    'ru-RU',
                )} ₽`,
            );
        }

        if (summary.total_transactions) {
            parts.push(`Транзакций: ${summary.total_transactions}`);
        }

        if (summary.new_members) {
            parts.push(`Новых участников: ${summary.new_members}`);
        }

        if (summary.total_projects) {
            parts.push(`Проектов: ${summary.total_projects}`);
        }

        return parts.join(' · ');
    }, [report.summary]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-indigo-100 p-2 text-indigo-600">
                        <BarChart3 className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span className="capitalize">{report.report_type}</span>
                            {report.project?.title && (
                                <span className="truncate text-xs text-muted-foreground">
                                    Проект: {report.project.title}
                                </span>
                            )}
                            {report.project_stage?.title && (
                                <span className="truncate text-xs text-muted-foreground">
                                    Этап: {report.project_stage.title}
                                </span>
                            )}
                            {report.site?.name && (
                                <span className="truncate text-xs text-muted-foreground">
                                    Сайт: {report.site.name}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {statusBadge}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(report)}>
                                Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(report)}
                                className="text-red-600"
                            >
                                Удалить
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    {report.description || 'Описание отсутствует'}
                </p>

                {summaryText && (
                    <div className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                        {summaryText}
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>
                        Обновлено:{' '}
                        {new Date(report.updated_at).toLocaleString('ru-RU')}
                    </span>
                    {report.generated_at && (
                        <span>
                            Последний запуск:{' '}
                            {new Date(report.generated_at).toLocaleString('ru-RU')}
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        size="sm"
                        onClick={() => onRun(report)}
                        disabled={isProcessing}
                    >
                        <Play className="mr-2 h-4 w-4" />
                        Сформировать
                    </Button>
                    {report.latest_run && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRun(report)}
                            disabled={isProcessing}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Повторить
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
});



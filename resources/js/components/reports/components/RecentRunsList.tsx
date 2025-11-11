import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ReportRun } from '../types';

interface RecentRunsListProps {
    runs: ReportRun[];
}

export const RecentRunsList = memo(function RecentRunsList({
    runs,
}: RecentRunsListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">
                    Последние запуски
                </CardTitle>
            </CardHeader>
            <CardContent>
                {runs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Пока нет сохраненных запусков отчетов.
                    </p>
                ) : (
                    <div className="relative max-h-[360px] overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Отчет</TableHead>
                                    <TableHead>Тип</TableHead>
                                    <TableHead>Сайт</TableHead>
                                    <TableHead className="text-right">
                                        Строк
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Дата
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {runs.map((run) => (
                                    <TableRow key={run.id}>
                                        <TableCell className="font-medium">
                                            {run.report?.title ?? 'Ad-hoc'}
                                        </TableCell>
                                        <TableCell className="capitalize">
                                            {run.report_type}
                                        </TableCell>
                                        <TableCell>
                                            {run.site?.name ?? 'Все сайты'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {run.rows_count}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {new Date(
                                                run.generated_at,
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
    );
});



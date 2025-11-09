import { memo } from 'react';
import { Report } from '../types';
import { ReportCard } from './ReportCard';

interface ReportsListProps {
    reports: Report[];
    onRun: (report: Report) => void;
    onEdit: (report: Report) => void;
    onDelete: (report: Report) => void;
    processingReportId?: number | null;
}

export const ReportsList = memo(function ReportsList({
    reports,
    onRun,
    onEdit,
    onDelete,
    processingReportId = null,
}: ReportsListProps) {
    if (!reports.length) {
        return (
            <div className="rounded-lg border border-dashed border-muted-foreground/40 p-12 text-center text-muted-foreground">
                Сохраненных отчетов пока нет. Создайте первый отчет, используя
                конструктор, и сохраните его для повторного использования.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {reports.map((report) => (
                <ReportCard
                    key={report.id}
                    report={report}
                    onRun={onRun}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isProcessing={processingReportId === report.id}
                />
            ))}
        </div>
    );
});



import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    type ExpenseReportFormData,
    type ExpenseReportItem,
    useProjectExpenseReports,
} from '@/hooks/useProjectExpenseReports';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, FileText, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface OrgMeta {
    id: number;
    name: string;
    slug: string;
}

interface ProjectMeta {
    id: number;
    title: string;
    slug: string;
}

interface Props {
    organization: OrgMeta;
    project: ProjectMeta;
    initialReports: ExpenseReportItem[];
    hasMore: boolean;
}

const EMPTY_FORM: ExpenseReportFormData = {
    title: '',
    amount_kopecks: 0,
    status: 'paid',
    report_date: new Date().toISOString().slice(0, 10),
    pdf_file: null,
};

export default function ProjectExpenseReportsPage({
    organization,
    project,
    initialReports,
    hasMore: initialHasMore,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Админ панель', href: '/dashboard' },
        { title: 'Организации', href: '/dashboard/organizations' },
        { title: organization.name, href: `/dashboard/organizations/${organization.id}` },
        {
            title: project.title,
            href: `/dashboard/organizations/${organization.id}/projects/${project.id}`,
        },
        { title: 'Отчёты по расходам', href: '#' },
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<ExpenseReportFormData>(EMPTY_FORM);

    const { reportList, hasMore, loadMore, submitReport, deleteReport } = useProjectExpenseReports({
        organizationId: organization.id,
        projectId: project.id,
        initialReports,
        initialHasMore,
    });

    const handleCreate = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setIsModalOpen(true);
    };

    const handleEdit = (report: ExpenseReportItem) => {
        setEditingId(report.id);
        setForm({
            title: report.title,
            amount_kopecks: report.amount_kopecks,
            status: report.status as 'paid' | 'pending',
            report_date: report.report_date,
            pdf_file: null,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const ok = await submitReport(form, editingId);
        if (ok) setIsModalOpen(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить отчёт?')) return;
        await deleteReport(id);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Отчёты по расходам — ${project.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/dashboard/organizations/${organization.id}/projects/${project.id}`}
                        >
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Назад
                            </Button>
                        </Link>
                        <div>
                            <h1 className="block__title">Отчёты по расходам</h1>
                            <p className="text-sm text-gray-600">{project.title}</p>
                        </div>
                    </div>
                    <Button size="sm" onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить
                    </Button>
                </div>

                {/* List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Список отчётов</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {reportList.length === 0 ? (
                            <p className="py-4 text-center text-sm text-gray-500">
                                Отчёты не добавлены
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {reportList.map((report) => (
                                    <div
                                        key={report.id}
                                        className="flex items-center gap-4 rounded-lg border p-3"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                                            <FileText className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-gray-400">
                                                {report.formatted_date}
                                                {report.pdf_url && (
                                                    <>
                                                        {' · '}
                                                        <a
                                                            href={report.pdf_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            PDF
                                                        </a>
                                                        {report.formatted_file_size && (
                                                            <> · {report.formatted_file_size}</>
                                                        )}
                                                    </>
                                                )}
                                            </p>
                                            <p className="truncate text-sm font-medium">
                                                {report.title}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-xs text-gray-400">
                                                {report.status_label}
                                            </p>
                                            <p className="text-sm font-bold">
                                                {report.formatted_amount}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(report)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(report.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {hasMore && (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={loadMore}
                                    >
                                        Загрузить ещё
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? 'Редактировать отчёт' : 'Добавить отчёт'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="er-title">Название</Label>
                            <Input
                                id="er-title"
                                value={form.title}
                                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                required
                                placeholder="Описание расхода"
                            />
                        </div>

                        <div>
                            <Label htmlFor="er-amount">Сумма, ₽</Label>
                            <Input
                                id="er-amount"
                                type="number"
                                min={0}
                                step="0.01"
                                value={form.amount_kopecks / 100 || ''}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        amount_kopecks: Math.round(
                                            parseFloat(e.target.value || '0') * 100,
                                        ),
                                    }))
                                }
                                required
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <Label htmlFor="er-date">Дата</Label>
                            <Input
                                id="er-date"
                                type="date"
                                value={form.report_date}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, report_date: e.target.value }))
                                }
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="er-status">Статус</Label>
                            <Select
                                value={form.status}
                                onValueChange={(v) =>
                                    setForm((f) => ({ ...f, status: v as 'paid' | 'pending' }))
                                }
                            >
                                <SelectTrigger id="er-status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="paid">Оплачено</SelectItem>
                                    <SelectItem value="pending">В обработке</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="er-pdf">PDF файл {editingId && '(оставьте пустым, чтобы не менять)'}</Label>
                            <Input
                                id="er-pdf"
                                type="file"
                                accept="application/pdf"
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        pdf_file: e.target.files?.[0] ?? null,
                                    }))
                                }
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Отмена
                            </Button>
                            <Button type="submit">
                                {editingId ? 'Сохранить' : 'Добавить'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

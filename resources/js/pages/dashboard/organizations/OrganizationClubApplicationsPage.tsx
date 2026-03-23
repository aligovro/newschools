import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    type ApplicationStatus,
    type ClubApplicationItem,
    useClubApplications,
} from '@/hooks/useClubApplications';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Check, Phone, X } from 'lucide-react';
import { useCallback, useState } from 'react';

interface OrgMeta {
    id: number;
    name: string;
    type: string;
    status: string;
    region?: { name: string } | null;
}

interface Props {
    organization: OrgMeta;
    initialApplications: ClubApplicationItem[];
    hasMore: boolean;
    counts: { total: number; pending: number };
    statusFilter: string | null;
}

const STATUS_TABS = [
    { value: '',        label: 'Все' },
    { value: 'pending', label: 'На рассмотрении' },
    { value: 'approved', label: 'Одобренные' },
    { value: 'rejected', label: 'Отклонённые' },
] as const;

const STATUS_BADGE_CLASS: Record<string, string> = {
    pending:  'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
};

export default function OrganizationClubApplicationsPage({
    organization,
    initialApplications,
    hasMore: initialHasMore,
    counts,
    statusFilter,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Админ панель', href: dashboard().url },
        { title: 'Организации', href: '/dashboard/organizations' },
        { title: organization.name, href: `/dashboard/organizations/${organization.id}` },
        { title: 'Заявки на секции', href: '#' },
    ];

    const [activeStatus, setActiveStatus] = useState<ApplicationStatus | ''>(
        (statusFilter as ApplicationStatus | '') ?? '',
    );
    const [processing, setProcessing] = useState<number | null>(null);

    const { items, hasMore, loading, fetchApplications, loadMore, updateStatus } =
        useClubApplications({
            organizationId:       organization.id,
            initialApplications,
            initialHasMore,
        });

    const handleTabChange = useCallback(
        (status: ApplicationStatus | '') => {
            setActiveStatus(status);
            fetchApplications(1, status);
        },
        [fetchApplications],
    );

    const handleUpdateStatus = useCallback(
        async (id: number, status: 'approved' | 'rejected') => {
            setProcessing(id);
            await updateStatus(id, status);
            setProcessing(null);
        },
        [updateStatus],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Заявки на секции — ${organization.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">

                {/* Заголовок */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/dashboard/organizations/${organization.id}`}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Назад
                            </Button>
                        </Link>
                        <div>
                            <h1 className="block__title flex items-center gap-2">
                                Заявки на секции
                                {counts.pending > 0 && (
                                    <span className="inline-flex items-center justify-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
                                        {counts.pending} новых
                                    </span>
                                )}
                            </h1>
                            <p className="text-sm text-gray-600">{organization.name}</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">Всего: {counts.total}</p>
                </div>

                {/* Фильтр по статусу */}
                <div className="flex flex-wrap gap-2">
                    {STATUS_TABS.map(({ value, label }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => handleTabChange(value as ApplicationStatus | '')}
                            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                                activeStatus === value
                                    ? 'border-gray-900 bg-gray-900 text-white'
                                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {label}
                            {value === 'pending' && counts.pending > 0 && (
                                <span className="ml-1.5 rounded-full bg-yellow-400 px-1.5 py-0.5 text-xs text-white">
                                    {counts.pending}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Список */}
                <Card>
                    <CardHeader>
                        <CardTitle>Заявки</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {items.length === 0 && !loading && (
                            <p className="py-8 text-center text-sm text-gray-500">
                                Заявок пока нет
                            </p>
                        )}

                        {items.length > 0 && (
                            <div className="divide-y">
                                {items.map((app) => (
                                    <ApplicationRow
                                        key={app.id}
                                        application={app}
                                        processing={processing === app.id}
                                        onApprove={() => handleUpdateStatus(app.id, 'approved')}
                                        onReject={() => handleUpdateStatus(app.id, 'rejected')}
                                    />
                                ))}
                            </div>
                        )}

                        {loading && (
                            <p className="py-4 text-center text-sm text-gray-400">Загрузка…</p>
                        )}

                        {hasMore && !loading && (
                            <div className="mt-4">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => loadMore(activeStatus)}
                                >
                                    Загрузить ещё
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

interface ApplicationRowProps {
    application: ClubApplicationItem;
    processing: boolean;
    onApprove: () => void;
    onReject: () => void;
}

function ApplicationRow({ application, processing, onApprove, onReject }: ApplicationRowProps) {
    const isPending = application.status === 'pending';

    return (
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900">{application.applicant_name}</span>
                    <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[application.status]}`}
                    >
                        {application.status_label}
                    </span>
                </div>
                <p className="text-sm text-gray-600">
                    Секция: <span className="font-medium text-gray-800">{application.club_name}</span>
                </p>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <a href={`tel:${application.phone}`} className="hover:underline">
                        {application.phone}
                    </a>
                </div>
                {application.comment && (
                    <p className="text-sm text-gray-500 italic">«{application.comment}»</p>
                )}
                <p className="text-xs text-gray-400">{application.created_at}</p>
            </div>

            {isPending && (
                <div className="flex shrink-0 gap-2 sm:ml-4">
                    <Button
                        size="sm"
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-50"
                        disabled={processing}
                        onClick={onApprove}
                    >
                        <Check className="mr-1 h-4 w-4" />
                        Одобрить
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        disabled={processing}
                        onClick={onReject}
                    >
                        <X className="mr-1 h-4 w-4" />
                        Отклонить
                    </Button>
                </div>
            )}

            {!isPending && application.reviewed_at && (
                <p className="shrink-0 self-start text-xs text-gray-400 sm:ml-4">
                    {application.reviewed_at}
                </p>
            )}
        </div>
    );
}

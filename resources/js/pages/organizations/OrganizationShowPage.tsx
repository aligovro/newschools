import OrganizationContactCard from '@/components/dashboard/pages/organizations/OrganizationContactCard';
import OrganizationDirectorCard from '@/components/dashboard/pages/organizations/OrganizationDirectorCard';
import OrganizationInfoCard from '@/components/dashboard/pages/organizations/OrganizationInfoCard';
import OrganizationStaffList from '@/components/dashboard/pages/organizations/OrganizationStaffList';
import OrganizationStaffModal from '@/components/dashboard/pages/organizations/OrganizationStaffModal';
import { StatusBadge } from '@/components/dashboard/pages/organizations/StatusBadge';
import type { OrganizationShow } from '@/components/dashboard/pages/organizations/types';
import { getTypeLabel } from '@/components/dashboard/pages/organizations/utils';
import { Button } from '@/components/ui/button';
import { useOrganizationStaff } from '@/hooks/useOrganizationStaff';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Админ панель',
        href: dashboard().url,
    },
    {
        title: 'Организации',
        href: '/dashboard/organizations',
    },
    {
        title: 'Просмотр',
        href: '#',
    },
];

interface Props {
    organization: OrganizationShow;
}

export default function OrganizationShowPage({ organization }: Props) {
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [editingStaffId, setEditingStaffId] = useState<number | null>(null);

    const {
        staffList,
        hasMoreStaff,
        staffForm,
        resetForm,
        fetchStaffMember,
        submitStaff,
        deleteStaff,
        loadMoreStaff,
    } = useOrganizationStaff({
        organizationId: organization.id,
        initialStaff: Array.isArray(organization.staff)
            ? organization.staff
            : [],
    });

    const handleCreateStaff = () => {
        setEditingStaffId(null);
        resetForm();
        setIsStaffModalOpen(true);
    };

    const handleEditStaff = async (staffId: number) => {
        const staffMember = await fetchStaffMember(staffId);
        if (staffMember) {
            setEditingStaffId(staffId);
            const nameParts = staffMember.full_name.split(' ');
            staffForm.setData({
                last_name: nameParts[0] || '',
                first_name: nameParts[1] || '',
                middle_name: nameParts.slice(2).join(' ') || '',
                position:
                    staffMember.position === 'Директор'
                        ? ''
                        : staffMember.position,
                is_director: staffMember.position === 'Директор',
                email: staffMember.email || '',
                address: staffMember.address || '',
                photo: staffMember.photo || null,
            });
            setIsStaffModalOpen(true);
        }
    };

    const handleSubmitStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await submitStaff(staffForm.data, editingStaffId);
        if (success) {
            setIsStaffModalOpen(false);
        }
    };

    const handleDeleteStaff = async (staffId: number) => {
        if (!confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
            return;
        }
        await deleteStaff(staffId);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={organization.name} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/organizations">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Назад к списку
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {organization.name}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {getTypeLabel(organization.type)}
                                {organization.region?.name &&
                                    ` • ${organization.region.name}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge status={organization.status} />
                        <div className="flex space-x-1">
                            <Link
                                href={`/dashboard/organizations/${organization.id}/edit`}
                            >
                                <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Основная информация */}
                    <div className="space-y-6 lg:col-span-2">
                        <OrganizationInfoCard organization={organization} />
                    </div>

                    {/* Контактная информация и персонал */}
                    <div className="space-y-6">
                        <OrganizationContactCard organization={organization} />

                        {/* Директор */}
                        {organization.director && organization.director.id && (
                            <OrganizationDirectorCard
                                director={organization.director}
                                onEdit={handleEditStaff}
                            />
                        )}

                        {/* Персонал */}
                        <OrganizationStaffList
                            staff={staffList}
                            hasMore={hasMoreStaff}
                            onAdd={handleCreateStaff}
                            onEdit={handleEditStaff}
                            onDelete={handleDeleteStaff}
                            onLoadMore={loadMoreStaff}
                        />
                    </div>
                </div>

                {/* Модальное окно для создания/редактирования персонала */}
                <OrganizationStaffModal
                    open={isStaffModalOpen}
                    onOpenChange={setIsStaffModalOpen}
                    formData={staffForm.data}
                    onFormDataChange={(key, value) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (staffForm.setData as any)(key, value);
                    }}
                    onSubmit={handleSubmitStaff}
                    isEditing={editingStaffId !== null}
                    organizationId={organization.id}
                    director={organization.director}
                />
            </div>
        </AppLayout>
    );
}

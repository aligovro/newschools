import OrganizationDirectorCard from '@/components/dashboard/pages/organizations/OrganizationDirectorCard';
import OrganizationStaffList from '@/components/dashboard/pages/organizations/OrganizationStaffList';
import OrganizationStaffModal from '@/components/dashboard/pages/organizations/OrganizationStaffModal';
import type { OrganizationDirector, OrganizationStaffMember } from '@/components/dashboard/pages/organizations/types';
import { Button } from '@/components/ui/button';
import { useOrganizationStaff } from '@/hooks/useOrganizationStaff';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useState } from 'react';

interface OrgMeta {
    id: number;
    name: string;
    type: string;
    status: string;
    region?: { name: string } | null;
    director?: OrganizationDirector | null;
}

interface Props {
    organization: OrgMeta;
    initialStaff: OrganizationStaffMember[];
    hasMore: boolean;
}

export default function OrganizationStaffPage({ organization, initialStaff }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Админ панель', href: dashboard().url },
        { title: 'Организации', href: '/dashboard/organizations' },
        { title: organization.name, href: `/dashboard/organizations/${organization.id}` },
        { title: 'Персонал', href: '#' },
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

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
        initialStaff,
    });

    const handleCreate = () => {
        setEditingId(null);
        resetForm();
        setIsModalOpen(true);
    };

    const handleEdit = async (staffId: number) => {
        const member = await fetchStaffMember(staffId);
        if (member) {
            setEditingId(staffId);
            const parts = member.full_name.split(' ');
            staffForm.setData({
                last_name: parts[0] || '',
                first_name: parts[1] || '',
                middle_name: parts.slice(2).join(' ') || '',
                position: member.position === 'Директор' ? '' : member.position,
                is_director: member.position === 'Директор',
                email: member.email || '',
                address: member.address || '',
                photo: member.photo || null,
            });
            setIsModalOpen(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const ok = await submitStaff(staffForm.data, editingId);
        if (ok) setIsModalOpen(false);
    };

    const handleDelete = async (staffId: number) => {
        if (!confirm('Вы уверены, что хотите удалить этого сотрудника?')) return;
        await deleteStaff(staffId);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Персонал — ${organization.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/dashboard/organizations/${organization.id}`}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Назад
                            </Button>
                        </Link>
                        <div>
                            <h1 className="block__title">Персонал</h1>
                            <p className="text-sm text-gray-600">{organization.name}</p>
                        </div>
                    </div>
                    <Button size="sm" onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <OrganizationStaffList
                            staff={staffList}
                            hasMore={hasMoreStaff}
                            onAdd={handleCreate}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onLoadMore={loadMoreStaff}
                        />
                    </div>
                    {organization.director && organization.director.id && (
                        <div>
                            <OrganizationDirectorCard
                                director={organization.director}
                                onEdit={handleEdit}
                            />
                        </div>
                    )}
                </div>

                <OrganizationStaffModal
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    formData={staffForm.data}
                    onFormDataChange={(key, value) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (staffForm.setData as any)(key, value);
                    }}
                    onSubmit={handleSubmit}
                    isEditing={editingId !== null}
                    organizationId={organization.id}
                    director={organization.director}
                />
            </div>
        </AppLayout>
    );
}

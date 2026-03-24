import OrganizationClubModal from '@/components/dashboard/pages/organizations/OrganizationClubModal';
import OrganizationClubsList from '@/components/dashboard/pages/organizations/OrganizationClubsList';
import type { ClubFormData, OrganizationClubMember } from '@/components/dashboard/pages/organizations/types';
import { Button } from '@/components/ui/button';
import { useOrganizationClubs } from '@/hooks/useOrganizationClubs';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ClipboardList, Plus } from 'lucide-react';
import { useState } from 'react';

interface OrgMeta {
    id: number;
    name: string;
    type: string;
    status: string;
    region?: { name: string } | null;
}

interface Props {
    organization: OrgMeta;
    initialClubs: OrganizationClubMember[];
    hasMore: boolean;
}

export default function OrganizationClubsPage({ organization, initialClubs }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Админ панель', href: dashboard().url },
        { title: 'Организации', href: '/dashboard/organizations' },
        { title: organization.name, href: `/dashboard/organizations/${organization.id}` },
        { title: 'Кружки и секции', href: '#' },
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<ClubFormData>({
        name: '',
        description: '',
        image: null,
        galleryItems: [],
        sort_order: 0,
        schedule: {},
    });

    const { clubList, hasMore, fetchClub, submitClub, deleteClub, loadMore } = useOrganizationClubs({
        organizationId: organization.id,
        initialClubs,
    });

    const handleCreate = () => {
        setEditingId(null);
        setForm({
            name: '',
            description: '',
            image: null,
            galleryItems: [],
            sort_order: 0,
            schedule: {},
        });
        setIsModalOpen(true);
    };

    const handleEdit = async (id: number) => {
        const club = await fetchClub(id);
        if (club) {
            setEditingId(id);
            setForm({
                name: club.name,
                description: club.description ?? '',
                image: club.image ?? null,
                galleryItems: (club.gallery ?? []).map((url, index) => ({
                    id: `g-${club.id}-${index}`,
                    url,
                    name: url.split('/').pop() || `photo-${index + 1}.jpg`,
                    size: 0,
                    type: 'image/*',
                    status: 'success' as const,
                })),
                sort_order: club.sort_order ?? 0,
                schedule: club.schedule ?? {},
            });
            setIsModalOpen(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const ok = await submitClub(form, editingId);
        if (ok) setIsModalOpen(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить кружок/секцию?')) return;
        await deleteClub(id);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Кружки и секции — ${organization.name}`} />
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
                            <h1 className="block__title">Кружки и секции</h1>
                            <p className="text-sm text-gray-600">{organization.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/dashboard/organizations/${organization.id}/club-applications`}>
                            <Button variant="outline" size="sm">
                                <ClipboardList className="mr-2 h-4 w-4" />
                                Заявки
                            </Button>
                        </Link>
                        <Button size="sm" onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Добавить
                        </Button>
                    </div>
                </div>

                <OrganizationClubsList
                    clubs={clubList}
                    hasMore={hasMore}
                    onAdd={handleCreate}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onLoadMore={loadMore}
                />

                <OrganizationClubModal
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    formData={form}
                    onFormDataChange={(key, value) =>
                        setForm((prev) => ({ ...prev, [key]: value }))
                    }
                    onSubmit={handleSubmit}
                    isEditing={editingId !== null}
                />
            </div>
        </AppLayout>
    );
}

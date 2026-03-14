import OrganizationVideoLessonModal from '@/components/dashboard/pages/organizations/OrganizationVideoLessonModal';
import OrganizationVideoLessonsList from '@/components/dashboard/pages/organizations/OrganizationVideoLessonsList';
import type { OrganizationVideoLessonMember, VideoLessonFormData } from '@/components/dashboard/pages/organizations/types';
import { Button } from '@/components/ui/button';
import { useOrganizationVideoLessons } from '@/hooks/useOrganizationVideoLessons';
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
}

interface Props {
    organization: OrgMeta;
    initialLessons: OrganizationVideoLessonMember[];
    hasMore: boolean;
}

export default function OrganizationVideoLessonsPage({ organization, initialLessons }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Админ панель', href: dashboard().url },
        { title: 'Организации', href: '/dashboard/organizations' },
        { title: organization.name, href: `/dashboard/organizations/${organization.id}` },
        { title: 'Видео уроки', href: '#' },
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<VideoLessonFormData>({
        title: '',
        description: '',
        video_url: '',
        thumbnail: null,
        sort_order: 0,
    });

    const { lessonList, hasMore, fetchLesson, submitLesson, deleteLesson, loadMore } =
        useOrganizationVideoLessons({
            organizationId: organization.id,
            initialLessons,
        });

    const handleCreate = () => {
        setEditingId(null);
        setForm({ title: '', description: '', video_url: '', thumbnail: null, sort_order: 0 });
        setIsModalOpen(true);
    };

    const handleEdit = async (id: number) => {
        const lesson = await fetchLesson(id);
        if (lesson) {
            setEditingId(id);
            setForm({
                title: lesson.title,
                description: lesson.description ?? '',
                video_url: lesson.video_url,
                thumbnail: lesson.thumbnail ?? null,
                sort_order: lesson.sort_order ?? 0,
            });
            setIsModalOpen(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const ok = await submitLesson(form, editingId);
        if (ok) setIsModalOpen(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить видео урок?')) return;
        await deleteLesson(id);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Видео уроки — ${organization.name}`} />
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
                            <h1 className="block__title">Видео уроки</h1>
                            <p className="text-sm text-gray-600">{organization.name}</p>
                        </div>
                    </div>
                    <Button size="sm" onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить
                    </Button>
                </div>

                <OrganizationVideoLessonsList
                    lessons={lessonList}
                    hasMore={hasMore}
                    onAdd={handleCreate}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onLoadMore={loadMore}
                />

                <OrganizationVideoLessonModal
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

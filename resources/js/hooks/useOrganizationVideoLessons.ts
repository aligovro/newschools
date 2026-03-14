import { router } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import type {
    OrganizationVideoLessonMember,
    VideoLessonFormData,
} from '@/components/dashboard/pages/organizations/types';

interface UseOrganizationVideoLessonsOptions {
    organizationId: number;
    initialLessons?: OrganizationVideoLessonMember[];
}

export function useOrganizationVideoLessons({
    organizationId,
    initialLessons = [],
}: UseOrganizationVideoLessonsOptions) {
    const safeInitial = Array.isArray(initialLessons) ? initialLessons : [];
    const [lessonList, setLessonList] = useState<OrganizationVideoLessonMember[]>(safeInitial);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(safeInitial.length >= 20);

    const fetchLessons = useCallback(
        async (page = 1) => {
            try {
                const res = await fetch(
                    `/dashboard/organizations/${organizationId}/video-lessons?page=${page}&per_page=20`,
                    { headers: { Accept: 'application/json' } },
                );
                const data = await res.json();
                if (page === 1) {
                    setLessonList(data.data || []);
                } else {
                    setLessonList((prev) => [...prev, ...(data.data || [])]);
                }
                setHasMore(
                    data.pagination?.current_page < data.pagination?.last_page,
                );
            } catch (e) {
                console.error('Error fetching video lessons:', e);
            }
        },
        [organizationId],
    );

    const loadMore = useCallback(() => {
        const next = currentPage + 1;
        setCurrentPage(next);
        fetchLessons(next);
    }, [currentPage, fetchLessons]);

    const fetchLesson = useCallback(
        async (id: number): Promise<OrganizationVideoLessonMember | null> => {
            try {
                const res = await fetch(
                    `/dashboard/organizations/${organizationId}/video-lessons/${id}`,
                    { headers: { Accept: 'application/json' } },
                );
                const data = await res.json();
                return data.data ?? null;
            } catch (e) {
                console.error('Error fetching video lesson:', e);
                return null;
            }
        },
        [organizationId],
    );

    const submitLesson = useCallback(
        async (
            formData: VideoLessonFormData,
            editingId: number | null,
        ): Promise<boolean> => {
            const fd = new FormData();
            fd.append('title', formData.title);
            fd.append('description', formData.description);
            fd.append('video_url', formData.video_url);
            fd.append('sort_order', String(formData.sort_order ?? 0));
            if (formData.thumbnail && formData.thumbnail instanceof File) {
                fd.append('thumbnail', formData.thumbnail);
            }

            const url = editingId
                ? `/dashboard/organizations/${organizationId}/video-lessons/${editingId}`
                : `/dashboard/organizations/${organizationId}/video-lessons`;

            if (editingId) fd.append('_method', 'PUT');

            try {
                const token =
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '';
                const res = await fetch(url, {
                    method: 'POST',
                    body: fd,
                    headers: {
                        'X-CSRF-TOKEN': token,
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                });

                if (!res.ok) throw new Error('Failed to save video lesson');
                router.reload();
                return true;
            } catch (e) {
                console.error('Error saving video lesson:', e);
                return false;
            }
        },
        [organizationId],
    );

    const deleteLesson = useCallback(
        async (id: number): Promise<boolean> => {
            try {
                const token =
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '';
                const res = await fetch(
                    `/dashboard/organizations/${organizationId}/video-lessons/${id}`,
                    {
                        method: 'DELETE',
                        headers: { 'X-CSRF-TOKEN': token },
                    },
                );
                if (!res.ok) throw new Error('Failed to delete');
                router.reload();
                return true;
            } catch (e) {
                console.error('Error deleting video lesson:', e);
                return false;
            }
        },
        [organizationId],
    );

    return {
        lessonList,
        hasMore,
        fetchLessons,
        loadMore,
        fetchLesson,
        submitLesson,
        deleteLesson,
    };
}

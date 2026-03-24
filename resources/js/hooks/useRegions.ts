import { router } from '@inertiajs/react';
import { CreateRegionForm, UpdateRegionForm } from '@/types/geo';

export const useRegions = () => {
    const create = (data: CreateRegionForm) =>
        router.post('/dashboard/admin/geo/regions', data as Record<string, unknown>, {
            preserveScroll: true,
        });

    const update = (id: number, data: UpdateRegionForm) =>
        router.put(`/dashboard/admin/geo/regions/${id}`, data as Record<string, unknown>, {
            preserveScroll: true,
        });

    const remove = (id: number) =>
        router.delete(`/dashboard/admin/geo/regions/${id}`, {
            preserveScroll: true,
        });

    const toggleActive = (id: number) =>
        router.patch(
            `/dashboard/admin/geo/regions/${id}/toggle-active`,
            {},
            { preserveScroll: true },
        );

    return { create, update, remove, toggleActive };
};

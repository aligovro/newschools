import { router, useForm } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import type { OrganizationStaffMember, StaffFormData } from '@/components/dashboard/pages/organizations/types';

interface UseOrganizationStaffOptions {
    organizationId: number;
    initialStaff?: OrganizationStaffMember[];
}

export function useOrganizationStaff({
    organizationId,
    initialStaff = [],
}: UseOrganizationStaffOptions) {
    // Убеждаемся, что initialStaff всегда массив
    const safeInitialStaff = Array.isArray(initialStaff) ? initialStaff : [];
    const [staffList, setStaffList] = useState<OrganizationStaffMember[]>(safeInitialStaff);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreStaff, setHasMoreStaff] = useState(
        safeInitialStaff.length >= 15,
    );

    const staffForm = useForm<StaffFormData>({
        last_name: '',
        first_name: '',
        middle_name: '',
        position: '',
        is_director: false,
        email: '',
        address: '',
        photo: null,
    });

    const fetchStaff = useCallback(
        async (page: number = 1) => {
            try {
                const response = await fetch(
                    `/dashboard/organizations/${organizationId}/staff?page=${page}&per_page=15&exclude_director=true`,
                );
                const data = await response.json();
                if (page === 1) {
                    setStaffList(data.data || []);
                } else {
                    setStaffList((prev) => [...prev, ...(data.data || [])]);
                }
                setHasMoreStaff(
                    data.pagination.current_page < data.pagination.last_page,
                );
            } catch (error) {
                console.error('Error fetching staff:', error);
            }
        },
        [organizationId],
    );

    const loadMoreStaff = useCallback(() => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchStaff(nextPage);
    }, [currentPage, fetchStaff]);

    const resetForm = useCallback(() => {
        staffForm.setData({
            last_name: '',
            first_name: '',
            middle_name: '',
            position: '',
            is_director: false,
            email: '',
            address: '',
            photo: null,
        });
    }, [staffForm]);

    const fetchStaffMember = useCallback(
        async (staffId: number): Promise<OrganizationStaffMember | null> => {
            try {
                const response = await fetch(
                    `/dashboard/organizations/${organizationId}/staff/${staffId}`,
                );
                const data = await response.json();
                return data.data || null;
            } catch (error) {
                console.error('Error fetching staff member:', error);
                return null;
            }
        },
        [organizationId],
    );

    const submitStaff = useCallback(
        async (
            staffData: StaffFormData,
            editingId: number | null,
        ): Promise<boolean> => {
            const formData = new FormData();
            formData.append('last_name', staffData.last_name);
            formData.append('first_name', staffData.first_name);
            formData.append('middle_name', staffData.middle_name);
            formData.append('position', staffData.position);
            formData.append('is_director', staffData.is_director ? '1' : '0');
            formData.append('email', staffData.email || '');
            formData.append('address', staffData.address || '');
            // Отправляем фото только если это новый файл (File), а не строка (существующий URL)
            if (staffData.photo && staffData.photo instanceof File) {
                formData.append('photo', staffData.photo);
            }

            const url = editingId
                ? `/dashboard/organizations/${organizationId}/staff/${editingId}`
                : `/dashboard/organizations/${organizationId}/staff`;

            // Для PUT метода Laravel требует _method в FormData
            if (editingId) {
                formData.append('_method', 'PUT');
            }

            try {
                const csrfToken =
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '';

                const response = await fetch(url, {
                    method: 'POST', // Всегда POST, для PUT используем _method
                    body: formData,
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                });

                if (!response.ok) {
                    throw new Error('Failed to save staff');
                }

                router.reload();
                return true;
            } catch (error) {
                console.error('Error saving staff:', error);
                return false;
            }
        },
        [organizationId],
    );

    const deleteStaff = useCallback(
        async (staffId: number): Promise<boolean> => {
            try {
                const response = await fetch(
                    `/dashboard/organizations/${organizationId}/staff/${staffId}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'X-CSRF-TOKEN':
                                document
                                    .querySelector('meta[name="csrf-token"]')
                                    ?.getAttribute('content') || '',
                        },
                    },
                );

                if (!response.ok) {
                    throw new Error('Failed to delete staff');
                }

                router.reload();
                return true;
            } catch (error) {
                console.error('Error deleting staff:', error);
                return false;
            }
        },
        [organizationId],
    );

    return {
        staffList,
        hasMoreStaff,
        staffForm,
        fetchStaff,
        loadMoreStaff,
        resetForm,
        fetchStaffMember,
        submitStaff,
        deleteStaff,
    };
}


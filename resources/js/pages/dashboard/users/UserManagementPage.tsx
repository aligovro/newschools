import UserManagement from '@/components/dashboard/users/users/UserManagement';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Админ панель',
        href: dashboard().url,
    },
    {
        title: 'Пользователи',
        href: '/dashboard/users',
    },
];

interface UserManagementPageProps {
    [key: string]: any;
    users: any;
    roles: any[];
    permissions: any[];
    filters: any;
}

const UserManagementPage: React.FC = () => {
    const { props } = usePage<UserManagementPageProps>();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Управление пользователями" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <UserManagement
                    initialUsers={props.users}
                    initialRoles={props.roles}
                    initialPermissions={props.permissions}
                    initialFilters={props.filters}
                />
            </div>
        </AppLayout>
    );
};

export default UserManagementPage;

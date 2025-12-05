import { memo, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    Building2,
    CheckCircle2,
    Edit3,
    MapPin,
    Trash2,
    XCircle,
} from 'lucide-react';

import { StatusBadge } from './StatusBadge';
import type {
    SuggestedOrganization,
    SuggestedOrganizationsStatus,
} from './types';

interface SuggestedOrganizationCardProps {
    organization: SuggestedOrganization;
    disableActions?: boolean;
    onUpdateStatus: (
        organization: SuggestedOrganization,
        status: SuggestedOrganizationsStatus,
    ) => void;
    onEdit: (organization: SuggestedOrganization) => void;
    onDelete: (organization: SuggestedOrganization) => void;
}

const getCoordinatesLabel = (
    latitude: number | null,
    longitude: number | null,
): string | null => {
    if (latitude === null || longitude === null) {
        return null;
    }

    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};

const SuggestedOrganizationCardComponent = ({
    organization,
    disableActions = false,
    onUpdateStatus,
    onEdit,
    onDelete,
}: SuggestedOrganizationCardProps) => {
    const coordinates = useMemo(
        () => getCoordinatesLabel(organization.latitude, organization.longitude),
        [organization.latitude, organization.longitude],
    );

    const createdAt = useMemo(() => {
        try {
            return new Date(organization.created_at).toLocaleString('ru-RU');
        } catch {
            return organization.created_at;
        }
    }, [organization.created_at]);

    return (
        <Card className="border border-gray-200 shadow-sm transition hover:border-gray-300">
            <CardContent className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {organization.name}
                                    </h3>
                                    <StatusBadge status={organization.status} />
                                </div>
                                <p className="text-sm text-gray-500">
                                    Создано: {createdAt}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                            {organization.city_name && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span>{organization.city_name}</span>
                                </div>
                            )}
                            {organization.address && (
                                <div className="pl-6 text-gray-500">
                                    {organization.address}
                                </div>
                            )}
                            {coordinates && (
                                <div className="pl-6 text-xs text-gray-500">
                                    Координаты: {coordinates}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                            {organization.admin_notes && (
                                <div className="rounded-md bg-gray-100 p-3 text-gray-700">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">
                                        Заметки администратора
                                    </p>
                                    <p className="mt-1 whitespace-pre-line">
                                        {organization.admin_notes}
                                    </p>
                                </div>
                            )}
                            {organization.reviewer && (
                                <div className="text-xs text-gray-500">
                                    Рассмотрено: {organization.reviewer.name}{' '}
                                    {organization.reviewed_at
                                        ? `(${new Date(
                                              organization.reviewed_at,
                                          ).toLocaleString('ru-RU')})`
                                        : ''}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="flex flex-wrap justify-end gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onEdit(organization)}
                                disabled={disableActions}
                                className="flex items-center gap-2"
                            >
                                <Edit3 className="h-4 w-4" />
                                Редактировать
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className={cn(
                                    'flex items-center gap-2',
                                    'text-green-600 hover:text-green-700',
                                )}
                                disabled={
                                    disableActions ||
                                    organization.status === 'approved'
                                }
                                onClick={() =>
                                    onUpdateStatus(organization, 'approved')
                                }
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Одобрить
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className={cn(
                                    'flex items-center gap-2',
                                    'text-red-600 hover:text-red-700',
                                )}
                                disabled={
                                    disableActions ||
                                    organization.status === 'rejected'
                                }
                                onClick={() =>
                                    onUpdateStatus(organization, 'rejected')
                                }
                            >
                                <XCircle className="h-4 w-4" />
                                Отклонить
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                className="flex items-center gap-2"
                                disabled={disableActions}
                                onClick={() => onDelete(organization)}
                            >
                                <Trash2 className="h-4 w-4" />
                                Удалить
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export const SuggestedOrganizationCard = memo(SuggestedOrganizationCardComponent);



import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OrganizationShow } from './types';
import { StatusBadge } from './StatusBadge';
import {
    buildAboutPhrase,
    getTypeLabel,
    useOrganizationTerms,
} from './utils';

interface OrganizationInfoCardProps {
    organization: OrganizationShow;
}

export default function OrganizationInfoCard({
    organization,
}: OrganizationInfoCardProps) {
    const { singularPrepositional } = useOrganizationTerms();
    const infoTitle = `Информация ${buildAboutPhrase(singularPrepositional)}`;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{infoTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {organization.logo && (
                    <div className="flex justify-between">
                        <img
                            src={organization.logo}
                            alt={organization.name}
                            className="h-24 w-24 rounded-lg object-cover"
                        />
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Статус
                            </p>
                            <div className="mt-1">
                                <StatusBadge status={organization.status} />
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-500">
                            Тип
                        </p>
                        <p className="text-sm">
                            {getTypeLabel(organization.type)}
                        </p>
                    </div>
                </div>

                {organization.description && (
                    <div>
                        <p className="text-sm font-medium text-gray-500">
                            Описание
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                            {organization.description}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-4 border-t pt-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {organization.members_count || 0}
                        </div>
                        <div className="text-sm text-gray-500">
                            Участники
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {organization.donations_count || 0}
                        </div>
                        <div className="text-sm text-gray-500">Донаты</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {organization.donations_total &&
                            typeof organization.donations_total === 'number'
                                ? new Intl.NumberFormat('ru-RU').format(
                                      organization.donations_total,
                                  ) + ' ₽'
                                : organization.donations_sum &&
                                    typeof organization.donations_sum ===
                                        'number'
                                  ? new Intl.NumberFormat('ru-RU').format(
                                        organization.donations_sum / 100,
                                    ) + ' ₽'
                                  : '0 ₽'}
                        </div>
                        <div className="text-sm text-gray-500">Собрано</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

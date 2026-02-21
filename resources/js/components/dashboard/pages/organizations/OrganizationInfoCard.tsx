import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import type { OrganizationShow } from './types';
import { buildAboutPhrase, getTypeLabel, useOrganizationTerms } from './utils';

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
                        <p className="text-sm font-medium text-gray-500">Тип</p>
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
                        <div
                            className="text-sm text-gray-900 prose prose-sm max-w-none"
                            // HTML в описании организации задается администраторами,
                            // поэтому мы считаем этот контент доверенным.
                            dangerouslySetInnerHTML={{
                                __html: organization.description,
                            }}
                        />
                    </div>
                )}

                <div className="grid grid-cols-3 gap-4 border-t pt-4">
                    <div className="text-center">
                        <div className="block__title">
                            {organization.members_count || 0}
                        </div>
                        <div className="text-sm text-gray-500">Участники</div>
                    </div>
                    <div className="text-center">
                        <div className="block__title">
                            {organization.donations_count || 0}
                        </div>
                        <div className="text-sm text-gray-500">Донаты</div>
                    </div>
                    <div className="text-center">
                        <div className="block__title">
                            {organization.donations_sum_completed != null &&
                            typeof organization.donations_sum_completed ===
                                'number'
                                ? new Intl.NumberFormat('ru-RU', {
                                      minimumFractionDigits: 2,
                                  }).format(
                                      organization.donations_sum_completed /
                                          100,
                                  ) + ' ₽'
                                : organization.donations_collected != null &&
                                    typeof organization.donations_collected ===
                                        'number'
                                  ? new Intl.NumberFormat('ru-RU', {
                                        minimumFractionDigits: 2,
                                    }).format(
                                        organization.donations_collected / 100,
                                    ) + ' ₽'
                                  : organization.donations_sum != null &&
                                    typeof organization.donations_sum ===
                                        'number'
                                  ? new Intl.NumberFormat('ru-RU', {
                                        minimumFractionDigits: 2,
                                    }).format(
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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Mail, MapPin, Phone } from 'lucide-react';
import type { OrganizationShow } from './types';

interface OrganizationContactCardProps {
    organization: OrganizationShow;
}

export default function OrganizationContactCard({
    organization,
}: OrganizationContactCardProps) {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Контактная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {organization.email && (
                        <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Email
                                </p>
                                <a
                                    href={`mailto:${organization.email}`}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    {organization.email}
                                </a>
                            </div>
                        </div>
                    )}

                    {organization.phone && (
                        <div className="flex items-center space-x-3">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Телефон
                                </p>
                                <a
                                    href={`tel:${organization.phone}`}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    {organization.phone}
                                </a>
                            </div>
                        </div>
                    )}

                    {organization.address && (
                        <div className="flex items-center space-x-3">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Адрес
                                </p>
                                <p className="text-sm text-gray-900 dark:text-white">
                                    {organization.address}
                                </p>
                            </div>
                        </div>
                    )}

                    {organization.website && (
                        <div className="flex items-center space-x-3">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Веб-сайт
                                </p>
                                <a
                                    href={organization.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    {organization.website}
                                </a>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Системная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Создана:</span>
                        <span className="text-sm">
                            {new Date(
                                organization.created_at,
                            ).toLocaleDateString('ru-RU')}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                            Обновлена:
                        </span>
                        <span className="text-sm">
                            {new Date(
                                organization.updated_at,
                            ).toLocaleDateString('ru-RU')}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                            Публичная:
                        </span>
                        <span className="text-sm">
                            {organization.is_public ? 'Да' : 'Нет'}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

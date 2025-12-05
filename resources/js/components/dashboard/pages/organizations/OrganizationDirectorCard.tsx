import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, User } from 'lucide-react';
import type { OrganizationDirector } from './types';

interface OrganizationDirectorCardProps {
    director: OrganizationDirector;
    onEdit?: (staffId: number) => void;
}

export default function OrganizationDirectorCard({
    director,
    onEdit,
}: OrganizationDirectorCardProps) {
    // Безопасная проверка данных директора
    if (!director || !director.id) {
        return null;
    }

    const fullName =
        director.full_name ||
        `${director.last_name || ''} ${director.first_name || ''} ${director.middle_name || ''}`.trim() ||
        'Не указано';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Директор
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-start gap-4">
                    {director.photo && (
                        <img
                            src={director.photo}
                            alt={fullName}
                            className="h-20 w-20 rounded-lg object-cover"
                        />
                    )}
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold">{fullName}</h3>
                        <p className="text-sm text-gray-600">
                            {director.position || 'Директор'}
                        </p>
                        {director.email && (
                            <p className="mt-1 text-sm">
                                <a
                                    href={`mailto:${director.email}`}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    {director.email}
                                </a>
                            </p>
                        )}
                        {director.address && (
                            <p className="mt-1 text-sm text-gray-600">
                                {director.address}
                            </p>
                        )}
                        {onEdit && (
                            <div className="mt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(director.id)}
                                >
                                    <Edit className="mr-1 h-4 w-4" />
                                    Редактировать
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

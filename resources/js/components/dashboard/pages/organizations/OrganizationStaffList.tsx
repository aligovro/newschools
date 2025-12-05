import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Plus, Users } from 'lucide-react';
import type { OrganizationStaffMember } from './types';

interface OrganizationStaffListProps {
    staff: OrganizationStaffMember[];
    hasMore: boolean;
    onAdd: () => void;
    onEdit: (staffId: number) => void;
    onDelete: (staffId: number) => void;
    onLoadMore?: () => void;
}

export default function OrganizationStaffList({
    staff,
    hasMore,
    onAdd,
    onEdit,
    onDelete,
    onLoadMore,
}: OrganizationStaffListProps) {
    // Убеждаемся, что staff всегда массив
    const staffArray = Array.isArray(staff) ? staff : [];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Персонал
                    </CardTitle>
                    <Button size="sm" onClick={onAdd}>
                        <Plus className="mr-1 h-4 w-4" />
                        Добавить
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {staffArray.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-500">
                        Персонал не добавлен
                    </p>
                ) : (
                    <div className="space-y-4">
                        {staffArray.map((staffMember) => (
                            <div
                                key={staffMember.id}
                                className="flex items-start gap-4 border-b pb-4 last:border-0"
                            >
                                {staffMember.photo && (
                                    <img
                                        src={staffMember.photo}
                                        alt={staffMember.full_name}
                                        className="h-16 w-16 rounded-lg object-cover"
                                    />
                                )}
                                <div className="flex-1">
                                    <h4 className="font-medium">
                                        {staffMember.full_name}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        {staffMember.position}
                                    </p>
                                    {staffMember.email && (
                                        <p className="mt-1 text-sm">
                                            <a
                                                href={`mailto:${staffMember.email}`}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                {staffMember.email}
                                            </a>
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(staffMember.id)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onDelete(staffMember.id)}
                                    >
                                        Удалить
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {hasMore && onLoadMore && (
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={onLoadMore}
                            >
                                Загрузить еще
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}


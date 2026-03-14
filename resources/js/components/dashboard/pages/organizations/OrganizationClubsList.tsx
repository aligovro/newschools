import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Plus } from 'lucide-react';
import type { OrganizationClubMember } from './types';

interface OrganizationClubsListProps {
    clubs: OrganizationClubMember[];
    hasMore: boolean;
    onAdd: () => void;
    onEdit: (clubId: number) => void;
    onDelete: (clubId: number) => void;
    onLoadMore?: () => void;
}

export default function OrganizationClubsList({
    clubs,
    hasMore,
    onAdd,
    onEdit,
    onDelete,
    onLoadMore,
}: OrganizationClubsListProps) {
    const items = Array.isArray(clubs) ? clubs : [];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        Кружки и секции
                    </CardTitle>
                    <Button size="sm" onClick={onAdd}>
                        <Plus className="mr-1 h-4 w-4" />
                        Добавить
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {items.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-500">
                        Кружки и секции не добавлены
                    </p>
                ) : (
                    <div className="space-y-4">
                        {items.map((club) => (
                            <div
                                key={club.id}
                                className="flex items-start gap-4 border-b pb-4 last:border-0"
                            >
                                {club.image && (
                                    <img
                                        src={club.image}
                                        alt={club.name}
                                        className="h-16 w-16 rounded-lg object-cover"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium">{club.name}</h4>
                                    {club.description && (
                                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                            {club.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(club.id)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onDelete(club.id)}
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
                                Загрузить ещё
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

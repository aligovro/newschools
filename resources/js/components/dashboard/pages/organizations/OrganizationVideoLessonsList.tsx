import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Plus } from 'lucide-react';
import type { OrganizationVideoLessonMember } from './types';

interface Props {
    lessons: OrganizationVideoLessonMember[];
    hasMore: boolean;
    onAdd: () => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onLoadMore?: () => void;
}

export default function OrganizationVideoLessonsList({
    lessons,
    hasMore,
    onAdd,
    onEdit,
    onDelete,
    onLoadMore,
}: Props) {
    const items = Array.isArray(lessons) ? lessons : [];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        Видео уроки
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
                        Видео уроки не добавлены
                    </p>
                ) : (
                    <div className="space-y-4">
                        {items.map((lesson) => (
                            <div
                                key={lesson.id}
                                className="flex items-start gap-4 border-b pb-4 last:border-0"
                            >
                                {lesson.thumbnail && (
                                    <img
                                        src={lesson.thumbnail}
                                        alt={lesson.title}
                                        className="h-16 w-28 shrink-0 rounded-lg object-cover"
                                    />
                                )}
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-medium">
                                        {lesson.title}
                                    </h4>
                                    {lesson.description && (
                                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                            {lesson.description}
                                        </p>
                                    )}
                                    <a
                                        href={lesson.video_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-1 text-xs text-blue-600 hover:underline"
                                    >
                                        {lesson.video_url}
                                    </a>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(lesson.id)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onDelete(lesson.id)}
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

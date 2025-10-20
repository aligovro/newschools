import { Card, CardContent } from '@/components/ui/card';
import React from 'react';

interface ContentBlock {
    id: string;
    type: string;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    category: string;
}

const contentBlocks: ContentBlock[] = [];

const categories = ['Основные', 'Медиа', 'Контент', 'Формы', 'Данные'];

interface ContentBlocksPanelProps {
    className?: string;
}

export const ContentBlocksPanel: React.FC<ContentBlocksPanelProps> = ({
    className = '',
}) => {
    const groupedBlocks = categories.map((category) => ({
        category,
        blocks: contentBlocks.filter((block) => block.category === category),
    }));

    return (
        <div
            className={`flex h-full w-full flex-col overflow-hidden bg-white ${className}`}
        >
            <div className="border-b border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    Блоки контента
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    Перетащите блоки для создания страницы
                </p>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-4 pb-20">
                {groupedBlocks.map(({ category, blocks }) => (
                    <div key={category}>
                        <h4 className="mb-3 text-sm font-medium text-gray-700">
                            {category}
                        </h4>
                        <div className="space-y-2">
                            {blocks.map((block) => (
                                <Card
                                    key={block.id}
                                    className="cursor-move transition-shadow hover:shadow-md"
                                >
                                    <CardContent className="p-3">
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0">
                                                <block.icon className="h-5 w-5 text-gray-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h5 className="truncate text-sm font-medium text-gray-900">
                                                    {block.name}
                                                </h5>
                                                <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                                                    {block.description}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

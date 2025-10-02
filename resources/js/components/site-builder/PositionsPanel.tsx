import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import React from 'react';

interface WidgetPosition {
    id: number;
    name: string;
    slug: string;
    description: string;
    area: string;
    order: number;
    allowed_widgets: string[];
    is_required: boolean;
}

interface PositionsPanelProps {
    positions: WidgetPosition[];
    onAddWidgetToPosition: (positionSlug: string) => void;
    className?: string;
}

// Компонент для отображения позиции (без drag & drop)
const PositionItem: React.FC<{
    position: WidgetPosition;
    onAddWidget: () => void;
}> = ({ position, onAddWidget }) => {
    const getAreaIcon = (area: string) => {
        const icons: Record<string, string> = {
            header: '📋',
            content: '📄',
            sidebar: '📌',
            footer: '🔗',
        };
        return icons[area] || '📦';
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center space-x-2">
                    <span className="text-lg">
                        {getAreaIcon(position.area)}
                    </span>
                    <div>
                        <h4 className="text-sm font-medium text-gray-900">
                            {position.name}
                        </h4>
                        <p className="text-xs text-gray-500">{position.slug}</p>
                    </div>
                </div>
                {position.is_required && (
                    <Badge variant="outline" className="text-xs">
                        Обязательная
                    </Badge>
                )}
            </div>

            {position.description && (
                <p className="mb-3 text-xs text-gray-600">
                    {position.description}
                </p>
            )}

            <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={onAddWidget}
            >
                <Plus className="mr-2 h-3 w-3" />
                Добавить виджет
            </Button>
        </div>
    );
};

export const PositionsPanel: React.FC<PositionsPanelProps> = ({
    positions,
    onAddWidgetToPosition,
    className = '',
}) => {
    return (
        <div
            className={`flex h-full w-64 flex-col overflow-hidden border-r border-gray-200 bg-white ${className}`}
        >
            <div className="border-b border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900">Позиции</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Области для размещения виджетов
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3 pb-20">
                    {positions.map((position) => (
                        <PositionItem
                            key={position.id}
                            position={position}
                            onAddWidget={() =>
                                onAddWidgetToPosition(position.slug)
                            }
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

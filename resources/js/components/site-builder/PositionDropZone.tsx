import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetPosition } from '@/types/global';
import { Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
import React from 'react';
import { useDrop } from 'react-dnd';
import { WidgetDisplay } from './WidgetDisplay';

interface WidgetData {
    id: number;
    widget_id: number;
    name: string;
    slug: string;
    config: Record<string, unknown>;
    settings: Record<string, unknown>;
    is_active: boolean;
    is_visible: boolean;
    order: number;
    position_name: string;
    position_slug: string;
    created_at: string;
    updated_at?: string;
}

interface PositionDropZoneProps {
    position: WidgetPosition;
    widgets: WidgetData[];
    onDropWidget: (item: { widget: WidgetData }, position: string) => void;
    onEditWidget: (widget: WidgetData) => void;
    onDeleteWidget: (widgetId: number) => void;
    onToggleWidgetVisibility: (widgetId: number) => void;
    onWidgetConfigChange: (
        widgetId: number,
        config: Record<string, unknown>,
    ) => void;
    isPreviewMode: boolean;
    newlyAddedWidgetId?: number;
    validationErrors?: string[];
}

export const PositionDropZone: React.FC<PositionDropZoneProps> = React.memo(
    ({
        position,
        widgets,
        onDropWidget,
        onEditWidget,
        onDeleteWidget,
        onToggleWidgetVisibility,
        onWidgetConfigChange,
        isPreviewMode,
        newlyAddedWidgetId,
        validationErrors = [],
    }) => {
        const [{ isOver, canDrop }, drop] = useDrop({
            accept: 'widget',
            drop: (item: { widget: WidgetData }) => {
                console.log(
                    'PositionDropZone - drop called:',
                    item,
                    position.slug,
                );
                onDropWidget(item, position.slug);
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }),
        });

        const isActive = isOver && canDrop;

        return (
            <div
                ref={drop as unknown as React.RefObject<HTMLDivElement>}
                className={`rounded-lg border-2 border-dashed transition-colors ${
                    isActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                }`}
            >
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                                {position.name}
                            </CardTitle>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">
                                    {widgets.length} виджетов
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {widgets.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="mb-2 text-gray-500">
                                    Перетащите виджет сюда или добавьте через
                                    кнопку
                                </p>
                                <p className="text-sm text-gray-400">
                                    Позиция: {position.slug}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {widgets.map((widget) => (
                                    <div
                                        key={widget.id}
                                        className="group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center space-x-2">
                                                    <h4 className="font-medium text-gray-900">
                                                        {widget.name}
                                                    </h4>
                                                    {!widget.is_visible && (
                                                        <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                                                            Скрыт
                                                        </span>
                                                    )}
                                                </div>

                                                <WidgetDisplay
                                                    widget={widget}
                                                    isEditable={!isPreviewMode}
                                                    autoExpandSettings={
                                                        newlyAddedWidgetId ===
                                                        widget.id
                                                    }
                                                    onConfigChange={(config) =>
                                                        onWidgetConfigChange(
                                                            widget.id,
                                                            config,
                                                        )
                                                    }
                                                />
                                            </div>

                                            {!isPreviewMode && (
                                                <div className="flex items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            onEditWidget(widget)
                                                        }
                                                        title="Редактировать"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            onToggleWidgetVisibility(
                                                                widget.id,
                                                            )
                                                        }
                                                        title={
                                                            widget.is_visible
                                                                ? 'Скрыть'
                                                                : 'Показать'
                                                        }
                                                    >
                                                        {widget.is_visible ? (
                                                            <Eye className="h-4 w-4" />
                                                        ) : (
                                                            <EyeOff className="h-4 w-4" />
                                                        )}
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            onDeleteWidget(
                                                                widget.id,
                                                            )
                                                        }
                                                        title="Удалить"
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    },
    (prevProps, nextProps) => {
        // Перерендериваем если изменился newlyAddedWidgetId
        if (prevProps.newlyAddedWidgetId !== nextProps.newlyAddedWidgetId) {
            return false;
        }
        // Перерендериваем если изменились виджеты
        if (prevProps.widgets.length !== nextProps.widgets.length) {
            return false;
        }
        // Перерендериваем если изменился isPreviewMode
        if (prevProps.isPreviewMode !== nextProps.isPreviewMode) {
            return false;
        }
        // В остальных случаях не перерендериваем
        return true;
    },
);

PositionDropZone.displayName = 'PositionDropZone';

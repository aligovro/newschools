import { Button } from '@/components/ui/button';
import React, { useEffect } from 'react';
import { useDrop } from 'react-dnd';
import type { WidgetData, WidgetPosition } from '../../types';
import { WidgetDisplay } from '../WidgetDisplay';

interface Props {
    position: WidgetPosition;
    widgets: WidgetData[];
    onDropWidget: (widget: { widget: any }, positionSlug: string) => void;
    onEditWidget: (widget: WidgetData) => void;
    onDeleteWidget: (widget: WidgetData) => void;
    onToggleWidgetVisibility: (widget: WidgetData) => void;
    onSaveWidget: (
        widgetId: string,
        config: Record<string, unknown>,
    ) => Promise<void>;
    isPreviewMode: boolean;
    newlyAddedWidgetId?: string | null;
    validationErrors: string[];
    onAddWidgetToPosition: (positionSlug: string) => void;
    onMoveSidebarLeft?: () => void;
    onMoveSidebarRight?: () => void;
    sidebarPosition?: 'left' | 'right';
}

export const PositionDropZone: React.FC<Props> = ({
    position,
    widgets,
    onDropWidget,
    onEditWidget,
    onDeleteWidget,
    onToggleWidgetVisibility,
    onSaveWidget,
    isPreviewMode,
    newlyAddedWidgetId,
    validationErrors,
    onAddWidgetToPosition,
    onMoveSidebarLeft,
    onMoveSidebarRight,
    sidebarPosition,
}) => {
    useEffect(() => {}, [position]);

    const [{ isOver, canDrop }, drop] = useDrop({
        accept: 'widget',
        drop: (item: { widget: any }) => {
            onDropWidget(item, position.slug);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    const positionWidgets = widgets
        .filter((widget) => widget.position_slug === position.slug)
        .sort((a, b) => a.order - b.order);

    const getWidgetErrors = (widget: WidgetData) => {
        return validationErrors.filter(
            (error) =>
                error.includes(`Виджет ${widget.id}`) ||
                error.includes(`Виджет ${widget.id}:`),
        );
    };

    return (
        <div
            ref={drop as unknown as React.RefObject<HTMLDivElement>}
            className={`widget-position rounded-lg border-2 border-dashed p-4 transition-colors ${
                isOver && canDrop
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 bg-gray-50'
            }`}
        >
            {position.area === 'sidebar' ? (
                <div className="mb-2 grid grid-cols-2 gap-2">
                    {sidebarPosition === 'right' ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                onMoveSidebarLeft && onMoveSidebarLeft()
                            }
                            title="Переместить сайдбар влево"
                            className="w-full"
                        >
                            Влево ←
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                onMoveSidebarRight && onMoveSidebarRight()
                            }
                            title="Переместить сайдбар вправо"
                            className="w-full"
                        >
                            → Вправо
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddWidgetToPosition(position.slug)}
                        title="Добавить виджет в эту позицию"
                        className="w-full"
                    >
                        + Добавить виджет
                    </Button>
                </div>
            ) : (
                <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {position.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                            {positionWidgets.length} виджетов
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAddWidgetToPosition(position.slug)}
                            title="Добавить виджет в эту позицию"
                        >
                            + Добавить виджет
                        </Button>
                    </div>
                </div>
            )}

            <div className="min-h-[100px] space-y-4">
                {positionWidgets.map((widget) => {
                    const widgetErrors = getWidgetErrors(widget);
                    const shouldExpand = newlyAddedWidgetId === widget.id;
                    return (
                        <div key={widget.id} className="space-y-2">
                            <WidgetDisplay
                                widget={widget}
                                onEdit={onEditWidget}
                                onDelete={onDeleteWidget}
                                onToggleVisibility={onToggleWidgetVisibility}
                                onSave={onSaveWidget}
                                isEditable={!isPreviewMode}
                                autoExpandSettings={shouldExpand}
                                className="mb-4"
                                useOutputRenderer={isPreviewMode}
                            />
                            {widgetErrors.length > 0 && (
                                <div className="rounded border border-red-200 bg-red-50 p-2">
                                    <div className="text-sm text-red-600">
                                        <ul className="list-inside list-disc space-y-1">
                                            {widgetErrors.map(
                                                (error, index) => (
                                                    <li key={index}>{error}</li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {positionWidgets.length === 0 && (
                    <div className="flex h-24 items-center justify-center text-gray-500">
                        <p>
                            {isOver && canDrop
                                ? 'Отпустите виджет здесь'
                                : 'Перетащите виджет сюда или добавьте из левой панели'}
                        </p>
                    </div>
                )}
            </div>

            {position.area === 'sidebar' && (
                <div className="mt-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {position.name}
                    </h3>
                    <span className="text-sm text-gray-500">
                        {positionWidgets.length} виджетов
                    </span>
                </div>
            )}
        </div>
    );
};

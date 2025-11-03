import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import React, { useEffect } from 'react';
import { useDrop } from 'react-dnd';
import type { WidgetData, WidgetPosition } from '../../types';
import { DraggableWidget } from './DraggableWidget';

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
    onMoveWidgetOrder?: (
        widgetId: string,
        positionSlug: string,
        order: number,
    ) => Promise<void>;
    onEditPosition: () => void;
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
    onMoveWidgetOrder,
    onEditPosition,
}) => {
    useEffect(() => {}, [position]);

    const [{ isOver, canDrop }, drop] = useDrop({
        accept: ['widget', 'widget-instance'],
        drop: (item: any) => {
            if (item.widget) {
                onDropWidget(item, position.slug);
            } else if (item.id && onMoveWidgetOrder) {
                // Drop existing widget instance into this position -> append to end
                onMoveWidgetOrder(
                    String(item.id),
                    position.slug,
                    positionWidgets.length + 1,
                );
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    const positionWidgets = widgets
        .filter((widget) => widget.position_slug === position.slug)
        .sort((a, b) => a.order - b.order);

    const isHeaderOrFooter =
        position.slug === 'header' || position.slug === 'footer';

    return (
        <div
            ref={drop as unknown as React.RefObject<HTMLDivElement>}
            className={`widget-position widget-position-${position.slug} rounded-lg border-2 border-dashed p-4 transition-colors ${
                isOver && canDrop ? 'drag-over' : ''
            }`}
        >
            {position.area === 'sidebar' ? (
                <div className="mb-2">
                    <div className="mb-2 flex flex-wrap items-center justify-between">
                        <h3
                            className={`position-label position-label-${position.slug} text-lg font-semibold`}
                        >
                            {position.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded border px-2 py-1 text-sm hover:bg-gray-50"
                                title="Настройки позиции"
                                onClick={onEditPosition}
                            >
                                <Settings size={16} />
                                <span>Настройки</span>
                            </button>
                            <span className="text-sm text-gray-500">
                                {positionWidgets.length} виджетов
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
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
                </div>
            ) : (
                <div className="mb-2 flex items-center justify-between">
                    <h3
                        className={`position-label position-label-${position.slug} text-lg font-semibold`}
                    >
                        {position.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded border px-2 py-1 text-sm hover:bg-gray-50"
                            title="Настройки позиции"
                            onClick={onEditPosition}
                        >
                            <Settings size={16} />
                            <span>Настройки</span>
                        </button>
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
                {positionWidgets.map((widget, index) => (
                    <DraggableWidget
                        key={widget.id}
                        widget={widget}
                        positionSlug={position.slug}
                        positionWidgetsLength={positionWidgets.length}
                        widgetOrder={index + 1}
                        onEditWidget={onEditWidget}
                        onDeleteWidget={onDeleteWidget}
                        onToggleWidgetVisibility={onToggleWidgetVisibility}
                        onSaveWidget={onSaveWidget}
                        onMoveWidgetOrder={onMoveWidgetOrder}
                        isPreviewMode={isPreviewMode}
                        newlyAddedWidgetId={newlyAddedWidgetId}
                        validationErrors={validationErrors}
                    />
                ))}

                {positionWidgets.length === 0 && (
                    <div className="position-empty-state flex h-24 items-center justify-center text-gray-500">
                        <p>
                            {isOver && canDrop
                                ? 'Отпустите виджет здесь'
                                : 'Перетащите виджет сюда или добавьте из левой панели'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

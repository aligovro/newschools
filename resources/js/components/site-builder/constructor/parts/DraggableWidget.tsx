import { Button } from '@/components/ui/button';
import React from 'react';
import { useDrag } from 'react-dnd';
import type { WidgetData } from '../../types';
import { WidgetDisplay } from '../WidgetDisplay';

interface DraggableWidgetProps {
    widget: WidgetData;
    positionSlug: string;
    positionWidgetsLength: number;
    widgetOrder: number;
    onEditWidget: (widget: WidgetData) => void;
    onDeleteWidget: (widget: WidgetData) => void;
    onToggleWidgetVisibility: (widget: WidgetData) => void;
    onSaveWidget: (
        widgetId: string,
        config: Record<string, unknown>,
    ) => Promise<void>;
    onMoveWidgetOrder?: (
        widgetId: string,
        positionSlug: string,
        order: number,
    ) => Promise<void>;
    isPreviewMode: boolean;
    newlyAddedWidgetId?: string | null;
    validationErrors: string[];
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
    widget,
    positionSlug,
    positionWidgetsLength,
    widgetOrder,
    onEditWidget,
    onDeleteWidget,
    onToggleWidgetVisibility,
    onSaveWidget,
    onMoveWidgetOrder,
    isPreviewMode,
    newlyAddedWidgetId,
    validationErrors,
}) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'widget-instance',
        item: {
            id: widget.id,
            position_slug: widget.position_slug,
            order: widget.order,
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    const getWidgetErrors = (widget: WidgetData) => {
        return validationErrors.filter(
            (error) =>
                error.includes(`Виджет ${widget.id}`) ||
                error.includes(`Виджет ${widget.id}:`),
        );
    };

    const widgetErrors = getWidgetErrors(widget);
    const shouldExpand = newlyAddedWidgetId === widget.id;

    return (
        <div
            className={`draggable-widget space-y-2 ${isDragging ? 'dragging' : ''}`}
            ref={drag as unknown as React.RefObject<HTMLDivElement>}
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <div className="widget-order-controls flex justify-end gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={widgetOrder <= 1}
                    onClick={() =>
                        onMoveWidgetOrder &&
                        onMoveWidgetOrder(
                            widget.id,
                            positionSlug,
                            Math.max(1, widgetOrder - 1),
                        )
                    }
                    title="Переместить выше"
                >
                    ↑
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={widgetOrder >= positionWidgetsLength}
                    onClick={() =>
                        onMoveWidgetOrder &&
                        onMoveWidgetOrder(
                            widget.id,
                            positionSlug,
                            Math.min(positionWidgetsLength, widgetOrder + 1),
                        )
                    }
                    title="Переместить ниже"
                >
                    ↓
                </Button>
            </div>
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
                            {widgetErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

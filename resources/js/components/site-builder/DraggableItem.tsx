import { cn } from '@/lib/utils';
import React, { useRef } from 'react';
import { useDragDrop } from './DragDropProvider';

interface DraggableItemProps {
    children: React.ReactNode;
    item: unknown;
    className?: string;
    disabled?: boolean;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
    children,
    item,
    className,
    disabled = false,
}) => {
    const { startDrag, endDrag, state } = useDragDrop();
    const ref = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (disabled) return;

        e.preventDefault();
        startDrag(item);

        const handleMouseUp = () => {
            endDrag();
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (disabled) return;

        e.preventDefault();
        startDrag(item);

        const handleTouchEnd = () => {
            endDrag();
            document.removeEventListener('touchend', handleTouchEnd);
        };

        document.addEventListener('touchend', handleTouchEnd);
    };

    return (
        <div
            ref={ref}
            className={cn(
                'cursor-move select-none transition-all duration-200',
                state.isDragging &&
                    state.draggedItem === item &&
                    'scale-95 opacity-50',
                disabled && 'cursor-not-allowed opacity-50',
                className,
            )}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            {children}
        </div>
    );
};

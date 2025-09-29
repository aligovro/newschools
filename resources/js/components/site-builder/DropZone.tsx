import { cn } from '@/lib/utils';
import React, { useEffect, useRef } from 'react';
import { useDragDrop } from './DragDropProvider';

interface DropZoneProps {
    children: React.ReactNode;
    onDrop: (item: unknown) => void;
    className?: string;
    disabled?: boolean;
    accept?: string[];
}

export const DropZone: React.FC<DropZoneProps> = ({
    children,
    onDrop,
    className,
    disabled = false,
    accept = [],
}) => {
    const { setDropTarget, handleDrop, state } = useDragDrop();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleDragOver = (e: DragEvent) => {
            if (disabled) return;
            e.preventDefault();
            e.stopPropagation();
        };

        const handleDragEnter = (e: DragEvent) => {
            if (disabled) return;
            e.preventDefault();
            e.stopPropagation();
            setDropTarget(element.id);
        };

        const handleDragLeave = (e: DragEvent) => {
            if (disabled) return;
            e.preventDefault();
            e.stopPropagation();
            if (!element.contains(e.relatedTarget as Node)) {
                setDropTarget(null);
            }
        };

        const handleDropEvent = (e: DragEvent) => {
            if (disabled) return;
            e.preventDefault();
            e.stopPropagation();
            handleDrop(element.id, onDrop);
        };

        element.addEventListener('dragover', handleDragOver);
        element.addEventListener('dragenter', handleDragEnter);
        element.addEventListener('dragleave', handleDragLeave);
        element.addEventListener('drop', handleDropEvent);

        return () => {
            element.removeEventListener('dragover', handleDragOver);
            element.removeEventListener('dragenter', handleDragEnter);
            element.removeEventListener('dragleave', handleDragLeave);
            element.removeEventListener('drop', handleDropEvent);
        };
    }, [disabled, onDrop, setDropTarget, handleDrop]);

    const isActive = state.dropTarget === ref.current?.id;

    return (
        <div
            ref={ref}
            id={
                ref.current?.id ||
                `drop-zone-${Math.random().toString(36).substr(2, 9)}`
            }
            className={cn(
                'transition-all duration-200',
                isActive && 'bg-blue-50 ring-2 ring-blue-500 ring-opacity-50',
                disabled && 'cursor-not-allowed opacity-50',
                className,
            )}
        >
            {children}
        </div>
    );
};

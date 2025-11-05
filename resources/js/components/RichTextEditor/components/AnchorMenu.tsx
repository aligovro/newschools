import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface AnchorMenuProps {
    anchorEl: HTMLElement | null;
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

/**
 * Компонент меню, позиционируемый относительно anchor элемента
 */
export const AnchorMenu: React.FC<AnchorMenuProps> = ({
    anchorEl,
    open,
    onClose,
    children,
    className,
}) => {
    const [position, setPosition] = useState<{
        top: number;
        left: number;
    } | null>(null);

    useEffect(() => {
        if (!open || !anchorEl) {
            setPosition(null);
            return;
        }

        const updatePosition = () => {
            const rect = anchorEl.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
            });
        };

        updatePosition();

        // Обновляем позицию при скролле или изменении размера окна
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [open, anchorEl]);

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                anchorEl &&
                !anchorEl.contains(event.target as Node) &&
                !(event.target as HTMLElement)?.closest('[data-anchor-menu]')
            ) {
                onClose();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open, anchorEl, onClose]);

    if (!open || !position) return null;

    return createPortal(
        <div
            data-anchor-menu
            className={cn(
                'bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md',
                className,
            )}
            style={{
                position: 'absolute',
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
        >
            {children}
        </div>,
        document.body,
    );
};

interface AnchorMenuItemProps {
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
}

export const AnchorMenuItem: React.FC<AnchorMenuItemProps> = ({
    onClick,
    children,
    className,
}) => {
    return (
        <div
            className={cn(
                'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className,
            )}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

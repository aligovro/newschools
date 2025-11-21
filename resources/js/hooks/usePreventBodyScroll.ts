import { useEffect } from 'react';

/**
 * Хук для предотвращения скролла body и горизонтального overflow при открытии модальных окон
 *
 * @param isOpen - флаг открытия модального окна
 */
export function usePreventBodyScroll(isOpen: boolean) {
    useEffect(() => {
        if (!isOpen) return;

        // Сохраняем текущие значения
        const originalStyle = window.getComputedStyle(document.body);
        const originalOverflow = originalStyle.overflow;
        const originalOverflowX = originalStyle.overflowX;
        const originalOverflowY = originalStyle.overflowY;
        const scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth;

        // Применяем стили для предотвращения скролла
        document.body.style.overflow = 'hidden';
        document.body.style.overflowX = 'hidden';
        document.body.style.overflowY = 'hidden';

        // Компенсируем ширину скроллбара, чтобы избежать скачка контента
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        // Также применяем к html элементу для надежности
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.overflowX = 'hidden';

        // Cleanup функция для восстановления стилей
        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.overflowX = originalOverflowX;
            document.body.style.overflowY = originalOverflowY;
            document.body.style.paddingRight = '';
            document.documentElement.style.overflow = '';
            document.documentElement.style.overflowX = '';
        };
    }, [isOpen]);
}

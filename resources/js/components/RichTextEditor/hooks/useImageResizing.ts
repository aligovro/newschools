import { useCallback } from 'react';

interface UseImageResizingProps {
    handleEditImage: (img: HTMLImageElement) => void;
}

export interface UseImageResizingReturn {
    createImageEditButton: (img: HTMLImageElement) => void;
    initializeImageResize: (img: HTMLImageElement) => void;
}

/**
 * Хук для управления кнопкой редактирования изображений в редакторе.
 * Resize-handles удалены — размер задаётся через диалог редактирования.
 */
export const useImageResizing = ({
    handleEditImage,
}: UseImageResizingProps): UseImageResizingReturn => {

    /**
     * Создаёт кнопку редактирования внутри контейнера изображения.
     * Кнопка абсолютно позиционирована в правом верхнем углу изображения
     * и появляется только при наведении на контейнер (через CSS в SCSS).
     */
    const createImageEditButton = useCallback(
        (img: HTMLImageElement) => {
            if (!img?.src) return;

            const container = img.parentElement as HTMLElement;
            if (!container) return;

            // Удаляем существующую кнопку, если она есть
            container.querySelectorAll('.image-settings-button').forEach((el) => el.remove());

            const editButton = document.createElement('button');
            editButton.className = 'image-settings-button';
            editButton.setAttribute('contenteditable', 'false');
            editButton.setAttribute('draggable', 'false');
            editButton.setAttribute('aria-label', 'Редактировать изображение');
            editButton.title = 'Редактировать изображение';
            // Иконка карандаша
            editButton.innerHTML = `
                <svg viewBox="0 0 24 24" width="14" height="14" fill="white" aria-hidden="true">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
            `;

            Object.assign(editButton.style, {
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '28px',
                height: '28px',
                background: 'rgba(25, 118, 210, 0.9)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                zIndex: '10',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0',
                outline: 'none',
                // Видимость управляется CSS :hover на контейнере (.rte-image)
                opacity: '0',
                transition: 'opacity 0.15s ease',
                pointerEvents: 'auto',
            });

            editButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEditImage(img);
            });

            editButton.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });

            container.appendChild(editButton);
        },
        [handleEditImage],
    );

    /**
     * Инициализирует кнопку редактирования для изображения.
     * Ранее здесь создавались resize-handles — теперь только edit-кнопка.
     */
    const initializeImageResize = useCallback(
        (img: HTMLImageElement) => {
            createImageEditButton(img);
        },
        [createImageEditButton],
    );

    return {
        createImageEditButton,
        initializeImageResize,
    };
};

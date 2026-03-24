import { uploadFile, type UploadImageResponse } from '@/utils/uploadFile';
import { useCallback, useRef, useState } from 'react';

interface UseImageHandlersProps {
    isActive: boolean;
    handleInput: () => void;
    handleEditImage: (img: HTMLImageElement) => void;
    initializeImageResize: (img: HTMLImageElement) => void;
    editorRef: React.RefObject<HTMLDivElement | null>;
}

export const useImageHandlers = ({
    isActive,
    handleInput,
    handleEditImage,
    initializeImageResize,
    editorRef,
}: UseImageHandlersProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageButtonClick = useCallback(() => {
        if (!isActive) return;
        fileInputRef.current?.click();
    }, [isActive]);

    const handleImageUpload = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            if (!isActive || !editorRef.current) return;

            const file = event.target.files?.[0];
            if (!file) return;

            // Сбрасываем input сразу — чтобы можно было загрузить тот же файл повторно
            event.target.value = '';

            const acceptedTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg+xml'];
            const fileType = file.type.split('/')[1];
            const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

            if (!acceptedTypes.includes(fileType) && !isSvg) {
                alert('Неподдерживаемый тип файла. Допустимые: jpeg, jpg, png, gif, webp, svg');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                alert('Размер изображения не должен превышать 10MB');
                return;
            }

            setIsUploading(true);

            let uploadedFile: UploadImageResponse;
            try {
                uploadedFile = await uploadFile(file, 'text-widget');
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Ошибка при загрузке изображения. Проверьте подключение к интернету.');
                setIsUploading(false);
                return;
            }

            const imageUrl = uploadedFile.data?.original || uploadedFile.url || null;
            if (!imageUrl) {
                alert('Не удалось получить URL изображения');
                setIsUploading(false);
                return;
            }

            const isFileSvg =
                file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

            // ── Создаём структуру ──────────────────────────────────────────────────
            const wrapper = document.createElement('span');
            wrapper.className = 'rte-image';
            wrapper.style.cssText = 'display: inline-block; position: relative;';
            wrapper.setAttribute('contenteditable', 'false');
            wrapper.setAttribute('draggable', 'false');

            const img = document.createElement('img');
            img.alt =
                uploadedFile?.filename ||
                uploadedFile?.data?.original_name ||
                file.name;
            img.loading = 'lazy';
            img.decoding = 'async';
            img.setAttribute('draggable', 'false');
            img.style.userSelect = 'none';
            (img.style as any).webkitUserDrag = 'none';

            // ── Сначала обработчики, потом src ────────────────────────────────────
            // Важно: назначаем onload/onerror ДО установки src.
            // Если браузер загружает из кэша — onload может сработать синхронно
            // в момент img.src = '...' и мы бы пропустили обработчик.
            img.onerror = () => {
                alert('Ошибка загрузки изображения. Проверьте доступность URL.');
                setIsUploading(false);
            };

            img.onload = () => {
                const urlEndsWithSvg = imageUrl.split('?')[0].toLowerCase().endsWith('.svg');
                const isSvgFinal = isFileSvg || urlEndsWithSvg;

                const imgContainer = img.parentElement;
                if (imgContainer) {
                    // Добавляем редактируемые области вокруг изображения (для курсора)
                    const prevSibling = imgContainer.previousElementSibling;
                    if (!prevSibling?.classList.contains('image-edit-area')) {
                        const editAreaBefore = document.createElement('div');
                        editAreaBefore.className = 'image-edit-area';
                        editAreaBefore.style.cssText = 'min-height: 20px; cursor: text;';
                        editAreaBefore.innerHTML = '<br>';
                        imgContainer.parentNode?.insertBefore(editAreaBefore, imgContainer);
                    }

                    const nextSibling = imgContainer.nextElementSibling;
                    if (!nextSibling?.classList.contains('image-edit-area')) {
                        const editAreaAfter = document.createElement('div');
                        editAreaAfter.className = 'image-edit-area';
                        editAreaAfter.style.cssText = 'min-height: 20px; cursor: text;';
                        editAreaAfter.innerHTML = '<br>';
                        imgContainer.parentNode?.insertBefore(
                            editAreaAfter,
                            imgContainer.nextSibling,
                        );
                    }
                }

                // Кнопка редактирования
                initializeImageResize(img);

                // Клик — выделяем
                img.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const range = document.createRange();
                    const selection = window.getSelection();
                    range.selectNode(img);
                    selection?.removeAllRanges();
                    selection?.addRange(range);
                });

                // Двойной клик — открываем диалог
                img.addEventListener('dblclick', (e) => {
                    e.stopPropagation();
                    handleEditImage(img);
                });
                (img as any).__hasDblClickHandler = true;

                // Переставляем курсор после изображения и уведомляем редактор
                setTimeout(() => {
                    const container = img.parentElement;
                    if (container) {
                        const next = container.nextElementSibling;
                        if (next?.classList.contains('image-edit-area')) {
                            const range = document.createRange();
                            const selection = window.getSelection();
                            range.setStart(next, 0);
                            range.collapse(true);
                            selection?.removeAllRanges();
                            selection?.addRange(range);
                        }
                    }
                    handleInput();
                    setIsUploading(false); // ← спиннер снимаем только когда всё готово
                }, 50);
            };

            // ── Добавляем в DOM ДО установки src ─────────────────────────────────
            // Это гарантирует что img.parentElement не null в момент onload
            wrapper.appendChild(img);
            editorRef.current.appendChild(wrapper);

            // ── Устанавливаем src последним ───────────────────────────────────────
            img.src = imageUrl;
        },
        [isActive, handleEditImage, initializeImageResize, editorRef, handleInput],
    );

    return {
        fileInputRef,
        handleImageButtonClick,
        handleImageUpload,
        isUploading,
    };
};

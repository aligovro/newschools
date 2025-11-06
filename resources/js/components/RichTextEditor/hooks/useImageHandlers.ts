import { uploadFile, type UploadImageResponse } from '@/utils/uploadFile';
import { useCallback, useRef, useState } from 'react';

interface UseImageHandlersProps {
    isActive: boolean;
    editorAccessLevel: string;
    handleInput: () => void;
    handleEditImage: (img: HTMLImageElement) => void;
    handleImageResize: (img: HTMLImageElement) => () => void;
    createResizeHandles: (img: HTMLImageElement) => void;
    initializeImageResize: (img: HTMLImageElement) => void;
    editorRef: React.RefObject<HTMLDivElement | null>;
}

export const useImageHandlers = ({
    isActive,
    editorAccessLevel,
    handleInput,
    handleEditImage,
    handleImageResize,
    createResizeHandles,
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
            if (!isActive) return;

            const file = event.target.files?.[0];
            if (file) {
                setIsUploading(true);
                // Проверка типа файла
                const acceptedTypes = [
                    'jpeg',
                    'jpg',
                    'png',
                    'gif',
                    'webp',
                    'svg+xml',
                ];
                const fileType = file.type.split('/')[1];
                const isSvg =
                    file.type === 'image/svg+xml' ||
                    file.name.toLowerCase().endsWith('.svg');

                if (!acceptedTypes.includes(fileType) && !isSvg) {
                    alert(
                        `Неподдерживаемый тип файла. Допустимые: ${acceptedTypes.filter((t) => t !== 'svg+xml').join(', ')}, svg`,
                    );
                    setIsUploading(false);
                    return;
                }

                // Ограничение размера изображений - 10MB для всех (изображения режутся на бэке)
                const maxSize = 10;
                if (file.size > maxSize * 1024 * 1024) {
                    alert(
                        `Размер изображения не должен превышать ${maxSize}MB`,
                    );
                    return;
                }

                try {
                    // Загружаем файл через API загрузки изображений текстового виджета
                    const uploadedFile: UploadImageResponse = await uploadFile(
                        file,
                        'text-widget',
                        undefined, // Можно добавить прогресс-бар позже
                    );

                    // Получаем URL изображения из ответа
                    // Приоритет: data.original > url (из корня ответа)
                    const imageUrl =
                        uploadedFile.data?.original || uploadedFile.url || null;

                    if (imageUrl) {
                        // Сохраняем информацию о типе файла для использования в onload
                        const fileType = file.type;
                        const fileName = file.name.toLowerCase();
                        const isFileSvg =
                            fileType === 'image/svg+xml' ||
                            fileName.endsWith('.svg');

                        // Вставляем изображение в редактор с оберткой для маркеров
                        const wrapper = document.createElement('span');
                        wrapper.className = 'rte-image';
                        wrapper.style.display = 'inline-block';
                        wrapper.style.position = 'relative';
                        wrapper.setAttribute('contenteditable', 'false');
                        wrapper.setAttribute('draggable', 'false');

                        const img = document.createElement('img');
                        img.src = imageUrl;
                        img.alt =
                            uploadedFile?.filename ||
                            uploadedFile?.data?.original_name ||
                            file.name;
                        img.loading = 'lazy';
                        img.decoding = 'async';
                        img.setAttribute('draggable', 'false');
                        img.style.userSelect = 'none';
                        (img.style as any).webkitUserDrag = 'none';
                        (img.style as any).webkitUserSelect = 'none';
                        (img.style as any).mozUserSelect = 'none';
                        (img.style as any).msUserSelect = 'none';

                        // Добавляем обработчик ошибок загрузки изображения
                        img.onerror = () => {
                            alert(
                                'Ошибка загрузки изображения. Проверьте доступность URL.',
                            );
                        };

                        img.onload = () => {
                            // Для SVG не применяем ресайз - они должны оставаться как есть
                            // Проверяем SVG по расширению файла в URL и по типу загруженного файла
                            const urlPath = imageUrl.split('?')[0]; // Убираем query параметры
                            const urlLower = urlPath.toLowerCase();
                            const urlEndsWithSvg = urlLower.endsWith('.svg');
                            const isSvg = isFileSvg || urlEndsWithSvg;

                            // Добавляем редактируемые области вокруг изображения (для всех типов)
                            const imgContainer = img.parentElement;
                            if (imgContainer) {
                                // Проверяем, есть ли уже пустые div'ы для редактирования
                                const prevSibling =
                                    imgContainer.previousElementSibling;
                                const nextSibling =
                                    imgContainer.nextElementSibling;

                                // Добавляем пустой div перед изображением, если его нет
                                if (
                                    !prevSibling ||
                                    !prevSibling.classList.contains(
                                        'image-edit-area',
                                    )
                                ) {
                                    const editAreaBefore =
                                        document.createElement('div');
                                    editAreaBefore.className =
                                        'image-edit-area';
                                    editAreaBefore.style.minHeight = '20px';
                                    editAreaBefore.style.cursor = 'text';
                                    editAreaBefore.innerHTML = '<br>';
                                    imgContainer.parentNode?.insertBefore(
                                        editAreaBefore,
                                        imgContainer,
                                    );
                                }

                                // Добавляем пустой div после изображения, если его нет
                                if (
                                    !nextSibling ||
                                    !nextSibling.classList.contains(
                                        'image-edit-area',
                                    )
                                ) {
                                    const editAreaAfter =
                                        document.createElement('div');
                                    editAreaAfter.className = 'image-edit-area';
                                    editAreaAfter.style.minHeight = '20px';
                                    editAreaAfter.style.cursor = 'text';
                                    editAreaAfter.innerHTML = '<br>';
                                    imgContainer.parentNode?.insertBefore(
                                        editAreaAfter,
                                        imgContainer.nextSibling,
                                    );
                                }
                            }

                            // Для растровых изображений добавляем ресайз
                            if (!isSvg) {
                                // Добавляем класс для изменения размера только для растровых изображений
                                img.classList.add('resizable');

                                // Инициализируем ресайз для изображения
                                initializeImageResize(img);
                            }

                            // Добавляем обработчик клика для выделения изображения (для SVG тоже)
                            img.addEventListener('click', (e) => {
                                e.stopPropagation();
                                // Выделяем изображение для возможности удаления
                                const range = document.createRange();
                                const selection = window.getSelection();
                                range.selectNode(img);
                                selection?.removeAllRanges();
                                selection?.addRange(range);
                            });

                            // Добавляем обработчик двойного клика для редактирования
                            img.addEventListener('dblclick', (e) => {
                                e.stopPropagation();
                                handleEditImage(img);
                            });

                            // Добавляем временную подсказку только при наведении (не сохраняется в HTML)
                            img.addEventListener('mouseenter', () => {
                                const tooltip = document.createElement('div');
                                tooltip.className = 'image-tooltip';
                                tooltip.innerHTML = `
                  <div class="image-tooltip__title">Изображение</div>
                  <div class="image-tooltip__line">• Клик для выбора</div>
                  <div class="image-tooltip__line">• Двойной клик для редактирования</div>
                  <div class="image-tooltip__line">• Перетащите маркеры для изменения размера</div>
                `;

                                const rect = img.getBoundingClientRect();

                                // Позиционируем подсказку выше изображения
                                tooltip.style.left = `${rect.left + rect.width / 2}px`;
                                tooltip.style.top = `${rect.top - 10}px`;
                                tooltip.style.transform =
                                    'translateX(-50%) translateY(-100%)';

                                document.body.appendChild(tooltip);

                                img.addEventListener(
                                    'mouseleave',
                                    () => {
                                        tooltip.remove();
                                    },
                                    { once: true },
                                );
                            });

                            // Удалили MutationObserver для каждого изображения - теперь используется единый observer в главном компоненте
                            // Это значительно улучшает производительность, особенно при множественных изображениях

                            // Устанавливаем курсор в редактируемую область после изображения
                            setTimeout(() => {
                                const imgContainer = img.parentElement;
                                if (imgContainer) {
                                    const nextSibling =
                                        imgContainer.nextElementSibling;
                                    if (
                                        nextSibling &&
                                        nextSibling.classList.contains(
                                            'image-edit-area',
                                        )
                                    ) {
                                        const range = document.createRange();
                                        const selection = window.getSelection();
                                        range.setStart(nextSibling, 0);
                                        range.collapse(true);
                                        selection?.removeAllRanges();
                                        selection?.addRange(range);
                                    }
                                }
                                handleInput();
                            }, 100);
                        };

                        // hover эффект реализован в CSS

                        wrapper.appendChild(img);
                        editorRef.current?.appendChild(wrapper);

                        // После добавления в DOM устанавливаем курсор в конец редактора
                        // (редактируемые области будут добавлены в onload)
                    } else {
                        throw new Error('Не удалось получить URL изображения');
                    }
                } catch (error) {
                    console.error('Error uploading image:', error);
                    alert(
                        'Ошибка при загрузке изображения. Проверьте подключение к интернету.',
                    );
                }
            }

            // Очищаем input для возможности повторной загрузки того же файла
            event.target.value = '';
            setIsUploading(false);
        },
        [
            isActive,
            handleEditImage,
            initializeImageResize,
            editorRef,
            handleInput,
        ],
    );

    return {
        fileInputRef,
        handleImageButtonClick,
        handleImageUpload,
        isUploading,
    };
};

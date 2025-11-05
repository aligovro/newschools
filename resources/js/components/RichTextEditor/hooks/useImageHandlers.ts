import { useCallback, useRef, useState } from 'react';
import { uploadFile, type UploadImageResponse } from '@/utils/uploadFile';

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
        const acceptedTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
        const fileType = file.type.split('/')[1];

        if (!acceptedTypes.includes(fileType)) {
          alert(`Неподдерживаемый тип файла. Допустимые: ${acceptedTypes.join(', ')}`);
          return;
        }

        // Ограничение размера изображений - 10MB для всех (изображения режутся на бэке)
        const maxSize = 10;
        if (file.size > maxSize * 1024 * 1024) {
          alert(`Размер изображения не должен превышать ${maxSize}MB`);
          return;
        }

        try {
          // Загружаем файл через API загрузки изображений галереи
          const uploadedFile: UploadImageResponse = await uploadFile(
            file,
            'gallery',
            undefined, // Можно добавить прогресс-бар позже
          );

          // Получаем URL изображения из ответа
          // Приоритет: variants.gallery > variants.original > url > data.original
          const imageUrl =
            uploadedFile.variants?.gallery ||
            uploadedFile.variants?.thumbnail ||
            uploadedFile.data?.original ||
            uploadedFile.url ||
            null;

          if (imageUrl) {
            // Вставляем изображение в редактор с оберткой для маркеров
            const wrapper = document.createElement('span');
            wrapper.className = 'rte-image';
            wrapper.style.display = 'inline-block';
            wrapper.style.position = 'relative';
            wrapper.setAttribute('contenteditable', 'false');
            wrapper.setAttribute('draggable', 'false');

            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = uploadedFile?.filename || uploadedFile?.data?.original_name || file.name;
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
              alert('Ошибка загрузки изображения. Проверьте доступность URL.');
            };

            img.onload = () => {
              console.log('Image loaded successfully:', imageUrl);

              // Добавляем класс для изменения размера
              img.classList.add('resizable');

              // Инициализируем ресайз для изображения
              initializeImageResize(img);

              // Добавляем редактируемые области вокруг изображения
              const imgContainer = img.parentElement;
              if (imgContainer) {
                // Проверяем, есть ли уже пустые div'ы для редактирования
                const prevSibling = imgContainer.previousElementSibling;
                const nextSibling = imgContainer.nextElementSibling;

                // Добавляем пустой div перед изображением, если его нет
                if (!prevSibling || !prevSibling.classList.contains('image-edit-area')) {
                  const editAreaBefore = document.createElement('div');
                  editAreaBefore.className = 'image-edit-area';
                  editAreaBefore.style.minHeight = '20px';
                  editAreaBefore.style.cursor = 'text';
                  editAreaBefore.innerHTML = '<br>';
                  imgContainer.parentNode?.insertBefore(editAreaBefore, imgContainer);
                }

                // Добавляем пустой div после изображения, если его нет
                if (!nextSibling || !nextSibling.classList.contains('image-edit-area')) {
                  const editAreaAfter = document.createElement('div');
                  editAreaAfter.className = 'image-edit-area';
                  editAreaAfter.style.minHeight = '20px';
                  editAreaAfter.style.cursor = 'text';
                  editAreaAfter.innerHTML = '<br>';
                  imgContainer.parentNode?.insertBefore(editAreaAfter, imgContainer.nextSibling);
                }
              }

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
                tooltip.style.transform = 'translateX(-50%) translateY(-100%)';

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

              // Вызываем handleInput для сохранения изображения в форму
              setTimeout(() => handleInput(), 100);
            };

            // hover эффект реализован в CSS

            wrapper.appendChild(img);
            editorRef.current?.appendChild(wrapper);
          } else {
            throw new Error('Не удалось получить URL изображения');
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Ошибка при загрузке изображения. Проверьте подключение к интернету.');
        }
      }

      // Очищаем input для возможности повторной загрузки того же файла
      event.target.value = '';
      setIsUploading(false);
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

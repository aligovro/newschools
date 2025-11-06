import { useState, useCallback, useRef, useEffect } from 'react';
import { cleanAndValidateHtml } from '@/utils/htmlSanitizer';
import { formatHtml } from '../utils/htmlFormatter';

interface UseHtmlModeProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  isActive: boolean;
  isAdmin: boolean;
  onContentChange: () => void;
  createResizeHandlesRef: React.RefObject<((img: HTMLImageElement) => void) | null>;
  handleImageResizeRef: React.RefObject<((img: HTMLImageElement) => () => void) | null>;
}

export interface UseHtmlModeReturn {
  isHtmlMode: boolean;
  setIsHtmlMode: (mode: boolean) => void;
  toggleHtmlMode: () => void;
}

/**
 * Хук для управления переключением между HTML и WYSIWYG режимами
 * Сохраняет маркеры ресайза изображений при переключении
 */
export const useHtmlMode = ({
  editorRef,
  isActive,
  isAdmin,
  onContentChange,
  createResizeHandlesRef,
  handleImageResizeRef,
}: UseHtmlModeProps): UseHtmlModeReturn => {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const isActiveRef = useRef(isActive);
  const isAdminRef = useRef(isAdmin);

  // Обновляем refs
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    isAdminRef.current = isAdmin;
  }, [isAdmin]);

  const toggleHtmlMode = useCallback(() => {
    if (!isActiveRef.current) return;

    if (isHtmlMode) {
      // Переход из HTML в WYSIWYG
      if (editorRef.current) {
        const htmlContent = editorRef.current.innerText;
        editorRef.current.innerHTML = htmlContent;
      }
    } else {
      // Переход из WYSIWYG в HTML - санитизируем контент
      if (editorRef.current) {
        const wysiwygContent = editorRef.current.innerHTML;

        // Санитизируем HTML перед переключением в HTML режим
        const { cleaned, isValid, errors } = cleanAndValidateHtml(
          wysiwygContent,
          isAdminRef.current,
        );

        if (!isValid) {
          alert(`HTML содержит ошибки: ${errors.join(', ')}. Контент будет очищен.`);
        }

        // Форматируем HTML с отступами
        const formattedHtml = formatHtml(cleaned);
        editorRef.current.innerText = formattedHtml;
      }
    }

    // Восстанавливаем маркеры ресайза для всех изображений после переключения режима
    setTimeout(() => {
      if (editorRef.current) {
        const images = editorRef.current.querySelectorAll('img');
        images.forEach((img) => {
          const imgElement = img as HTMLImageElement;
          
          // Проверяем, является ли изображение SVG - для SVG не применяем ресайз
          if (imgElement.src) {
            const urlPath = imgElement.src.split('?')[0];
            const isSvg = urlPath.toLowerCase().endsWith('.svg') || 
                         imgElement.src.toLowerCase().startsWith('data:image/svg+xml');
            if (isSvg) {
              // Удаляем класс resizable у SVG, если он был добавлен по ошибке
              imgElement.classList.remove('resizable');
              return; // Пропускаем SVG
            }
          }

          if (img.classList.contains('resizable')) {
            // Проверяем, есть ли уже маркеры и кнопка настроек
            const container = (img.parentElement as HTMLElement) || img;
            const existingHandles = container.querySelectorAll(
              '.resize-handle, .corner-handle, .image-settings-button',
            );

            // Если маркеров нет или нет кнопки настроек, создаем их
            if (existingHandles.length < 9) {
              // Создаем маркеры ресайза
              if (createResizeHandlesRef.current) {
                createResizeHandlesRef.current(imgElement);
              }

              // Добавляем обработчики ресайза
              setTimeout(() => {
                if (!(img as any).__cleanupResize && handleImageResizeRef.current) {
                  const cleanupResize = handleImageResizeRef.current(imgElement);
                  (img as any).__cleanupResize = cleanupResize;
                }
              }, 100);
            }
          }
        });
      }
    }, 100);

    setIsHtmlMode(!isHtmlMode);
    onContentChange();
  }, [isHtmlMode, onContentChange, editorRef, createResizeHandlesRef, handleImageResizeRef]);

  return {
    isHtmlMode,
    setIsHtmlMode,
    toggleHtmlMode,
  };
};

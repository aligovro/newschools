import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { sanitizeHtml } from '@/utils/htmlSanitizer';
import { cleanContentForOutput } from '../utils/htmlFormatter';
import { debounce } from '@/utils/debounce';

interface UseEditorContentProps {
  value: string;
  onChange: (data: string) => void;
  isAdmin: boolean;
  isHtmlMode: boolean;
  imageEditDialogOpen: boolean;
  editorRef: React.RefObject<HTMLDivElement | null>;
  onContentUpdate?: () => void; // Вызывается при каждом изменении (для счетчика слов)
}

export interface UseEditorContentReturn {
  localContent: string;
  lastContentRef: React.RefObject<string>;
  handleInput: () => void;
  handleInputDeferred: () => void;
  handleBlur: () => void;
  setLocalContent: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * Хук для управления контентом редактора
 * Обрабатывает ввод, санитизацию, debouncing и синхронизацию с формой
 */
export const useEditorContent = ({
  value,
  onChange,
  isAdmin,
  isHtmlMode,
  imageEditDialogOpen,
  editorRef,
  onContentUpdate,
}: UseEditorContentProps): UseEditorContentReturn => {
  const initialValue = value || '';
  const [localContent, setLocalContent] = useState(initialValue);
  const lastContentRef = useRef<string>(initialValue);
  const inputRafRef = useRef<number | null>(null);
  const isUserEditingRef = useRef(false); // Флаг: пользователь редактирует контент

  // Стабильные refs для функций
  const onChangeRef = useRef(onChange);
  const isAdminRef = useRef(isAdmin);

  // Обновляем refs при изменениях
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    isAdminRef.current = isAdmin;
  }, [isAdmin]);

  // Debounced onChange для уменьшения количества вызовов
  const debouncedOnChange = useMemo(
    () =>
      debounce((content: string) => {
        onChangeRef.current(content);
      }, 150), // Уменьшил с 300ms до 150ms для более быстрого сохранения
    [],
  );

  // Обработка изменений (стабильная версия)
  const handleInput = useCallback(() => {
    if (!editorRef.current) return;

    // Помечаем, что пользователь редактирует
    isUserEditingRef.current = true;

    let content = isHtmlMode ? editorRef.current.innerText : editorRef.current.innerHTML;

    // Санитизируем HTML контент (только для визуального режима)
    if (!isHtmlMode && content) {
      const sanitizedContent = sanitizeHtml(content, isAdminRef.current);
      if (content !== sanitizedContent) {
        // Не перезаписываем DOM, если есть изображения с маркерами ресайза
        const hasImagesWithHandles =
          (editorRef.current?.querySelectorAll(
            '.resize-handle, .corner-handle, .image-settings-button',
          ).length || 0) > 0;

        if (!imageEditDialogOpen && !hasImagesWithHandles) {
          editorRef.current.innerHTML = sanitizedContent;
          content = sanitizedContent;
        } else {
          content = sanitizedContent;
        }
      }
    }

    // Очищаем контент от элементов ресайза перед сохранением
    // Также санитизируем HTML для закрытия незакрытых тегов и валидации структуры
    const cleanContent = cleanContentForOutput(content, isAdminRef.current);

    if (cleanContent !== lastContentRef.current) {
      lastContentRef.current = cleanContent;
      setLocalContent(cleanContent);
      debouncedOnChange(cleanContent);
    }

    // Обновляем счетчик слов
    onContentUpdate?.();
  }, [isHtmlMode, imageEditDialogOpen, debouncedOnChange, editorRef, onContentUpdate]);

  // Отложенная обработка ввода для снижения количества перерисовок
  const handleInputDeferred = useCallback(() => {
    if (inputRafRef.current) return;
    inputRafRef.current = window.requestAnimationFrame(() => {
      inputRafRef.current = null;
      handleInput();
    });
  }, [handleInput]);

  // Cleanup RAF и debounce
  useEffect(() => {
    return () => {
      if (inputRafRef.current) {
        cancelAnimationFrame(inputRafRef.current);
      }
      // Форсируем сохранение при unmount компонента
      debouncedOnChange.flush();
    };
  }, [debouncedOnChange]);

  // Автосохранение при submit формы
  useEffect(() => {
    const handleFormSubmit = () => {
      // Форсируем сохранение всех pending изменений перед submit
      debouncedOnChange.flush();

      // Также сразу читаем текущее содержимое и сохраняем
      if (editorRef.current) {
        const content = isHtmlMode ? editorRef.current.innerText : editorRef.current.innerHTML;
        const cleanContent = cleanContentForOutput(content, isAdminRef.current);
        if (cleanContent !== lastContentRef.current) {
          lastContentRef.current = cleanContent;
          onChangeRef.current(cleanContent);
        }
      }
    };

    // Находим родительскую форму
    const form = editorRef.current?.closest('form');
    if (form) {
      form.addEventListener('submit', handleFormSubmit, { capture: true });
      return () => form.removeEventListener('submit', handleFormSubmit, { capture: true });
    }
  }, [debouncedOnChange, isHtmlMode, editorRef]);

  // Обработка blur
  const handleBlur = useCallback(() => {
    if (!editorRef.current) return;

    // Форсируем сохранение всех отложенных изменений
    debouncedOnChange.flush();

    const content = isHtmlMode ? editorRef.current.innerText : editorRef.current.innerHTML;
    const cleanContent = cleanContentForOutput(content, isAdminRef.current);

    if (cleanContent !== lastContentRef.current) {
      lastContentRef.current = cleanContent;
      setLocalContent(cleanContent);
      onChangeRef.current(cleanContent); // Немедленный вызов при blur
    }
  }, [isHtmlMode, editorRef, debouncedOnChange]);

  // Инициализация контента при первой загрузке
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && initialValue) {
      if (isHtmlMode) {
        editorRef.current.innerText = initialValue;
      } else {
        editorRef.current.innerHTML = initialValue;
      }
      lastContentRef.current = initialValue;
    }
  }, [initialValue, isHtmlMode, editorRef]);

  // Инициализация и обновление контента из value prop
  useEffect(() => {
    // НЕ обновляем если пользователь сейчас редактирует
    if (isUserEditingRef.current) {
      // Сбрасываем флаг после небольшой задержки
      const timeout = setTimeout(() => {
        isUserEditingRef.current = false;
      }, 200);
      return () => clearTimeout(timeout);
    }

    const currentValue = value || '';

    // Обновляем контент если value изменился и отличается от текущего
    if (currentValue !== lastContentRef.current) {
      setLocalContent(currentValue);
      lastContentRef.current = currentValue;

      if (editorRef.current) {
        const hasImagesWithHandles =
          (editorRef.current.querySelectorAll(
            '.resize-handle, .corner-handle, .image-settings-button',
          ).length || 0) > 0;

        if (!hasImagesWithHandles) {
          if (isHtmlMode) {
            editorRef.current.innerText = currentValue;
          } else {
            editorRef.current.innerHTML = currentValue;
          }
        }
      }
    }
  }, [value, isHtmlMode, editorRef]);

  return {
    localContent,
    lastContentRef,
    handleInput,
    handleInputDeferred,
    handleBlur,
    setLocalContent,
  };
};

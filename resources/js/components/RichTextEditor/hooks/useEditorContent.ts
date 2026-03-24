import { useCallback, useEffect, useMemo, useRef } from 'react';
import { cleanContentForOutput } from '../utils/htmlFormatter';
import { debounce } from '@/utils/debounce';

interface UseEditorContentProps {
  value: string;
  onChange: (data: string) => void;
  isAdmin: boolean;
  isHtmlMode: boolean;
  editorRef: React.RefObject<HTMLDivElement | null>;
  onContentUpdate?: () => void;
}

export interface UseEditorContentReturn {
  handleInput: () => void;
  handleInputDeferred: () => void;
  handleBlur: () => void;
}

/**
 * Хук для управления контентом редактора.
 *
 * Ключевые принципы:
 *  - handleInput НИКОГДА не перезаписывает editorRef.current.innerHTML —
 *    это сбрасывало бы курсор и удаляло кнопки редактирования изображений.
 *  - Для onChange отдаём cleanContentForOutput(innerHTML) — клон без служебных
 *    элементов редактора, прошедший DOMPurify. Живой DOM не трогаем.
 *  - Внешний value обновляет DOM только когда пользователь не редактирует.
 */
export const useEditorContent = ({
  value,
  onChange,
  isAdmin,
  isHtmlMode,
  editorRef,
  onContentUpdate,
}: UseEditorContentProps): UseEditorContentReturn => {
  // Последнее значение, переданное в onChange. Используем ref, чтобы
  // избежать лишних вызовов onChange при одинаковом контенте.
  const lastContentRef = useRef<string>(value || '');
  const inputRafRef = useRef<number | null>(null);
  // Флаг: пользователь активно вводит текст → не перезаписываем DOM из value prop.
  const isUserEditingRef = useRef(false);
  const isUserEditingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Стабильные refs, чтобы не пересоздавать callbacks при каждом render
  const onChangeRef = useRef(onChange);
  const isAdminRef = useRef(isAdmin);
  const isHtmlModeRef = useRef(isHtmlMode);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { isAdminRef.current = isAdmin; }, [isAdmin]);
  useEffect(() => { isHtmlModeRef.current = isHtmlMode; }, [isHtmlMode]);

  // Debounce 150 мс — компромисс между отзывчивостью и нагрузкой
  const debouncedOnChange = useMemo(
    () => debounce((content: string) => { onChangeRef.current(content); }, 150),
    [],
  );

  // ── handleInput ────────────────────────────────────────────────────────────
  const handleInput = useCallback(() => {
    if (!editorRef.current) return;

    // Помечаем активное редактирование — сбрасываем через 300 мс после последнего ввода
    isUserEditingRef.current = true;
    if (isUserEditingTimerRef.current) clearTimeout(isUserEditingTimerRef.current);
    isUserEditingTimerRef.current = setTimeout(() => {
      isUserEditingRef.current = false;
      isUserEditingTimerRef.current = null;
    }, 300);

    const raw = isHtmlModeRef.current
      ? editorRef.current.innerText
      : editorRef.current.innerHTML;

    // cleanContentForOutput работает на клоне DOM — живой редактор не трогаем.
    // Внутри вызывается DOMPurify, закрываются незакрытые теги, удаляются
    // служебные элементы (.rte-image обёртки, кнопки редактирования и т.д.)
    const clean = cleanContentForOutput(raw, isAdminRef.current);

    if (clean !== lastContentRef.current) {
      lastContentRef.current = clean;
      debouncedOnChange(clean);
    }

    onContentUpdate?.();
  }, [debouncedOnChange, editorRef, onContentUpdate]);

  // ── handleInputDeferred (RAF) ──────────────────────────────────────────────
  const handleInputDeferred = useCallback(() => {
    // Один RAF в очереди — не накапливаем лишние вызовы
    if (inputRafRef.current) return;
    inputRafRef.current = window.requestAnimationFrame(() => {
      inputRafRef.current = null;
      handleInput();
    });
  }, [handleInput]);

  // ── handleBlur ─────────────────────────────────────────────────────────────
  const handleBlur = useCallback(() => {
    if (!editorRef.current) return;

    // Форсируем сохранение немедленно (без debounce)
    debouncedOnChange.flush();

    const raw = isHtmlModeRef.current
      ? editorRef.current.innerText
      : editorRef.current.innerHTML;

    const clean = cleanContentForOutput(raw, isAdminRef.current);

    if (clean !== lastContentRef.current) {
      lastContentRef.current = clean;
      onChangeRef.current(clean);
    }
  }, [editorRef, debouncedOnChange]);

  // ── Cleanup RAF и debounce при unmount ─────────────────────────────────────
  useEffect(() => {
    return () => {
      if (inputRafRef.current) cancelAnimationFrame(inputRafRef.current);
      if (isUserEditingTimerRef.current) clearTimeout(isUserEditingTimerRef.current);
      debouncedOnChange.flush();
    };
  }, [debouncedOnChange]);

  // ── Автосохранение при submit формы ────────────────────────────────────────
  useEffect(() => {
    const handleFormSubmit = () => {
      debouncedOnChange.flush();
      if (!editorRef.current) return;
      const raw = isHtmlModeRef.current
        ? editorRef.current.innerText
        : editorRef.current.innerHTML;
      const clean = cleanContentForOutput(raw, isAdminRef.current);
      if (clean !== lastContentRef.current) {
        lastContentRef.current = clean;
        onChangeRef.current(clean);
      }
    };

    const form = editorRef.current?.closest('form');
    if (form) {
      form.addEventListener('submit', handleFormSubmit, { capture: true });
      return () => form.removeEventListener('submit', handleFormSubmit, { capture: true });
    }
  }, [debouncedOnChange, editorRef]);

  // ── Инициализация контента при первой загрузке ─────────────────────────────
  useEffect(() => {
    if (!editorRef.current) return;
    const initial = value || '';
    // Ставим начальный контент только если редактор пустой
    if (!editorRef.current.innerHTML || editorRef.current.innerHTML === '<br>') {
      if (isHtmlModeRef.current) {
        editorRef.current.innerText = initial;
      } else {
        editorRef.current.innerHTML = initial;
      }
      lastContentRef.current = initial;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Только при монтировании

  // ── Синхронизация DOM при изменении value извне (не из нашего handleInput) ─
  useEffect(() => {
    if (!editorRef.current) return;

    const incoming = value || '';

    // Если это наше же значение (результат handleInput) — не трогаем DOM
    if (incoming === lastContentRef.current) return;
    // Если пользователь активно редактирует — не перебиваем
    if (isUserEditingRef.current) return;

    lastContentRef.current = incoming;

    // Не перезаписываем DOM если редактируется изображение (кнопки редактирования активны)
    const hasEditButtons =
      (editorRef.current.querySelectorAll('.image-settings-button').length || 0) > 0;
    if (hasEditButtons) return;

    if (isHtmlModeRef.current) {
      editorRef.current.innerText = incoming;
    } else {
      editorRef.current.innerHTML = incoming;
    }
  }, [value, editorRef]);

  return { handleInput, handleInputDeferred, handleBlur };
};

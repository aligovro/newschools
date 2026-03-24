import { useState, useCallback, useRef, useEffect } from 'react';
import { cleanAndValidateHtml, sanitizeHtml } from '@/utils/htmlSanitizer';
import { cleanContentForOutput, formatHtml } from '../utils/htmlFormatter';

interface UseHtmlModeProps {
    editorRef: React.RefObject<HTMLDivElement | null>;
    isActive: boolean;
    isAdmin: boolean;
    /** Вызывается после любого переключения — должен быть стабильной функцией (из ref). */
    onContentChange: () => void;
    createImageEditButtonRef: React.RefObject<((img: HTMLImageElement) => void) | null>;
    /**
     * Ref на функцию инициализации изображения (обёртка + кнопка + dblclick).
     * Передаётся из index.tsx и вызывается после HTML→WYSIWYG для восстановления
     * голых <img>, которые пользователь мог ввести вручную в HTML-режиме.
     */
    initializeImageRef: React.RefObject<((img: HTMLImageElement) => void) | null>;
}

export interface UseHtmlModeReturn {
    isHtmlMode: boolean;
    toggleHtmlMode: () => void;
}

/**
 * Хук для переключения между HTML и WYSIWYG режимами.
 *
 * WYSIWYG → HTML:
 *   1. cleanContentForOutput — убираем служебные элементы редактора
 *   2. cleanAndValidateHtml  — DOMPurify + валидация
 *   3. formatHtml            — форматируем с отступами для читаемости
 *   4. Показываем как innerText (plain text)
 *
 * HTML → WYSIWYG:
 *   1. Читаем innerText (пользовательский HTML-код)
 *   2. sanitizeHtml          — DOMPurify (пользователь мог вписать обработчики вручную)
 *   3. Ставим как innerHTML
 *   4. Восстанавливаем .rte-image обёртки и кнопки редактирования
 */
export const useHtmlMode = ({
    editorRef,
    isActive,
    isAdmin,
    onContentChange,
    createImageEditButtonRef,
    initializeImageRef,
}: UseHtmlModeProps): UseHtmlModeReturn => {
    const [isHtmlMode, setIsHtmlMode] = useState(false);
    const isActiveRef = useRef(isActive);
    const isAdminRef = useRef(isAdmin);

    useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
    useEffect(() => { isAdminRef.current = isAdmin; }, [isAdmin]);

    const toggleHtmlMode = useCallback(() => {
        if (!isActiveRef.current || !editorRef.current) return;

        if (isHtmlMode) {
            // ── HTML → WYSIWYG ─────────────────────────────────────────────────
            // Читаем введённый пользователем HTML-код
            const userHtml = editorRef.current.innerText;

            // Санитизируем — пользователь мог вписать onclick, onerror и т.п.
            const sanitized = sanitizeHtml(userHtml, isAdminRef.current);

            editorRef.current.innerHTML = sanitized;

            // Восстанавливаем .rte-image обёртки и кнопки редактирования.
            // Делаем в setTimeout, чтобы браузер завершил парсинг innerHTML.
            setTimeout(() => {
                if (!editorRef.current || !initializeImageRef.current) return;

                editorRef.current.querySelectorAll('img').forEach((img) => {
                    const imgEl = img as HTMLImageElement;

                    // Если изображение не в .rte-image — инициализируем полностью
                    // (пользователь мог добавить <img> в HTML-режиме вручную)
                    if (!imgEl.parentElement?.classList.contains('rte-image')) {
                        initializeImageRef.current!(imgEl);
                        return;
                    }

                    // Если обёртка есть, но нет кнопки — восстанавливаем только кнопку
                    const container = imgEl.parentElement as HTMLElement;
                    if (!container.querySelector('.image-settings-button')) {
                        createImageEditButtonRef.current?.(imgEl);
                    }
                });

                onContentChange();
            }, 50);
        } else {
            // ── WYSIWYG → HTML ─────────────────────────────────────────────────
            const wysiwygContent = editorRef.current.innerHTML;

            // Шаг 1: убираем служебные элементы редактора (.rte-image, кнопки, edit-area)
            const contentForHtml = cleanContentForOutput(wysiwygContent, isAdminRef.current);

            // Шаг 2: дополнительная валидация и санитизация
            const { cleaned, isValid, errors } = cleanAndValidateHtml(
                contentForHtml,
                isAdminRef.current,
            );

            if (!isValid && errors.length > 0) {
                // Не блокируем пользователя alert'ом — просто логируем
                console.warn('[RichTextEditor] HTML содержит ошибки, контент очищен:', errors);
            }

            // Шаг 3: форматируем с отступами для удобного чтения/редактирования
            editorRef.current.innerText = formatHtml(cleaned);

            onContentChange();
        }

        setIsHtmlMode((prev) => !prev);
    }, [isHtmlMode, onContentChange, editorRef, createImageEditButtonRef, initializeImageRef]);

    return { isHtmlMode, toggleHtmlMode };
};

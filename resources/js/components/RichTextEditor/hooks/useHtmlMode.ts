import { useState, useCallback, useRef, useEffect } from 'react';
import { cleanAndValidateHtml, sanitizeHtml } from '@/utils/htmlSanitizer';
import { formatHtml } from '../utils/htmlFormatter';

interface UseHtmlModeProps {
    editorRef: React.RefObject<HTMLDivElement | null>;
    isActive: boolean;
    isAdmin: boolean;
    onContentChange: () => void;
    createImageEditButtonRef: React.RefObject<((img: HTMLImageElement) => void) | null>;
}

export interface UseHtmlModeReturn {
    isHtmlMode: boolean;
    setIsHtmlMode: (mode: boolean) => void;
    toggleHtmlMode: () => void;
}

/**
 * Хук для управления переключением между HTML и WYSIWYG режимами.
 * При переходе из HTML → WYSIWYG восстанавливает кнопки редактирования изображений.
 */
export const useHtmlMode = ({
    editorRef,
    isActive,
    isAdmin,
    onContentChange,
    createImageEditButtonRef,
}: UseHtmlModeProps): UseHtmlModeReturn => {
    const [isHtmlMode, setIsHtmlMode] = useState(false);
    const isActiveRef = useRef(isActive);
    const isAdminRef = useRef(isAdmin);

    useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
    useEffect(() => { isAdminRef.current = isAdmin; }, [isAdmin]);

    const toggleHtmlMode = useCallback(() => {
        if (!isActiveRef.current) return;

        if (isHtmlMode) {
            // HTML → WYSIWYG: читаем источник, санитизируем и ставим как innerHTML.
            // Санитизация обязательна — пользователь мог вписать inline-обработчики вручную.
            if (editorRef.current) {
                const htmlContent = editorRef.current.innerText;
                const sanitized = sanitizeHtml(htmlContent, isAdminRef.current);
                editorRef.current.innerHTML = sanitized;
            }
        } else {
            // WYSIWYG → HTML: санитизируем и форматируем
            if (editorRef.current) {
                const wysiwygContent = editorRef.current.innerHTML;

                const { cleaned, isValid, errors } = cleanAndValidateHtml(
                    wysiwygContent,
                    isAdminRef.current,
                );

                if (!isValid) {
                    alert(`HTML содержит ошибки: ${errors.join(', ')}. Контент будет очищен.`);
                }

                editorRef.current.innerText = formatHtml(cleaned);
            }
        }

        // После перехода обратно в WYSIWYG восстанавливаем кнопки редактирования
        if (isHtmlMode) {
            setTimeout(() => {
                if (!editorRef.current || !createImageEditButtonRef.current) return;

                editorRef.current.querySelectorAll('img').forEach((img) => {
                    const imgElement = img as HTMLImageElement;
                    const container = imgElement.parentElement as HTMLElement;
                    if (!container?.classList.contains('rte-image')) return;

                    // Если кнопки нет — создаём
                    if (!container.querySelector('.image-settings-button')) {
                        createImageEditButtonRef.current!(imgElement);
                    }
                });
            }, 100);
        }

        setIsHtmlMode(!isHtmlMode);
        onContentChange();
    }, [isHtmlMode, onContentChange, editorRef, createImageEditButtonRef]);

    return {
        isHtmlMode,
        setIsHtmlMode,
        toggleHtmlMode,
    };
};

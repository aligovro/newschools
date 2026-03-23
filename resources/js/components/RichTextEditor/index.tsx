import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import styles from './RichTextEditor.module.scss';

// Импорты компонентов
import ButtonDialog from './components/ButtonDialog';
import ColorPicker from './components/ColorPicker';
import EditorContent from './components/EditorContent';
import ImageEditDialog from './components/ImageEditDialog';
import LinkDialog from './components/LinkDialog';
import TableInsertMenu from './components/TableInsertMenu';
import TemplatesMenu from './components/TemplatesMenu';
import Toolbar from './components/Toolbar';
import VideoInsertMenu from './components/VideoInsertMenu';
import WordCount from './components/WordCount';

// Импорты хуков
import { useButtonInsertion } from './hooks/useButtonInsertion';
import { useColorFormatting } from './hooks/useColorFormatting';
import { useEditorCommands } from './hooks/useEditorCommands';
import { useEditorContent } from './hooks/useEditorContent';
import { useHtmlMode } from './hooks/useHtmlMode';
import { useImageHandlers } from './hooks/useImageHandlers';
import { useImageResizing } from './hooks/useImageResizing';
import { useLinkInsertion } from './hooks/useLinkInsertion';
import { useTableInsertion } from './hooks/useTableInsertion';
import { useVideoInsertion } from './hooks/useVideoInsertion';
import { removeImageCompletely } from './utils/htmlFormatter';
import { countWordsFromElement } from './utils/wordCounter';
import { sanitizeHtml } from '@/utils/htmlSanitizer';

interface IRichTextEditor {
    value: string;
    onChange: (data: string) => void;
    placeholder?: string;
    level?: 'simple' | 'advanced'; // Уровень редактора: simple - базовый функционал, advanced - все возможности
    height?: number;
    disabled?: boolean;
    showHtmlToggle?: boolean;
    showTemplates?: boolean;
    showWordCount?: boolean;
    showImageUpload?: boolean;
}

const RichTextEditor: React.FC<IRichTextEditor> = ({
    value,
    onChange,
    placeholder = '',
    level = 'simple',
    height = 300,
    disabled = false,
    showHtmlToggle = true,
    showTemplates = true,
    showWordCount = true,
    showImageUpload = false,
}) => {
    // Определяем уровень доступа на основе level
    const isAdvanced = level === 'advanced';

    // Refs
    const editorRef = useRef<HTMLDivElement>(null);
    const createImageEditButtonRef = useRef<
        ((img: HTMLImageElement) => void) | null
    >(null);
    const initializeImageResizeRef = useRef<
        ((img: HTMLImageElement) => void) | null
    >(null);

    // State
    const [isReady, setIsReady] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [imageEditDialogOpen, setImageEditDialogOpen] = useState(false);
    const [editingImage, setEditingImage] = useState<HTMLImageElement | null>(
        null,
    );
    const [imageSettings, setImageSettings] = useState({
        width: 100,
        height: 100,
        alt: '',
        title: '',
        align: 'none',
        border: 0,
        margin: 16,
    });
    const [templatesAnchorEl, setTemplatesAnchorEl] =
        useState<null | HTMLElement>(null);

    const isActive = useMemo(() => !disabled, [disabled]);

    // 🔍 DEBUG: Раскомментируйте для отладки производительности
    // const renderCountRef = useRef(0);
    // renderCountRef.current += 1;
    // console.log(`🔄 RichTextEditor render #${renderCountRef.current}`);

    // 🔍 DEBUG: Отслеживание изменений пропсов
    // const prevPropsRef = useRef({ name, onChange, placeholder, level, height, disabled });
    // useEffect(() => {
    //   const prev = prevPropsRef.current;
    //   const changes: string[] = [];
    //
    //   if (prev.name !== name) changes.push('name');
    //   if (prev.onChange !== onChange) changes.push('onChange');
    //   if (prev.placeholder !== placeholder) changes.push('placeholder');
    //   if (prev.level !== level) changes.push('level');
    //   if (prev.height !== height) changes.push('height');
    //   if (prev.disabled !== disabled) changes.push('disabled');
    //
    //   if (changes.length > 0) {
    //     console.log(`📝 Props changed:`, changes.join(', '));
    //   }
    //
    //   prevPropsRef.current = { name, onChange, placeholder, level, height, disabled };
    // }, [name, onChange, placeholder, level, height, disabled]);

    // Обновление счетчика слов
    const updateWordCount = useCallback(() => {
        if (editorRef.current) {
            const result = countWordsFromElement(editorRef.current);
            setWordCount(result.words);
            setCharCount(result.characters);
        }
    }, []);

    // HTML Mode Hook
    const htmlModeWithContent = useHtmlMode({
        editorRef,
        isActive,
        isAdmin: isAdvanced,
        onContentChange: () => {}, // Будет обновлен ниже после создания handleInput
        createImageEditButtonRef,
    });

    const isHtmlMode = htmlModeWithContent.isHtmlMode;

    // Обёртка для onChange - просто передаем контент без переключения режима
    const handleChange = useCallback(
        (content: string) => {
            // Просто передаем контент как есть, без автоматического переключения режима
            // Пользователь сам решает, когда переключаться между режимами
            onChange(content);
        },
        [onChange],
    );

    // Editor Content Hook
    const { handleInput, handleInputDeferred, handleBlur } = useEditorContent({
        value: value || '',
        onChange: handleChange,
        isAdmin: isAdvanced,
        isHtmlMode,
        imageEditDialogOpen,
        editorRef,
        onContentUpdate: updateWordCount,
    });

    // Editor Commands Hook
    const { execCommand } = useEditorCommands({
        editorRef,
        isActive,
        onContentChange: handleInput,
    });

    // Link Insertion Hook
    const {
        linkDialogOpen,
        linkUrl,
        linkText,
        openInNewTab: linkOpenInNewTab,
        setLinkDialogOpen,
        setLinkUrl,
        setLinkText,
        setOpenInNewTab: setLinkOpenInNewTab,
        handleInsertLink,
        handleLinkSubmit,
    } = useLinkInsertion({
        editorRef,
        isActive,
        isHtmlMode,
        onContentChange: handleInput,
    });

    // Button Insertion Hook
    const {
        buttonDialogOpen,
        buttonUrl,
        buttonText,
        openInNewTab: buttonOpenInNewTab,
        setButtonDialogOpen,
        setButtonUrl,
        setButtonText,
        setOpenInNewTab: setButtonOpenInNewTab,
        handleInsertButton,
        handleButtonSubmit,
    } = useButtonInsertion({
        editorRef,
        isActive,
        isHtmlMode,
        onContentChange: handleInput,
    });

    // Table Insertion Hook
    const { tableAnchorEl, setTableAnchorEl, handleInsertTable } =
        useTableInsertion({
            editorRef,
            isActive,
            isHtmlMode,
            onContentChange: handleInput,
        });

    // Video Insertion Hook
    const { videoAnchorEl, setVideoAnchorEl, handleInsertVideo } =
        useVideoInsertion({
            editorRef,
            isActive,
            onContentChange: handleInput,
        });

    // Color Formatting Hook
    const {
        colorAnchorEl,
        selectedColor,
        setColorAnchorEl,
        handleColorChange,
    } = useColorFormatting({
        isActive,
        onContentChange: handleInput,
    });

    // Template Insertion
    const handleInsertTemplate = useCallback(
        (template: string) => {
            if (!isActive || !editorRef.current) return;

            if (isHtmlMode) {
                editorRef.current.innerText += template;
            } else {
                editorRef.current.innerHTML += template;
            }

            setTemplatesAnchorEl(null);
            handleInput();
        },
        [isActive, isHtmlMode, handleInput],
    );

    // Инициализация контента при первой загрузке
    useEffect(() => {
        if (editorRef.current && value && isReady) {
            const currentContent = isHtmlMode
                ? editorRef.current.innerText
                : editorRef.current.innerHTML;

            // Инициализируем только если редактор пустой
            if (
                !currentContent ||
                currentContent.trim() === '' ||
                currentContent === '<br>' ||
                currentContent === '<p><br></p>'
            ) {
                if (isHtmlMode) {
                    editorRef.current.innerText = value;
                } else {
                    editorRef.current.innerHTML = value;
                }
            }
        }
    }, [value, isHtmlMode, isReady]);

    // Инициализация готовности
    useEffect(() => {
        if (editorRef.current) {
            setIsReady(true);
            updateWordCount();
        }
    }, [updateWordCount]);

    // Обработка фокуса
    const handleFocus = useCallback(() => {
        // no-op
    }, []);

    // Обработка вставки из буфера обмена
    const handlePaste = useCallback(
        (e: React.ClipboardEvent<HTMLDivElement>) => {
            if (!editorRef.current || !isActive) {
                return;
            }

            // В HTML-режиме не вмешиваемся: пользователь сам редактирует исходник
            if (isHtmlMode) {
                return;
            }

            e.preventDefault();

            const clipboardData = e.clipboardData || (window as any).clipboardData;
            let pastedHtml = clipboardData.getData('text/html');

            if (!pastedHtml) {
                const text = clipboardData.getData('text/plain');
                if (!text) {
                    return;
                }

                // Преобразуем обычный текст в простой HTML, сохраняя переводы строк
                const escaped = text
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\r\n|\r|\n/g, '<br>');

                pastedHtml = `<p>${escaped}</p>`;
            }

            // Для вставки всегда чистим HTML как для обычного пользователя:
            // убираем инлайн-стили у текстовых элементов, font-family и прочий мусор
            // из внешних источников. Стили у img/iframe оставляем.
            const cleaned = sanitizeHtml(pastedHtml, false, {
                stripTextStyles: true,
            });

            document.execCommand('insertHTML', false, cleaned);

            // Обновляем внутреннее состояние редактора
            handleInputDeferred();
        },
        [isActive, isHtmlMode, handleInputDeferred],
    );

    // Обработка клика в редакторе
    const handleEditorClick = useCallback((e: React.MouseEvent) => {
        const target = e.target as HTMLElement;

        // Клик на кнопку редактирования изображения обрабатывается самой кнопкой
        if (
            target.classList.contains('image-settings-button') ||
            target.closest('.image-settings-button')
        ) {
            e.stopPropagation();
            return;
        }
    }, []);

    // Открытие редактора изображения
    const handleEditImage = useCallback((img: HTMLImageElement) => {
        setEditingImage(img);

        const currentWidth = parseInt(img.style.width) || img.naturalWidth || img.width || 100;
        const currentHeight = parseInt(img.style.height) || img.naturalHeight || img.height || 100;
        const currentAlt = img.alt || '';
        const currentTitle = img.title || '';
        const currentMargin = parseInt(img.style.marginRight || img.style.marginLeft || img.style.margin) || 16;
        const currentBorder = parseInt(img.style.borderWidth) || 0;

        // Определяем выравнивание — проверяем и контейнер, и само изображение
        const container = img.parentElement;
        const isRteContainer = container?.classList.contains('rte-image');
        const containerFloat = isRteContainer ? container!.style.float : '';
        const imgFloat = img.style.float;

        let align = 'none';
        if (containerFloat === 'left' || imgFloat === 'left') {
            align = 'left';
        } else if (containerFloat === 'right' || imgFloat === 'right') {
            align = 'right';
        } else if (
            (isRteContainer && container!.style.display === 'block' &&
                (container!.style.marginLeft === 'auto' || container!.style.marginRight === 'auto')) ||
            img.style.display === 'block'
        ) {
            align = 'center';
        }

        setImageSettings({
            width: currentWidth,
            height: currentHeight,
            alt: currentAlt,
            title: currentTitle,
            align,
            border: currentBorder,
            margin: currentMargin,
        });

        setImageEditDialogOpen(true);
    }, []);

    // Image Resizing Hook
    const { createImageEditButton, initializeImageResize } =
        useImageResizing({
            handleEditImage,
        });

    // Обновляем refs для функций работы с изображениями
    useEffect(() => {
        createImageEditButtonRef.current = createImageEditButton;
        initializeImageResizeRef.current = initializeImageResize;
    }, [createImageEditButton, initializeImageResize]);

    // Функции для изменения размера изображения
    const handleWidthChange = useCallback(
        (newWidth: number) => {
            if (!editingImage) return;

            const originalWidth = editingImage.naturalWidth;
            const originalHeight = editingImage.naturalHeight;
            const aspectRatio = originalHeight / originalWidth;

            setImageSettings((prev) => ({
                ...prev,
                width: newWidth,
                height: Math.round(newWidth * aspectRatio),
            }));
        },
        [editingImage],
    );

    const handleHeightChange = useCallback(
        (newHeight: number) => {
            if (!editingImage) return;

            const originalWidth = editingImage.naturalWidth;
            const originalHeight = editingImage.naturalHeight;
            const aspectRatio = originalWidth / originalHeight;

            setImageSettings((prev) => ({
                ...prev,
                height: newHeight,
                width: Math.round(newHeight * aspectRatio),
            }));
        },
        [editingImage],
    );

    // Применение настроек изображения
    const handleApplyImageSettings = useCallback(() => {
        if (!editingImage) return;

        // Размеры — только для не-SVG
        const isSvg =
            editingImage.src.split('?')[0].toLowerCase().endsWith('.svg') ||
            editingImage.src.toLowerCase().startsWith('data:image/svg+xml');

        if (!isSvg) {
            editingImage.style.width = `${imageSettings.width}px`;
            editingImage.style.height = `${imageSettings.height}px`;
        }

        // Граница
        editingImage.style.borderWidth = `${imageSettings.border}px`;
        editingImage.style.borderStyle = imageSettings.border > 0 ? 'solid' : 'none';
        editingImage.style.borderColor = '#ddd';

        // Alt и title
        editingImage.alt = imageSettings.alt;
        editingImage.title = imageSettings.title;

        // Сбрасываем служебные стили float/display с самого изображения
        editingImage.style.float = '';
        editingImage.style.display = '';
        editingImage.style.marginLeft = '';
        editingImage.style.marginRight = '';
        editingImage.style.marginTop = '';
        editingImage.style.marginBottom = '';

        const container = editingImage.parentElement;
        if (container?.classList.contains('rte-image')) {
            // Полностью сбрасываем предыдущие стили выравнивания на контейнере
            container.style.float = '';
            container.style.display = '';
            container.style.marginLeft = '';
            container.style.marginRight = '';
            container.style.marginTop = '';
            container.style.marginBottom = '';

            const margin = imageSettings.margin;

            if (imageSettings.align === 'left') {
                container.style.float = 'left';
                container.style.marginRight = `${margin}px`;
                container.style.marginBottom = `${margin}px`;
            } else if (imageSettings.align === 'right') {
                container.style.float = 'right';
                container.style.marginLeft = `${margin}px`;
                container.style.marginBottom = `${margin}px`;
            } else if (imageSettings.align === 'center') {
                container.style.display = 'block';
                container.style.marginLeft = 'auto';
                container.style.marginRight = 'auto';
                container.style.marginTop = `${margin}px`;
                container.style.marginBottom = `${margin}px`;
            } else {
                // none — inline-block без обтекания
                container.style.display = 'inline-block';
                container.style.marginTop = `${margin}px`;
                container.style.marginBottom = `${margin}px`;
            }
        }

        handleInput();
        setImageEditDialogOpen(false);
        setEditingImage(null);
    }, [editingImage, imageSettings, handleInput]);

    // Инициализация существующих изображений при загрузке контента.
    // Оборачивает изображения в .rte-image, переносит float/display на обёртку
    // и добавляет кнопку редактирования.
    useEffect(() => {
        if (!editorRef.current || !isReady) return;

        const timeoutId = setTimeout(() => {
            if (!editorRef.current) return;

            editorRef.current.querySelectorAll('img').forEach((img) => {
                const imgElement = img as HTMLImageElement;
                if (!imgElement.src) return;

                // Если изображение ещё не обёрнуто — оборачиваем
                if (!imgElement.parentElement?.classList.contains('rte-image')) {
                    const newContainer = document.createElement('span');
                    newContainer.className = 'rte-image';
                    newContainer.style.cssText = 'display: inline-block; position: relative;';
                    newContainer.setAttribute('contenteditable', 'false');
                    newContainer.setAttribute('draggable', 'false');

                    // Переносим float/выравнивание с изображения на контейнер
                    const imgFloat = imgElement.style.float;
                    const imgDisplay = imgElement.style.display;
                    const imgMarginLeft = imgElement.style.marginLeft;
                    const imgMarginRight = imgElement.style.marginRight;
                    const imgMarginTop = imgElement.style.marginTop;
                    const imgMarginBottom = imgElement.style.marginBottom;

                    if (imgFloat === 'left') {
                        newContainer.style.float = 'left';
                        newContainer.style.marginRight = imgMarginRight || '16px';
                        newContainer.style.marginBottom = imgMarginBottom || '8px';
                        imgElement.style.float = '';
                        imgElement.style.marginRight = '';
                    } else if (imgFloat === 'right') {
                        newContainer.style.float = 'right';
                        newContainer.style.marginLeft = imgMarginLeft || '16px';
                        newContainer.style.marginBottom = imgMarginBottom || '8px';
                        imgElement.style.float = '';
                        imgElement.style.marginLeft = '';
                    } else if (
                        imgDisplay === 'block' ||
                        imgMarginLeft === 'auto' ||
                        imgMarginRight === 'auto'
                    ) {
                        newContainer.style.display = 'block';
                        newContainer.style.marginLeft = 'auto';
                        newContainer.style.marginRight = 'auto';
                        if (imgMarginTop) newContainer.style.marginTop = imgMarginTop;
                        if (imgMarginBottom) newContainer.style.marginBottom = imgMarginBottom;
                        imgElement.style.display = '';
                        imgElement.style.marginLeft = '';
                        imgElement.style.marginRight = '';
                    }

                    imgElement.parentNode?.insertBefore(newContainer, imgElement);
                    newContainer.appendChild(imgElement);
                }

                // Добавляем кнопку редактирования, если её нет
                const container = imgElement.parentElement as HTMLElement;
                if (!container.querySelector('.image-settings-button') && initializeImageResizeRef.current) {
                    initializeImageResizeRef.current(imgElement);
                }

                // Двойной клик — открыть диалог
                if (!(imgElement as any).__hasDblClickHandler) {
                    imgElement.addEventListener('dblclick', (e) => {
                        e.stopPropagation();
                        handleEditImage(imgElement);
                    });
                    (imgElement as any).__hasDblClickHandler = true;
                }
            });
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [value, isReady, handleEditImage]);

    // MutationObserver: восстанавливает кнопку редактирования если она пропала
    // (например, после переключения HTML-режима или undo/redo)
    useEffect(() => {
        if (!editorRef.current) return;

        let timeoutId: NodeJS.Timeout;

        const restoreEditButtons = () => {
            if (!editorRef.current || !createImageEditButtonRef.current) return;

            editorRef.current
                .querySelectorAll('.rte-image')
                .forEach((container) => {
                    const img = container.querySelector('img') as HTMLImageElement | null;
                    if (img && !container.querySelector('.image-settings-button')) {
                        createImageEditButtonRef.current!(img);
                    }
                });
        };

        const debouncedRestore = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(restoreEditButtons, 200);
        };

        const observer = new MutationObserver((mutations) => {
            let needsCheck = false;
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const el = node as Element;
                            if (el.tagName === 'IMG' || el.querySelector?.('img')) {
                                needsCheck = true;
                            }
                        }
                    });
                }
            });
            if (needsCheck) debouncedRestore();
        });

        observer.observe(editorRef.current, {
            childList: true,
            subtree: true,
        });

        return () => {
            observer.disconnect();
            clearTimeout(timeoutId);
        };
    }, [createImageEditButton]);

    // Обработка клавиатурных сокращений и удаления изображений
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isActive) return;

            const isCtrl = e.ctrlKey || e.metaKey;

            // Обработка Delete/Backspace для удаления изображений.
            //
            // Правило: картинка удаляется ТОЛЬКО в двух случаях:
            //   1. Выделение (не-collapsed) явно охватывает .rte-image обёртку.
            //   2. Курсор стоит в .image-edit-area ТОЧНО на границе, смежной с изображением
            //      (offset 0 при Backspace, конец контента при Delete),
            //      либо область полностью пустая.
            //
            // Во всех остальных случаях браузер обрабатывает нажатие сам (удаляет символ).
            if ((e.key === 'Delete' || e.key === 'Backspace') && !isCtrl) {
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0) return;

                const range = selection.getRangeAt(0);
                const isBackspace = e.key === 'Backspace';
                let imgToDelete: HTMLImageElement | null = null;

                /**
                 * Проверяет, находится ли курсор точно на указанной границе элемента.
                 * Использует Range.compareBoundaryPoints — надёжнее ручного подсчёта offset'ов.
                 */
                const isCursorAtEdge = (
                    r: Range,
                    el: Element,
                    edge: 'start' | 'end',
                ): boolean => {
                    try {
                        const ref = document.createRange();
                        ref.selectNodeContents(el);
                        return edge === 'start'
                            ? r.compareBoundaryPoints(Range.START_TO_START, ref) === 0
                            : r.compareBoundaryPoints(Range.END_TO_END, ref) === 0;
                    } catch {
                        return false;
                    }
                };

                if (!range.collapsed) {
                    // ── Есть выделение ──────────────────────────────────────────────────
                    // Ищем .rte-image внутри скопированного фрагмента выделения.
                    // Если нашли — ищем соответствующий img в живом DOM по src.
                    const fragment = range.cloneContents();
                    const imgInFragment =
                        fragment.querySelector('.rte-image img') ??
                        fragment.querySelector('img');

                    if (imgInFragment && editorRef.current) {
                        const src = imgInFragment.getAttribute('src');
                        if (src) {
                            for (const domImg of editorRef.current.querySelectorAll('img')) {
                                if (domImg.getAttribute('src') === src) {
                                    imgToDelete = domImg;
                                    break;
                                }
                            }
                        }
                    }
                } else {
                    // ── Курсор (collapsed) ───────────────────────────────────────────────
                    const anchorNode = range.startContainer;
                    const anchorEl = (
                        anchorNode.nodeType === Node.TEXT_NODE
                            ? anchorNode.parentElement
                            : anchorNode
                    ) as Element | null;

                    if (anchorEl && editorRef.current?.contains(anchorEl)) {
                        // Случай A: курсор каким-то образом попал внутрь .rte-image
                        const rteWrapper = anchorEl.closest('.rte-image');
                        if (rteWrapper) {
                            imgToDelete = rteWrapper.querySelector('img');
                        }

                        // Случай B: курсор в .image-edit-area
                        // Удаляем соседнее изображение ТОЛЬКО если курсор
                        // стоит прямо на границе области, смежной с картинкой.
                        if (!imgToDelete) {
                            const editArea = anchorEl.closest(
                                '.image-edit-area',
                            ) as HTMLElement | null;

                            if (editArea) {
                                const areaIsEmpty =
                                    !editArea.textContent?.trim();

                                if (isBackspace) {
                                    if (areaIsEmpty || isCursorAtEdge(range, editArea, 'start')) {
                                        const prev = editArea.previousElementSibling;
                                        if (prev?.classList.contains('rte-image')) {
                                            imgToDelete = prev.querySelector('img');
                                        }
                                    }
                                } else {
                                    // Delete
                                    if (areaIsEmpty || isCursorAtEdge(range, editArea, 'end')) {
                                        const next = editArea.nextElementSibling;
                                        if (next?.classList.contains('rte-image')) {
                                            imgToDelete = next.querySelector('img');
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // ── Удаляем найденное изображение ──────────────────────────────────────
                if (imgToDelete) {
                    e.preventDefault();

                    const rteWrapper = imgToDelete.closest('.rte-image');
                    const prevArea = rteWrapper?.previousElementSibling ?? null;
                    const nextArea = rteWrapper?.nextElementSibling ?? null;

                    removeImageCompletely(imgToDelete);

                    // Ставим курсор в соседнюю редактируемую область
                    setTimeout(() => {
                        const sel = window.getSelection();
                        if (!sel || !editorRef.current) return;

                        const newRange = document.createRange();
                        const target =
                            (isBackspace ? prevArea : nextArea) ??
                            nextArea ??
                            prevArea ??
                            editorRef.current.lastChild;

                        if (target) {
                            if (target.nodeType === Node.TEXT_NODE) {
                                const len = target.textContent?.length ?? 0;
                                newRange.setStart(target, isBackspace ? len : 0);
                            } else {
                                isBackspace
                                    ? newRange.setStartAfter(target)
                                    : newRange.setStart(target, 0);
                            }
                        } else {
                            newRange.setStart(editorRef.current, 0);
                        }

                        newRange.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(newRange);
                    }, 0);

                    handleInput();
                    return;
                }
            }

            if (isCtrl) {
                switch (e.key) {
                    case 'b':
                        e.preventDefault();
                        execCommand('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        execCommand('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        execCommand('underline');
                        break;
                    case 'k':
                        e.preventDefault();
                        handleInsertLink();
                        break;
                    case 's':
                        e.preventDefault();
                        handleInput();
                        break;
                }
            }
        };

        const currentEditor = editorRef.current;
        if (currentEditor) {
            currentEditor.addEventListener('keydown', handleKeyDown);
            return () =>
                currentEditor.removeEventListener('keydown', handleKeyDown);
        }
    }, [isActive, execCommand, handleInsertLink, handleInput]);

    // Хук для обработки изображений
    const {
        fileInputRef,
        handleImageButtonClick,
        handleImageUpload,
        isUploading: isImageUploading,
    } = useImageHandlers({
        isActive,
        handleInput,
        handleEditImage,
        initializeImageResize,
        editorRef,
    });

    // Открыватели меню (мемоизированы)
    const openVideoMenu = useCallback(
        (e: React.MouseEvent<HTMLElement>) => {
            setVideoAnchorEl(e.currentTarget);
        },
        [setVideoAnchorEl],
    );

    const openColorMenu = useCallback(
        (e: React.MouseEvent<HTMLElement>) => {
            setColorAnchorEl(e.currentTarget);
        },
        [setColorAnchorEl],
    );

    const openTableMenu = useCallback(
        (e: React.MouseEvent<HTMLElement>) => {
            setTableAnchorEl(e.currentTarget);
        },
        [setTableAnchorEl],
    );

    const openTemplatesMenu = useCallback(
        (e: React.MouseEvent<HTMLElement>) => {
            setTemplatesAnchorEl(e.currentTarget);
        },
        [],
    );

    return (
        <>
            <div className={styles.editorRoot}>
                <div className={styles.editorWrapper}>
                    <Toolbar
                        isAdmin={isAdvanced}
                        isActive={isActive}
                        showTemplates={showTemplates}
                        showHtmlToggle={showHtmlToggle}
                        showImageUpload={showImageUpload}
                        isHtmlMode={isHtmlMode}
                        selectedColor={selectedColor}
                        selectedImage={null}
                        onExecCommand={execCommand}
                        onImageButtonClick={handleImageButtonClick}
                        onInsertLink={handleInsertLink}
                        onInsertButton={handleInsertButton}
                        onVideoClick={openVideoMenu}
                        onColorClick={openColorMenu}
                        onTableClick={openTableMenu}
                        onTemplatesClick={openTemplatesMenu}
                        onHtmlToggle={() => {
                            htmlModeWithContent.toggleHtmlMode();
                        }}
                        onImageEdit={handleEditImage}
                        fileInputRef={fileInputRef}
                        onImageUpload={handleImageUpload}
                        isImageUploading={isImageUploading}
                    />

                    <EditorContent
                        editorRef={editorRef}
                        isHtmlMode={isHtmlMode}
                        isActive={isActive}
                        height={height}
                        placeholder={placeholder}
                        onInput={handleInputDeferred}
                        onPaste={handlePaste}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onClick={handleEditorClick}
                        onKeyUp={handleInputDeferred}
                        onMouseUp={handleInputDeferred}
                        isReady={isReady}
                    />

                    <WordCount
                        wordCount={wordCount}
                        charCount={charCount}
                        show={showWordCount}
                    />
                </div>
            </div>

            <LinkDialog
                open={linkDialogOpen}
                onClose={() => setLinkDialogOpen(false)}
                linkUrl={linkUrl}
                linkText={linkText}
                openInNewTab={linkOpenInNewTab}
                onUrlChange={setLinkUrl}
                onTextChange={setLinkText}
                onOpenInNewTabChange={setLinkOpenInNewTab}
                onSubmit={handleLinkSubmit}
            />

            <ButtonDialog
                open={buttonDialogOpen}
                onClose={() => setButtonDialogOpen(false)}
                buttonUrl={buttonUrl}
                buttonText={buttonText}
                openInNewTab={buttonOpenInNewTab}
                onUrlChange={setButtonUrl}
                onTextChange={setButtonText}
                onOpenInNewTabChange={setButtonOpenInNewTab}
                onSubmit={handleButtonSubmit}
            />

            <ColorPicker
                anchorEl={colorAnchorEl}
                open={Boolean(colorAnchorEl)}
                onClose={() => setColorAnchorEl(null)}
                onColorChange={handleColorChange}
                selectedColor={selectedColor}
            />

            <TableInsertMenu
                anchorEl={tableAnchorEl}
                open={Boolean(tableAnchorEl)}
                onClose={() => setTableAnchorEl(null)}
                onInsertTable={handleInsertTable}
            />

            <TemplatesMenu
                anchorEl={templatesAnchorEl}
                open={Boolean(templatesAnchorEl)}
                onClose={() => setTemplatesAnchorEl(null)}
                onInsertTemplate={handleInsertTemplate}
            />

            <VideoInsertMenu
                anchorEl={videoAnchorEl}
                open={Boolean(videoAnchorEl)}
                onClose={() => setVideoAnchorEl(null)}
                onInsertVideo={handleInsertVideo}
            />

            <ImageEditDialog
                open={imageEditDialogOpen}
                onClose={() => setImageEditDialogOpen(false)}
                editingImage={editingImage}
                imageSettings={imageSettings}
                onSettingsChange={setImageSettings}
                onApplySettings={handleApplyImageSettings}
                onDeleteImage={() => {
                    if (editingImage) {
                        // Используем функцию полного удаления изображения
                        removeImageCompletely(editingImage);
                        handleInput();
                        setImageEditDialogOpen(false);
                        setEditingImage(null);
                    }
                }}
                onWidthChange={handleWidthChange}
                onHeightChange={handleHeightChange}
                onResetSize={() => {
                    if (editingImage) {
                        setImageSettings((prev) => ({
                            ...prev,
                            width: editingImage.naturalWidth,
                            height: editingImage.naturalHeight,
                        }));
                    }
                }}
            />
        </>
    );
};

export default React.memo(RichTextEditor);

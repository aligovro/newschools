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
import { cleanPastedHtml, convertPlainTextToHtml } from './utils/pasteCleanup';
import { countWordsFromElement } from './utils/wordCounter';
import { sanitizeHtml } from '@/utils/htmlSanitizer';

interface IRichTextEditor {
    value: string;
    onChange: (data: string) => void;
    placeholder?: string;
    level?: 'simple' | 'advanced';
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
    const isAdvanced = level === 'advanced';
    const isActive = useMemo(() => !disabled, [disabled]);

    // ── Refs ───────────────────────────────────────────────────────────────────
    const editorRef = useRef<HTMLDivElement>(null);

    // Refs на функции работы с изображениями — нужны хукам которые инициализируются
    // раньше чем сами функции определены (обходим порядок зависимостей в хуках).
    const createImageEditButtonRef = useRef<((img: HTMLImageElement) => void) | null>(null);
    const initializeImageResizeRef = useRef<((img: HTMLImageElement) => void) | null>(null);
    const handleEditImageRef = useRef<((img: HTMLImageElement) => void) | null>(null);

    // Ref на handleInput — нужен для onContentChange в useHtmlMode, который
    // инициализируется до useEditorContent (обходим порядок объявления хуков).
    const handleInputRef = useRef<() => void>(() => {});
    const onHtmlModeContentChange = useCallback(() => handleInputRef.current(), []);

    // ── State ──────────────────────────────────────────────────────────────────
    const [isReady, setIsReady] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [imageEditDialogOpen, setImageEditDialogOpen] = useState(false);
    const [editingImage, setEditingImage] = useState<HTMLImageElement | null>(null);
    const [imageSettings, setImageSettings] = useState({
        width: 100,
        height: 100,
        alt: '',
        title: '',
        align: 'none',
        border: 0,
        margin: 16,
    });
    const [templatesAnchorEl, setTemplatesAnchorEl] = useState<null | HTMLElement>(null);

    // ── Word count ─────────────────────────────────────────────────────────────
    const updateWordCount = useCallback(() => {
        if (editorRef.current) {
            const result = countWordsFromElement(editorRef.current);
            setWordCount(result.words);
            setCharCount(result.characters);
        }
    }, []);

    // ── HTML mode ──────────────────────────────────────────────────────────────
    const { isHtmlMode, toggleHtmlMode } = useHtmlMode({
        editorRef,
        isActive,
        isAdmin: isAdvanced,
        onContentChange: onHtmlModeContentChange,
        createImageEditButtonRef,
        initializeImageRef: initializeImageResizeRef,
    });

    // ── Editor content ─────────────────────────────────────────────────────────
    const { handleInput, handleInputDeferred, handleBlur } = useEditorContent({
        value: value || '',
        onChange,
        isAdmin: isAdvanced,
        isHtmlMode,
        editorRef,
        onContentUpdate: updateWordCount,
    });

    // Синхронизируем ref после инициализации handleInput
    useEffect(() => {
        handleInputRef.current = handleInput;
    }, [handleInput]);

    // ── Editor commands ────────────────────────────────────────────────────────
    const { execCommand } = useEditorCommands({
        editorRef,
        isActive,
        onContentChange: handleInput,
    });

    // ── Link insertion ─────────────────────────────────────────────────────────
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

    // ── Button insertion ───────────────────────────────────────────────────────
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

    // ── Table insertion ────────────────────────────────────────────────────────
    const { tableAnchorEl, setTableAnchorEl, handleInsertTable } = useTableInsertion({
        editorRef,
        isActive,
        isHtmlMode,
        onContentChange: handleInput,
    });

    // ── Video insertion ────────────────────────────────────────────────────────
    const { videoAnchorEl, setVideoAnchorEl, handleInsertVideo } = useVideoInsertion({
        editorRef,
        isActive,
        onContentChange: handleInput,
    });

    // ── Color formatting ───────────────────────────────────────────────────────
    const { colorAnchorEl, selectedColor, setColorAnchorEl, handleColorChange } =
        useColorFormatting({ isActive, onContentChange: handleInput });

    // ── Template insertion ─────────────────────────────────────────────────────
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

    // ── Image edit dialog ──────────────────────────────────────────────────────
    const handleEditImage = useCallback((img: HTMLImageElement) => {
        setEditingImage(img);

        const currentWidth =
            parseInt(img.style.width) || img.naturalWidth || img.width || 100;
        const currentHeight =
            parseInt(img.style.height) || img.naturalHeight || img.height || 100;

        const container = img.parentElement;
        const isRteContainer = container?.classList.contains('rte-image');
        const containerFloat = isRteContainer ? (container as HTMLElement).style.float : '';
        const imgFloat = img.style.float;

        let align = 'none';
        if (containerFloat === 'left' || imgFloat === 'left') {
            align = 'left';
        } else if (containerFloat === 'right' || imgFloat === 'right') {
            align = 'right';
        } else if (
            (isRteContainer &&
                (container as HTMLElement).style.display === 'block' &&
                ((container as HTMLElement).style.marginLeft === 'auto' ||
                    (container as HTMLElement).style.marginRight === 'auto')) ||
            img.style.display === 'block'
        ) {
            align = 'center';
        }

        setImageSettings({
            width: currentWidth,
            height: currentHeight,
            alt: img.alt || '',
            title: img.title || '',
            align,
            border: parseInt(img.style.borderWidth) || 0,
            margin:
                parseInt(
                    img.style.marginRight ||
                    img.style.marginLeft ||
                    img.style.margin,
                ) || 16,
        });

        setImageEditDialogOpen(true);
    }, []);

    // Синхронизируем ref
    useEffect(() => {
        handleEditImageRef.current = handleEditImage;
    }, [handleEditImage]);

    // ── Image resizing (кнопка редактирования) ─────────────────────────────────
    const { createImageEditButton } = useImageResizing({
        handleEditImage,
    });

    // createImageEditButtonRef нужен useHtmlMode для восстановления кнопок
    useEffect(() => {
        createImageEditButtonRef.current = createImageEditButton;
    }, [createImageEditButton]);

    // ── Инициализация изображения (обёртка + кнопка + обработчики) ────────────
    /**
     * Полная инициализация одного изображения в редакторе:
     *  - оборачивает в .rte-image если ещё не обёрнуто
     *  - добавляет кнопку редактирования
     *  - вешает click/dblclick обработчики
     * Используется при первичной загрузке контента и после HTML→WYSIWYG.
     */
    const initializeImage = useCallback(
        (imgElement: HTMLImageElement) => {
            if (!imgElement.src) return;

            // Оборачиваем в .rte-image если нужно
            if (!imgElement.parentElement?.classList.contains('rte-image')) {
                const newContainer = document.createElement('span');
                newContainer.className = 'rte-image';
                newContainer.style.cssText = 'display: inline-block; position: relative;';
                newContainer.setAttribute('contenteditable', 'false');
                newContainer.setAttribute('draggable', 'false');

                // Переносим float/alignment с изображения на контейнер
                const imgStyle = imgElement.style;
                if (imgStyle.float === 'left') {
                    newContainer.style.float = 'left';
                    newContainer.style.marginRight = imgStyle.marginRight || '16px';
                    newContainer.style.marginBottom = imgStyle.marginBottom || '8px';
                    imgElement.style.float = '';
                    imgElement.style.marginRight = '';
                } else if (imgStyle.float === 'right') {
                    newContainer.style.float = 'right';
                    newContainer.style.marginLeft = imgStyle.marginLeft || '16px';
                    newContainer.style.marginBottom = imgStyle.marginBottom || '8px';
                    imgElement.style.float = '';
                    imgElement.style.marginLeft = '';
                } else if (
                    imgStyle.display === 'block' ||
                    imgStyle.marginLeft === 'auto' ||
                    imgStyle.marginRight === 'auto'
                ) {
                    newContainer.style.display = 'block';
                    newContainer.style.marginLeft = 'auto';
                    newContainer.style.marginRight = 'auto';
                    if (imgStyle.marginTop) newContainer.style.marginTop = imgStyle.marginTop;
                    if (imgStyle.marginBottom) newContainer.style.marginBottom = imgStyle.marginBottom;
                    imgElement.style.display = '';
                    imgElement.style.marginLeft = '';
                    imgElement.style.marginRight = '';
                }

                imgElement.parentNode?.insertBefore(newContainer, imgElement);
                newContainer.appendChild(imgElement);
            }

            // Кнопка редактирования
            const container = imgElement.parentElement as HTMLElement;
            if (!container.querySelector('.image-settings-button')) {
                createImageEditButton(imgElement);
            }

            // Двойной клик — диалог редактирования
            if (!(imgElement as any).__hasDblClickHandler) {
                imgElement.addEventListener('dblclick', (e) => {
                    e.stopPropagation();
                    handleEditImageRef.current?.(imgElement);
                });
                (imgElement as any).__hasDblClickHandler = true;
            }
        },
        [createImageEditButton],
    );

    // Синхронизируем ref на initializeImage (используется в useHtmlMode)
    useEffect(() => {
        initializeImageResizeRef.current = initializeImage;
    }, [initializeImage]);

    // ── Применение настроек изображения ───────────────────────────────────────
    const handleWidthChange = useCallback(
        (newWidth: number) => {
            if (!editingImage) return;
            const ratio = editingImage.naturalHeight / editingImage.naturalWidth;
            setImageSettings((prev) => ({
                ...prev,
                width: newWidth,
                height: Math.round(newWidth * ratio),
            }));
        },
        [editingImage],
    );

    const handleHeightChange = useCallback(
        (newHeight: number) => {
            if (!editingImage) return;
            const ratio = editingImage.naturalWidth / editingImage.naturalHeight;
            setImageSettings((prev) => ({
                ...prev,
                height: newHeight,
                width: Math.round(newHeight * ratio),
            }));
        },
        [editingImage],
    );

    const handleApplyImageSettings = useCallback(() => {
        if (!editingImage) return;

        const isSvg =
            editingImage.src.split('?')[0].toLowerCase().endsWith('.svg') ||
            editingImage.src.toLowerCase().startsWith('data:image/svg+xml');

        if (!isSvg) {
            editingImage.style.width = `${imageSettings.width}px`;
            editingImage.style.height = `${imageSettings.height}px`;
        }

        editingImage.style.borderWidth = `${imageSettings.border}px`;
        editingImage.style.borderStyle = imageSettings.border > 0 ? 'solid' : 'none';
        editingImage.style.borderColor = '#ddd';
        editingImage.alt = imageSettings.alt;
        editingImage.title = imageSettings.title;

        // Сбрасываем выравнивание с самого изображения — оно хранится на контейнере
        editingImage.style.float = '';
        editingImage.style.display = '';
        editingImage.style.marginLeft = '';
        editingImage.style.marginRight = '';
        editingImage.style.marginTop = '';
        editingImage.style.marginBottom = '';

        const container = editingImage.parentElement;
        if (container?.classList.contains('rte-image')) {
            const { align, margin } = imageSettings;
            container.style.float = '';
            container.style.display = '';
            container.style.marginLeft = '';
            container.style.marginRight = '';
            container.style.marginTop = '';
            container.style.marginBottom = '';

            if (align === 'left') {
                container.style.float = 'left';
                container.style.marginRight = `${margin}px`;
                container.style.marginBottom = `${margin}px`;
            } else if (align === 'right') {
                container.style.float = 'right';
                container.style.marginLeft = `${margin}px`;
                container.style.marginBottom = `${margin}px`;
            } else if (align === 'center') {
                container.style.display = 'block';
                container.style.marginLeft = 'auto';
                container.style.marginRight = 'auto';
                container.style.marginTop = `${margin}px`;
                container.style.marginBottom = `${margin}px`;
            } else {
                container.style.display = 'inline-block';
                container.style.marginTop = `${margin}px`;
                container.style.marginBottom = `${margin}px`;
            }
        }

        handleInput();
        setImageEditDialogOpen(false);
        setEditingImage(null);
    }, [editingImage, imageSettings, handleInput]);

    // ── Инициализация готовности редактора ─────────────────────────────────────
    useEffect(() => {
        if (editorRef.current) {
            setIsReady(true);
            updateWordCount();
        }
    }, [updateWordCount]);

    // ── Инициализация изображений при загрузке контента ───────────────────────
    // Запускаем только при isReady (единожды после первой загрузки).
    // Дальнейшее восстановление — через MutationObserver.
    useEffect(() => {
        if (!editorRef.current || !isReady) return;

        const timeoutId = setTimeout(() => {
            editorRef.current?.querySelectorAll('img').forEach((img) => {
                initializeImage(img as HTMLImageElement);
            });
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [isReady, initializeImage]);

    // ── MutationObserver: восстанавливает кнопки при изменениях DOM ────────────
    // (после undo/redo, переключения HTML-режима, вставки контента)
    useEffect(() => {
        if (!editorRef.current) return;

        let debounceId: ReturnType<typeof setTimeout>;

        const restoreImages = () => {
            if (!editorRef.current) return;

            editorRef.current.querySelectorAll('img').forEach((img) => {
                const imgEl = img as HTMLImageElement;

                // Если изображение не в .rte-image — инициализируем полностью
                if (!imgEl.parentElement?.classList.contains('rte-image')) {
                    initializeImage(imgEl);
                    return;
                }

                // Если обёртка есть, но нет кнопки — восстанавливаем только кнопку
                const container = imgEl.parentElement as HTMLElement;
                if (!container.querySelector('.image-settings-button')) {
                    createImageEditButton(imgEl);
                }
            });
        };

        const observer = new MutationObserver((mutations) => {
            let hasNewImages = false;
            for (const mutation of mutations) {
                if (mutation.type !== 'childList') continue;
                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== Node.ELEMENT_NODE) continue;
                    const el = node as Element;
                    if (el.tagName === 'IMG' || el.querySelector?.('img')) {
                        hasNewImages = true;
                        break;
                    }
                }
                if (hasNewImages) break;
            }
            if (!hasNewImages) return;

            clearTimeout(debounceId);
            debounceId = setTimeout(restoreImages, 150);
        });

        observer.observe(editorRef.current, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            clearTimeout(debounceId);
        };
    }, [initializeImage, createImageEditButton]);

    // ── Keyboard shortcuts + Delete/Backspace для изображений ─────────────────
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isActive) return;

            const isCtrl = e.ctrlKey || e.metaKey;

            // ── Delete / Backspace ───────────────────────────────────────────────
            // Правило: картинка удаляется ТОЛЬКО в двух случаях:
            //  1. Выделение (не-collapsed) явно охватывает .rte-image обёртку.
            //  2. Курсор стоит в .image-edit-area ТОЧНО на границе, смежной с картинкой
            //     (offset 0 при Backspace / конец при Delete), либо область пустая.
            // В остальных случаях браузер обрабатывает нажатие сам (удаляет символ).
            if ((e.key === 'Delete' || e.key === 'Backspace') && !isCtrl) {
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0) return;

                const range = selection.getRangeAt(0);
                const isBackspace = e.key === 'Backspace';
                let imgToDelete: HTMLImageElement | null = null;

                /** Проверяет, стоит ли граница range точно на краю элемента. */
                const isCursorAtEdge = (r: Range, el: Element, edge: 'start' | 'end'): boolean => {
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
                    // Есть выделение — ищем .rte-image img внутри фрагмента
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
                    // Курсор (collapsed)
                    const anchorNode = range.startContainer;
                    const anchorEl = (
                        anchorNode.nodeType === Node.TEXT_NODE
                            ? anchorNode.parentElement
                            : anchorNode
                    ) as Element | null;

                    if (anchorEl && editorRef.current?.contains(anchorEl)) {
                        // Случай A: курсор попал внутрь .rte-image (не должно, но страховка)
                        const rteWrapper = anchorEl.closest('.rte-image');
                        if (rteWrapper) {
                            imgToDelete = rteWrapper.querySelector('img');
                        }

                        // Случай B: курсор в .image-edit-area на границе с картинкой
                        if (!imgToDelete) {
                            const editArea = anchorEl.closest('.image-edit-area') as HTMLElement | null;
                            if (editArea) {
                                const areaIsEmpty = !editArea.textContent?.trim();

                                if (isBackspace) {
                                    if (areaIsEmpty || isCursorAtEdge(range, editArea, 'start')) {
                                        const prev = editArea.previousElementSibling;
                                        if (prev?.classList.contains('rte-image')) {
                                            imgToDelete = prev.querySelector('img');
                                        }
                                    }
                                } else {
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

                if (imgToDelete) {
                    e.preventDefault();

                    const rteWrapper = imgToDelete.closest('.rte-image');
                    const prevArea = rteWrapper?.previousElementSibling ?? null;
                    const nextArea = rteWrapper?.nextElementSibling ?? null;

                    removeImageCompletely(imgToDelete);

                    // Ставим курсор в соседнюю область
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
                    case 'b': e.preventDefault(); execCommand('bold'); break;
                    case 'i': e.preventDefault(); execCommand('italic'); break;
                    case 'u': e.preventDefault(); execCommand('underline'); break;
                    case 'k': e.preventDefault(); handleInsertLink(); break;
                    case 's': e.preventDefault(); handleInput(); break;
                }
            }
        };

        const currentEditor = editorRef.current;
        if (currentEditor) {
            currentEditor.addEventListener('keydown', handleKeyDown);
            return () => currentEditor.removeEventListener('keydown', handleKeyDown);
        }
    }, [isActive, execCommand, handleInsertLink, handleInput]);

    // ── Image upload ───────────────────────────────────────────────────────────
    const {
        fileInputRef,
        handleImageButtonClick,
        handleImageUpload,
        isUploading: isImageUploading,
    } = useImageHandlers({
        isActive,
        handleInput,
        handleEditImage,
        initializeImageResize: initializeImage,
        editorRef,
    });

    // ── Paste ──────────────────────────────────────────────────────────────────
    const handlePaste = useCallback(
        (e: React.ClipboardEvent<HTMLDivElement>) => {
            if (!editorRef.current || !isActive) return;
            // В HTML-режиме не вмешиваемся — пользователь редактирует исходник
            if (isHtmlMode) return;

            e.preventDefault();

            const clipboardData = e.clipboardData || (window as any).clipboardData;
            const rawHtml = clipboardData.getData('text/html');

            let pastedHtml: string;

            if (rawHtml) {
                // HTML из Word, Google Docs, браузера:
                // 1. cleanPastedHtml — убираем MSO-мусор, нормализуем теги, &nbsp;
                // 2. sanitizeHtml(stripTextStyles) — DOMPurify + снимаем inline-стили
                const preClean = cleanPastedHtml(rawHtml);
                pastedHtml = sanitizeHtml(preClean, false, { stripTextStyles: true });
            } else {
                // Fallback: plain text
                const text = clipboardData.getData('text/plain');
                if (!text) return;
                // Каждая непустая строка → отдельный <p>
                pastedHtml = convertPlainTextToHtml(text);
            }

            document.execCommand('insertHTML', false, pastedHtml);
            handleInputDeferred();
        },
        [isActive, isHtmlMode, handleInputDeferred],
    );

    // ── Click handler ──────────────────────────────────────────────────────────
    const handleEditorClick = useCallback((e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (
            target.classList.contains('image-settings-button') ||
            target.closest('.image-settings-button')
        ) {
            e.stopPropagation();
        }
    }, []);

    const handleFocus = useCallback(() => {}, []);

    // ── Menu openers ───────────────────────────────────────────────────────────
    const openVideoMenu = useCallback(
        (e: React.MouseEvent<HTMLElement>) => setVideoAnchorEl(e.currentTarget),
        [setVideoAnchorEl],
    );
    const openColorMenu = useCallback(
        (e: React.MouseEvent<HTMLElement>) => setColorAnchorEl(e.currentTarget),
        [setColorAnchorEl],
    );
    const openTableMenu = useCallback(
        (e: React.MouseEvent<HTMLElement>) => setTableAnchorEl(e.currentTarget),
        [setTableAnchorEl],
    );
    const openTemplatesMenu = useCallback(
        (e: React.MouseEvent<HTMLElement>) => setTemplatesAnchorEl(e.currentTarget),
        [],
    );

    // ── Render ─────────────────────────────────────────────────────────────────
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
                        onHtmlToggle={toggleHtmlMode}
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

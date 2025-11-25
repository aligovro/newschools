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
    const editorAccessLevel = isAdvanced ? 'admin' : 'user';

    // Refs
    const editorRef = useRef<HTMLDivElement>(null);
    const createResizeHandlesRef = useRef<
        ((img: HTMLImageElement) => void) | null
    >(null);
    const handleImageResizeRef = useRef<
        ((img: HTMLImageElement) => () => void) | null
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
        createResizeHandlesRef,
        handleImageResizeRef,
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

        // Проверяем, кликнули ли на маркеры ресайза или кнопку настроек
        if (
            target.classList.contains('resize-handle') ||
            target.classList.contains('corner-handle') ||
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

        // Получаем текущие настройки изображения
        const currentWidth = parseInt(img.style.width) || img.width || 100;
        const currentHeight = parseInt(img.style.height) || img.height || 100;
        const currentAlt = img.alt || '';
        const currentTitle = img.title || '';
        const currentMargin = parseInt(img.style.margin) || 16;
        const currentBorder = parseInt(img.style.borderWidth) || 0;

        // Определяем выравнивание
        let align = 'none';
        if (img.style.float === 'left') align = 'left';
        else if (img.style.float === 'right') align = 'right';
        else if (img.style.textAlign === 'center') align = 'center';

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
    const { createResizeHandles, handleImageResize, initializeImageResize } =
        useImageResizing({
            handleEditImage,
        });

    // Обновляем refs для функций работы с изображениями
    useEffect(() => {
        createResizeHandlesRef.current = createResizeHandles;
        handleImageResizeRef.current = handleImageResize;
        initializeImageResizeRef.current = initializeImageResize;
    }, [createResizeHandles, handleImageResize, initializeImageResize]);

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

        // Применяем новые настройки
        editingImage.style.width = `${imageSettings.width}px`;
        editingImage.style.height = `${imageSettings.height}px`;
        editingImage.style.marginTop = `${imageSettings.margin}px`;
        editingImage.style.marginBottom = `${imageSettings.margin}px`;
        editingImage.style.borderWidth = `${imageSettings.border}px`;
        editingImage.style.borderStyle =
            imageSettings.border > 0 ? 'solid' : 'none';
        editingImage.style.borderColor = '#ddd';
        editingImage.alt = imageSettings.alt;
        editingImage.title = imageSettings.title;

        // Применяем выравнивание через CSS классы
        editingImage.className = editingImage.className.replace(
            /image-align-\w+/g,
            '',
        );
        editingImage.classList.add(`image-align-${imageSettings.align}`);

        // Применяем стили обтекания к контейнеру изображения
        const container = editingImage.parentElement;
        if (container && container.classList.contains('rte-image')) {
            if (imageSettings.align === 'left') {
                container.style.float = 'left';
                container.style.marginRight = `${imageSettings.margin}px`;
                container.style.marginLeft = '';
                container.style.marginBottom = '16px';
                editingImage.style.float = 'none';
                editingImage.style.marginRight = '';
                editingImage.style.marginLeft = '';
            } else if (imageSettings.align === 'right') {
                container.style.float = 'right';
                container.style.marginLeft = `${imageSettings.margin}px`;
                container.style.marginRight = '';
                container.style.marginBottom = '16px';
                editingImage.style.float = 'none';
                editingImage.style.marginRight = '';
                editingImage.style.marginLeft = '';
            } else if (imageSettings.align === 'center') {
                container.style.float = 'none';
                container.style.display = 'block';
                container.style.marginLeft = 'auto';
                container.style.marginRight = 'auto';
                container.style.marginBottom = '16px';
                editingImage.style.float = 'none';
                editingImage.style.display = 'inline-block';
                editingImage.style.marginLeft = '';
                editingImage.style.marginRight = '';
            } else {
                container.style.float = 'none';
                container.style.display = 'inline-block';
                container.style.marginLeft = '';
                container.style.marginRight = '';
                editingImage.style.float = 'none';
                editingImage.style.display = 'inline-block';
                editingImage.style.marginLeft = '';
                editingImage.style.marginRight = '';
            }
        }

        handleInput();
        setImageEditDialogOpen(false);
        setEditingImage(null);
    }, [editingImage, imageSettings, handleInput]);

    // Инициализация существующих изображений при загрузке контента
    useEffect(() => {
        if (!editorRef.current || !isReady) return;

        const timeoutId = setTimeout(() => {
            if (!editorRef.current) return;

            const images = editorRef.current.querySelectorAll('img');

            images.forEach((img) => {
                const imgElement = img as HTMLImageElement;

                if (!imgElement.src || !imgElement.complete) return;

                // Проверяем, является ли изображение SVG - для SVG не применяем ресайз
                const urlPath = imgElement.src.split('?')[0];
                const isSvg =
                    urlPath.toLowerCase().endsWith('.svg') ||
                    imgElement.src
                        .toLowerCase()
                        .startsWith('data:image/svg+xml');
                if (isSvg) {
                    // Убеждаемся, что у SVG нет класса resizable
                    imgElement.classList.remove('resizable');
                    return; // Пропускаем SVG
                }

                const container = imgElement.parentElement;
                const existingHandles = container?.querySelectorAll(
                    '.resize-handle, .corner-handle, .image-settings-button',
                );
                const hasHandles =
                    existingHandles && existingHandles.length >= 9;

                if (!hasHandles) {
                    // Добавляем класс resizable только для не-SVG изображений
                    imgElement.classList.add('resizable');

                    if (
                        !imgElement.parentElement?.classList.contains(
                            'rte-image',
                        )
                    ) {
                        const newContainer = document.createElement('span');
                        newContainer.className = 'rte-image';
                        newContainer.style.display = 'inline-block';
                        newContainer.style.position = 'relative';
                        newContainer.style.userSelect = 'none';
                        newContainer.setAttribute('contenteditable', 'false');
                        newContainer.setAttribute('draggable', 'false');

                        imgElement.parentNode?.insertBefore(
                            newContainer,
                            imgElement,
                        );
                        newContainer.appendChild(imgElement);
                    }

                    if (initializeImageResizeRef.current) {
                        initializeImageResizeRef.current(imgElement);
                    }

                    if (!(imgElement as any).__hasDblClickHandler) {
                        imgElement.addEventListener('dblclick', (e) => {
                            e.stopPropagation();
                            handleEditImage(imgElement);
                        });
                        (imgElement as any).__hasDblClickHandler = true;
                    }
                } else {
                    if (!(imgElement as any).__cleanupResize) {
                        const cleanupResize = handleImageResize(imgElement);
                        (imgElement as any).__cleanupResize = cleanupResize;
                    }

                    if (!(imgElement as any).__hasDblClickHandler) {
                        imgElement.addEventListener('dblclick', (e) => {
                            e.stopPropagation();
                            handleEditImage(imgElement);
                        });
                        (imgElement as any).__hasDblClickHandler = true;
                    }

                    const settingsButton = container?.querySelector(
                        '.image-settings-button',
                    );
                    if (
                        settingsButton &&
                        !(settingsButton as any).__hasClickHandler
                    ) {
                        settingsButton.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditImage(imgElement);
                        });
                        settingsButton.addEventListener('mousedown', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        });
                        (settingsButton as any).__hasClickHandler = true;
                    }
                }
            });
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [value, isReady, handleEditImage, handleImageResize]);

    // Единый MutationObserver для проверки и восстановления маркеров ресайза
    useEffect(() => {
        if (!editorRef.current) return;

        let timeoutId: NodeJS.Timeout;

        const checkAndRestoreHandles = () => {
            if (!editorRef.current) return;

            const images = editorRef.current.querySelectorAll('img.resizable');
            images.forEach((img) => {
                const imgElement = img as HTMLImageElement;

                if (!imgElement.src || !imgElement.complete) return;

                // Проверяем, является ли изображение SVG - для SVG не применяем ресайз
                const urlPath = imgElement.src.split('?')[0];
                const isSvg =
                    urlPath.toLowerCase().endsWith('.svg') ||
                    imgElement.src
                        .toLowerCase()
                        .startsWith('data:image/svg+xml');
                if (isSvg) {
                    // Удаляем класс resizable у SVG, если он был добавлен по ошибке
                    imgElement.classList.remove('resizable');
                    return; // Пропускаем SVG
                }

                const container = imgElement.parentElement as HTMLElement;
                if (!container) return;

                const existingHandles = container.querySelectorAll(
                    '.resize-handle, .corner-handle, .image-settings-button',
                );

                if (existingHandles.length < 9) {
                    if (createResizeHandlesRef.current) {
                        createResizeHandlesRef.current(imgElement);
                    }

                    setTimeout(() => {
                        if (
                            !(imgElement as any).__cleanupResize &&
                            handleImageResizeRef.current
                        ) {
                            const cleanupResize =
                                handleImageResizeRef.current(imgElement);
                            (imgElement as any).__cleanupResize = cleanupResize;
                        }
                    }, 100);
                }
            });
        };

        const debouncedCheck = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(checkAndRestoreHandles, 200);
        };

        const observer = new MutationObserver((mutations) => {
            let needsCheck = false;

            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.removedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const element = node as Element;
                            if (
                                element.tagName === 'IMG' &&
                                element.classList.contains('resizable')
                            ) {
                                if ((element as any).__cleanupResize) {
                                    (element as any).__cleanupResize();
                                    delete (element as any).__cleanupResize;
                                }
                            }
                            const images =
                                element.querySelectorAll?.('img.resizable');
                            images?.forEach((img) => {
                                if ((img as any).__cleanupResize) {
                                    (img as any).__cleanupResize();
                                    delete (img as any).__cleanupResize;
                                }
                            });
                        }
                    });

                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const element = node as Element;
                            if (
                                element.tagName === 'IMG' ||
                                element.querySelector?.('img')
                            ) {
                                needsCheck = true;
                            }
                        }
                    });
                } else if (mutation.type === 'attributes') {
                    const target = mutation.target as Element;
                    if (
                        target.tagName === 'IMG' &&
                        target.classList.contains('resizable')
                    ) {
                        needsCheck = true;
                    }
                }
            });

            if (needsCheck) {
                debouncedCheck();
            }
        });

        observer.observe(editorRef.current, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style'],
        });

        return () => {
            observer.disconnect();
            clearTimeout(timeoutId);
        };
    }, [createResizeHandles, handleImageResize]);

    // Обработка клавиатурных сокращений и удаления изображений
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isActive) return;

            const isCtrl = e.ctrlKey || e.metaKey;

            // Обработка Delete/Backspace для удаления изображений
            if ((e.key === 'Delete' || e.key === 'Backspace') && !isCtrl) {
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    let imgToDelete: HTMLImageElement | null = null;

                    // Проверяем, выделено ли изображение напрямую
                    if (!range.collapsed) {
                        // Выделен диапазон - проверяем, содержит ли он изображение
                        const startNode = range.startContainer;
                        const endNode = range.endContainer;

                        // Проверяем начальный и конечный узлы
                        const checkNodeForImage = (
                            node: Node,
                        ): HTMLImageElement | null => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                const element = node as Element;
                                if (element.tagName === 'IMG') {
                                    return element as HTMLImageElement;
                                }
                                const img = element.querySelector('img');
                                if (img) return img;

                                // Проверяем, является ли элемент .rte-image оберткой
                                if (element.classList.contains('rte-image')) {
                                    const img = element.querySelector('img');
                                    if (img) return img;
                                }
                            }
                            // Проверяем родительские элементы
                            let parent = node.parentElement;
                            while (parent && parent !== editorRef.current) {
                                if (parent.tagName === 'IMG') {
                                    return parent as HTMLImageElement;
                                }
                                const img = parent.querySelector('img');
                                if (img) return img;

                                // Проверяем, является ли родитель .rte-image оберткой
                                if (parent.classList.contains('rte-image')) {
                                    const img = parent.querySelector('img');
                                    if (img) return img;
                                }
                                parent = parent.parentElement;
                            }
                            return null;
                        };

                        imgToDelete =
                            checkNodeForImage(startNode) ||
                            checkNodeForImage(endNode);

                        // Также проверяем содержимое диапазона
                        if (!imgToDelete) {
                            const contents = range.cloneContents();
                            const img = contents.querySelector('img');
                            if (img) {
                                // Находим соответствующее изображение в DOM
                                const imgSrc = img.getAttribute('src');
                                if (imgSrc && editorRef.current) {
                                    const allImages =
                                        editorRef.current.querySelectorAll(
                                            'img',
                                        );
                                    for (const domImg of allImages) {
                                        if (
                                            domImg.getAttribute('src') ===
                                            imgSrc
                                        ) {
                                            imgToDelete = domImg;
                                            break;
                                        }
                                    }
                                }
                            }

                            // Также проверяем, выделена ли .rte-image обертка
                            if (!imgToDelete) {
                                const rteImageWrapper =
                                    contents.querySelector('.rte-image');
                                if (rteImageWrapper) {
                                    const img =
                                        rteImageWrapper.querySelector('img');
                                    if (img && editorRef.current) {
                                        // Находим соответствующее изображение в DOM
                                        const imgSrc = img.getAttribute('src');
                                        if (imgSrc) {
                                            const allImages =
                                                editorRef.current.querySelectorAll(
                                                    'img',
                                                );
                                            for (const domImg of allImages) {
                                                if (
                                                    domImg.getAttribute(
                                                        'src',
                                                    ) === imgSrc
                                                ) {
                                                    imgToDelete = domImg;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        // Курсор находится в тексте - проверяем соседние элементы
                        const container = range.commonAncestorContainer;
                        const node =
                            container.nodeType === Node.TEXT_NODE
                                ? container.parentElement
                                : (container as Element);

                        if (node && editorRef.current) {
                            // Если курсор находится в .image-edit-area, проверяем соседние .rte-image
                            if (node.classList?.contains('image-edit-area')) {
                                const direction =
                                    e.key === 'Delete' ? 'next' : 'prev';
                                const sibling =
                                    direction === 'next'
                                        ? node.nextElementSibling
                                        : node.previousElementSibling;

                                if (sibling) {
                                    // Проверяем, является ли соседний элемент .rte-image оберткой
                                    if (
                                        sibling.classList.contains('rte-image')
                                    ) {
                                        const img =
                                            sibling.querySelector('img');
                                        if (img) {
                                            imgToDelete = img;
                                        }
                                    } else if (sibling.tagName === 'IMG') {
                                        imgToDelete =
                                            sibling as HTMLImageElement;
                                    }
                                }
                            }

                            // Также проверяем, находится ли курсор внутри .rte-image обертки
                            const rteImageWrapper =
                                node.closest?.('.rte-image');
                            if (rteImageWrapper && !imgToDelete) {
                                const img =
                                    rteImageWrapper.querySelector('img');
                                if (img) {
                                    // Если курсор внутри обертки, удаляем изображение
                                    imgToDelete = img;
                                }
                            }

                            // Если изображение еще не найдено, ищем в соседних элементах
                            if (!imgToDelete) {
                                // Функция для поиска изображения в соседних элементах
                                const findImageInSiblings = (
                                    startNode: Element,
                                    direction: 'next' | 'prev',
                                ): HTMLImageElement | null => {
                                    let current: Node | null = startNode;
                                    const maxIterations = 10; // Защита от бесконечного цикла
                                    let iterations = 0;

                                    while (
                                        current &&
                                        iterations < maxIterations
                                    ) {
                                        iterations++;
                                        current =
                                            direction === 'next'
                                                ? current.nextSibling
                                                : current.previousSibling;

                                        if (!current) break;

                                        if (
                                            current.nodeType ===
                                            Node.ELEMENT_NODE
                                        ) {
                                            const element = current as Element;

                                            // Пропускаем .image-edit-area
                                            if (
                                                element.classList.contains(
                                                    'image-edit-area',
                                                )
                                            ) {
                                                continue;
                                            }

                                            // Проверяем, является ли элемент изображением
                                            if (element.tagName === 'IMG') {
                                                return element as HTMLImageElement;
                                            }

                                            // Проверяем внутри элемента (может быть .rte-image обертка)
                                            const img =
                                                element.querySelector('img');
                                            if (img) {
                                                return img;
                                            }

                                            // Если это .rte-image обертка, проверяем изображение внутри
                                            if (
                                                element.classList.contains(
                                                    'rte-image',
                                                )
                                            ) {
                                                const img =
                                                    element.querySelector(
                                                        'img',
                                                    );
                                                if (img) return img;
                                            }
                                        }
                                    }

                                    return null;
                                };

                                if (e.key === 'Delete') {
                                    imgToDelete = findImageInSiblings(
                                        node,
                                        'next',
                                    );
                                } else {
                                    imgToDelete = findImageInSiblings(
                                        node,
                                        'prev',
                                    );
                                }
                            }
                        }
                    }

                    // Если найдено изображение, удаляем его
                    if (imgToDelete) {
                        e.preventDefault();

                        // Сохраняем информацию о соседних элементах для установки курсора после удаления
                        const rteImageWrapper =
                            imgToDelete.closest('.rte-image');
                        const nextEditArea =
                            rteImageWrapper?.nextElementSibling;
                        const prevEditArea =
                            rteImageWrapper?.previousElementSibling;

                        removeImageCompletely(imgToDelete);

                        // Устанавливаем курсор в редактируемую область после удаления
                        setTimeout(() => {
                            const selection = window.getSelection();
                            if (selection && editorRef.current) {
                                const range = document.createRange();

                                // Пытаемся установить курсор в следующую редактируемую область
                                if (
                                    nextEditArea &&
                                    nextEditArea.classList.contains(
                                        'image-edit-area',
                                    )
                                ) {
                                    range.setStart(nextEditArea, 0);
                                    range.collapse(true);
                                } else if (
                                    prevEditArea &&
                                    prevEditArea.classList.contains(
                                        'image-edit-area',
                                    )
                                ) {
                                    range.setStart(prevEditArea, 0);
                                    range.collapse(true);
                                } else {
                                    // Если нет редактируемых областей, устанавливаем курсор в конец редактора
                                    const lastChild =
                                        editorRef.current.lastChild;
                                    if (lastChild) {
                                        if (
                                            lastChild.nodeType ===
                                            Node.TEXT_NODE
                                        ) {
                                            range.setStart(
                                                lastChild,
                                                lastChild.textContent?.length ||
                                                    0,
                                            );
                                        } else {
                                            range.setStartAfter(lastChild);
                                        }
                                    } else {
                                        range.setStart(editorRef.current, 0);
                                    }
                                    range.collapse(true);
                                }

                                selection.removeAllRanges();
                                selection.addRange(range);
                            }
                        }, 0);

                        handleInput();
                        return;
                    }
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
        editorAccessLevel,
        handleInput,
        handleEditImage,
        handleImageResize,
        createResizeHandles,
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

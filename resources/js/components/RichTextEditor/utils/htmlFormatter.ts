/**
 * Утилиты для форматирования HTML
 * Вынесены в отдельный файл для переиспользования и тестирования
 */

import { sanitizeHtml } from '@/utils/htmlSanitizer';

/**
 * Форматирует HTML с отступами для читаемости
 * @param html - HTML строка для форматирования
 * @returns Отформатированная HTML строка
 */
export const formatHtml = (html: string): string => {
    let formatted = html;
    let indent = 0;
    const indentSize = 2;

    formatted = formatted
        .replace(/></g, '>\n<') // Переносы между тегами
        .replace(/\n\s*\n/g, '\n') // Убираем пустые строки
        .split('\n')
        .map((line) => {
            const trimmed = line.trim();
            if (!trimmed) return '';

            // Уменьшаем отступ для закрывающих тегов
            if (trimmed.startsWith('</')) {
                indent = Math.max(0, indent - indentSize);
            }

            const indentedLine = ' '.repeat(indent) + trimmed;

            // Увеличиваем отступ для открывающих тегов (кроме самозакрывающихся)
            if (
                trimmed.startsWith('<') &&
                !trimmed.startsWith('</') &&
                !trimmed.endsWith('/>')
            ) {
                indent += indentSize;
            }

            return indentedLine;
        })
        .filter((line) => line.trim() !== '') // Убираем пустые строки
        .join('\n');

    return formatted;
};

/**
 * Очищает HTML контент от служебных элементов редактора
 * Удаляет все служебные элементы и оставляет только чистый контент с изображениями
 * Также санитизирует HTML для закрытия незакрытых тегов и валидации структуры
 * @param html - HTML строка для очистки
 * @param isAdmin - является ли пользователь админом (влияет на разрешенные теги)
 * @returns Очищенная и санитизированная HTML строка
 */
export const cleanContentForOutput = (
    html: string,
    isAdmin: boolean = false,
): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // 1. Удаляем все элементы ресайза и иконку редактирования
    const elementsToRemove = tempDiv.querySelectorAll(
        '.resize-handle, .corner-handle, .image-settings-button',
    );
    elementsToRemove.forEach((element) => element.remove());

    // 2. Обрабатываем обертки rte-image - извлекаем изображения и удаляем обертки
    // ВАЖНО: Делаем это ДО обработки .image-edit-area, чтобы сохранить соседние элементы
    const rteImageWrappers = Array.from(tempDiv.querySelectorAll('.rte-image'));
    rteImageWrappers.forEach((wrapper) => {
        const img = wrapper.querySelector('img');
        if (img) {
            // Создаем новое чистое изображение
            const cleanImg = document.createElement('img');

            // Копируем только важные атрибуты изображения
            const importantAttributes = [
                'src',
                'alt',
                'title',
                'width',
                'height',
                'loading',
                'decoding',
            ];
            importantAttributes.forEach((attrName) => {
                const value = img.getAttribute(attrName);
                if (value !== null) {
                    cleanImg.setAttribute(attrName, value);
                }
            });

            // Копируем data-атрибуты (если есть)
            Array.from(img.attributes).forEach((attr) => {
                if (attr.name.startsWith('data-')) {
                    cleanImg.setAttribute(attr.name, attr.value);
                }
            });

            // Обрабатываем стили изображения и обертки
            const imgStyle = img.style;
            const wrapperStyle = (wrapper as HTMLElement).style;
            const cleanStyle: string[] = [];

            // Проверяем, является ли изображение SVG
            const imgSrc = img.getAttribute('src') || '';
            const isSvg =
                imgSrc.toLowerCase().endsWith('.svg') ||
                imgSrc.toLowerCase().includes('data:image/svg+xml');

            // Ширина и высота - приоритет изображению
            // Для SVG не сохраняем размеры, если они не были явно заданы пользователем
            // (SVG масштабируются автоматически)
            if (!isSvg) {
                // Для растровых изображений сохраняем размеры
                if (imgStyle.width) cleanStyle.push(`width: ${imgStyle.width}`);
                else if (wrapperStyle.width)
                    cleanStyle.push(`width: ${wrapperStyle.width}`);

                if (imgStyle.height)
                    cleanStyle.push(`height: ${imgStyle.height}`);
                else if (wrapperStyle.height)
                    cleanStyle.push(`height: ${wrapperStyle.height}`);
            } else {
                // Для SVG не сохраняем размеры из стилей - они масштабируются автоматически
                // SVG должны загружаться как есть, без принудительных размеров
            }

            // Выравнивание - приоритет обертке (float для left/right, display для center)
            // ВАЖНО: Сохраняем float для обтекания текстом
            // Для SVG сохраняем выравнивание только если оно было явно задано
            const hasAlignment =
                wrapperStyle.float ||
                imgStyle.float ||
                (wrapperStyle.display === 'block' &&
                    (wrapperStyle.marginLeft === 'auto' ||
                        wrapperStyle.marginRight === 'auto'));

            if (!isSvg || hasAlignment) {
                if (wrapperStyle.float) {
                    cleanStyle.push(`float: ${wrapperStyle.float}`);
                } else if (imgStyle.float) {
                    cleanStyle.push(`float: ${imgStyle.float}`);
                }

                // Display - для центрирования
                if (
                    wrapperStyle.display === 'block' &&
                    (wrapperStyle.marginLeft === 'auto' ||
                        wrapperStyle.marginRight === 'auto')
                ) {
                    cleanStyle.push(`display: block`);
                    cleanStyle.push(`margin-left: auto`);
                    cleanStyle.push(`margin-right: auto`);
                } else if (
                    wrapperStyle.display &&
                    wrapperStyle.display !== 'inline-block'
                ) {
                    cleanStyle.push(`display: ${wrapperStyle.display}`);
                } else if (
                    imgStyle.display &&
                    imgStyle.display !== 'inline-block' &&
                    imgStyle.display !== 'block'
                ) {
                    cleanStyle.push(`display: ${imgStyle.display}`);
                }
            }

            // Отступы - объединяем из обертки и изображения, избегая дублирования
            // ВАЖНО: При float left/right отступы на обертке критичны для обтекания
            // Приоритет: обертка для выравнивания (margin-right для left, margin-left для right, margin-bottom)
            // Для SVG сохраняем отступы только если они были явно заданы (не автоматические)
            const getMarginValue = (
                wrapperValue: string,
                imgValue: string,
            ): string => {
                return wrapperValue || imgValue || '';
            };

            const marginTop = getMarginValue(
                wrapperStyle.marginTop,
                imgStyle.marginTop,
            );
            const marginBottom = getMarginValue(
                wrapperStyle.marginBottom,
                imgStyle.marginBottom,
            );
            const marginLeft = getMarginValue(
                wrapperStyle.marginLeft,
                imgStyle.marginLeft,
            );
            const marginRight = getMarginValue(
                wrapperStyle.marginRight,
                imgStyle.marginRight,
            );

            // Используем отдельные отступы (важно для центрирования с auto и обтекания)
            // ВАЖНО: Сохраняем все отступы для правильного обтекания текстом
            // Для SVG: сохраняем только если они были явно заданы (float предполагает необходимость отступов)
            if (!isSvg || wrapperStyle.float || imgStyle.float) {
                // Для растровых или SVG с выравниванием сохраняем отступы
                if (marginTop) cleanStyle.push(`margin-top: ${marginTop}`);
                if (marginBottom)
                    cleanStyle.push(`margin-bottom: ${marginBottom}`);
                if (marginLeft) cleanStyle.push(`margin-left: ${marginLeft}`);
                if (marginRight)
                    cleanStyle.push(`margin-right: ${marginRight}`);
            }

            // Границы - только из изображения, и только если есть border
            const borderWidth = imgStyle.borderWidth
                ? parseInt(imgStyle.borderWidth, 10)
                : 0;
            if (borderWidth > 0) {
                cleanStyle.push(`border-width: ${imgStyle.borderWidth}`);
                if (imgStyle.borderStyle)
                    cleanStyle.push(`border-style: ${imgStyle.borderStyle}`);
                if (imgStyle.borderColor)
                    cleanStyle.push(`border-color: ${imgStyle.borderColor}`);
            }

            // Применяем очищенные стили
            if (cleanStyle.length > 0) {
                cleanImg.style.cssText = cleanStyle.join('; ');
            }

            // Заменяем обертку на чистое изображение
            // ВАЖНО: Это сохраняет соседние элементы (включая .image-edit-area с текстом)
            wrapper.parentNode?.replaceChild(cleanImg, wrapper);
        } else {
            // Если изображения нет, просто удаляем обертку
            wrapper.remove();
        }
    });

    // 3. Обрабатываем элементы image-edit-area - сохраняем контент, если он есть
    const editAreas = Array.from(tempDiv.querySelectorAll('.image-edit-area'));
    editAreas.forEach((editAreaElement) => {
        const editArea = editAreaElement as HTMLElement;
        // Проверяем, есть ли реальный контент (не только <br> или пусто)
        const innerHTML = editArea.innerHTML.trim();
        const textContent = editArea.textContent?.trim() || '';

        // Нормализуем innerHTML для проверки (убираем пробелы и переносы строк)
        const normalizedHTML = innerHTML.replace(/\s+/g, ' ').trim();

        // Проверяем, есть ли реальный контент:
        // 1. innerHTML не пустой
        // 2. innerHTML не только <br> (разные варианты, включая <div><br></div>)
        // 3. textContent не пустой (есть реальный текст)
        const isEmptyBr =
            normalizedHTML === '<br>' ||
            normalizedHTML === '<br/>' ||
            normalizedHTML === '<br />' ||
            normalizedHTML === '<div><br></div>' ||
            normalizedHTML === '<div><br/></div>' ||
            normalizedHTML === '<div><br /></div>';

        const hasRealContent =
            innerHTML && !isEmptyBr && textContent.length > 0;

        if (hasRealContent) {
            // "Разворачиваем" div - заменяем его содержимым для лучшего обтекания
            // Это позволяет тексту быть напрямую рядом с изображением
            const parent = editArea.parentElement;
            if (parent) {
                // Создаем DocumentFragment для содержимого
                const fragment = document.createDocumentFragment();

                // Перемещаем все дочерние узлы в fragment
                while (editArea.firstChild) {
                    fragment.appendChild(editArea.firstChild);
                }

                // Заменяем editArea на его содержимое
                parent.insertBefore(fragment, editArea);
                editArea.remove();
            } else {
                // Если нет родителя, просто очищаем служебные атрибуты
                editArea.classList.remove('image-edit-area');
                editArea.removeAttribute('contenteditable');
                editArea.removeAttribute('draggable');
                editArea.style.removeProperty('min-height');
                editArea.style.removeProperty('cursor');
                if (!editArea.style.cssText.trim()) {
                    editArea.removeAttribute('style');
                }
            }
        } else {
            // Если контента нет (только <br> или пусто), удаляем элемент
            editArea.remove();
        }
    });

    // 4. Разворачиваем простые div'ы с текстом для лучшего обтекания
    // Это позволяет тексту быть напрямую рядом с изображениями
    const simpleTextDivs = Array.from(tempDiv.querySelectorAll('div'));
    simpleTextDivs.forEach((div) => {
        // Пропускаем div'ы с важными классами, атрибутами или вложенными блоками
        if (div.className || div.id || div.getAttribute('style')) {
            return;
        }

        // Проверяем, содержит ли div только текстовые узлы или inline-элементы
        const hasBlockElements = Array.from(div.children).some((child) => {
            const tagName = child.tagName.toLowerCase();
            return [
                'div',
                'p',
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'ul',
                'ol',
                'li',
                'table',
                'blockquote',
            ].includes(tagName);
        });

        if (!hasBlockElements) {
            // Разворачиваем div - заменяем его содержимым
            const parent = div.parentElement;
            if (parent) {
                const fragment = document.createDocumentFragment();
                while (div.firstChild) {
                    fragment.appendChild(div.firstChild);
                }
                parent.insertBefore(fragment, div);
                div.remove();
            }
        }
    });

    // 5. Очищаем пустые div'ы, которые могли остаться (например, <div><br></div>)
    // Делаем несколько проходов, так как после удаления одних div'ов могут появиться новые пустые
    let hasChanges = true;
    let iterations = 0;
    const maxIterations = 5; // Защита от бесконечного цикла

    while (hasChanges && iterations < maxIterations) {
        hasChanges = false;
        iterations++;

        const allDivs = Array.from(tempDiv.querySelectorAll('div'));
        allDivs.forEach((div) => {
            // Пропускаем div'ы с важными классами или атрибутами
            if (div.className || div.id || div.getAttribute('style')) {
                return;
            }

            const innerHTML = div.innerHTML.trim();
            const textContent = div.textContent?.trim() || '';
            const normalizedHTML = innerHTML.replace(/\s+/g, ' ').trim();

            // Проверяем, является ли div пустым или содержит только <br>
            const isEmptyBr =
                !innerHTML ||
                (!textContent &&
                    (normalizedHTML === '<br>' ||
                        normalizedHTML === '<br/>' ||
                        normalizedHTML === '<br />' ||
                        normalizedHTML === '<div><br></div>' ||
                        normalizedHTML === '<div><br/></div>' ||
                        normalizedHTML === '<div><br /></div>'));

            // Удаляем пустые div'ы без важных атрибутов
            if (isEmptyBr) {
                div.remove();
                hasChanges = true;
            }
        });
    }

    // 6. Очищаем служебные классы и атрибуты у всех оставшихся изображений
    const allImages = tempDiv.querySelectorAll('img');
    allImages.forEach((element) => {
        const img = element as HTMLImageElement;

        // Удаляем служебные классы
        img.classList.remove('resizable');

        // Удаляем служебные атрибуты
        img.removeAttribute('draggable');

        // Очищаем служебные стили, сохраняя важные
        const style = img.style;
        if (style.userSelect) style.removeProperty('user-select');

        const webkitStyle = style as CSSStyleDeclaration & {
            webkitUserDrag?: string;
            webkitUserSelect?: string;
            mozUserSelect?: string;
            msUserSelect?: string;
        };
        if (webkitStyle.webkitUserDrag)
            style.removeProperty('-webkit-user-drag');
        if (webkitStyle.webkitUserSelect)
            style.removeProperty('-webkit-user-select');
        if (webkitStyle.mozUserSelect) style.removeProperty('-moz-user-select');
        if (webkitStyle.msUserSelect) style.removeProperty('-ms-user-select');
    });

    // 7. Получаем очищенный HTML
    let cleanedHtml = tempDiv.innerHTML;

    // 8. Санитизируем HTML через DOMPurify для:
    //    - Закрытия незакрытых тегов (DOMPurify автоматически закрывает их)
    //    - Удаления опасных тегов и атрибутов
    //    - Валидации структуры HTML
    //    - Защиты от XSS атак
    cleanedHtml = sanitizeHtml(cleanedHtml, isAdmin);

    return cleanedHtml;
};

/**
 * Полностью удаляет изображение и все связанные с ним элементы из DOM
 * Удаляет: само изображение, обертку .rte-image, элементы ресайза, .image-edit-area и т.д.
 * @param img - HTMLImageElement для удаления
 * @returns true если изображение было удалено, false если не найдено
 */
export const removeImageCompletely = (
    img: HTMLImageElement | null,
): boolean => {
    if (!img) return false;

    // 1. Очищаем cleanup функцию ресайза, если она есть
    interface ImageWithCleanup extends HTMLImageElement {
        __cleanupResize?: () => void;
    }
    const imgWithCleanup = img as ImageWithCleanup;
    if (imgWithCleanup.__cleanupResize) {
        try {
            imgWithCleanup.__cleanupResize();
        } catch {
            // Игнорируем ошибки при очистке
        }
        delete imgWithCleanup.__cleanupResize;
    }

    // 2. Находим контейнер (может быть .rte-image обертка или родитель)
    const container: HTMLElement | null = img.parentElement;
    const rteImageWrapper: HTMLElement | null = container?.classList.contains(
        'rte-image',
    )
        ? container
        : container?.closest('.rte-image') || null;

    // 3. Удаляем все элементы ресайза и настройки
    // Сначала из контейнера изображения
    if (container) {
        const elementsToRemove = container.querySelectorAll(
            '.resize-handle, .corner-handle, .image-settings-button',
        );
        elementsToRemove.forEach((element) => {
            try {
                element.remove();
            } catch {
                // Игнорируем ошибки
            }
        });
    }

    // Также удаляем из обертки .rte-image, если она есть
    if (rteImageWrapper && rteImageWrapper !== container) {
        const elementsToRemove = rteImageWrapper.querySelectorAll(
            '.resize-handle, .corner-handle, .image-settings-button',
        );
        elementsToRemove.forEach((element) => {
            try {
                element.remove();
            } catch {
                // Игнорируем ошибки
            }
        });
    }

    // 4. Находим и удаляем соседние .image-edit-area элементы
    const elementToRemove = rteImageWrapper || container || img;
    if (elementToRemove.parentElement) {
        // Удаляем предыдущий .image-edit-area
        const prevSibling = elementToRemove.previousElementSibling;
        if (prevSibling && prevSibling.classList.contains('image-edit-area')) {
            try {
                prevSibling.remove();
            } catch {
                // Игнорируем ошибки
            }
        }

        // Удаляем следующий .image-edit-area
        const nextSibling = elementToRemove.nextElementSibling;
        if (nextSibling && nextSibling.classList.contains('image-edit-area')) {
            try {
                nextSibling.remove();
            } catch {
                // Игнорируем ошибки
            }
        }
    }

    // 5. Удаляем само изображение и его обертку
    if (rteImageWrapper) {
        // Удаляем всю обертку .rte-image
        const parent = rteImageWrapper.parentElement;
        if (parent) {
            rteImageWrapper.remove();
            // Если после удаления обертки остался пустой .image-edit-area, удаляем его
            if (parent.classList.contains('image-edit-area')) {
                const remainingContent = parent.innerHTML.trim();
                if (!remainingContent || remainingContent === '<br>') {
                    parent.remove();
                }
            }
        } else {
            rteImageWrapper.remove();
        }
    } else {
        // Удаляем только изображение
        img.remove();
        // Если родитель - .image-edit-area и он пустой, удаляем его тоже
        if (container && container.classList.contains('image-edit-area')) {
            const remainingContent = container.innerHTML.trim();
            if (!remainingContent || remainingContent === '<br>') {
                container.remove();
            }
        }
    }

    return true;
};

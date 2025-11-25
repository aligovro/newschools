import DOMPurify from 'dompurify';

// Конфигурация для санитизации HTML
const SANITIZE_CONFIG = {
    // Разрешенные теги
    ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'b',
        'em',
        'i',
        'u',
        's',
        'strike',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'ul',
        'ol',
        'li',
        'blockquote',
        'hr',
        'a',
        'img',
        'span',
        'div',
        'code',
        'pre',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'iframe', // для видео
    ],

    // Разрешенные атрибуты
    ALLOWED_ATTR: [
        'href',
        'src',
        'alt',
        'title',
        'target',
        'rel',
        'style',
        'class',
        'id',
        'width',
        'height',
        'frameborder',
        'allowfullscreen',
        'allow', // для iframe
    ],

    // Разрешенные протоколы для ссылок
    ALLOWED_URI_REGEXP:
        /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,

    // Разрешенные CSS свойства
    ALLOWED_CSS_PROPERTIES: [
        'color',
        'background-color',
        'font-size',
        'font-weight',
        'font-style',
        'text-align',
        'text-decoration',
        'line-height',
        'margin',
        'padding',
        'border',
        'border-radius',
        'display',
        'position',
        'top',
        'left',
        'width',
        'height',
        'max-width',
        'max-height',
    ],
};

/**
 * Опции санитизации HTML.
 * stripTextStyles: если true — удаляем все inline-стили у текстовых элементов
 * (используем при вставке из буфера), но оставляем стили у img/iframe.
 */
export interface SanitizeHtmlOptions {
    stripTextStyles?: boolean;
}

/**
 * Санитизирует HTML контент, удаляя опасные теги и атрибуты.
 * @param html - HTML строка для санитизации
 * @param isAdmin - является ли пользователь админом (больше разрешений)
 * @param options - дополнительные опции санитизации
 * @returns очищенный HTML
 */
export const sanitizeHtml = (
    html: string,
    isAdmin: boolean = false,
    options: SanitizeHtmlOptions = {},
): string => {
    if (!html) return '';

    // Для админов разрешаем больше тегов/атрибутов
    const config = {
        ...SANITIZE_CONFIG,
        ALLOWED_TAGS: isAdmin
            ? [
                  ...SANITIZE_CONFIG.ALLOWED_TAGS,
                  'script',
                  'style',
                  'object',
                  'embed',
              ]
            : SANITIZE_CONFIG.ALLOWED_TAGS,

        ALLOWED_ATTR: isAdmin
            ? [...SANITIZE_CONFIG.ALLOWED_ATTR, 'onclick', 'onload', 'onerror']
            : SANITIZE_CONFIG.ALLOWED_ATTR,
    };

    // 1. Сначала очищаем HTML с помощью DOMPurify
    let sanitizedHtml = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: config.ALLOWED_TAGS,
        ALLOWED_ATTR: config.ALLOWED_ATTR,
        ALLOWED_URI_REGEXP: config.ALLOWED_URI_REGEXP,
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false,
        SANITIZE_DOM: true,
        KEEP_CONTENT: true,
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        ADD_ATTR: ['target'],
        ADD_TAGS: [],
        FORBID_TAGS: ['script', 'object', 'embed', 'link', 'meta'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
        ADD_URI_SAFE_ATTR: ['src', 'href'],
    });

    // 2. Дополнительно убираем инлайн-стили у текстовых элементов,
    //    если явно запросили это (например, при вставке из буфера обмена).
    //    Стили для img/iframe при этом сохраняем.
    if (options.stripTextStyles && typeof window !== 'undefined') {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(sanitizedHtml, 'text/html');

            doc.body.querySelectorAll<HTMLElement>('[style]').forEach((el) => {
                const tag = el.tagName.toLowerCase();

                // Для текстовых блоков стили не сохраняем вообще
                const textTags = [
                    'p',
                    'span',
                    'strong',
                    'b',
                    'em',
                    'i',
                    'u',
                    's',
                    'strike',
                    'h1',
                    'h2',
                    'h3',
                    'h4',
                    'h5',
                    'h6',
                    'blockquote',
                    'li',
                    'code',
                    'pre',
                    'div',
                ];

                // Стили для изображений и iframe оставляем — ими управляет наш редактор
                if (tag === 'img' || tag === 'iframe') {
                    return;
                }

                // Для всех остальных (включая текстовые элементы) просто убираем style
                if (el.hasAttribute('style')) {
                    el.removeAttribute('style');
                }
            });

            sanitizedHtml = doc.body.innerHTML;
        } catch {
            // В случае ошибки парсинга просто возвращаем результат DOMPurify
        }
    }

    // 2b. Независимо от роли, дополнительно вычищаем font-family из оставшихся style,
    //     чтобы не тянуть шрифты из Word / чужих сайтов.
    if (typeof window !== 'undefined') {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(sanitizedHtml, 'text/html');

            doc.body.querySelectorAll<HTMLElement>('[style]').forEach((el) => {
                const style = el.getAttribute('style') || '';
                if (!style) return;

                const cleaned = style
                    .split(';')
                    .map((rule) => rule.trim())
                    .filter((rule) => {
                        if (!rule) return false;
                        const [prop] = rule.split(':');
                        return (
                            prop && prop.trim().toLowerCase() !== 'font-family'
                        );
                    })
                    .join('; ');

                if (cleaned.trim()) {
                    el.setAttribute('style', cleaned);
                } else {
                    el.removeAttribute('style');
                }
            });

            sanitizedHtml = doc.body.innerHTML;
        } catch {
            // Если что-то пошло не так при парсинге — просто оставляем как есть
        }
    }

    // 3. Дополнительная проверка для iframe (только разрешенные видео домены)
    sanitizedHtml = sanitizedHtml.replace(
        /<iframe[^>]*src="([^"]*)"[^>]*>/gi,
        (match, src) => {
            if (isAllowedVideoUrl(src)) {
                return match;
            } else {
                return ''; // Удаляем неразрешенные iframe
            }
        },
    );

    return sanitizedHtml;
};

/**
 * Проверяет, является ли URL разрешенным для встраивания видео
 */
const isAllowedVideoUrl = (url: string): boolean => {
    const allowedDomains = [
        'youtube.com',
        'youtu.be',
        'vimeo.com',
        'player.vimeo.com',
        'dailymotion.com',
        'twitch.tv',
        'rutube.ru',
    ];

    try {
        const urlObj = new URL(url);
        return allowedDomains.some(
            (domain) =>
                urlObj.hostname.includes(domain) ||
                urlObj.hostname.endsWith(domain),
        );
    } catch {
        return false;
    }
};

/**
 * Очищает CSS стили, оставляя только безопасные свойства
 */
const sanitizeCss = (css: string): string => {
    const allowedProps = SANITIZE_CONFIG.ALLOWED_CSS_PROPERTIES;
    const styles: string[] = [];

    css.split(';').forEach((style) => {
        const [prop, value] = style.split(':').map((s) => s.trim());
        if (prop && value && allowedProps.includes(prop.toLowerCase())) {
            // Дополнительная проверка значений
            if (isSafeCssValue(prop, value)) {
                styles.push(`${prop}: ${value}`);
            }
        }
    });

    return styles.join('; ');
};

/**
 * Проверяет, является ли CSS значение безопасным
 */
const isSafeCssValue = (property: string, value: string): boolean => {
    const lowerProp = property.toLowerCase();
    const lowerValue = value.toLowerCase();

    // Запрещаем javascript: и expression()
    if (
        lowerValue.includes('javascript:') ||
        lowerValue.includes('expression(')
    ) {
        return false;
    }

    // Для URL значений проверяем протоколы
    if (lowerProp.includes('url')) {
        return (
            !lowerValue.includes('javascript:') && !lowerValue.includes('data:')
        );
    }

    return true;
};

/**
 * Проверяет валидность HTML структуры
 */
export const validateHtmlStructure = (
    html: string,
): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!html) return { isValid: true, errors };

    // Проверяем незакрытые теги
    const tagRegex = /<\/?[^>]+>/g;
    const tags: string[] = [];
    let match;

    while ((match = tagRegex.exec(html)) !== null) {
        const tag = match[0];
        const isClosing = tag.startsWith('</');
        const tagName = tag.replace(/<\/?([^\s>]+).*/, '$1').toLowerCase();

        if (isClosing) {
            if (tags.length === 0 || tags[tags.length - 1] !== tagName) {
                errors.push(`Незакрытый тег: ${tagName}`);
            } else {
                tags.pop();
            }
        } else if (
            !['br', 'hr', 'img', 'input', 'meta', 'link'].includes(tagName)
        ) {
            tags.push(tagName);
        }
    }

    // Проверяем оставшиеся незакрытые теги
    if (tags.length > 0) {
        errors.push(`Незакрытые теги: ${tags.join(', ')}`);
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Полная очистка и валидация HTML
 */
export const cleanAndValidateHtml = (
    html: string,
    isAdmin: boolean = false,
): {
    cleaned: string;
    isValid: boolean;
    errors: string[];
} => {
    const validation = validateHtmlStructure(html);
    const cleaned = sanitizeHtml(html, isAdmin);

    return {
        cleaned,
        isValid: validation.isValid,
        errors: validation.errors,
    };
};

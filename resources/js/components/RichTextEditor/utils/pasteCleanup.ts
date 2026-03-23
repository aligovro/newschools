/**
 * Утилиты для очистки HTML при вставке из внешних источников.
 *
 * Pipeline:
 *   1. Regex pre-clean   — удаляем известный Word/Office мусор до парсинга DOM
 *   2. DOM parse         — работаем со структурой
 *   3. Атрибуты          — убираем class, id, lang, xmlns, data-*
 *   4. Теги              — b→strong, i→em, font→unwrap
 *   5. Base64 img        — удаляем (тяжёлые, не наш upload)
 *   6. Пустые обёртки    — span/font без атрибутов разворачиваем
 *   7. &nbsp;            — нормализуем в обычные пробелы
 *   8. Пустые блоки      — убираем пустые <p>/<div>/<h*>
 *
 * После этого пайплайна контент проходит DOMPurify (stripTextStyles: true).
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Тэги, у которых допустимо пустое содержимое (сохраняем структуру). */
const PRESERVE_IF_EMPTY = new Set(['td', 'th', 'li', 'caption', 'br', 'hr']);

/** Проверяет, является ли элемент «фактически пустым» (только пробелы / одиночный br). */
const isEffectivelyEmpty = (el: Element): boolean => {
    const tag = el.tagName.toLowerCase();
    if (PRESERVE_IF_EMPTY.has(tag)) return false;

    const text = (el.textContent ?? '').replace(/\u00A0/g, '').trim();
    if (text.length > 0) return false;

    // Считаем значимые дочерние узлы (не пустые текстовые узлы)
    const meaningful = Array.from(el.childNodes).filter((n) => {
        if (n.nodeType === Node.TEXT_NODE) return (n.textContent ?? '').trim().length > 0;
        if (n.nodeType === Node.ELEMENT_NODE) return (n as Element).tagName !== 'BR';
        return false;
    });

    return meaningful.length === 0;
};

/**
 * Заменяет &nbsp; (U+00A0) на обычные пробелы везде, кроме <pre>/<code>.
 * Word злоупотребляет &nbsp; как заменой пробела и как отступом.
 */
const normalizeNbsp = (root: Element): void => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

    const nodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
        nodes.push(node as Text);
    }

    nodes.forEach((textNode) => {
        // Не трогаем содержимое <pre> и <code>
        let parent = textNode.parentElement;
        while (parent && parent !== root) {
            if (parent.tagName === 'PRE' || parent.tagName === 'CODE') return;
            parent = parent.parentElement;
        }

        const original = textNode.textContent ?? '';
        const cleaned = original
            .replace(/\u00A0{2,}/g, ' ')  // множественные &nbsp; → один пробел
            .replace(/^\u00A0+/g, '')       // &nbsp; в начале узла — это фиктивные отступы
            .replace(/\u00A0+$/g, '')       // &nbsp; в конце узла
            .replace(/\u00A0/g, ' ');       // одиночный &nbsp; → обычный пробел

        if (original !== cleaned) {
            textNode.textContent = cleaned;
        }
    });
};

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Очищает HTML из внешнего источника (Word, Google Docs, любой сайт).
 * Возвращает чистый семантический HTML без мусорных атрибутов и тегов.
 *
 * Вызывается ДО DOMPurify — убирает то, что DOMPurify не трогает
 * (классы, id, lang, пустые span-обёртки, &nbsp;, base64-картинки).
 */
export const cleanPastedHtml = (rawHtml: string): string => {
    if (!rawHtml.trim()) return '';

    // ── 1. Regex pre-clean ────────────────────────────────────────────────────
    let html = rawHtml
        // Условные комментарии Word: <!--[if ...]>...</[endif]-->
        .replace(/<!--\[if[^\]]*\]>[\s\S]*?<!\[endif\]-->/gi, '')
        // XML-блоки Word: <xml>...</xml>
        .replace(/<xml[\s\S]*?<\/xml>/gi, '')
        // Office namespace теги: <o:p>, <w:sdt>, <m:oMath> и т.д.
        .replace(/<\/?[a-zA-Z]+:[a-zA-Z][^>]*\/?>/gi, '')
        // Встроенные <style> блоки (Word генерирует огромные style-блоки)
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // ── 2. DOM parse ──────────────────────────────────────────────────────────
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;

    // ── 3. Очистка атрибутов ──────────────────────────────────────────────────
    body.querySelectorAll<Element>('*').forEach((el) => {
        el.removeAttribute('class');          // Mso*, Bootstrap*, кастомные — всё лишнее
        el.removeAttribute('id');             // может конфликтовать с id страницы
        el.removeAttribute('lang');
        el.removeAttribute('xml:lang');
        el.removeAttribute('name');           // Word якоря
        el.removeAttribute('tabindex');

        // xmlns:* и data-* атрибуты
        for (const attr of Array.from(el.attributes)) {
            if (attr.name.startsWith('xmlns') || attr.name.startsWith('data-')) {
                el.removeAttribute(attr.name);
            }
        }
    });

    // ── 4. Нормализация тегов ────────────────────────────────────────────────
    // <b> → <strong>  (семантически правильнее)
    body.querySelectorAll('b').forEach((el) => {
        const strong = doc.createElement('strong');
        strong.innerHTML = el.innerHTML;
        el.replaceWith(strong);
    });
    // <i> → <em>
    body.querySelectorAll('i').forEach((el) => {
        const em = doc.createElement('em');
        em.innerHTML = el.innerHTML;
        el.replaceWith(em);
    });
    // <font> → разворачиваем содержимое (тег устарел)
    body.querySelectorAll('font').forEach((el) => {
        el.replaceWith(...Array.from(el.childNodes));
    });

    // ── 5. Удаляем base64-картинки ───────────────────────────────────────────
    // Word встраивает картинки как data:... — они слишком тяжёлые.
    // Пользователь должен загружать картинки через наш upload.
    body.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
        const src = img.getAttribute('src') ?? '';
        if (src.startsWith('data:')) {
            img.remove();
        }
    });

    // ── 6. Разворачиваем пустые обёртки ──────────────────────────────────────
    // <span> и <font> без атрибутов — бесполезные обёртки от Word/Docs.
    // Несколько проходов: разворачивание открывает новые пустые обёртки.
    for (let pass = 0; pass < 5; pass++) {
        let changed = false;
        body.querySelectorAll('span').forEach((el) => {
            if (!el.hasAttributes()) {
                el.replaceWith(...Array.from(el.childNodes));
                changed = true;
            }
        });
        if (!changed) break;
    }

    // ── 7. Нормализуем &nbsp; ────────────────────────────────────────────────
    normalizeNbsp(body);

    // ── 8. Удаляем пустые блочные элементы ───────────────────────────────────
    // Проходим снизу вверх (reverse), чтобы сначала удалялись вложенные.
    for (let pass = 0; pass < 3; pass++) {
        let changed = false;
        Array.from(
            body.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6'),
        )
            .reverse()
            .forEach((el) => {
                if (isEffectivelyEmpty(el)) {
                    el.remove();
                    changed = true;
                }
            });
        if (!changed) break;
    }

    return body.innerHTML;
};

/**
 * Конвертирует plain-text в семантический HTML.
 * Каждая непустая строка → отдельный <p>.
 * Это лучше, чем одна <p> со всеми <br>, — сохраняет правильную структуру абзацев.
 */
export const convertPlainTextToHtml = (text: string): string => {
    if (!text.trim()) return '';

    const escapeHtml = (str: string) =>
        str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

    const lines = text.split(/\r?\n/);
    const paragraphs: string[] = [];
    let buffer: string[] = [];

    lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed) {
            buffer.push(escapeHtml(trimmed));
        } else {
            if (buffer.length > 0) {
                // Несколько подряд идущих строк (без пустой строки между ними) —
                // объединяем в один абзац с <br> между ними.
                paragraphs.push(`<p>${buffer.join('<br>')}</p>`);
                buffer = [];
            }
        }
    });

    if (buffer.length > 0) {
        paragraphs.push(`<p>${buffer.join('<br>')}</p>`);
    }

    return paragraphs.length > 0 ? paragraphs.join('') : '<p><br></p>';
};

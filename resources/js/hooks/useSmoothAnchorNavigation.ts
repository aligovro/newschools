import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

interface SmoothAnchorOptions {
    homePath?: string;
    maxWaitMs?: number;
}

const STORAGE_KEY = 'site:pending-anchor-target';
const DEFAULT_HOME_PATH = '/';
const DEFAULT_MAX_WAIT_MS = 5000;

const cssEscape = (value: string): string => {
    if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
        return CSS.escape(value);
    }

    const controlCharsRange =
        String.fromCharCode(0) + '-' + String.fromCharCode(31);
    const deleteChar = String.fromCharCode(127);
    const punctuation = ' !"#$%&\'()*+,./:;<=>?@[\\\\]^`{|}~';
    const unsafePattern = `[${']'}${controlCharsRange}${deleteChar}${punctuation}]`;
    const unsafeChars = new RegExp(unsafePattern, 'g');

    return value.replace(unsafeChars, '\\$&');
};

const getAnchorOffset = (): number => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return 0;
    }

    const bodyOffset = document.body?.getAttribute('data-anchor-offset');
    const attrOffset = bodyOffset ? Number.parseInt(bodyOffset, 10) : NaN;
    if (!Number.isNaN(attrOffset)) {
        return attrOffset;
    }

    const root = document.documentElement;
    const styles = window.getComputedStyle(root);
    const cssVar = styles.getPropertyValue('--site-anchor-offset');
    const varOffset = cssVar ? Number.parseInt(cssVar, 10) : NaN;

    return Number.isNaN(varOffset) ? 0 : varOffset;
};

const findTargetElement = (anchor: string): HTMLElement | null => {
    if (!anchor || typeof document === 'undefined') {
        return null;
    }

    const trimmed = anchor.trim();
    if (!trimmed) return null;

    const byId = document.getElementById(trimmed);
    if (byId) return byId;

    const escaped = cssEscape(trimmed);
    const byClass = document.querySelector<HTMLElement>(`.${escaped}`);
    if (byClass) return byClass;

    return document.querySelector<HTMLElement>(`[data-anchor="${trimmed}"]`);
};

const scrollToElement = (element: HTMLElement, anchor: string): void => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
    ).matches;
    const offset = getAnchorOffset();
    const targetY =
        element.getBoundingClientRect().top +
        window.scrollY -
        Math.max(offset, 0);

    window.scrollTo({
        top: targetY,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });

    if (anchor) {
        const base = `${window.location.pathname}${window.location.search}`;
        const hash = `#${anchor}`;
        if (window.location.hash !== hash) {
            window.history.replaceState(
                window.history.state,
                '',
                `${base}${hash}`,
            );
        }
    }
};

const tryScrollToAnchor = (anchor: string): boolean => {
    const target = findTargetElement(anchor);
    if (!target) return false;

    scrollToElement(target, anchor);
    return true;
};

const watchForAnchor = (
    anchor: string,
    maxWaitMs: number,
): (() => void) | void => {
    if (tryScrollToAnchor(anchor)) {
        return;
    }

    if (
        typeof MutationObserver === 'undefined' ||
        typeof document === 'undefined'
    ) {
        return;
    }

    let timeoutId: number | null = null;

    const observer = new MutationObserver(() => {
        if (tryScrollToAnchor(anchor)) {
            cleanup();
        }
    });

    function cleanup() {
        observer.disconnect();
        if (timeoutId) {
            window.clearTimeout(timeoutId);
            timeoutId = null;
        }
    }

    observer.observe(document.body, { childList: true, subtree: true });

    timeoutId = window.setTimeout(() => {
        cleanup();
    }, maxWaitMs);

    return cleanup;
};

const extractAnchorTarget = (anchorEl: HTMLAnchorElement): string | null => {
    const dataAnchor =
        anchorEl.dataset.anchor ||
        anchorEl.getAttribute('data-anchor') ||
        anchorEl.getAttribute('data-scroll-target');

    if (dataAnchor && dataAnchor.trim()) {
        return dataAnchor.trim();
    }

    const rawHref = anchorEl.getAttribute('href');
    if (!rawHref) return null;

    if (rawHref === '#' || rawHref.trim() === '') {
        return null;
    }

    if (rawHref.startsWith('#')) {
        return rawHref.slice(1);
    }

    if (rawHref.includes('#')) {
        const hashIndex = rawHref.indexOf('#');
        if (hashIndex >= 0 && hashIndex < rawHref.length - 1) {
            return rawHref.slice(hashIndex + 1);
        }
    }

    return null;
};

const consumePendingAnchor = (): string | null => {
    if (typeof window === 'undefined') return null;
    const pending = sessionStorage.getItem(STORAGE_KEY);
    if (!pending) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    return pending;
};

const rememberPendingAnchor = (anchor: string): void => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(STORAGE_KEY, anchor);
};

export const useSmoothAnchorNavigation = (
    options?: SmoothAnchorOptions,
): void => {
    const { url } = usePage();
    const cleanupRef = useRef<(() => void) | void>(undefined);
    const homePath = options?.homePath || DEFAULT_HOME_PATH;
    const maxWaitMs = options?.maxWaitMs || DEFAULT_MAX_WAIT_MS;

    useEffect(() => {
        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
            }
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = undefined;
        }

        const pending = consumePendingAnchor();
        const hash = window.location.hash
            ? window.location.hash.slice(1)
            : null;
        const anchor = pending || hash;
        if (!anchor) return;

        cleanupRef.current = watchForAnchor(anchor, maxWaitMs);
    }, [url, maxWaitMs]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleClick = (event: MouseEvent) => {
            if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
            ) {
                return;
            }

            const target = (event.target as HTMLElement | null)?.closest('a');
            if (!target) return;

            const anchorTarget = extractAnchorTarget(
                target as HTMLAnchorElement,
            );
            if (!anchorTarget) return;

            if (
                target instanceof HTMLAnchorElement &&
                target.target &&
                target.target !== '_self'
            ) {
                return;
            }

            event.preventDefault();

            if (tryScrollToAnchor(anchorTarget)) {
                return;
            }

            // Already on homepage - wait for element to appear
            if (window.location.pathname === homePath) {
                cleanupRef.current = watchForAnchor(anchorTarget, maxWaitMs);
                return;
            }

            // Navigate to home and scroll after render
            rememberPendingAnchor(anchorTarget);
            router.visit(homePath, {
                preserveScroll: false,
            });
        };

        const useCapture = true;
        document.addEventListener('click', handleClick, useCapture);

        return () => {
            document.removeEventListener('click', handleClick, useCapture);
        };
    }, [homePath, maxWaitMs]);
};

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { isInternalLink } from '@/lib/linkUtils';
import { Link, usePage } from '@inertiajs/react';
import { X } from 'lucide-react';
import React, { useCallback, useEffect, useRef } from 'react';
import { MenuItem } from './types';

interface MobileMenuModalProps {
    items: MenuItem[];
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    /** Шаблон school: дублировать блок .school-contacts-bar из шапки вниз модалки */
    cloneSchoolContacts?: boolean;
}

export const MobileMenuModal: React.FC<MobileMenuModalProps> = ({
    items,
    isOpen,
    onOpenChange,
    title,
    cloneSchoolContacts = false,
}) => {
    const page = usePage();
    const contactsMountRef = useRef<HTMLDivElement>(null);

    // Определение активного пункта меню
    const isActiveMenuItem = useCallback(
        (url: string): boolean => {
            const currentUrl = page.url || '';
            const normalizedCurrentUrl = currentUrl.split('?')[0].toLowerCase();
            const normalizedItemUrl = url.split('?')[0].toLowerCase();

            // Точное совпадение
            if (normalizedCurrentUrl === normalizedItemUrl) {
                return true;
            }

            // Проверка начала пути для подстраниц
            if (
                normalizedItemUrl !== '/' &&
                normalizedCurrentUrl.startsWith(normalizedItemUrl)
            ) {
                return true;
            }

            return false;
        },
        [page.url],
    );

    // Закрываем меню при клике на пункт меню (для внутренних ссылок)
    const handleItemClick = useCallback(
        (item: MenuItem) => {
            // Если это внутренняя ссылка, закрываем модальное окно
            if (!item.target && isInternalLink(item.url)) {
                // Небольшая задержка для плавности
                setTimeout(() => {
                    onOpenChange(false);
                }, 100);
            }
        },
        [onOpenChange],
    );

    const renderMenuItem = useCallback(
        (item: MenuItem, level = 0) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExternal =
                item.target === '_blank' || !isInternalLink(item.url);
            const isActive = !isExternal && isActiveMenuItem(item.url);

            const linkClassName = `mobile-menu-modal__link ${isActive ? 'mobile-menu-modal__link--active' : ''}`;

            return (
                <li
                    key={item.id}
                    className={`mobile-menu-modal__item mobile-menu-modal__item--level-${level}`}
                >
                    {isExternal ? (
                        <a
                            href={item.url}
                            target={item.target}
                            rel="noopener noreferrer"
                            className={linkClassName}
                        >
                            <span className="mobile-menu-modal__link-text">
                                {item.title}
                            </span>
                            <svg
                                className="mobile-menu-modal__external-icon"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                            </svg>
                        </a>
                    ) : (
                        <Link
                            href={item.url}
                            className={linkClassName}
                            onClick={() => handleItemClick(item)}
                        >
                            <span className="mobile-menu-modal__link-text">
                                {item.title}
                            </span>
                        </Link>
                    )}
                    {hasChildren && (
                        <ul className="mobile-menu-modal__submenu">
                            {item.children!.map((child) =>
                                renderMenuItem(child, level + 1),
                            )}
                        </ul>
                    )}
                </li>
            );
        },
        [isActiveMenuItem, handleItemClick],
    );

    // Dialog ренерит контент в портал — ref и DOM источника могут быть готовы не в том же тике, что useLayoutEffect
    useEffect(() => {
        if (!cloneSchoolContacts) {
            return;
        }

        const clear = () => {
            contactsMountRef.current?.replaceChildren();
        };

        if (!isOpen) {
            clear();
            return;
        }

        let cancelled = false;
        let frame = 0;
        let attempts = 0;
        const maxAttempts = 40;

        const run = (): void => {
            if (cancelled) {
                return;
            }
            const el = contactsMountRef.current;
            const sourceRoot = document.querySelector(
                '.school-header-contacts-source',
            );
            const bar = sourceRoot?.querySelector('.school-contacts-bar');

            if (!el) {
                attempts += 1;
                if (attempts < maxAttempts) {
                    frame = requestAnimationFrame(run);
                }
                return;
            }

            el.replaceChildren();
            if (bar) {
                el.appendChild(bar.cloneNode(true));
            }
        };

        // Двойной rAF: контент Dialog в портале часто появляется на следующем кадре
        frame = requestAnimationFrame(() => {
            frame = requestAnimationFrame(run);
        });

        return () => {
            cancelled = true;
            cancelAnimationFrame(frame);
            clear();
        };
    }, [isOpen, cloneSchoolContacts]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange} modal={true}>
            <DialogContent className="mobile-menu-modal__content">
                {/* Header с кнопкой закрытия */}
                <div className="mobile-menu-modal__header">
                    {title && (
                        <h2 className="mobile-menu-modal__title">{title}</h2>
                    )}
                    <button
                        onClick={() => onOpenChange(false)}
                        className="mobile-menu-modal__close-button"
                        aria-label="Закрыть меню"
                    >
                        <X className="mobile-menu-modal__close-icon" />
                    </button>
                </div>

                {/* Список пунктов меню + опционально контакты (шаблон school) */}
                <nav className="mobile-menu-modal__nav" aria-label="Навигация">
                    <div className="mobile-menu-modal__scroll">
                        <ul className="mobile-menu-modal__list">
                            {items.map((item) => renderMenuItem(item))}
                        </ul>
                    </div>
                    {cloneSchoolContacts && (
                        <div
                            className="mobile-menu-modal__contacts"
                            ref={contactsMountRef}
                            role="region"
                            aria-label="Контакты"
                        />
                    )}
                </nav>
            </DialogContent>
        </Dialog>
    );
};

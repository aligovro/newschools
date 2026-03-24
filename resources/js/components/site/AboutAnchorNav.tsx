import type { AboutAnchorItem } from '@/lib/aboutPageLayout';
import React from 'react';

interface AboutAnchorNavProps {
    items: AboutAnchorItem[];
    className?: string;
}

/**
 * Чипы-якоря для страницы «О школе» (плавный скролл через useSmoothAnchorNavigation в MainLayout).
 */
export const AboutAnchorNav: React.FC<AboutAnchorNavProps> = ({
    items,
    className = '',
}) => {
    if (!items.length) return null;

    return (
        <nav
            className={`school-about-anchor-nav ${className}`.trim()}
            aria-label="Разделы страницы"
        >
            <ul className="school-about-anchor-nav__list">
                {items.map((item) => (
                    <li key={item.id}>
                        <a
                            href={`#${item.id}`}
                            className="school-about-anchor-nav__chip"
                        >
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default AboutAnchorNav;

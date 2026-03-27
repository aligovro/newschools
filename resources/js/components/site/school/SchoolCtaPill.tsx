import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type SchoolCtaPillLinkProps = {
    href: string;
    children: ReactNode;
    className?: string;
};

type SchoolCtaPillButtonProps = {
    children: ReactNode;
    className?: string;
    type?: 'button' | 'submit';
    onClick?: () => void;
    disabled?: boolean;
};

export type SchoolCtaPillProps = SchoolCtaPillLinkProps | SchoolCtaPillButtonProps;

/**
 * Единая «пилюля» CTA для шаблона school (ссылка «Все …» и кнопки подгрузки).
 * Стили: .school-cta-pill в templates/school/_load-more-button.scss
 */
export function SchoolCtaPill(props: SchoolCtaPillProps) {
    if ('href' in props) {
        const { href, children, className } = props;
        return (
            <a href={href} className={cn('school-cta-pill', className)}>
                {children}
            </a>
        );
    }

    const { children, className, type = 'button', onClick, disabled } = props;

    return (
        <button type={type} className={cn('school-cta-pill', className)} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    );
}

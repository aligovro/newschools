import { usePage } from '@inertiajs/react';
import React from 'react';
import { WidgetOutputProps } from './types';

interface HtmlOutputConfig {
    title?: string;
    show_title?: boolean;
    htmlContent?: string;
    enableScripts?: boolean;
    enableStyles?: boolean;
    width?: string;
    height?: string;
    backgroundColor?: string;
    padding?: string;
    margin?: string;
    borderRadius?: string;
    borderWidth?: string;
    borderColor?: string;
}

export const HtmlOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const page = usePage<{ site?: { template?: string } }>();
    const siteTemplate = page.props?.site?.template;
    const positionSlug =
        typeof (widget as { position_slug?: string }).position_slug === 'string'
            ? (widget as { position_slug: string }).position_slug
            : '';

    const config = (widget.config || {}) as HtmlOutputConfig;
    const {
        title,
        show_title = true,
        htmlContent = '',
        enableScripts = true,
        enableStyles = true,
        width,
        height,
        backgroundColor,
        padding,
        margin,
        borderRadius,
        borderWidth,
        borderColor,
    } = config;

    if (!htmlContent) {
        return null;
    }

    /** Разметка клонируется в моб. меню (MenuOutput); только шаблон school + зона header-col-* */
    const isSchoolContactsSource =
        siteTemplate === 'school' &&
        positionSlug.startsWith('header-col') &&
        htmlContent.includes('school-contacts-bar');

    const processHtml = (html: string): string => {
        let processed = html;
        if (!enableScripts) {
            processed = processed.replace(
                /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                '',
            );
        }
        if (!enableStyles) {
            processed = processed.replace(
                /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
                '',
            );
        }
        return processed;
    };

    const containerStyle: React.CSSProperties = {
        width: width || '100%',
        height: height || 'auto',
        backgroundColor: backgroundColor || 'transparent',
        ...(padding ? { padding: `${padding}px` } : {}),
        ...(margin ? { margin: `${margin}px` } : {}),
        ...(borderRadius ? { borderRadius: `${borderRadius}px` } : {}),
        ...(borderWidth
            ? {
                  borderWidth: `${borderWidth}px`,
                  borderColor: borderColor || 'transparent',
                  borderStyle: 'solid',
              }
            : {}),
        overflow: 'auto',
        ...style,
    };

    return (
        <div className={`html-output ${className || ''}`}>
            {title && show_title && (
                <h2 className="mb-3 text-2xl font-bold">{title}</h2>
            )}
            <div
                className={
                    isSchoolContactsSource
                        ? 'html-output-content school-header-contacts-source'
                        : 'html-output-content'
                }
                style={containerStyle}
                dangerouslySetInnerHTML={{ __html: processHtml(htmlContent) }}
            />
        </div>
    );
};

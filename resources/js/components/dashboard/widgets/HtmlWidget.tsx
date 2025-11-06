import React from 'react';

interface HtmlWidgetProps {
    config?: {
        title?: string;
        show_title?: boolean; // Показывать заголовок на сайте
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
    };
}

export const HtmlWidget: React.FC<HtmlWidgetProps> = ({ config = {} }) => {
    const {
        title,
        show_title = true, // По умолчанию true для обратной совместимости
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

    // Функция для обработки HTML контента
    const processHtmlContent = (html: string): string => {
        if (!html) return '';

        let processedHtml = html;

        // Если скрипты отключены, удаляем их
        if (!enableScripts) {
            processedHtml = processedHtml.replace(
                /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                '',
            );
        }

        // Если стили отключены, удаляем их
        if (!enableStyles) {
            processedHtml = processedHtml.replace(
                /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
                '',
            );
        }

        return processedHtml;
    };

    const containerStyle: React.CSSProperties = {
        width: width || '100%',
        height: height || 'auto',
        backgroundColor: backgroundColor || 'transparent',
        padding: padding ? `${padding}px` : '0',
        margin: margin ? `${margin}px` : '0',
        borderRadius: borderRadius ? `${borderRadius}px` : '0',
        borderWidth: borderWidth ? `${borderWidth}px` : '0',
        borderColor: borderColor || 'transparent',
        borderStyle: borderWidth ? 'solid' : 'none',
        overflow: 'auto',
    };

    return (
        <div className="html-widget-container">
            {title && show_title && (
                <h3 className="html-widget-title mb-3 text-lg font-semibold">
                    {title}
                </h3>
            )}
            <div
                className="html-widget-content"
                style={containerStyle}
                dangerouslySetInnerHTML={{
                    __html: processHtmlContent(htmlContent),
                }}
            />
        </div>
    );
};

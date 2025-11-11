import React from 'react';
import { TextOutputConfig, WidgetOutputProps } from './types';

export const TextOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = widget.config as TextOutputConfig;

    const {
        title = '',
        content = '',
        show_title = true, // По умолчанию true для обратной совместимости
        fontSize,
        textAlign,
        backgroundColor,
        textColor,
        titleColor,
        padding,
        margin,
        borderRadius,
        borderWidth,
        borderColor,
        enableFormatting = false,
        enableColors = false,
    } = config;

    const hasPadding = typeof padding === 'string' && padding.trim().length > 0;
    const hasMargin = typeof margin === 'string' && margin.trim().length > 0;
    const hasRadius =
        typeof borderRadius === 'string' && borderRadius.trim().length > 0;
    const normalizedBorderWidth =
        typeof borderWidth === 'string' ? borderWidth.trim() : undefined;
    const hasBorder =
        Boolean(normalizedBorderWidth) &&
        normalizedBorderWidth !== '0' &&
        normalizedBorderWidth !== '0px';

    const resolvedTextColor =
        enableColors && textColor && textColor.trim().length > 0
            ? textColor
            : undefined;
    const resolvedBgColor =
        enableColors && backgroundColor && backgroundColor.trim().length > 0
            ? backgroundColor
            : undefined;
    const resolvedTitleColor =
        enableColors && (titleColor || textColor)
            ? titleColor && titleColor.trim().length > 0
                ? titleColor
                : textColor
            : undefined;

    const containerStyle: React.CSSProperties = {
        ...(resolvedBgColor ? { backgroundColor: resolvedBgColor } : {}),
        ...(resolvedTextColor ? { color: resolvedTextColor } : {}),
        ...(hasPadding ? { padding } : {}),
        ...(hasMargin ? { margin } : {}),
        ...(hasRadius ? { borderRadius } : {}),
        ...(hasBorder
            ? {
                  borderWidth: normalizedBorderWidth,
                  borderColor:
                      borderColor && borderColor.trim().length > 0
                          ? borderColor
                          : undefined,
                  borderStyle: 'solid',
              }
            : {}),
        ...(fontSize ? { fontSize } : {}),
        ...(textAlign ? { textAlign } : {}),
        ...style,
    };

    const titleStyle: React.CSSProperties = {
        ...(resolvedTitleColor ? { color: resolvedTitleColor } : {}),
        ...(title && content ? { marginBottom: '16px' } : {}),
    };

    // Render content: prefer HTML from editor; fallback to plain text with line breaks
    const renderContent = (text: string): React.ReactNode => {
        const containsHtml = /<[^>]+>/.test(text || '');
        if (containsHtml) {
            return (
                <div
                    className="text-content"
                    dangerouslySetInnerHTML={{ __html: text }}
                />
            );
        }

        if (!enableFormatting) {
            return (
                <div className="text-content whitespace-pre-line">{text}</div>
            );
        }

        // Minimal formatting: convert newlines to paragraphs
        const lines = (text || '').split('\n');
        return (
            <div className="text-content">
                {lines.map((line, idx) => (
                    <p key={`p-${idx}`} className="mb-4 last:mb-0">
                        {line}
                    </p>
                ))}
            </div>
        );
    };

    return (
        <div
            className={`text-output ${className || ''}`}
            style={containerStyle}
        >
            {title && show_title && (
                <h2 className="text-2xl font-bold" style={titleStyle}>
                    {title}
                </h2>
            )}
            {content && renderContent(content)}
        </div>
    );
};

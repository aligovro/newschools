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
        fontSize = '16px',
        textAlign = 'left',
        backgroundColor = 'transparent',
        textColor = '#000000',
        titleColor = '#000000',
        padding = '16px',
        margin = '0',
        borderRadius = '0',
        borderWidth = '0',
        borderColor = '#000000',
        enableFormatting = false,
        enableColors = false,
    } = config;

    const containerStyle: React.CSSProperties = {
        backgroundColor,
        color: textColor,
        padding,
        margin,
        borderRadius,
        borderWidth: borderWidth !== '0' ? borderWidth : undefined,
        borderColor: borderWidth !== '0' ? borderColor : undefined,
        borderStyle: borderWidth !== '0' ? 'solid' : undefined,
        fontSize,
        textAlign,
        ...style,
    };

    const titleStyle: React.CSSProperties = {
        color: enableColors ? titleColor : textColor,
        marginBottom: title && content ? '16px' : '0',
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
            {title && (
                <h2 className="text-2xl font-bold" style={titleStyle}>
                    {title}
                </h2>
            )}
            {content && renderContent(content)}
        </div>
    );
};

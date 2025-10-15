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

    // Simple text formatting parser
    const formatText = (text: string): React.ReactNode => {
        if (!enableFormatting) {
            return text;
        }

        // Split by line breaks and process each line
        return text.split('\n').map((line, index) => {
            if (line.trim() === '') {
                return <br key={index} />;
            }

            // Simple markdown-like formatting
            let formattedLine = line;
            const parts: React.ReactNode[] = [];
            let key = 0;

            // Bold text **text**
            const boldRegex = /\*\*(.*?)\*\*/g;
            let lastIndex = 0;
            let match;

            while ((match = boldRegex.exec(line)) !== null) {
                // Add text before the match
                if (match.index > lastIndex) {
                    parts.push(
                        <span key={key++}>
                            {formattedLine.slice(lastIndex, match.index)}
                        </span>,
                    );
                }
                // Add bold text
                parts.push(<strong key={key++}>{match[1]}</strong>);
                lastIndex = match.index + match[0].length;
            }

            // Add remaining text
            if (lastIndex < line.length) {
                parts.push(
                    <span key={key++}>{formattedLine.slice(lastIndex)}</span>,
                );
            }

            return (
                <p key={index} className="mb-4 last:mb-0">
                    {parts.length > 0 ? parts : line}
                </p>
            );
        });
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
            {content && (
                <div className="text-content">{formatText(content)}</div>
            )}
        </div>
    );
};

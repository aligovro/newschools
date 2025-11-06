import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import React, { useCallback } from 'react';

interface TitleFieldProps {
    title: string;
    showTitle: boolean;
    onTitleChange: (title: string) => void;
    onShowTitleChange: (showTitle: boolean) => void;
    placeholder?: string;
    label?: string;
    showTitleLabel?: string;
    className?: string;
}

/**
 * Общий компонент для поля заголовка с галочкой "показывать заголовок на сайте"
 * Используется во всех виджетах для единообразия
 */
export const TitleField: React.FC<TitleFieldProps> = React.memo(
    ({
        title,
        showTitle,
        onTitleChange,
        onShowTitleChange,
        placeholder = 'Введите заголовок',
        label = 'Заголовок',
        showTitleLabel = 'Показывать заголовок на сайте',
        className = '',
    }) => {
        const handleTitleChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                onTitleChange(e.target.value);
            },
            [onTitleChange],
        );

        const handleShowTitleChange = useCallback(
            (checked: boolean) => {
                onShowTitleChange(checked);
            },
            [onShowTitleChange],
        );

        return (
            <div className={`space-y-3 ${className}`}>
                <div>
                    <Label htmlFor="widget-title">{label}</Label>
                    <Input
                        id="widget-title"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder={placeholder}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="widget-show-title" className="cursor-pointer">
                            {showTitleLabel}
                        </Label>
                        <p className="text-xs text-gray-500">
                            Отображать заголовок на публичной странице сайта
                        </p>
                    </div>
                    <Switch
                        id="widget-show-title"
                        checked={showTitle}
                        onCheckedChange={handleShowTitleChange}
                    />
                </div>
            </div>
        );
    },
);

TitleField.displayName = 'TitleField';


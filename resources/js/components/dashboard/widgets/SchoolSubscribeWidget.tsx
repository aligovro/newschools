import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import React, { useEffect, useState } from 'react';

export interface SchoolSubscribeConfig {
    [key: string]: any;
    title?: string;
    subtitle?: string;
    default_amount?: number;
    preset_amounts?: number[];
    min_amount?: number;
    max_amount?: number;
    currency?: 'RUB' | 'USD' | 'EUR';
    require_name?: boolean;
    require_email?: boolean;
    allow_anonymous?: boolean;
    show_message_field?: boolean;
    button_text?: string;
    organizationId?: number;
}

export interface SchoolSubscribeWidgetProps {
    config?: SchoolSubscribeConfig;
    isEditable?: boolean;
    onConfigChange?: (config: SchoolSubscribeConfig) => void;
}

export const SchoolSubscribeWidget: React.FC<SchoolSubscribeWidgetProps> = ({
    config = {},
    isEditable = false,
    onConfigChange,
}) => {
    const [localConfig, setLocalConfig] = useState<SchoolSubscribeConfig>({
        title: config.title || 'Подпишись\nна постоянную\nпомощь школе',
        subtitle: config.subtitle || 'Оформление регулярной подписки — это самый надежный\nи эффективный способ поддержать деятельность и развитие школы.',
        default_amount: config.default_amount || 250,
        preset_amounts: config.preset_amounts || [250, 500, 1000],
        min_amount: config.min_amount || 100,
        max_amount: config.max_amount || 0,
        currency: config.currency || 'RUB',
        require_name: config.require_name ?? true,
        require_email: config.require_email ?? false,
        allow_anonymous: config.allow_anonymous ?? true,
        show_message_field: config.show_message_field ?? false,
        button_text: config.button_text || 'Подписаться на помощь',
        organizationId: config.organizationId,
    });

    useEffect(() => {
        setLocalConfig((prev) => ({ ...prev, ...config }));
    }, [config]);

    const handleChange = (key: keyof SchoolSubscribeConfig, value: any) => {
        const newConfig = { ...localConfig, [key]: value };
        setLocalConfig(newConfig);
        onConfigChange?.(newConfig);
    };

    if (!isEditable) {
        return (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                Виджет подписки школы (настройка доступна в режиме редактирования)
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Заголовок</Label>
                    <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={localConfig.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="Например: Подпишись на постоянную помощь школе"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Подзаголовок</Label>
                    <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={localConfig.subtitle || ''}
                        onChange={(e) => handleChange('subtitle', e.target.value)}
                        placeholder="Например: Оформление регулярной подписки..."
                    />
                </div>

                <div className="space-y-2">
                    <Label>Текст кнопки</Label>
                    <Input
                        value={localConfig.button_text}
                        onChange={(e) => handleChange('button_text', e.target.value)}
                        placeholder="Подписаться на помощь"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Сумма по умолчанию</Label>
                    <Input
                        type="number"
                        value={localConfig.default_amount}
                        onChange={(e) => handleChange('default_amount', Number(e.target.value))}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Предустановленные суммы (через запятую)</Label>
                    <Input
                        value={localConfig.preset_amounts?.join(', ')}
                        onChange={(e) => {
                            const values = e.target.value
                                .split(',')
                                .map((v) => Number(v.trim()))
                                .filter((v) => !isNaN(v) && v > 0);
                            handleChange('preset_amounts', values);
                        }}
                        placeholder="250, 500, 1000"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Минимальная сумма</Label>
                        <Input
                            type="number"
                            value={localConfig.min_amount}
                            onChange={(e) => handleChange('min_amount', Number(e.target.value))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Максимальная сумма (0 - без лимита)</Label>
                        <Input
                            type="number"
                            value={localConfig.max_amount}
                            onChange={(e) => handleChange('max_amount', Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>ID Организации (опционально)</Label>
                    <Input
                        type="number"
                        value={localConfig.organizationId || ''}
                        onChange={(e) =>
                            handleChange(
                                'organizationId',
                                e.target.value ? parseInt(e.target.value) : undefined
                            )
                        }
                        placeholder="Оставьте пустым для автоопределения"
                    />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base">Обязательное имя</Label>
                        <p className="text-sm text-gray-500">Требовать ввод имени</p>
                    </div>
                    <Switch
                        checked={localConfig.require_name}
                        onCheckedChange={(checked) => handleChange('require_name', checked)}
                    />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base">Анонимные пожертвования</Label>
                        <p className="text-sm text-gray-500">Разрешить скрывать имя</p>
                    </div>
                    <Switch
                        checked={localConfig.allow_anonymous}
                        onCheckedChange={(checked) => handleChange('allow_anonymous', checked)}
                    />
                </div>
            </div>
        </div>
    );
};

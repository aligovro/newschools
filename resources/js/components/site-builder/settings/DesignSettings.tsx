import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useDesignSettings } from '@/hooks/useDesignSettings';
import { Loader2, Save } from 'lucide-react';
import React from 'react';

interface DesignSettingsProps {
    siteId: number;
    initialSettings?: {
        color_scheme?: string;
        font_family?: string;
        font_size?: string;
        layout?: string;
        header_style?: string;
        footer_style?: string;
    };
}

export const DesignSettings: React.FC<DesignSettingsProps> = React.memo(
    ({ siteId, initialSettings = {} }) => {
        const { settings, isLoading, errors, updateSetting, saveSettings } =
            useDesignSettings(siteId, initialSettings);

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Настройки дизайна
                        <Button
                            onClick={saveSettings}
                            disabled={isLoading}
                            size="sm"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {isLoading ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {errors.length > 0 && (
                        <div className="rounded border border-red-200 bg-red-50 p-3">
                            <ul className="space-y-1 text-sm text-red-600">
                                {errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="color_scheme">Цветовая схема</Label>
                            <Select
                                value={settings.color_scheme || ''}
                                onValueChange={(value) =>
                                    updateSetting('color_scheme', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите цветовую схему" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="blue">Синяя</SelectItem>
                                    <SelectItem value="green">
                                        Зеленая
                                    </SelectItem>
                                    <SelectItem value="red">Красная</SelectItem>
                                    <SelectItem value="purple">
                                        Фиолетовая
                                    </SelectItem>
                                    <SelectItem value="orange">
                                        Оранжевая
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="font_family">Шрифт</Label>
                            <Select
                                value={settings.font_family || ''}
                                onValueChange={(value) =>
                                    updateSetting('font_family', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите шрифт" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="inter">Inter</SelectItem>
                                    <SelectItem value="roboto">
                                        Roboto
                                    </SelectItem>
                                    <SelectItem value="open-sans">
                                        Open Sans
                                    </SelectItem>
                                    <SelectItem value="lato">Lato</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="font_size">Размер шрифта</Label>
                            <Select
                                value={settings.font_size || ''}
                                onValueChange={(value) =>
                                    updateSetting('font_size', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите размер шрифта" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="small">
                                        Маленький
                                    </SelectItem>
                                    <SelectItem value="medium">
                                        Средний
                                    </SelectItem>
                                    <SelectItem value="large">
                                        Большой
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="layout">Макет</Label>
                            <Select
                                value={settings.layout || ''}
                                onValueChange={(value) =>
                                    updateSetting('layout', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите макет" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="wide">
                                        Широкий
                                    </SelectItem>
                                    <SelectItem value="boxed">
                                        В контейнере
                                    </SelectItem>
                                    <SelectItem value="full-width">
                                        На всю ширину
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="header_style">Стиль шапки</Label>
                            <Select
                                value={settings.header_style || ''}
                                onValueChange={(value) =>
                                    updateSetting('header_style', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите стиль шапки" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="minimal">
                                        Минималистичный
                                    </SelectItem>
                                    <SelectItem value="classic">
                                        Классический
                                    </SelectItem>
                                    <SelectItem value="modern">
                                        Современный
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="footer_style">Стиль подвала</Label>
                            <Select
                                value={settings.footer_style || ''}
                                onValueChange={(value) =>
                                    updateSetting('footer_style', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите стиль подвала" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="minimal">
                                        Минималистичный
                                    </SelectItem>
                                    <SelectItem value="classic">
                                        Классический
                                    </SelectItem>
                                    <SelectItem value="modern">
                                        Современный
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    },
);

DesignSettings.displayName = 'DesignSettings';

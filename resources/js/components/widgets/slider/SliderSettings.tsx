import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import React from 'react';
import { SliderConfig } from './types';

interface SliderSettingsProps {
    config: SliderConfig;
    onConfigChange: (config: SliderConfig) => void;
}

export const SliderSettings: React.FC<SliderSettingsProps> = ({
    config,
    onConfigChange,
}) => {
    const handleChange = (key: keyof SliderConfig, value: unknown) => {
        onConfigChange({
            ...config,
            [key]: value,
        });
    };

    return (
        <div className="space-y-6">
            {/* Основные настройки */}
            <div>
                <h4 className="text-md mb-3 font-semibold">
                    Основные настройки
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="type">Тип слайдера</Label>
                        <Select
                            value={config.type || 'hero'}
                            onValueChange={(value) =>
                                handleChange('type', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="hero">
                                    Hero (полноэкранный)
                                </SelectItem>
                                <SelectItem value="carousel">
                                    Карусель
                                </SelectItem>
                                <SelectItem value="gallery">Галерея</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="layout">Макет</Label>
                        <Select
                            value={config.layout || 'fullwidth'}
                            onValueChange={(value) =>
                                handleChange('layout', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fullwidth">
                                    Полная ширина
                                </SelectItem>
                                <SelectItem value="grid">Сетка</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {config.layout === 'grid' && (
                        <div>
                            <Label htmlFor="slidesPerView">
                                Слайдов в строке
                            </Label>
                            <Input
                                id="slidesPerView"
                                type="number"
                                min="1"
                                max="6"
                                value={config.slidesPerView || 1}
                                onChange={(e) =>
                                    handleChange(
                                        'slidesPerView',
                                        parseInt(e.target.value),
                                    )
                                }
                            />
                        </div>
                    )}

                    <div>
                        <Label htmlFor="height">Высота (px)</Label>
                        <Input
                            id="height"
                            type="number"
                            min="200"
                            max="800"
                            value={parseInt(config.height || '400')}
                            onChange={(e) =>
                                handleChange('height', `${e.target.value}px`)
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Анимация */}
            <div>
                <h4 className="text-md mb-3 font-semibold">Анимация</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="animation">Тип анимации</Label>
                        <Select
                            value={config.animation || 'fade'}
                            onValueChange={(value) =>
                                handleChange('animation', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fade">
                                    Fade (плавное появление)
                                </SelectItem>
                                <SelectItem value="flip">
                                    Flip (переворот)
                                </SelectItem>
                                <SelectItem value="cube">Cube (куб)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="autoplay"
                                checked={config.autoplay || false}
                                onCheckedChange={(checked) =>
                                    handleChange('autoplay', checked)
                                }
                            />
                            <Label htmlFor="autoplay">Автопрокрутка</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="loop"
                                checked={config.loop || false}
                                onCheckedChange={(checked) =>
                                    handleChange('loop', checked)
                                }
                            />
                            <Label htmlFor="loop">Зацикливание</Label>
                        </div>
                    </div>

                    {config.autoplay && (
                        <div>
                            <Label htmlFor="autoplayDelay">
                                Задержка автопрокрутки (мс)
                            </Label>
                            <Input
                                id="autoplayDelay"
                                type="number"
                                min="1000"
                                max="10000"
                                step="500"
                                value={config.autoplayDelay || 5000}
                                onChange={(e) =>
                                    handleChange(
                                        'autoplayDelay',
                                        parseInt(e.target.value),
                                    )
                                }
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Навигация */}
            <div>
                <h4 className="text-md mb-3 font-semibold">Навигация</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="showArrows"
                            checked={config.showArrows || false}
                            onCheckedChange={(checked) =>
                                handleChange('showArrows', checked)
                            }
                        />
                        <Label htmlFor="showArrows">Стрелки навигации</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="showDots"
                            checked={config.showDots || false}
                            onCheckedChange={(checked) =>
                                handleChange('showDots', checked)
                            }
                        />
                        <Label htmlFor="showDots">Точки навигации</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="showProgress"
                            checked={config.showProgress || false}
                            onCheckedChange={(checked) =>
                                handleChange('showProgress', checked)
                            }
                        />
                        <Label htmlFor="showProgress">Прогресс-бар</Label>
                    </div>
                </div>
            </div>

            {/* Настройки сетки */}
            {config.layout === 'grid' && (
                <div>
                    <h4 className="text-md mb-3 font-semibold">
                        Настройки сетки
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="spaceBetween">
                                Отступ между слайдами (px)
                            </Label>
                            <Input
                                id="spaceBetween"
                                type="number"
                                min="0"
                                max="100"
                                value={config.spaceBetween || 0}
                                onChange={(e) =>
                                    handleChange(
                                        'spaceBetween',
                                        parseInt(e.target.value),
                                    )
                                }
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* CSS класс */}
            <div>
                <h4 className="text-md mb-3 font-semibold">Стилизация</h4>
                <div>
                    <Label htmlFor="css_class">CSS класс</Label>
                    <Input
                        id="css_class"
                        type="text"
                        value={config.css_class || ''}
                        onChange={(e) =>
                            handleChange('css_class', e.target.value)
                        }
                        placeholder="my-custom-slider"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        Добавьте CSS класс для кастомной стилизации слайдера.
                    </p>
                </div>
            </div>
        </div>
    );
};

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
import React, { useEffect, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { HeroSlide } from './types';

interface OverlaySettingsProps {
    slide: HeroSlide;
    onSlideUpdate: (updatedSlide: HeroSlide) => void;
}

export const OverlaySettings: React.FC<OverlaySettingsProps> = ({
    slide,
    onSlideUpdate,
}) => {
    // Показывать настройки наложения, если есть загруженное изображение и overlayOpacity > 0
    const hasImage = !!slide.backgroundImage;
    const hasOverlay = (slide.overlayOpacity || 0) > 0;
    const [showOverlaySettings, setShowOverlaySettings] = useState(hasOverlay);

    // Синхронизируем состояние при изменении slide
    useEffect(() => {
        const currentHasOverlay = (slide.overlayOpacity || 0) > 0;
        setShowOverlaySettings(currentHasOverlay);
    }, [slide.overlayOpacity]);

    const handleToggleOverlay = (checked: boolean) => {
        setShowOverlaySettings(checked);
        if (!checked) {
            // Если отключаем, устанавливаем прозрачность в 0
            const updatedSlide = {
                ...slide,
                overlayOpacity: 0,
            };
            onSlideUpdate(updatedSlide);
        } else if (!hasOverlay) {
            // Если включаем впервые, устанавливаем значение по умолчанию
            const updatedSlide = {
                ...slide,
                overlayOpacity: 0,
            };
            onSlideUpdate(updatedSlide);
        }
    };
    const handleOpacityChange = (value: string) => {
        const updatedSlide = {
            ...slide,
            overlayOpacity: parseInt(value),
        };
        onSlideUpdate(updatedSlide);
    };

    const handleColorChange = (color: string) => {
        const updatedSlide = {
            ...slide,
            overlayColor: color,
        };
        onSlideUpdate(updatedSlide);
    };

    const handleGradientChange = (value: string) => {
        const updatedSlide = {
            ...slide,
            overlayGradient: value as
                | 'none'
                | 'left'
                | 'right'
                | 'top'
                | 'bottom'
                | 'center',
        };
        onSlideUpdate(updatedSlide);
    };

    const handleGradientIntensityChange = (value: string) => {
        const updatedSlide = {
            ...slide,
            overlayGradientIntensity: parseInt(value),
        };
        onSlideUpdate(updatedSlide);
    };

    // Не показывать настройки, если нет изображения
    if (!hasImage) {
        return null;
    }

    return (
        <div className="space-y-3">
            {/* Переключатель показа настроек наложения */}
            <div className="flex items-center space-x-2">
                <Switch
                    id={`useOverlay-${slide.id}`}
                    checked={showOverlaySettings}
                    onCheckedChange={handleToggleOverlay}
                />
                <Label htmlFor={`useOverlay-${slide.id}`}>
                    Использовать наложение
                </Label>
            </div>

            {/* Настройки наложения (показываются только если включено) */}
            {showOverlaySettings && (
                <div className="grid grid-cols-2 gap-6 rounded-lg border p-4">
                    {/* Левая колонка - настройки */}
                    <div className="space-y-4">
                        <div>
                            <Label>Прозрачность наложения (%)</Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={slide.overlayOpacity || 0}
                                onChange={(e) =>
                                    handleOpacityChange(e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <Label>Тип градиента</Label>
                            <Select
                                value={slide.overlayGradient || 'none'}
                                onValueChange={handleGradientChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите тип градиента" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Без градиента</SelectItem>
                                    <SelectItem value="left">Слева направо</SelectItem>
                                    <SelectItem value="right">Справа налево</SelectItem>
                                    <SelectItem value="top">Сверху вниз</SelectItem>
                                    <SelectItem value="bottom">Снизу вверх</SelectItem>
                                    <SelectItem value="center">От центра</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Интенсивность градиента */}
                        {slide.overlayGradient && slide.overlayGradient !== 'none' && (
                            <div className="space-y-2">
                                <Label>
                                    Интенсивность градиента:{' '}
                                    {slide.overlayGradientIntensity || 50}%
                                </Label>
                                <Input
                                    type="range"
                                    min="10"
                                    max="90"
                                    value={slide.overlayGradientIntensity || 50}
                                    onChange={(e) =>
                                        handleGradientIntensityChange(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        )}
                    </div>

                    {/* Правая колонка - выбор цвета */}
                    <div>
                        <Label>Цвет наложения</Label>
                        <div className="space-y-3">
                            <HexColorPicker
                                color={slide.overlayColor || '#000000'}
                                onChange={handleColorChange}
                            />
                            <Input
                                value={slide.overlayColor || '#000000'}
                                onChange={(e) => handleColorChange(e.target.value)}
                                placeholder="#000000"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

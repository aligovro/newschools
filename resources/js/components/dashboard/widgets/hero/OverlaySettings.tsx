import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import React from 'react';
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

    return (
        <div className="grid grid-cols-2 gap-6">
            {/* Левая колонка - настройки */}
            <div className="space-y-4">
                <div>
                    <Label>Прозрачность наложения (%)</Label>
                    <Input
                        type="number"
                        min="0"
                        max="100"
                        value={slide.overlayOpacity || 50}
                        onChange={(e) => handleOpacityChange(e.target.value)}
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
    );
};

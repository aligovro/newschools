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

interface HeroSettingsProps {
    type: 'single' | 'slider';
    height: string;
    animation: 'fade' | 'slide' | 'zoom';
    autoplay: boolean;
    autoplayDelay: number;
    loop: boolean;
    showDots: boolean;
    showArrows: boolean;
    css_class?: string;
    onTypeChange: (type: 'single' | 'slider') => void;
    onHeightChange: (height: string) => void;
    onAnimationChange: (animation: 'fade' | 'slide' | 'zoom') => void;
    onAutoplayChange: (autoplay: boolean) => void;
    onAutoplayDelayChange: (delay: number) => void;
    onLoopChange: (loop: boolean) => void;
    onShowDotsChange: (show: boolean) => void;
    onShowArrowsChange: (show: boolean) => void;
    onCssClassChange: (css_class: string) => void;
}

export const HeroSettings: React.FC<HeroSettingsProps> = ({
    type,
    height,
    animation,
    autoplay,
    autoplayDelay,
    loop,
    showDots,
    showArrows,
    css_class,
    onTypeChange,
    onHeightChange,
    onAnimationChange,
    onAutoplayChange,
    onAutoplayDelayChange,
    onLoopChange,
    onShowDotsChange,
    onShowArrowsChange,
    onCssClassChange,
}) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="type">Тип Hero секции</Label>
                    <Select value={type} onValueChange={onTypeChange}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="single">
                                Одна картинка
                            </SelectItem>
                            <SelectItem value="slider">Слайдер</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="height">Высота (px)</Label>
                    <Input
                        id="height"
                        type="number"
                        value={parseInt(height)}
                        onChange={(e) => onHeightChange(`${e.target.value}px`)}
                    />
                </div>
            </div>

            {type === 'slider' && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="animation">Анимация</Label>
                            <Select
                                value={animation}
                                onValueChange={onAnimationChange}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fade">
                                        Плавное появление
                                    </SelectItem>
                                    <SelectItem value="slide">
                                        Скольжение
                                    </SelectItem>
                                    <SelectItem value="zoom">
                                        Масштабирование
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="autoplayDelay">
                                Задержка автопрокрутки (мс)
                            </Label>
                            <Input
                                id="autoplayDelay"
                                type="number"
                                value={autoplayDelay}
                                onChange={(e) =>
                                    onAutoplayDelayChange(
                                        parseInt(e.target.value),
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="autoplay"
                                checked={autoplay}
                                onCheckedChange={onAutoplayChange}
                            />
                            <Label htmlFor="autoplay">Автопрокрутка</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="loop"
                                checked={loop}
                                onCheckedChange={onLoopChange}
                            />
                            <Label htmlFor="loop">Зацикливание</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="showDots"
                                checked={showDots}
                                onCheckedChange={onShowDotsChange}
                            />
                            <Label htmlFor="showDots">Показать точки</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="showArrows"
                                checked={showArrows}
                                onCheckedChange={onShowArrowsChange}
                            />
                            <Label htmlFor="showArrows">Показать стрелки</Label>
                        </div>
                    </div>
                </>
            )}

            <div>
                <Label htmlFor="css_class">CSS класс для обертки</Label>
                <Input
                    id="css_class"
                    value={css_class || ''}
                    onChange={(e) => onCssClassChange(e.target.value)}
                    placeholder="my-custom-hero-class"
                />
                <p className="mt-1 text-sm text-gray-500">
                    Добавьте CSS класс для кастомной стилизации Hero секции.
                </p>
            </div>
        </div>
    );
};

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
    height: string;
    animation: 'fade' | 'slide' | 'zoom';
    autoplay: boolean;
    autoplayDelay: number;
    loop: boolean;
    showDots: boolean;
    showArrows: boolean;
    onHeightChange: (height: string) => void;
    onAnimationChange: (animation: 'fade' | 'slide' | 'zoom') => void;
    onAutoplayChange: (autoplay: boolean) => void;
    onAutoplayDelayChange: (delay: number) => void;
    onLoopChange: (loop: boolean) => void;
    onShowDotsChange: (show: boolean) => void;
    onShowArrowsChange: (show: boolean) => void;
}

export const HeroSettings: React.FC<HeroSettingsProps> = ({
    height,
    animation,
    autoplay,
    autoplayDelay,
    loop,
    showDots,
    showArrows,
    onHeightChange,
    onAnimationChange,
    onAutoplayChange,
    onAutoplayDelayChange,
    onLoopChange,
    onShowDotsChange,
    onShowArrowsChange,
}) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="height">Высота (px)</Label>
                    <Input
                        id="height"
                        type="number"
                        value={parseInt(height)}
                        onChange={(e) => onHeightChange(`${e.target.value}px`)}
                    />
                </div>

                <div>
                    <Label htmlFor="animation">Анимация</Label>
                    <Select value={animation} onValueChange={onAnimationChange}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fade">
                                Плавное появление
                            </SelectItem>
                            <SelectItem value="slide">Скольжение</SelectItem>
                            <SelectItem value="zoom">
                                Масштабирование
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
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
                        onAutoplayDelayChange(parseInt(e.target.value))
                    }
                />
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
        </div>
    );
};

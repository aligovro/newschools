import ImageUploader from '@/components/dashboard/settings/sites/ImageUploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { OverlaySettings } from './OverlaySettings';
import { HeroSlide } from './types';

interface HeroSlideEditorProps {
    slide: HeroSlide;
    index: number;
    type: 'single' | 'slider';
    totalSlides: number;
    onSlideUpdate: (updatedSlide: HeroSlide) => void;
    onSlideDelete: () => void;
    onImageUpload: (file: File, serverUrl?: string) => void;
    onImageCrop: (url: string) => void;
    onImageDelete: () => void;
    getGradientStyle: (
        color: string,
        opacity: number,
        gradient: string,
        intensity: number,
    ) => string;
}

export const HeroSlideEditor: React.FC<HeroSlideEditorProps> = ({
    slide,
    index,
    type,
    totalSlides,
    onSlideUpdate,
    onSlideDelete,
    onImageUpload,
    onImageCrop,
    onImageDelete,
    getGradientStyle,
}) => {
    // Состояние для показа/скрытия настроек кнопки
    const hasButton = !!(slide.buttonText && slide.buttonText.trim());
    const [showButtonSettings, setShowButtonSettings] = useState(hasButton);

    // Синхронизируем состояние при изменении slide
    useEffect(() => {
        const currentHasButton = !!(
            slide.buttonText && slide.buttonText.trim()
        );
        setShowButtonSettings(currentHasButton);
    }, [slide.buttonText]);

    const handleFieldChange = (
        field: keyof HeroSlide,
        value: string | boolean,
    ) => {
        const updatedSlide = {
            ...slide,
            [field]: value,
        };
        onSlideUpdate(updatedSlide);
    };

    const handleToggleButton = (checked: boolean) => {
        setShowButtonSettings(checked);
        if (!checked) {
            // Если отключаем, очищаем все настройки кнопки
            const updatedSlide = {
                ...slide,
                buttonText: '',
                buttonLink: '',
                buttonOpenInNewTab: false,
            };
            onSlideUpdate(updatedSlide);
        }
    };

    return (
        <Card>
            <CardContent className="p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-medium">
                        {type === 'slider'
                            ? `Слайд ${index + 1}`
                            : 'Основной контент'}
                    </h4>
                    {type === 'slider' && totalSlides > 1 && (
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={onSlideDelete}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="space-y-3">
                    {/* Загрузка изображения */}
                    <div>
                        <Label>Фоновое изображение</Label>
                        <ImageUploader
                            key={`image-uploader-${slide.id}-${slide.backgroundImage || 'empty'}`}
                            onImageUpload={onImageUpload}
                            onImageCrop={onImageCrop}
                            onImageDelete={onImageDelete}
                            //aspectRatio={16 / 9}
                            className="mt-2"
                            widgetSlug="hero-slider"
                            imageType="background"
                            slideId={slide.id}
                            enableServerUpload={true}
                            existingImageUrl={slide.backgroundImage || ''}
                            hidePreview={false}
                        />
                        {/* <ImagePreview
                            slide={slide}
                            getGradientStyle={getGradientStyle}
                        /> */}
                    </div>

                    {/* Настройки наложения */}
                    <OverlaySettings
                        slide={slide}
                        onSlideUpdate={onSlideUpdate}
                    />

                    {/* Основные поля - компактное размещение */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-sm">Заголовок</Label>
                                <Input
                                    value={slide.title}
                                    onChange={(e) =>
                                        handleFieldChange(
                                            'title',
                                            e.target.value,
                                        )
                                    }
                                    className="h-9"
                                />
                            </div>

                            <div>
                                <Label className="text-sm">Подзаголовок</Label>
                                <Input
                                    value={slide.subtitle || ''}
                                    onChange={(e) =>
                                        handleFieldChange(
                                            'subtitle',
                                            e.target.value,
                                        )
                                    }
                                    className="h-9"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-sm">Описание</Label>
                            <Textarea
                                value={slide.description || ''}
                                onChange={(e) =>
                                    handleFieldChange(
                                        'description',
                                        e.target.value,
                                    )
                                }
                                className="min-h-[60px]"
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Переключатель для настроек кнопки */}
                    <div className="flex items-center space-x-2">
                        <Switch
                            id={`showButton-${slide.id}`}
                            checked={showButtonSettings}
                            onCheckedChange={handleToggleButton}
                        />
                        <Label htmlFor={`showButton-${slide.id}`}>
                            Добавить кнопку
                        </Label>
                    </div>

                    {/* Настройки кнопки (показываются только если включено) */}
                    {showButtonSettings && (
                        <div className="space-y-4 rounded-lg border p-4">
                            <div>
                                <Label>Текст кнопки</Label>
                                <Input
                                    value={slide.buttonText || ''}
                                    onChange={(e) =>
                                        handleFieldChange(
                                            'buttonText',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Ссылка кнопки</Label>
                                    <Input
                                        value={slide.buttonLink || ''}
                                        onChange={(e) =>
                                            handleFieldChange(
                                                'buttonLink',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="https://example.com или /page"
                                    />
                                </div>

                                <div>
                                    <Label>Тип ссылки</Label>
                                    <Select
                                        value={
                                            slide.buttonLinkType || 'internal'
                                        }
                                        onValueChange={(value) =>
                                            handleFieldChange(
                                                'buttonLinkType',
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="internal">
                                                Внутренняя
                                            </SelectItem>
                                            <SelectItem value="external">
                                                Внешняя
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id={`openNewTab-${slide.id}`}
                                    checked={slide.buttonOpenInNewTab || false}
                                    onCheckedChange={(checked) =>
                                        handleFieldChange(
                                            'buttonOpenInNewTab',
                                            checked,
                                        )
                                    }
                                />
                                <Label htmlFor={`openNewTab-${slide.id}`}>
                                    Открывать в новом окне
                                </Label>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

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
import { Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import ImageUploader from '@/components/dashboard/settings/sites/ImageUploader';
import { SliderSlide } from './types';

interface SliderSlideEditorProps {
    slides: SliderSlide[];
    onSlideUpdate: (slide: SliderSlide) => void;
    onAddSlide: () => void;
    onDeleteSlide: (slideId: string) => void;
    onImageUpload: (slideId: string, file: File, serverUrl?: string) => void;
    onImageCrop: (slideId: string, url: string) => void;
    onImageDelete: (slideId: string) => void;
}

export const SliderSlideEditor: React.FC<SliderSlideEditorProps> = ({
    slides,
    onSlideUpdate,
    onAddSlide,
    onDeleteSlide,
    onImageUpload,
    onImageCrop,
    onImageDelete,
}) => {
    const [editingSlide, setEditingSlide] = useState<SliderSlide | null>(null);

    const handleSlideChange = (
        slideId: string,
        field: keyof SliderSlide,
        value: unknown,
    ) => {
        const slide = slides.find((s) => s.id === slideId);
        if (slide) {
            onSlideUpdate({
                ...slide,
                [field]: value,
            });
        }
    };

    const handleOverlayChange = (
        slideId: string,
        overlayField: string,
        value: unknown,
    ) => {
        const slide = slides.find((s) => s.id === slideId);
        if (slide) {
            onSlideUpdate({
                ...slide,
                [overlayField]: value,
            });
        }
    };

    const renderSlidePreview = (slide: SliderSlide) => {
        const overlayStyle =
            slide.overlayOpacity &&
            slide.overlayOpacity > 0 &&
            slide.overlayGradient !== 'none'
                ? getGradientStyle(
                      slide.overlayColor || '#000000',
                      slide.overlayOpacity,
                      slide.overlayGradient || 'none',
                      slide.overlayGradientIntensity || 50,
                  )
                : slide.overlayOpacity && slide.overlayOpacity > 0
                  ? `${slide.overlayColor || '#000000'}${Math.round(
                        ((slide.overlayOpacity || 0) / 100) * 255,
                    )
                        .toString(16)
                        .padStart(2, '0')}`
                  : '';

        return (
            <div className="relative h-32 overflow-hidden rounded-lg bg-gray-100">
                {slide.backgroundImage ? (
                    <>
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage: `url(${slide.backgroundImage})`,
                            }}
                        />
                        {overlayStyle && (
                            <div
                                className="absolute inset-0"
                                style={{ background: overlayStyle }}
                            />
                        )}
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        Нет изображения
                    </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 text-white">
                    <div className="truncate text-sm font-medium">
                        {slide.title}
                    </div>
                </div>
            </div>
        );
    };

    const getGradientStyle = (
        color: string,
        opacity: number,
        gradient: string,
        intensity: number,
    ) => {
        const alpha = opacity / 100;
        const colorWithAlpha = `${color}${Math.round(alpha * 255)
            .toString(16)
            .padStart(2, '0')}`;

        switch (gradient) {
            case 'left':
                return `linear-gradient(to right, ${colorWithAlpha} ${intensity}%, transparent)`;
            case 'right':
                return `linear-gradient(to left, ${colorWithAlpha} ${intensity}%, transparent)`;
            case 'top':
                return `linear-gradient(to bottom, ${colorWithAlpha} ${intensity}%, transparent)`;
            case 'bottom':
                return `linear-gradient(to top, ${colorWithAlpha} ${intensity}%, transparent)`;
            case 'center':
                return `radial-gradient(circle, ${colorWithAlpha} ${intensity}%, transparent)`;
            default:
                return colorWithAlpha;
        }
    };

    return (
        <div className="space-y-4">
            {/* Кнопка добавления слайда */}
            <div className="flex items-center justify-between">
                <h4 className="text-md font-semibold">
                    Слайды ({slides.length})
                </h4>
                <Button onClick={onAddSlide} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить слайд
                </Button>
            </div>

            {/* Список слайдов */}
            <div className="space-y-4">
                {slides
                    .sort((a, b) => parseInt(b.id) - parseInt(a.id))
                    .map((slide, index) => (
                        <Card key={slide.id}>
                            <CardContent className="p-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <h5 className="text-sm font-medium text-gray-900">
                                        Слайд {index + 1}
                                    </h5>
                                    <div className="flex space-x-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setEditingSlide(
                                                    editingSlide?.id ===
                                                        slide.id
                                                        ? null
                                                        : slide,
                                                )
                                            }
                                        >
                                            {editingSlide?.id === slide.id
                                                ? 'Свернуть'
                                                : 'Редактировать'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() =>
                                                onDeleteSlide(slide.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Превью слайда */}
                                <div className="mb-4">
                                    {renderSlidePreview(slide)}
                                </div>

                                {/* Форма редактирования */}
                                {editingSlide?.id === slide.id && (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {/* Основные поля */}
                                        <div className="space-y-4">
                                            <div>
                                                <Label
                                                    htmlFor={`title-${slide.id}`}
                                                >
                                                    Заголовок
                                                </Label>
                                                <Input
                                                    id={`title-${slide.id}`}
                                                    value={slide.title}
                                                    onChange={(e) =>
                                                        handleSlideChange(
                                                            slide.id,
                                                            'title',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <Label
                                                    htmlFor={`subtitle-${slide.id}`}
                                                >
                                                    Подзаголовок
                                                </Label>
                                                <Input
                                                    id={`subtitle-${slide.id}`}
                                                    value={slide.subtitle || ''}
                                                    onChange={(e) =>
                                                        handleSlideChange(
                                                            slide.id,
                                                            'subtitle',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <Label
                                                    htmlFor={`description-${slide.id}`}
                                                >
                                                    Описание
                                                </Label>
                                                <Textarea
                                                    id={`description-${slide.id}`}
                                                    value={
                                                        slide.description || ''
                                                    }
                                                    onChange={(e) =>
                                                        handleSlideChange(
                                                            slide.id,
                                                            'description',
                                                            e.target.value,
                                                        )
                                                    }
                                                    rows={3}
                                                />
                                            </div>

                                            <div>
                                                <Label
                                                    htmlFor={`buttonText-${slide.id}`}
                                                >
                                                    Текст кнопки
                                                </Label>
                                                <Input
                                                    id={`buttonText-${slide.id}`}
                                                    value={
                                                        slide.buttonText || ''
                                                    }
                                                    onChange={(e) =>
                                                        handleSlideChange(
                                                            slide.id,
                                                            'buttonText',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <Label
                                                    htmlFor={`buttonLink-${slide.id}`}
                                                >
                                                    Ссылка кнопки
                                                </Label>
                                                <Input
                                                    id={`buttonLink-${slide.id}`}
                                                    value={
                                                        slide.buttonLink || ''
                                                    }
                                                    onChange={(e) =>
                                                        handleSlideChange(
                                                            slide.id,
                                                            'buttonLink',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        id={`buttonOpenInNewTab-${slide.id}`}
                                                        checked={
                                                            slide.buttonOpenInNewTab ||
                                                            false
                                                        }
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            handleSlideChange(
                                                                slide.id,
                                                                'buttonOpenInNewTab',
                                                                checked,
                                                            )
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`buttonOpenInNewTab-${slide.id}`}
                                                    >
                                                        Открывать в новой
                                                        вкладке
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Изображение и наложение */}
                                        <div className="space-y-4">
                                            <div>
                                                <Label>
                                                    Фоновое изображение
                                                </Label>
                                                <ImageUploader
                                                    key={`image-uploader-${slide.id}-${slide.backgroundImage || 'empty'}`}
                                                    onImageUpload={(
                                                        file,
                                                        serverUrl,
                                                    ) =>
                                                        onImageUpload(
                                                            slide.id,
                                                            file,
                                                            serverUrl,
                                                        )
                                                    }
                                                    onImageCrop={(url) =>
                                                        onImageCrop(
                                                            slide.id,
                                                            url,
                                                        )
                                                    }
                                                    aspectRatio={16 / 9}
                                                    className="mt-2"
                                                    widgetSlug="slider-widget"
                                                    imageType="background"
                                                    slideId={slide.id}
                                                    enableServerUpload={true}
                                                    existingImageUrl={
                                                        slide.backgroundImage ||
                                                        ''
                                                    }
                                                />
                                                {slide.backgroundImage && (
                                                    <div className="mt-2">
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() =>
                                                                onImageDelete(
                                                                    slide.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Удалить изображение
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Настройки наложения */}
                                            <div>
                                                <h6 className="mb-2 text-sm font-medium text-gray-700">
                                                    Наложение
                                                </h6>
                                                <div className="space-y-3">
                                                    <div>
                                                        <Label
                                                            htmlFor={`overlayColor-${slide.id}`}
                                                        >
                                                            Цвет наложения
                                                        </Label>
                                                        <div className="flex items-center space-x-2">
                                                            <Input
                                                                id={`overlayColor-${slide.id}`}
                                                                type="color"
                                                                value={
                                                                    slide.overlayColor ||
                                                                    '#000000'
                                                                }
                                                                onChange={(e) =>
                                                                    handleOverlayChange(
                                                                        slide.id,
                                                                        'overlayColor',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="h-8 w-16"
                                                            />
                                                            <Input
                                                                value={
                                                                    slide.overlayColor ||
                                                                    '#000000'
                                                                }
                                                                onChange={(e) =>
                                                                    handleOverlayChange(
                                                                        slide.id,
                                                                        'overlayColor',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="flex-1"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <Label
                                                            htmlFor={`overlayOpacity-${slide.id}`}
                                                        >
                                                            Прозрачность (
                                                            {slide.overlayOpacity ||
                                                                0}
                                                            %)
                                                        </Label>
                                                        <Input
                                                            id={`overlayOpacity-${slide.id}`}
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={
                                                                slide.overlayOpacity ||
                                                                0
                                                            }
                                                            onChange={(e) =>
                                                                handleOverlayChange(
                                                                    slide.id,
                                                                    'overlayOpacity',
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label
                                                            htmlFor={`overlayGradient-${slide.id}`}
                                                        >
                                                            Градиент
                                                        </Label>
                                                        <Select
                                                            value={
                                                                slide.overlayGradient ||
                                                                'none'
                                                            }
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                handleOverlayChange(
                                                                    slide.id,
                                                                    'overlayGradient',
                                                                    value,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="none">
                                                                    Нет
                                                                </SelectItem>
                                                                <SelectItem value="left">
                                                                    Слева
                                                                </SelectItem>
                                                                <SelectItem value="right">
                                                                    Справа
                                                                </SelectItem>
                                                                <SelectItem value="top">
                                                                    Сверху
                                                                </SelectItem>
                                                                <SelectItem value="bottom">
                                                                    Снизу
                                                                </SelectItem>
                                                                <SelectItem value="center">
                                                                    По центру
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {slide.overlayGradient &&
                                                        slide.overlayGradient !==
                                                            'none' && (
                                                            <div>
                                                                <Label
                                                                    htmlFor={`overlayGradientIntensity-${slide.id}`}
                                                                >
                                                                    Интенсивность
                                                                    градиента (
                                                                    {slide.overlayGradientIntensity ||
                                                                        50}
                                                                    %)
                                                                </Label>
                                                                <Input
                                                                    id={`overlayGradientIntensity-${slide.id}`}
                                                                    type="range"
                                                                    min="0"
                                                                    max="100"
                                                                    value={
                                                                        slide.overlayGradientIntensity ||
                                                                        50
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleOverlayChange(
                                                                            slide.id,
                                                                            'overlayGradientIntensity',
                                                                            parseInt(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
            </div>

            {slides.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                    <p>Слайды не добавлены</p>
                    <Button onClick={onAddSlide} className="mt-2">
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить первый слайд
                    </Button>
                </div>
            )}
        </div>
    );
};

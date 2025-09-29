import { Button } from '@/components/common/ui/button';
import { Card } from '@/components/common/ui/card';
import { Checkbox } from '@/components/common/ui/checkbox';
import { Input } from '@/components/common/ui/input';
import { Label } from '@/components/common/ui/label';
import { Select } from '@/components/common/ui/select';
import { Textarea } from '@/components/common/ui/textarea';
import { cn } from '@/lib/utils';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Edit, GripVertical, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

interface Slide {
    id: number;
    title?: string;
    subtitle?: string;
    description?: string;
    image?: string;
    background_image?: string;
    button_text?: string;
    button_url?: string;
    button_style?: string;
    is_active: boolean;
    sort_order: number;
    image_url?: string;
    background_image_url?: string;
}

interface Slider {
    id: number;
    name: string;
    type: string;
    position: string;
    settings: any;
    is_active: boolean;
    sort_order: number;
    slides: Slide[];
}

interface Organization {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    organization: Organization;
    slider: Slider;
    sliderTypes: Record<string, any>;
    positions: Record<string, string>;
}

export default function SliderEdit({
    organization,
    slider,
    sliderTypes,
    positions,
}: Props) {
    const [showSlideForm, setShowSlideForm] = useState(false);
    const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
    const [draggedSlide, setDraggedSlide] = useState<number | null>(null);

    const { data, setData, put, processing, errors } = useForm({
        name: slider.name,
        type: slider.type,
        position: slider.position,
        settings: slider.settings || {},
        is_active: slider.is_active,
        sort_order: slider.sort_order,
        display_conditions: {},
    });

    const slideForm = useForm({
        title: '',
        subtitle: '',
        description: '',
        image: null as File | null,
        background_image: null as File | null,
        button_text: '',
        button_url: '',
        button_style: 'primary',
        is_active: true,
        sort_order: slider.slides.length,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(
            route('organization.admin.sliders.update', [
                organization.id,
                slider.id,
            ]),
        );
    };

    const handleSlideSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        Object.entries(slideForm.data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });

        if (editingSlide) {
            router.post(
                route('organization.admin.sliders.update-slide', [
                    organization.id,
                    slider.id,
                    editingSlide.id,
                ]),
                formData,
                {
                    forceFormData: true,
                    onSuccess: () => {
                        setShowSlideForm(false);
                        setEditingSlide(null);
                        slideForm.reset();
                    },
                },
            );
        } else {
            router.post(
                route('organization.admin.sliders.store-slide', [
                    organization.id,
                    slider.id,
                ]),
                formData,
                {
                    forceFormData: true,
                    onSuccess: () => {
                        setShowSlideForm(false);
                        slideForm.reset();
                    },
                },
            );
        }
    };

    const handleEditSlide = (slide: Slide) => {
        setEditingSlide(slide);
        slideForm.setData({
            title: slide.title || '',
            subtitle: slide.subtitle || '',
            description: slide.description || '',
            image: null,
            background_image: null,
            button_text: slide.button_text || '',
            button_url: slide.button_url || '',
            button_style: slide.button_style || 'primary',
            is_active: slide.is_active,
            sort_order: slide.sort_order,
        });
        setShowSlideForm(true);
    };

    const handleDeleteSlide = (slide: Slide) => {
        if (
            confirm(
                `Вы уверены, что хотите удалить слайд "${slide.title || 'Без названия'}"?`,
            )
        ) {
            router.delete(
                route('organization.admin.sliders.destroy-slide', [
                    organization.id,
                    slider.id,
                    slide.id,
                ]),
            );
        }
    };

    const handleDragStart = (e: React.DragEvent, slideId: number) => {
        setDraggedSlide(slideId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetSlideId: number) => {
        e.preventDefault();

        if (draggedSlide && draggedSlide !== targetSlideId) {
            const slides = [...slider.slides];
            const draggedIndex = slides.findIndex((s) => s.id === draggedSlide);
            const targetIndex = slides.findIndex((s) => s.id === targetSlideId);

            const [movedSlide] = slides.splice(draggedIndex, 1);
            slides.splice(targetIndex, 0, movedSlide);

            const updatedSlides = slides.map((slide, index) => ({
                ...slide,
                sort_order: index,
            }));

            router.patch(
                route('organization.admin.sliders.reorder-slides', [
                    organization.id,
                    slider.id,
                ]),
                {
                    slides: updatedSlides.map((s) => ({
                        id: s.id,
                        sort_order: s.sort_order,
                    })),
                },
            );
        }

        setDraggedSlide(null);
    };

    const getSliderTypeName = (type: string) => {
        return sliderTypes[type]?.name || type;
    };

    const getPositionName = (position: string) => {
        return positions[position] || position;
    };

    return (
        <>
            <Head title={`Редактировать слайдер - ${organization.name}`} />

            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Редактировать слайдер
                        </h1>
                        <p className="text-gray-600">{slider.name}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Настройки слайдера */}
                    <Card className="p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Настройки слайдера
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Название</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="mt-1"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="type">Тип</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) =>
                                            setData('type', value)
                                        }
                                    >
                                        {Object.entries(sliderTypes).map(
                                            ([key, config]) => (
                                                <option key={key} value={key}>
                                                    {config.name}
                                                </option>
                                            ),
                                        )}
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="position">Позиция</Label>
                                    <Select
                                        value={data.position}
                                        onValueChange={(value) =>
                                            setData('position', value)
                                        }
                                    >
                                        {Object.entries(positions).map(
                                            ([key, name]) => (
                                                <option key={key} value={key}>
                                                    {name}
                                                </option>
                                            ),
                                        )}
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) =>
                                        setData('is_active', !!checked)
                                    }
                                />
                                <Label htmlFor="is_active">Активен</Label>
                            </div>

                            <Button type="submit" disabled={processing}>
                                {processing
                                    ? 'Сохранение...'
                                    : 'Сохранить настройки'}
                            </Button>
                        </form>
                    </Card>

                    {/* Слайды */}
                    <Card className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Слайды</h2>
                            <Button
                                onClick={() => {
                                    setEditingSlide(null);
                                    slideForm.reset();
                                    setShowSlideForm(true);
                                }}
                                size="sm"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Добавить слайд
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {slider.slides.map((slide) => (
                                <div
                                    key={slide.id}
                                    className={cn(
                                        'flex items-center space-x-3 rounded-lg border p-3',
                                        draggedSlide === slide.id &&
                                            'opacity-50',
                                    )}
                                    draggable
                                    onDragStart={(e) =>
                                        handleDragStart(e, slide.id)
                                    }
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, slide.id)}
                                >
                                    <GripVertical className="h-4 w-4 cursor-move text-gray-400" />

                                    {slide.image_url && (
                                        <img
                                            src={slide.image_url}
                                            alt={slide.title || ''}
                                            className="h-12 w-16 rounded object-cover"
                                        />
                                    )}

                                    <div className="flex-1">
                                        <h4 className="font-medium">
                                            {slide.title || 'Без названия'}
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                            {slide.subtitle}
                                        </p>
                                    </div>

                                    <div className="flex items-center space-x-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleEditSlide(slide)
                                            }
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleDeleteSlide(slide)
                                            }
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Форма слайда */}
                {showSlideForm && (
                    <Card className="p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            {editingSlide
                                ? 'Редактировать слайд'
                                : 'Добавить слайд'}
                        </h2>

                        <form
                            onSubmit={handleSlideSubmit}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="slide_title">
                                        Заголовок
                                    </Label>
                                    <Input
                                        id="slide_title"
                                        value={slideForm.data.title}
                                        onChange={(e) =>
                                            slideForm.setData(
                                                'title',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="slide_subtitle">
                                        Подзаголовок
                                    </Label>
                                    <Input
                                        id="slide_subtitle"
                                        value={slideForm.data.subtitle}
                                        onChange={(e) =>
                                            slideForm.setData(
                                                'subtitle',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="slide_description">
                                    Описание
                                </Label>
                                <Textarea
                                    id="slide_description"
                                    value={slideForm.data.description}
                                    onChange={(e) =>
                                        slideForm.setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="slide_image">
                                        Изображение
                                    </Label>
                                    <Input
                                        id="slide_image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            slideForm.setData(
                                                'image',
                                                e.target.files?.[0] || null,
                                            )
                                        }
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="slide_background_image">
                                        Фоновое изображение
                                    </Label>
                                    <Input
                                        id="slide_background_image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            slideForm.setData(
                                                'background_image',
                                                e.target.files?.[0] || null,
                                            )
                                        }
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <Label htmlFor="slide_button_text">
                                        Текст кнопки
                                    </Label>
                                    <Input
                                        id="slide_button_text"
                                        value={slideForm.data.button_text}
                                        onChange={(e) =>
                                            slideForm.setData(
                                                'button_text',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="slide_button_url">
                                        URL кнопки
                                    </Label>
                                    <Input
                                        id="slide_button_url"
                                        value={slideForm.data.button_url}
                                        onChange={(e) =>
                                            slideForm.setData(
                                                'button_url',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="slide_button_style">
                                        Стиль кнопки
                                    </Label>
                                    <Select
                                        value={slideForm.data.button_style}
                                        onValueChange={(value) =>
                                            slideForm.setData(
                                                'button_style',
                                                value,
                                            )
                                        }
                                    >
                                        <option value="primary">
                                            Основной
                                        </option>
                                        <option value="secondary">
                                            Вторичный
                                        </option>
                                        <option value="outline">Контур</option>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="slide_is_active"
                                    checked={slideForm.data.is_active}
                                    onCheckedChange={(checked) =>
                                        slideForm.setData(
                                            'is_active',
                                            !!checked,
                                        )
                                    }
                                />
                                <Label htmlFor="slide_is_active">Активен</Label>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowSlideForm(false);
                                        setEditingSlide(null);
                                        slideForm.reset();
                                    }}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={slideForm.processing}
                                >
                                    {slideForm.processing
                                        ? 'Сохранение...'
                                        : 'Сохранить слайд'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                )}
            </div>
        </>
    );
}

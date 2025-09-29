import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import {
    Edit,
    Eye,
    EyeOff,
    GripVertical,
    Plus,
    Settings,
    Trash2,
} from 'lucide-react';
import React, { useState } from 'react';

interface Slide {
    id: number;
    title?: string;
    image?: string;
    is_active: boolean;
    sort_order: number;
}

interface Slider {
    id: number;
    name: string;
    type: string;
    position: string;
    is_active: boolean;
    sort_order: number;
    slides: Slide[];
    created_at: string;
    updated_at: string;
}

interface Organization {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    organization: Organization;
    sliders: Slider[];
    sliderTypes: Record<string, any>;
    positions: Record<string, string>;
}

export default function SlidersIndex({
    organization,
    sliders,
    sliderTypes,
    positions,
}: Props) {
    const [draggedSlider, setDraggedSlider] = useState<number | null>(null);

    const handleDelete = (slider: Slider) => {
        if (
            confirm(`Вы уверены, что хотите удалить слайдер "${slider.name}"?`)
        ) {
            router.delete(
                route('organization.admin.sliders.destroy', [
                    organization.id,
                    slider.id,
                ]),
            );
        }
    };

    const handleToggleActive = (slider: Slider) => {
        router.patch(
            route('organization.admin.sliders.update', [
                organization.id,
                slider.id,
            ]),
            {
                is_active: !slider.is_active,
            },
        );
    };

    const handleDragStart = (e: React.DragEvent, sliderId: number) => {
        setDraggedSlider(sliderId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetSliderId: number) => {
        e.preventDefault();

        if (draggedSlider && draggedSlider !== targetSliderId) {
            const draggedSliderData = sliders.find(
                (s) => s.id === draggedSlider,
            );
            const targetSliderData = sliders.find(
                (s) => s.id === targetSliderId,
            );

            if (draggedSliderData && targetSliderData) {
                const newSliders = [...sliders];
                const draggedIndex = newSliders.findIndex(
                    (s) => s.id === draggedSlider,
                );
                const targetIndex = newSliders.findIndex(
                    (s) => s.id === targetSliderId,
                );

                // Перемещаем элемент
                const [movedSlider] = newSliders.splice(draggedIndex, 1);
                newSliders.splice(targetIndex, 0, movedSlider);

                // Обновляем sort_order
                const updatedSliders = newSliders.map((slider, index) => ({
                    ...slider,
                    sort_order: index,
                }));

                router.patch(
                    route(
                        'organization.admin.sliders.reorder',
                        organization.id,
                    ),
                    {
                        sliders: updatedSliders.map((s) => ({
                            id: s.id,
                            sort_order: s.sort_order,
                        })),
                    },
                );
            }
        }

        setDraggedSlider(null);
    };

    const getSliderTypeName = (type: string) => {
        return sliderTypes[type]?.name || type;
    };

    const getPositionName = (position: string) => {
        return positions[position] || position;
    };

    return (
        <>
            <Head title={`Слайдеры - ${organization.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Слайдеры
                        </h1>
                        <p className="text-gray-600">
                            Управление слайдерами организации
                        </p>
                    </div>
                    <Link
                        href={route(
                            'organization.admin.sliders.create',
                            organization.id,
                        )}
                    >
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Создать слайдер
                        </Button>
                    </Link>
                </div>

                {sliders.length === 0 ? (
                    <Card className="p-8 text-center">
                        <Settings className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                            Нет слайдеров
                        </h3>
                        <p className="mt-2 text-gray-500">
                            Создайте первый слайдер для отображения контента на
                            сайте
                        </p>
                        <Link
                            href={route(
                                'organization.admin.sliders.create',
                                organization.id,
                            )}
                        >
                            <Button className="mt-4">
                                <Plus className="mr-2 h-4 w-4" />
                                Создать слайдер
                            </Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {sliders.map((slider) => (
                            <Card
                                key={slider.id}
                                className={cn(
                                    'p-6 transition-all',
                                    draggedSlider === slider.id && 'opacity-50',
                                )}
                                draggable
                                onDragStart={(e) =>
                                    handleDragStart(e, slider.id)
                                }
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, slider.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <GripVertical className="h-5 w-5 cursor-move text-gray-400" />
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {slider.name}
                                                </h3>
                                                <Badge
                                                    variant={
                                                        slider.is_active
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {slider.is_active
                                                        ? 'Активен'
                                                        : 'Неактивен'}
                                                </Badge>
                                            </div>
                                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                                <span>
                                                    Тип:{' '}
                                                    {getSliderTypeName(
                                                        slider.type,
                                                    )}
                                                </span>
                                                <span>
                                                    Позиция:{' '}
                                                    {getPositionName(
                                                        slider.position,
                                                    )}
                                                </span>
                                                <span>
                                                    Слайдов:{' '}
                                                    {slider.slides.length}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleToggleActive(slider)
                                            }
                                        >
                                            {slider.is_active ? (
                                                <Eye className="h-4 w-4" />
                                            ) : (
                                                <EyeOff className="h-4 w-4" />
                                            )}
                                        </Button>

                                        <Link
                                            href={route(
                                                'organization.admin.sliders.edit',
                                                [organization.id, slider.id],
                                            )}
                                        >
                                            <Button variant="ghost" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(slider)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

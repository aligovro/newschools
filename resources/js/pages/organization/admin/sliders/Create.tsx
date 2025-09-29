import { Button } from '@/components/common/ui/button';
import { Card } from '@/components/common/ui/card';
import { Checkbox } from '@/components/common/ui/checkbox';
import { Input } from '@/components/common/ui/input';
import { Label } from '@/components/common/ui/label';
import { Select } from '@/components/common/ui/select';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';

interface Organization {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    organization: Organization;
    sliderTypes: Record<string, any>;
    positions: Record<string, string>;
}

export default function SliderCreate({
    organization,
    sliderTypes,
    positions,
}: Props) {
    const [selectedType, setSelectedType] = useState<string>('hero');

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: 'hero',
        position: 'hero',
        settings: {},
        is_active: true,
        sort_order: 0,
        display_conditions: {},
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('organization.admin.sliders.store', organization.id));
    };

    const selectedTypeConfig = sliderTypes[selectedType] || {};

    return (
        <>
            <Head title={`Создать слайдер - ${organization.name}`} />

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
                            Создать слайдер
                        </h1>
                        <p className="text-gray-600">
                            Настройте новый слайдер для организации
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="p-6">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="name">
                                        Название слайдера
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="Введите название слайдера"
                                        className="mt-1"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="type">Тип слайдера</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) => {
                                            setData('type', value);
                                            setSelectedType(value);
                                        }}
                                    >
                                        {Object.entries(sliderTypes).map(
                                            ([key, config]) => (
                                                <option key={key} value={key}>
                                                    {config.name}
                                                </option>
                                            ),
                                        )}
                                    </Select>
                                    {selectedTypeConfig.description && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            {selectedTypeConfig.description}
                                        </p>
                                    )}
                                    {errors.type && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.type}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="position">
                                        Позиция на сайте
                                    </Label>
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
                                    {errors.position && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.position}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="sort_order">
                                        Порядок сортировки
                                    </Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) =>
                                            setData(
                                                'sort_order',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                        className="mt-1"
                                    />
                                    {errors.sort_order && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.sort_order}
                                        </p>
                                    )}
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
                        </div>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Отмена
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Создание...' : 'Создать слайдер'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

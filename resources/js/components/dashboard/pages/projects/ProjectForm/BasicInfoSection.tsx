import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import UniversalSelect from '@/components/ui/universal-select/UniversalSelect';
import { Target } from 'lucide-react';
import type { BasicInfoSectionProps, Project, StatusOption } from './types';

const statusOptions: StatusOption[] = [
    { value: 'draft', label: 'Черновик' },
    { value: 'active', label: 'Активный' },
    { value: 'completed', label: 'Завершен' },
    { value: 'cancelled', label: 'Отменен' },
    { value: 'suspended', label: 'Приостановлен' },
];

export function BasicInfoSection({
    data,
    errors,
    projectCategories = [],
    onDataChange,
}: BasicInfoSectionProps) {
    const handleCategoryToggle = (categoryId: number) => {
        const currentIds = new Set(data.category_ids || []);
        if (currentIds.has(categoryId)) {
            currentIds.delete(categoryId);
        } else {
            currentIds.add(categoryId);
        }

        const nextIds = projectCategories
            .filter((category) => currentIds.has(category.id))
            .map((category) => category.id);

        onDataChange('category_ids', nextIds);

        const primaryStillSelected = projectCategories.some(
            (category) =>
                category.slug === data.category &&
                nextIds.includes(category.id),
        );

        if (!primaryStillSelected) {
            const fallback =
                projectCategories.find((category) =>
                    nextIds.includes(category.id),
                ) ?? null;
            const nextCategory = fallback?.slug ?? '';

            if (nextCategory !== data.category) {
                onDataChange('category', nextCategory);
            }
        }
    };

    return (
        <div className="create-organization__section">
            <div className="create-organization__section-header">
                <Target className="create-organization__section-icon" />
                <h2 className="create-organization__section-title">
                    Основная информация
                </h2>
            </div>
            <div className="create-organization__section-content">
                <div className="create-organization__field-group create-organization__field-group--two-columns">
                    <div className="create-organization__field">
                        <Label htmlFor="title">
                            Название проекта
                            <span className="create-organization__required">
                                *
                            </span>
                        </Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) =>
                                onDataChange('title', e.target.value)
                            }
                            placeholder="Введите название проекта"
                            className={errors.title ? 'border-red-500' : ''}
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <div className="create-organization__field">
                        <Label htmlFor="slug">URL slug</Label>
                        <Input
                            id="slug"
                            value={data.slug}
                            onChange={(e) =>
                                onDataChange('slug', e.target.value)
                            }
                            placeholder="url-slug"
                            className={errors.slug ? 'border-red-500' : ''}
                        />
                        {errors.slug && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.slug}
                            </p>
                        )}
                    </div>
                </div>

                <div className="create-organization__field-group create-organization__field-group--two-columns">
                    {projectCategories.length > 0 && (
                        <div className="create-organization__field-group">
                            <div className="create-organization__field">
                                <Label>
                                    Категории проекта
                                    <span className="text-muted-foreground">
                                        {' '}
                                        (можно выбрать несколько)
                                    </span>
                                </Label>
                                <div className="mt-2 space-y-2">
                                    {projectCategories.map((category) => {
                                        const isChecked = (
                                            data.category_ids || []
                                        ).includes(category.id);
                                        return (
                                            <div
                                                key={category.id}
                                                className="flex items-center space-x-2"
                                            >
                                                <Checkbox
                                                    id={`category-${category.id}`}
                                                    checked={isChecked}
                                                    onCheckedChange={() =>
                                                        handleCategoryToggle(
                                                            category.id,
                                                        )
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`category-${category.id}`}
                                                    className="cursor-pointer font-normal"
                                                >
                                                    {category.name}
                                                    {category.description && (
                                                        <span className="ml-2 text-sm text-muted-foreground">
                                                            (
                                                            {
                                                                category.description
                                                            }
                                                            )
                                                        </span>
                                                    )}
                                                </Label>
                                            </div>
                                        );
                                    })}
                                </div>
                                {errors.category_ids && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.category_ids}
                                    </p>
                                )}
                                {errors.category && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.category}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="create-organization__field">
                        <UniversalSelect
                            options={statusOptions}
                            value={data.status}
                            onChange={(value) =>
                                onDataChange(
                                    'status',
                                    value as Project['status'],
                                )
                            }
                            label="Статус"
                            placeholder="Выберите статус"
                            error={errors.status}
                        />
                    </div>
                </div>

                <div className="create-organization__field-group">
                    <div className="create-organization__field">
                        <Label htmlFor="short_description">
                            Краткое описание
                        </Label>
                        <Textarea
                            id="short_description"
                            value={data.short_description}
                            onChange={(e) =>
                                onDataChange(
                                    'short_description',
                                    e.target.value,
                                )
                            }
                            placeholder="Краткое описание проекта"
                            rows={2}
                            className={
                                errors.short_description ? 'border-red-500' : ''
                            }
                        />
                        {errors.short_description && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.short_description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="create-organization__field-group">
                    <div className="create-organization__field">
                        <Label htmlFor="description">Описание проекта</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                onDataChange('description', e.target.value)
                            }
                            placeholder="Подробное описание проекта"
                            rows={8}
                            className={
                                errors.description ? 'border-red-500' : ''
                            }
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

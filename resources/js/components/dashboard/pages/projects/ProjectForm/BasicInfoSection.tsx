import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/RichTextEditor';
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
    slug,
    autoGenerateSlug,
    isSlugGenerating,
    slugValidation,
    onSlugChange,
    onAutoGenerateSlugChange,
    onRegenerateSlug,
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
                        <Label
                            htmlFor="title"
                            className="create-organization__label mb-1"
                        >
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
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <Label htmlFor="slug">URL slug</Label>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="project-auto-generate-slug"
                                    checked={autoGenerateSlug}
                                    onCheckedChange={(checked) => {
                                        onAutoGenerateSlugChange(!!checked);
                                        if (checked) {
                                            onRegenerateSlug();
                                        }
                                    }}
                                />
                                <Label
                                    htmlFor="project-auto-generate-slug"
                                    className="cursor-pointer text-sm font-normal"
                                >
                                    Сгенерировать автоматически
                                </Label>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                id="slug"
                                value={slug}
                                onChange={(e) => onSlugChange(e.target.value)}
                                placeholder="url-slug"
                                className={
                                    errors.slug ||
                                    (!slugValidation.isUnique &&
                                        slugValidation.isValid)
                                        ? 'border-red-500'
                                        : ''
                                }
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    onRegenerateSlug();
                                    onAutoGenerateSlugChange(true);
                                }}
                                disabled={isSlugGenerating}
                                className="rounded-md border border-gray-300 px-3 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                title="Перегенерировать slug"
                            >
                                {isSlugGenerating ? '...' : '⟳'}
                            </button>
                        </div>
                        {autoGenerateSlug && !slug && (
                            <p className="mt-1 text-xs text-gray-500">
                                Слаг будет сгенерирован из названия проекта
                            </p>
                        )}
                        {slugValidation.isValid && !slugValidation.isUnique && (
                            <p className="mt-1 text-sm text-red-600">
                                Такой slug уже существует
                                {slugValidation.suggestedSlug &&
                                    slugValidation.suggestedSlug !== slug && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onSlugChange(
                                                    slugValidation.suggestedSlug!,
                                                )
                                            }
                                            className="ml-2 text-blue-600 underline hover:text-blue-800"
                                        >
                                            Использовать:{' '}
                                            {slugValidation.suggestedSlug}
                                        </button>
                                    )}
                            </p>
                        )}
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
                        <RichTextEditor
                            value={data.description || ''}
                            onChange={(html) =>
                                onDataChange('description', html)
                            }
                            placeholder="Подробное описание проекта (поддерживается форматирование, списки, ссылки...)"
                            height={280}
                            level="simple"
                            showHtmlToggle={true}
                            showTemplates={false}
                            showWordCount={true}
                            showImageUpload={false}
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

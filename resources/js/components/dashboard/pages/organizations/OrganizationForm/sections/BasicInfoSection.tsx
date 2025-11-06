import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import type { Status, ReferenceData } from '../../types';
import type { SlugValidation } from './types';

interface BasicInfoSectionProps {
    name: string;
    slug: string;
    description: string;
    type: string;
    status: Status;
    autoGenerateSlug: boolean;
    isSlugGenerating: boolean;
    slugValidation: SlugValidation;
    referenceData: ReferenceData;
    errors: {
        name?: string;
        slug?: string;
    };
    onNameChange: (value: string) => void;
    onSlugChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onTypeChange: (value: string) => void;
    onStatusChange: (value: Status) => void;
    onAutoGenerateSlugChange: (checked: boolean) => void;
    onRegenerateSlug: () => void;
}

export function BasicInfoSection({
    name,
    slug,
    description,
    type,
    status,
    autoGenerateSlug,
    isSlugGenerating,
    slugValidation,
    referenceData,
    errors,
    onNameChange,
    onSlugChange,
    onDescriptionChange,
    onTypeChange,
    onStatusChange,
    onAutoGenerateSlugChange,
    onRegenerateSlug,
}: BasicInfoSectionProps) {
    return (
        <div className="rounded-lg border bg-white p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor="org-name">
                        Название организации *
                    </Label>
                    <Input
                        id="org-name"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.name}
                        </p>
                    )}
                </div>
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <Label htmlFor="org-slug">URL slug *</Label>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="auto-generate-slug"
                                checked={autoGenerateSlug}
                                onCheckedChange={(checked) => {
                                    onAutoGenerateSlugChange(!!checked);
                                    if (checked) {
                                        onRegenerateSlug();
                                    }
                                }}
                            />
                            <Label
                                htmlFor="auto-generate-slug"
                                className="cursor-pointer text-sm font-normal"
                            >
                                Сгенерировать автоматически
                            </Label>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            id="org-slug"
                            value={slug}
                            onChange={(e) => onSlugChange(e.target.value)}
                            placeholder={
                                autoGenerateSlug
                                    ? `Будет сгенерирован автоматически (например: ${type}-123)`
                                    : 'url-slug'
                            }
                            className={
                                !slugValidation.isUnique &&
                                slugValidation.isValid
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
                    {autoGenerateSlug && slug === type && (
                        <p className="mt-1 text-xs text-gray-500">
                            После сохранения будет добавлен ID (например:{' '}
                            {type}-123)
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
                    {errors.slug &&
                        (slugValidation.isValid ||
                            slugValidation.isUnique) && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.slug}
                            </p>
                        )}
                </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label>Тип организации *</Label>
                    <Select value={type} onValueChange={onTypeChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                        <SelectContent>
                            {referenceData.organizationTypes.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Статус *</Label>
                    <Select value={status} onValueChange={onStatusChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Выберите статус" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Активна</SelectItem>
                            <SelectItem value="inactive">Неактивна</SelectItem>
                            <SelectItem value="pending">
                                На рассмотрении
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="mt-4">
                <Label htmlFor="org-desc">Описание</Label>
                <Textarea
                    id="org-desc"
                    rows={3}
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                />
            </div>
        </div>
    );
}


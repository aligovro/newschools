import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Eye, FileText, Image, Save, Settings } from 'lucide-react';
import { useState, useMemo } from 'react';
import LogoUploader from '@/components/ui/image-uploader/LogoUploader';
import MultiImageUploader, {
    type UploadedImage,
} from '@/components/ui/image-uploader/MultiImageUploader';
import { organizationsApi } from '@/lib/api/organizations';

interface Site {
    id: number;
    name: string;
    slug: string;
}

interface ParentPage {
    id: number;
    title: string;
    slug: string;
}

interface Page {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    status: string;
    template?: string;
    is_homepage: boolean;
    is_public: boolean;
    show_in_navigation: boolean;
    parent_id?: number;
    sort_order: number;
    image?: string;
    images?: string[];
    published_at?: string;
    created_at: string;
    updated_at: string;
}

interface SitePageFormData {
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    status: 'draft' | 'published' | 'private';
    template?: string;
    is_homepage: boolean;
    is_public: boolean;
    show_in_navigation: boolean;
    parent_id?: number | null;
    sort_order: number;
    image?: string;
    images?: string[];
    published_at?: string;
}

interface SitePageFormProps {
    mode: 'create' | 'edit';
    site: Site;
    page?: Page;
    parentPages: ParentPage[];
}

export default function SitePageForm({
    mode,
    site,
    page,
    parentPages,
}: SitePageFormProps) {
    const [activeTab, setActiveTab] = useState<
        'content' | 'media' | 'settings'
    >('content');
    const [generateSlug, setGenerateSlug] = useState(mode === 'create');

    const { data, setData, post, put, processing, errors } =
        useForm<SitePageFormData>({
            title: page?.title || '',
            slug: page?.slug || '',
            excerpt: page?.excerpt || '',
            content: page?.content || '',
            status: (page?.status as any) || 'draft',
            template: page?.template || 'default',
            is_homepage: page?.is_homepage || false,
            is_public: page?.is_public || false,
            show_in_navigation: page?.show_in_navigation ?? true,
            parent_id: page?.parent_id || null,
            sort_order: page?.sort_order || 0,
            image: page?.image || '',
            images: page?.images || [],
            published_at: page?.published_at || '',
        });

    // Конвертация images (string[]) в UploadedImage[] для MultiImageUploader
    const uploadedImages = useMemo<UploadedImage[]>(() => {
        if (!data.images || !Array.isArray(data.images)) return [];
        return data.images.map((url, index) => ({
            id: `image-${index}`,
            url: url,
            name: url.split('/').pop() || `image-${index}`,
            size: 0,
            type: 'image/jpeg',
            status: 'success' as const,
        }));
    }, [data.images]);

    // Обработка изменения множественных изображений
    const handleImagesChange = (images: UploadedImage[]) => {
        const urls = images
            .filter((img) => img.status === 'success')
            .map((img) => img.url);
        setData('images', urls);
    };

    // Обработчик загрузки для LogoUploader
    const handleImageUpload = async (file: File): Promise<string> => {
        try {
            const response = await organizationsApi.uploadLogo(file);
            return response.url;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    // Обработчик загрузки для MultiImageUploader
    const handleMultipleImagesUpload = async (file: File): Promise<string> => {
        try {
            const response = await organizationsApi.uploadImages(file);
            // API возвращает массив изображений, берем первое
            return response.images[0]?.url || '';
        } catch (error) {
            console.error('Error uploading images:', error);
            throw error;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'edit' && page) {
            put(
                `/dashboard/sites/${site.id}/pages/${page.id}`,
                {
                    preserveScroll: true,
                }
            );
        } else {
            post(`/dashboard/sites/${site.id}/pages`);
        }
    };

    const handleTitleChange = (title: string) => {
        setData('title', title);
        if (generateSlug) {
            setData(
                'slug',
                title
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .trim()
            );
        }
    };

    const templates = [
        { value: 'default', label: 'Обычная страница' },
        { value: 'full-width', label: 'Полная ширина' },
        { value: 'landing', label: 'Лендинг' },
        { value: 'blog', label: 'Блог' },
        { value: 'contact', label: 'Контакты' },
        { value: 'about', label: 'О нас' },
    ];

    const statuses = [
        { value: 'draft', label: 'Черновик' },
        { value: 'published', label: 'Опубликовано' },
        { value: 'private', label: 'Приватная' },
    ];

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-3">
                        {/* Tabs */}
                        <div className="border-b">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('content')}
                                    className={`border-b-2 px-1 py-2 text-sm font-medium ${
                                        activeTab === 'content'
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground'
                                    }`}
                                >
                                    <FileText className="mr-2 inline h-4 w-4" />
                                    Контент
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('media')}
                                    className={`border-b-2 px-1 py-2 text-sm font-medium ${
                                        activeTab === 'media'
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground'
                                    }`}
                                >
                                    <Image className="mr-2 inline h-4 w-4" />
                                    Медиа
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('settings')}
                                    className={`border-b-2 px-1 py-2 text-sm font-medium ${
                                        activeTab === 'settings'
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground'
                                    }`}
                                >
                                    <Settings className="mr-2 inline h-4 w-4" />
                                    Настройки
                                </button>
                            </nav>
                        </div>

                        {/* Content Tab */}
                        {activeTab === 'content' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Основная информация</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="title">
                                                Заголовок *
                                            </Label>
                                            <Input
                                                id="title"
                                                value={data.title}
                                                onChange={(e) =>
                                                    handleTitleChange(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Введите заголовок страницы"
                                                className={
                                                    errors.title
                                                        ? 'border-destructive'
                                                        : ''
                                                }
                                            />
                                            {errors.title && (
                                                <p className="text-destructive mt-1 text-sm">
                                                    {errors.title}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="slug">URL (slug)</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id="slug"
                                                    value={data.slug}
                                                    onChange={(e) =>
                                                        setData(
                                                            'slug',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="url-stranitsy"
                                                    className={
                                                        errors.slug
                                                            ? 'border-destructive'
                                                            : ''
                                                    }
                                                />
                                                <Checkbox
                                                    id="generate-slug"
                                                    checked={generateSlug}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        setGenerateSlug(
                                                            checked as boolean,
                                                        )
                                                    }
                                                />
                                                <Label
                                                    htmlFor="generate-slug"
                                                    className="text-sm"
                                                >
                                                    Автогенерация
                                                </Label>
                                            </div>
                                            {errors.slug && (
                                                <p className="text-destructive mt-1 text-sm">
                                                    {errors.slug}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="excerpt">
                                                Краткое описание
                                            </Label>
                                            <Textarea
                                                id="excerpt"
                                                value={data.excerpt || ''}
                                                onChange={(e) =>
                                                    setData(
                                                        'excerpt',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Краткое описание страницы"
                                                rows={3}
                                                className={
                                                    errors.excerpt
                                                        ? 'border-destructive'
                                                        : ''
                                                }
                                            />
                                            {errors.excerpt && (
                                                <p className="text-destructive mt-1 text-sm">
                                                    {errors.excerpt}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="content">
                                                Содержимое
                                            </Label>
                                            <Textarea
                                                id="content"
                                                value={data.content || ''}
                                                onChange={(e) =>
                                                    setData(
                                                        'content',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Основное содержимое страницы"
                                                rows={15}
                                                className={
                                                    errors.content
                                                        ? 'border-destructive'
                                                        : ''
                                                }
                                            />
                                            {errors.content && (
                                                <p className="text-destructive mt-1 text-sm">
                                                    {errors.content}
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Media Tab */}
                        {activeTab === 'media' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Медиа файлы</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <Label htmlFor="image">
                                                Главное изображение
                                            </Label>
                                            <LogoUploader
                                                value={data.image || null}
                                                onChange={(file, previewUrl) => {
                                                    setData(
                                                        'image',
                                                        previewUrl || '',
                                                    );
                                                }}
                                                onUpload={handleImageUpload}
                                                maxSize={10 * 1024 * 1024}
                                                aspectRatio={null}
                                                showCropControls={true}
                                                className="mt-2"
                                                error={errors.image}
                                            />
                                            {errors.image && (
                                                <p className="text-destructive mt-1 text-sm">
                                                    {errors.image}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="images">
                                                Дополнительные изображения
                                            </Label>
                                            <MultiImageUploader
                                                images={uploadedImages}
                                                onChange={handleImagesChange}
                                                onUpload={handleMultipleImagesUpload}
                                                maxFiles={20}
                                                maxSize={10 * 1024 * 1024}
                                                enableSorting={true}
                                                enableDeletion={true}
                                                showPreview={true}
                                                showFileInfo={true}
                                                layout="grid"
                                                previewSize="md"
                                                className="mt-2"
                                            />
                                            {errors.images && (
                                                <p className="text-destructive mt-1 text-sm">
                                                    {errors.images}
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Настройки страницы</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="status">Статус</Label>
                                                <Select
                                                    value={data.status}
                                                    onValueChange={(value) =>
                                                        setData(
                                                            'status',
                                                            value as any,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger
                                                        className={
                                                            errors.status
                                                                ? 'border-destructive'
                                                                : ''
                                                        }
                                                    >
                                                        <SelectValue placeholder="Выберите статус" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {statuses.map(
                                                            (status) => (
                                                                <SelectItem
                                                                    key={
                                                                        status.value
                                                                    }
                                                                    value={
                                                                        status.value
                                                                    }
                                                                >
                                                                    {
                                                                        status.label
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {errors.status && (
                                                    <p className="text-destructive mt-1 text-sm">
                                                        {errors.status}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="template">
                                                    Шаблон
                                                </Label>
                                                <Select
                                                    value={data.template || 'default'}
                                                    onValueChange={(value) =>
                                                        setData(
                                                            'template',
                                                            value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger
                                                        className={
                                                            errors.template
                                                                ? 'border-destructive'
                                                                : ''
                                                        }
                                                    >
                                                        <SelectValue placeholder="Выберите шаблон" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {templates.map(
                                                            (template) => (
                                                                <SelectItem
                                                                    key={
                                                                        template.value
                                                                    }
                                                                    value={
                                                                        template.value
                                                                    }
                                                                >
                                                                    {
                                                                        template.label
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {errors.template && (
                                                    <p className="text-destructive mt-1 text-sm">
                                                        {errors.template}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="parent_id">
                                                    Родительская страница
                                                </Label>
                                                <Select
                                                    value={
                                                        data.parent_id?.toString() ||
                                                        'none'
                                                    }
                                                    onValueChange={(value) =>
                                                        setData(
                                                            'parent_id',
                                                            value === 'none'
                                                                ? null
                                                                : parseInt(
                                                                      value,
                                                                  ),
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger
                                                        className={
                                                            errors.parent_id
                                                                ? 'border-destructive'
                                                                : ''
                                                        }
                                                    >
                                                        <SelectValue placeholder="Выберите родительскую страницу" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">
                                                            Без родительской
                                                            страницы
                                                        </SelectItem>
                                                        {parentPages.map(
                                                            (parentPage) => (
                                                                <SelectItem
                                                                    key={
                                                                        parentPage.id
                                                                    }
                                                                    value={parentPage.id.toString()}
                                                                >
                                                                    {
                                                                        parentPage.title
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {errors.parent_id && (
                                                    <p className="text-destructive mt-1 text-sm">
                                                        {errors.parent_id}
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
                                                            parseInt(
                                                                e.target.value,
                                                            ) || 0,
                                                        )
                                                    }
                                                    min="0"
                                                    className={
                                                        errors.sort_order
                                                            ? 'border-destructive'
                                                            : ''
                                                    }
                                                />
                                                {errors.sort_order && (
                                                    <p className="text-destructive mt-1 text-sm">
                                                        {errors.sort_order}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="published_at">
                                                    Дата публикации
                                                </Label>
                                                <Input
                                                    id="published_at"
                                                    type="datetime-local"
                                                    value={data.published_at || ''}
                                                    onChange={(e) =>
                                                        setData(
                                                            'published_at',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={
                                                        errors.published_at
                                                            ? 'border-destructive'
                                                            : ''
                                                    }
                                                />
                                                {errors.published_at && (
                                                    <p className="text-destructive mt-1 text-sm">
                                                        {errors.published_at}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="is_homepage"
                                                    checked={data.is_homepage}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        setData(
                                                            'is_homepage',
                                                            checked as boolean,
                                                        )
                                                    }
                                                />
                                                <Label htmlFor="is_homepage">
                                                    Сделать главной страницей
                                                </Label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="is_public"
                                                    checked={data.is_public}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        setData(
                                                            'is_public',
                                                            checked as boolean,
                                                        )
                                                    }
                                                />
                                                <Label htmlFor="is_public">
                                                    Публичная страница
                                                </Label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="show_in_navigation"
                                                    checked={data.show_in_navigation}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        setData(
                                                            'show_in_navigation',
                                                            checked as boolean,
                                                        )
                                                    }
                                                />
                                                <Label htmlFor="show_in_navigation">
                                                    Показывать в навигации
                                                </Label>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Информация</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                                        Создано
                                    </h4>
                                    <p className="text-sm">
                                        {mode === 'edit' && page
                                            ? new Date(
                                                  page.created_at,
                                              ).toLocaleString('ru-RU')
                                            : 'Страница будет создана при сохранении'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                                        Обновлено
                                    </h4>
                                    <p className="text-sm">
                                        {mode === 'edit' && page
                                            ? new Date(
                                                  page.updated_at,
                                              ).toLocaleString('ru-RU')
                                            : 'Не обновлялось'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Действия</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={processing}
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing
                                        ? 'Сохранение...'
                                        : 'Сохранить'}
                                </Button>
                                {mode === 'edit' && (
                                    <Link
                                        href={`/dashboard/sites/${site.id}/pages/${page?.id}`}
                                    >
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            Просмотр
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}


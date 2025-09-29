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
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, FileText, Save, Settings } from 'lucide-react';
import { useState } from 'react';

interface ParentPage {
    id: number;
    title: string;
}

interface Organization {
    id: number;
    name: string;
}

interface PageFormData {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    status: 'draft' | 'published' | 'private' | 'scheduled';
    template: string;
    seo_title: string;
    seo_description: string;
    seo_keywords: string;
    seo_image: string;
    featured_image: string;
    parent_id: number | null;
    is_homepage: boolean;
    published_at: string;
    sort_order: number;
}

interface PageFormProps {
    organization: Organization;
    page?: {
        id: number;
        title: string;
        slug: string;
        content: string;
        excerpt: string;
        status: string;
        template: string;
        seo_title: string;
        seo_description: string;
        seo_keywords: string;
        seo_image: string;
        featured_image: string;
        parent_id: number | null;
        is_homepage: boolean;
        published_at: string | null;
        sort_order: number;
        url: string;
    };
    parentPages: ParentPage[];
    isEdit?: boolean;
}

const PageForm: React.FC<PageFormProps> = ({
    organization,
    page,
    parentPages,
    isEdit = false,
}) => {
    const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>(
        'content',
    );
    const [generateSlug, setGenerateSlug] = useState(!isEdit);

    const { data, setData, post, put, processing, errors, reset } =
        useForm<PageFormData>({
            title: page?.title || '',
            slug: page?.slug || '',
            content: page?.content || '',
            excerpt: page?.excerpt || '',
            status: (page?.status as any) || 'draft',
            template: page?.template || 'default',
            seo_title: page?.seo_title || '',
            seo_description: page?.seo_description || '',
            seo_keywords: page?.seo_keywords || '',
            seo_image: page?.seo_image || '',
            featured_image: page?.featured_image || '',
            parent_id: page?.parent_id || null,
            is_homepage: page?.is_homepage || false,
            published_at: page?.published_at || '',
            sort_order: page?.sort_order || 0,
        });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(
                route('organization.pages.update', {
                    organization: organization.id,
                    page: page!.id,
                }),
            );
        } else {
            post(route('organization.pages.store', organization.id));
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
                    .trim('-'),
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
        { value: 'scheduled', label: 'Запланировано' },
    ];

    return (
        <AppLayout>
            <Head
                title={
                    isEdit
                        ? `Редактировать страницу - ${organization.name}`
                        : `Создать страницу - ${organization.name}`
                }
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route(
                                'organization.pages.index',
                                organization.id,
                            )}
                        >
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Назад к списку
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {isEdit
                                    ? 'Редактировать страницу'
                                    : 'Создать страницу'}
                            </h1>
                            <p className="text-muted-foreground">
                                {isEdit
                                    ? 'Внесите изменения в страницу'
                                    : 'Создайте новую страницу для вашего сайта'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isEdit && (
                            <Link href={page!.url} target="_blank">
                                <Button variant="outline">
                                    <Eye className="mr-2 h-4 w-4" />
                                    Предварительный просмотр
                                </Button>
                            </Link>
                        )}
                        <Button onClick={handleSubmit} disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-3">
                        {/* Tabs */}
                        <div className="border-b">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('content')}
                                    className={`border-b-2 px-1 py-2 text-sm font-medium ${
                                        activeTab === 'content'
                                            ? 'border-primary text-primary'
                                            : 'text-muted-foreground hover:text-foreground border-transparent hover:border-gray-300'
                                    }`}
                                >
                                    <FileText className="mr-2 inline h-4 w-4" />
                                    Контент
                                </button>
                                <button
                                    onClick={() => setActiveTab('seo')}
                                    className={`border-b-2 px-1 py-2 text-sm font-medium ${
                                        activeTab === 'seo'
                                            ? 'border-primary text-primary'
                                            : 'text-muted-foreground hover:text-foreground border-transparent hover:border-gray-300'
                                    }`}
                                >
                                    <Settings className="mr-2 inline h-4 w-4" />
                                    SEO
                                </button>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`border-b-2 px-1 py-2 text-sm font-medium ${
                                        activeTab === 'settings'
                                            ? 'border-primary text-primary'
                                            : 'text-muted-foreground hover:text-foreground border-transparent hover:border-gray-300'
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
                                        <CardTitle>
                                            Основная информация
                                        </CardTitle>
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
                                            <Label htmlFor="slug">
                                                URL (slug)
                                            </Label>
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
                                                value={data.excerpt}
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
                                                value={data.content}
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

                        {/* SEO Tab */}
                        {activeTab === 'seo' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>SEO настройки</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="seo_title">
                                                SEO заголовок
                                            </Label>
                                            <Input
                                                id="seo_title"
                                                value={data.seo_title}
                                                onChange={(e) =>
                                                    setData(
                                                        'seo_title',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="SEO заголовок для поисковых систем"
                                                maxLength={60}
                                                className={
                                                    errors.seo_title
                                                        ? 'border-destructive'
                                                        : ''
                                                }
                                            />
                                            {errors.seo_title && (
                                                <p className="text-destructive mt-1 text-sm">
                                                    {errors.seo_title}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="seo_description">
                                                SEO описание
                                            </Label>
                                            <Textarea
                                                id="seo_description"
                                                value={data.seo_description}
                                                onChange={(e) =>
                                                    setData(
                                                        'seo_description',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Описание для поисковых систем"
                                                rows={3}
                                                maxLength={160}
                                                className={
                                                    errors.seo_description
                                                        ? 'border-destructive'
                                                        : ''
                                                }
                                            />
                                            {errors.seo_description && (
                                                <p className="text-destructive mt-1 text-sm">
                                                    {errors.seo_description}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="seo_keywords">
                                                Ключевые слова
                                            </Label>
                                            <Input
                                                id="seo_keywords"
                                                value={data.seo_keywords}
                                                onChange={(e) =>
                                                    setData(
                                                        'seo_keywords',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="ключевые, слова, через, запятую"
                                                className={
                                                    errors.seo_keywords
                                                        ? 'border-destructive'
                                                        : ''
                                                }
                                            />
                                            {errors.seo_keywords && (
                                                <p className="text-destructive mt-1 text-sm">
                                                    {errors.seo_keywords}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="seo_image">
                                                SEO изображение
                                            </Label>
                                            <Input
                                                id="seo_image"
                                                value={data.seo_image}
                                                onChange={(e) =>
                                                    setData(
                                                        'seo_image',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="URL изображения для социальных сетей"
                                                className={
                                                    errors.seo_image
                                                        ? 'border-destructive'
                                                        : ''
                                                }
                                            />
                                            {errors.seo_image && (
                                                <p className="text-destructive mt-1 text-sm">
                                                    {errors.seo_image}
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
                                        <CardTitle>
                                            Настройки страницы
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="status">
                                                    Статус
                                                </Label>
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
                                                    value={data.template}
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
                                                        ''
                                                    }
                                                    onValueChange={(value) =>
                                                        setData(
                                                            'parent_id',
                                                            value
                                                                ? parseInt(
                                                                      value,
                                                                  )
                                                                : null,
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
                                                        <SelectItem value="">
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
                                                    value={data.published_at}
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

                                            <div className="flex items-center space-x-2 pt-6">
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
                                        </div>

                                        <div>
                                            <Label htmlFor="featured_image">
                                                Изображение страницы
                                            </Label>
                                            <Input
                                                id="featured_image"
                                                value={data.featured_image}
                                                onChange={(e) =>
                                                    setData(
                                                        'featured_image',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="URL изображения страницы"
                                                className={
                                                    errors.featured_image
                                                        ? 'border-destructive'
                                                        : ''
                                                }
                                            />
                                            {errors.featured_image && (
                                                <p className="text-destructive mt-1 text-sm">
                                                    {errors.featured_image}
                                                </p>
                                            )}
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
                                    <h4 className="text-muted-foreground mb-2 text-sm font-medium">
                                        Создано
                                    </h4>
                                    <p className="text-sm">
                                        {isEdit
                                            ? new Date(
                                                  page!.created_at,
                                              ).toLocaleString('ru-RU')
                                            : 'Страница будет создана при сохранении'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-muted-foreground mb-2 text-sm font-medium">
                                        Обновлено
                                    </h4>
                                    <p className="text-sm">
                                        {isEdit
                                            ? new Date(
                                                  page!.updated_at,
                                              ).toLocaleString('ru-RU')
                                            : 'Не обновлялось'}
                                    </p>
                                </div>
                                {isEdit && (
                                    <div>
                                        <h4 className="text-muted-foreground mb-2 text-sm font-medium">
                                            URL
                                        </h4>
                                        <Link
                                            href={page!.url}
                                            target="_blank"
                                            className="text-primary text-sm hover:underline"
                                        >
                                            {page!.url}
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Советы</CardTitle>
                            </CardHeader>
                            <CardContent className="text-muted-foreground space-y-3 text-sm">
                                <div>
                                    <h4 className="text-foreground font-medium">
                                        SEO заголовок
                                    </h4>
                                    <p>
                                        Должен быть 50-60 символов для лучшего
                                        отображения в поиске.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-foreground font-medium">
                                        SEO описание
                                    </h4>
                                    <p>Оптимальная длина 150-160 символов.</p>
                                </div>
                                <div>
                                    <h4 className="text-foreground font-medium">
                                        URL (slug)
                                    </h4>
                                    <p>
                                        Используйте только латинские буквы,
                                        цифры и дефисы.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default PageForm;

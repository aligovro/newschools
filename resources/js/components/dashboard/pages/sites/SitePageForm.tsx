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
import { Link, useForm } from '@inertiajs/react';
import { apiClient } from '@/lib/api';
import { Eye, FileText, Image, Save, Settings } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import LogoUploader from '@/components/ui/image-uploader/LogoUploader';
import MultiImageUploader, { type UploadedImage } from '@/components/ui/image-uploader/MultiImageUploader';
import { organizationsApi } from '@/lib/api/organizations';
import RichTextEditor from '@/components/RichTextEditor';
import { SchoolAboutSection, type AboutSectionData } from './sections/SchoolAboutSection';
import { SchoolThanksSection } from './sections/SchoolThanksSection';
import { SchoolContactsSection } from './sections/SchoolContactsSection';
import type {
    AboutMission,
    AboutValue,
    ContactsLayout,
    PageStatus,
    SitePageFormProps,
    ThanksLayout,
} from './types';

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_TEMPLATES = [
    { value: 'default',    label: 'Обычная страница' },
    { value: 'full-width', label: 'Полная ширина' },
    { value: 'landing',    label: 'Лендинг' },
    { value: 'blog',       label: 'Блог' },
    { value: 'contact',    label: 'Контакты' },
    { value: 'about',      label: 'О нас' },
    { value: 'thanks',     label: 'Спасибо' },
];

const PAGE_STATUSES = [
    { value: 'draft',     label: 'Черновик' },
    { value: 'published', label: 'Опубликовано' },
    { value: 'private',   label: 'Приватная' },
];

type TabKey = 'content' | 'media' | 'settings';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'content',  label: 'Контент',   icon: FileText },
    { key: 'media',    label: 'Медиа',     icon: Image },
    { key: 'settings', label: 'Настройки', icon: Settings },
];

// ── Layout config helpers ─────────────────────────────────────────────────────

function getLcAbout(lc: Record<string, unknown>): AboutSectionData {
    const raw = typeof lc.about === 'object' && lc.about !== null
        ? (lc.about as Record<string, unknown>)
        : {};
    const m = typeof raw.mission === 'object' && raw.mission !== null
        ? (raw.mission as Record<string, unknown>)
        : {};
    return {
        mission: {
            title:         String(m.title ?? ''),
            body:          String(m.body ?? ''),
            image:         String(m.image ?? ''),
            imagePosition: (m.imagePosition as 'left' | 'right') || 'left',
        } as AboutMission,
        values: Array.isArray(raw.values) ? (raw.values as AboutValue[]) : [],
    };
}

function getLcThanks(lc: Record<string, unknown>): ThanksLayout {
    const raw = typeof lc.thanks === 'object' && lc.thanks !== null
        ? (lc.thanks as Record<string, unknown>)
        : {};
    return {
        collected_amount:  String(raw.collected_amount ?? ''),
        profile_link_text: String(raw.profile_link_text ?? ''),
        profile_url:       String(raw.profile_url ?? ''),
        cta_text:          String(raw.cta_text ?? ''),
        cta_url:           String(raw.cta_url ?? ''),
        requisites_url:    String(raw.requisites_url ?? ''),
    };
}

function getLcContacts(lc: Record<string, unknown>): ContactsLayout {
    const raw = typeof lc.contacts === 'object' && lc.contacts !== null
        ? (lc.contacts as Record<string, unknown>)
        : {};
    return {
        cards:      Array.isArray(raw.cards)     ? raw.cards     : [],
        documents:  Array.isArray(raw.documents) ? raw.documents : [],
        docs_title: String(raw.docs_title ?? ''),
    };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SitePageForm({ mode, site, page, parentPages }: SitePageFormProps) {
    const [activeTab, setActiveTab] = useState<TabKey>('content');
    const [generateSlug, setGenerateSlug] = useState(mode === 'create');

    // layout_config хранится отдельно от useForm: Inertia FormDataType
    // не принимает Record<string, unknown> (index-signature → never).
    // Перед отправкой данные инжектируются через form.transform().
    const [layoutConfig, setLayoutConfig] = useState<Record<string, unknown>>(
        page?.layout_config ?? {}
    );

    const form = useForm({
        title:              page?.title              ?? '',
        show_title:         page?.show_title         ?? true,
        slug:               page?.slug               ?? '',
        excerpt:            page?.excerpt            ?? '',
        content:            page?.content            ?? '',
        status:             (page?.status ?? 'draft') as PageStatus,
        template:           page?.template           ?? 'default',
        is_homepage:        page?.is_homepage        ?? false,
        is_public:          page?.is_public          ?? false,
        show_in_navigation: page?.show_in_navigation ?? true,
        parent_id:          page?.parent_id          ?? null,
        sort_order:         page?.sort_order         ?? 0,
        image:              page?.image              ?? '',
        images:             page?.images             ?? [] as string[],
        published_at:       page?.published_at       ?? '',
    });

    const { data, setData, processing, errors } = form;

    const mergeLayout = (key: string, slice: unknown) =>
        setLayoutConfig((prev) => ({ ...prev, [key]: slice }));

    const aboutData    = useMemo(() => getLcAbout(layoutConfig),    [layoutConfig]);
    const thanksData   = useMemo(() => getLcThanks(layoutConfig),   [layoutConfig]);
    const contactsData = useMemo(() => getLcContacts(layoutConfig), [layoutConfig]);

    // ── Slug autogenerate ─────────────────────────────────────────────────────

    const debouncedTitle = useDebounce(data.title, 400);

    useEffect(() => {
        if (!generateSlug || !debouncedTitle.trim()) return;
        apiClient
            .post<{ slug: string }>('/slug/generate', {
                text:            debouncedTitle,
                table:           'site_pages',
                scope:           { site_id: site.id },
                without_trashed: true,
            })
            .then((r) => setData('slug', r.data.slug))
            .catch(() => {});
    }, [debouncedTitle, generateSlug, setData, site.id]);

    // ── Image uploads ─────────────────────────────────────────────────────────

    const handleImageUpload = (file: File): Promise<string> =>
        organizationsApi.uploadLogo(file).then((r) => r.url);

    const handleMultipleImagesUpload = (file: File): Promise<string> =>
        organizationsApi.uploadImages(file).then((r) => r.images[0]?.url ?? '');

    const uploadedImages = useMemo<UploadedImage[]>(() => {
        if (!Array.isArray(data.images)) return [];
        return data.images.map((url, i) => ({
            id:     `image-${i}`,
            url,
            name:   url.split('/').pop() ?? `image-${i}`,
            size:   0,
            type:   'image/jpeg',
            status: 'success' as const,
        }));
    }, [data.images]);

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // layout_config инжектируется через transform — оно не в useForm из-за ограничений FormDataType
        form.transform((d) => ({ ...d, layout_config: layoutConfig }));
        if (mode === 'edit' && page) {
            form.put(`/dashboard/sites/${site.id}/pages/${page.id}`, { preserveScroll: true });
        } else {
            form.post(`/dashboard/sites/${site.id}/pages`);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    const isSchool = site.template === 'school';

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">

                    {/* ── Main column ── */}
                    <div className="space-y-6 lg:col-span-3">

                        {/* Tab nav */}
                        <div className="border-b">
                            <nav className="-mb-px flex space-x-8">
                                {TABS.map(({ key, label, icon: Icon }) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setActiveTab(key)}
                                        className={`border-b-2 px-1 py-2 text-sm font-medium ${
                                            activeTab === key
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground'
                                        }`}
                                    >
                                        <Icon className="mr-2 inline h-4 w-4" />
                                        {label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* ── Content tab ── */}
                        {activeTab === 'content' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Основная информация</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="title">Заголовок *</Label>
                                            <Input
                                                id="title"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                placeholder="Введите заголовок страницы"
                                                className={errors.title ? 'border-destructive' : ''}
                                            />
                                            {errors.title && (
                                                <p className="mt-1 text-sm text-destructive">{errors.title}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="slug">URL (slug)</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id="slug"
                                                    value={data.slug}
                                                    onChange={(e) => setData('slug', e.target.value)}
                                                    placeholder="url-stranitsy"
                                                    className={errors.slug ? 'border-destructive' : ''}
                                                />
                                                <Checkbox
                                                    id="generate-slug"
                                                    checked={generateSlug}
                                                    onCheckedChange={(v) => setGenerateSlug(v as boolean)}
                                                />
                                                <Label htmlFor="generate-slug" className="text-sm">
                                                    Автогенерация
                                                </Label>
                                            </div>
                                            {errors.slug && (
                                                <p className="mt-1 text-sm text-destructive">{errors.slug}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="excerpt">Краткое описание</Label>
                                            <Textarea
                                                id="excerpt"
                                                value={data.excerpt || ''}
                                                onChange={(e) => setData('excerpt', e.target.value)}
                                                placeholder="Краткое описание страницы"
                                                rows={3}
                                                className={errors.excerpt ? 'border-destructive' : ''}
                                            />
                                            {errors.excerpt && (
                                                <p className="mt-1 text-sm text-destructive">{errors.excerpt}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="content">Содержимое</Label>
                                            <RichTextEditor
                                                value={data.content || ''}
                                                onChange={(html) => setData('content', html)}
                                                placeholder="Основное содержимое страницы"
                                                height={400}
                                                level="advanced"
                                                showHtmlToggle={true}
                                                showTemplates={true}
                                                showWordCount={true}
                                                showImageUpload={true}
                                            />
                                            {errors.content && (
                                                <p className="mt-1 text-sm text-destructive">{errors.content}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {data.template === 'about' && isSchool && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Блоки «О школе»</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <SchoolAboutSection
                                                data={aboutData}
                                                onChange={(d) => mergeLayout('about', d)}
                                                onImageUpload={handleImageUpload}
                                            />
                                        </CardContent>
                                    </Card>
                                )}

                                {data.template === 'thanks' && isSchool && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Блок «Спасибо»</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <SchoolThanksSection
                                                data={thanksData}
                                                onChange={(d) => mergeLayout('thanks', d)}
                                            />
                                        </CardContent>
                                    </Card>
                                )}

                                {data.template === 'contact' && isSchool && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Блок «Контакты»</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <SchoolContactsSection
                                                data={contactsData}
                                                onChange={(d) => mergeLayout('contacts', d)}
                                            />
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        {/* ── Media tab ── */}
                        {activeTab === 'media' && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Медиа файлы</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <Label htmlFor="image">Главное изображение</Label>
                                            <LogoUploader
                                                value={data.image || null}
                                                onChange={(_f, url) => setData('image', url || '')}
                                                onUpload={handleImageUpload}
                                                maxSize={10 * 1024 * 1024}
                                                aspectRatio={null}
                                                showCropControls={true}
                                                className="mt-2"
                                                error={errors.image}
                                            />
                                            {errors.image && (
                                                <p className="mt-1 text-sm text-destructive">{errors.image}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="images">Дополнительные изображения</Label>
                                            <MultiImageUploader
                                                images={uploadedImages}
                                                onChange={(imgs) =>
                                                    setData(
                                                        'images',
                                                        imgs.filter((i) => i.status === 'success').map((i) => i.url),
                                                    )
                                                }
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
                                                <p className="mt-1 text-sm text-destructive">{errors.images}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* ── Settings tab ── */}
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
                                                    onValueChange={(v) =>
                                                        setData('status', v as PageStatus)
                                                    }
                                                >
                                                    <SelectTrigger className={errors.status ? 'border-destructive' : ''}>
                                                        <SelectValue placeholder="Выберите статус" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {PAGE_STATUSES.map((s) => (
                                                            <SelectItem key={s.value} value={s.value}>
                                                                {s.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.status && (
                                                    <p className="mt-1 text-sm text-destructive">{errors.status}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="template">Шаблон</Label>
                                                <Select
                                                    value={data.template || 'default'}
                                                    onValueChange={(v) => setData('template', v)}
                                                >
                                                    <SelectTrigger className={errors.template ? 'border-destructive' : ''}>
                                                        <SelectValue placeholder="Выберите шаблон" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {PAGE_TEMPLATES.map((t) => (
                                                            <SelectItem key={t.value} value={t.value}>
                                                                {t.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.template && (
                                                    <p className="mt-1 text-sm text-destructive">{errors.template}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="parent_id">Родительская страница</Label>
                                                <Select
                                                    value={data.parent_id?.toString() ?? 'none'}
                                                    onValueChange={(v) =>
                                                        setData('parent_id', v === 'none' ? null : parseInt(v))
                                                    }
                                                >
                                                    <SelectTrigger className={errors.parent_id ? 'border-destructive' : ''}>
                                                        <SelectValue placeholder="Выберите родительскую страницу" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">
                                                            Без родительской страницы
                                                        </SelectItem>
                                                        {parentPages.map((p) => (
                                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                                {p.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.parent_id && (
                                                    <p className="mt-1 text-sm text-destructive">{errors.parent_id}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="sort_order">Порядок сортировки</Label>
                                                <Input
                                                    id="sort_order"
                                                    type="number"
                                                    value={data.sort_order}
                                                    onChange={(e) =>
                                                        setData('sort_order', parseInt(e.target.value) || 0)
                                                    }
                                                    min="0"
                                                    className={errors.sort_order ? 'border-destructive' : ''}
                                                />
                                                {errors.sort_order && (
                                                    <p className="mt-1 text-sm text-destructive">{errors.sort_order}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="published_at">Дата публикации</Label>
                                                <Input
                                                    id="published_at"
                                                    type="datetime-local"
                                                    value={data.published_at || ''}
                                                    onChange={(e) => setData('published_at', e.target.value)}
                                                    className={errors.published_at ? 'border-destructive' : ''}
                                                />
                                                {errors.published_at && (
                                                    <p className="mt-1 text-sm text-destructive">{errors.published_at}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {(
                                                [
                                                    { id: 'is_homepage',        label: 'Сделать главной страницей' },
                                                    { id: 'is_public',          label: 'Публичная страница' },
                                                    { id: 'show_in_navigation', label: 'Показывать в навигации' },
                                                ] as const
                                            ).map(({ id, label }) => (
                                                <div key={id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={id}
                                                        checked={data[id]}
                                                        onCheckedChange={(v) => setData(id, v as boolean)}
                                                    />
                                                    <Label htmlFor={id}>{label}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Информация</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">Создано</h4>
                                    <p className="text-sm">
                                        {mode === 'edit' && page
                                            ? new Date(page.created_at).toLocaleString('ru-RU')
                                            : 'Страница будет создана при сохранении'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">Обновлено</h4>
                                    <p className="text-sm">
                                        {mode === 'edit' && page
                                            ? new Date(page.updated_at).toLocaleString('ru-RU')
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
                                <Button type="submit" className="w-full" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Сохранение...' : 'Сохранить'}
                                </Button>
                                {mode === 'edit' && (
                                    <Link href={`/dashboard/sites/${site.id}/pages/${page?.id}`}>
                                        <Button variant="outline" className="w-full">
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

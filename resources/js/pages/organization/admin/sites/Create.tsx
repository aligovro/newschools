import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2 } from 'lucide-react';

interface Organization {
    id: number;
    name: string;
    slug: string;
}

interface SiteTemplate {
    id: number;
    name: string;
    slug: string;
    description: string;
    layout_config: any;
    theme_config: any;
    is_premium: boolean;
}

interface Props {
    organization: Organization;
    templates: SiteTemplate[];
}

export default function CreateSite({ organization, templates }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        description: '',
        template: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Организации',
            href: '/dashboard/organizations',
        },
        {
            title: organization.name,
            href: `/organization/${organization.id}/admin`,
        },
        {
            title: 'Сайты',
            href: `/organization/${organization.id}/admin/sites`,
        },
        {
            title: 'Создать сайт',
            href: `/organization/${organization.id}/admin/sites/create`,
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/organization/${organization.id}/admin/sites`);
    };

    const generateSlug = (name: string) => {
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        setData('slug', slug);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Создать сайт - ${organization.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link href={`/organization/${organization.id}/admin/sites`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Назад к сайтам
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Создать сайт</h1>
                        <p className="text-muted-foreground">
                            Создайте новый сайт для организации
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Основная информация</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            Название сайта *
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => {
                                                setData('name', e.target.value);
                                                if (!data.slug) {
                                                    generateSlug(
                                                        e.target.value,
                                                    );
                                                }
                                            }}
                                            placeholder="Введите название сайта"
                                            className={
                                                errors.name
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-500">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="slug">
                                            URL-адрес (slug) *
                                        </Label>
                                        <Input
                                            id="slug"
                                            value={data.slug}
                                            onChange={(e) =>
                                                setData('slug', e.target.value)
                                            }
                                            placeholder="url-adres-saita"
                                            className={
                                                errors.slug
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {errors.slug && (
                                            <p className="text-sm text-red-500">
                                                {errors.slug}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Только латинские буквы, цифры и
                                            дефисы
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">
                                            Описание
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Краткое описание сайта"
                                            rows={3}
                                            className={
                                                errors.description
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-500">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="template">
                                            Шаблон сайта *
                                        </Label>
                                        <Select
                                            value={data.template}
                                            onValueChange={(value) =>
                                                setData('template', value)
                                            }
                                        >
                                            <SelectTrigger
                                                className={
                                                    errors.template
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            >
                                                <SelectValue placeholder="Выберите шаблон" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {templates.map((template) => (
                                                    <SelectItem
                                                        key={template.id}
                                                        value={template.slug}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <span>
                                                                {template.name}
                                                            </span>
                                                            {template.is_premium && (
                                                                <span className="rounded bg-yellow-100 px-1 py-0.5 text-xs text-yellow-800">
                                                                    Premium
                                                                </span>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.template && (
                                            <p className="text-sm text-red-500">
                                                {errors.template}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? 'Создание...'
                                                : 'Создать сайт'}
                                        </Button>
                                        <Link
                                            href={`/organization/${organization.id}/admin/sites`}
                                        >
                                            <Button
                                                type="button"
                                                variant="outline"
                                            >
                                                Отмена
                                            </Button>
                                        </Link>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Template Preview */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Building2 className="mr-2 h-5 w-5" />
                                    Выбранный шаблон
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {data.template ? (
                                    (() => {
                                        const selectedTemplate = templates.find(
                                            (t) => t.slug === data.template,
                                        );
                                        return selectedTemplate ? (
                                            <div className="space-y-3">
                                                <div className="bg-muted flex aspect-video items-center justify-center rounded-lg">
                                                    <div className="text-center">
                                                        <Building2 className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                                                        <p className="text-sm text-muted-foreground">
                                                            Превью шаблона
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">
                                                        {selectedTemplate.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {
                                                            selectedTemplate.description
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        ) : null;
                                    })()
                                ) : (
                                    <div className="py-8 text-center">
                                        <Building2 className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            Выберите шаблон для предварительного
                                            просмотра
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Help */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    Помощь
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <p>После создания сайта вы сможете:</p>
                                <ul className="ml-2 list-inside list-disc space-y-1">
                                    <li>Настроить дизайн и цвета</li>
                                    <li>Добавить виджеты и контент</li>
                                    <li>Создать страницы</li>
                                    <li>Настроить SEO</li>
                                    <li>Опубликовать сайт</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

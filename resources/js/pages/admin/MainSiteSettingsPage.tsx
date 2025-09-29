import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Globe, RefreshCw, RotateCcw, Save } from 'lucide-react';
import React, { useState } from 'react';

interface MainSiteSettingsPageProps {
    settings: {
        id: number;
        site_name: string;
        site_description: string;
        site_logo: string | null;
        site_favicon: string | null;
        site_theme: string;
        primary_color: string;
        secondary_color: string;
        dark_mode: boolean;
        meta_title: string | null;
        meta_description: string | null;
        meta_keywords: string | null;
        og_title: string | null;
        og_description: string | null;
        og_image: string | null;
        og_type: string;
        twitter_card: string;
        twitter_title: string | null;
        twitter_description: string | null;
        twitter_image: string | null;
        contact_email: string | null;
        contact_phone: string | null;
        contact_address: string | null;
        contact_telegram: string | null;
        contact_vk: string | null;
        social_links: any;
        google_analytics_id: string | null;
        yandex_metrika_id: string | null;
        custom_head_code: string | null;
        custom_body_code: string | null;
        payment_settings: any;
        notification_settings: any;
        integration_settings: any;
        metadata: any;
        created_at: string;
        updated_at: string;
    };
}

export default function MainSiteSettingsPage({
    settings,
}: MainSiteSettingsPageProps) {
    const [activeTab, setActiveTab] = useState('basic');

    // Формы для разных разделов
    const basicForm = useForm({
        site_name: settings.site_name,
        site_description: settings.site_description || '',
        site_logo: settings.site_logo || '',
        site_favicon: settings.site_favicon || '',
        site_theme: settings.site_theme,
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        dark_mode: settings.dark_mode,
    });

    const seoForm = useForm({
        meta_title: settings.meta_title || '',
        meta_description: settings.meta_description || '',
        meta_keywords: settings.meta_keywords || '',
        og_title: settings.og_title || '',
        og_description: settings.og_description || '',
        og_image: settings.og_image || '',
        og_type: settings.og_type,
        twitter_card: settings.twitter_card,
        twitter_title: settings.twitter_title || '',
        twitter_description: settings.twitter_description || '',
        twitter_image: settings.twitter_image || '',
    });

    const contactForm = useForm({
        contact_email: settings.contact_email || '',
        contact_phone: settings.contact_phone || '',
        contact_address: settings.contact_address || '',
        contact_telegram: settings.contact_telegram || '',
        contact_vk: settings.contact_vk || '',
        social_links: settings.social_links || [],
    });

    const analyticsForm = useForm({
        google_analytics_id: settings.google_analytics_id || '',
        yandex_metrika_id: settings.yandex_metrika_id || '',
        custom_head_code: settings.custom_head_code || '',
        custom_body_code: settings.custom_body_code || '',
    });

    const paymentForm = useForm({
        payment_settings: settings.payment_settings || {
            enabled_methods: ['yookassa', 'tinkoff'],
            min_amount: 100,
            max_amount: 100000000,
            currency: 'RUB',
            auto_approve: true,
        },
    });

    const notificationForm = useForm({
        notification_settings: settings.notification_settings || {
            email_notifications: true,
            telegram_notifications: false,
            donation_notifications: true,
        },
    });

    const integrationForm = useForm({
        integration_settings: settings.integration_settings || {
            yookassa_test_mode: true,
            telegram_bot_enabled: false,
        },
    });

    // Обработчики отправки форм
    const handleBasicSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        basicForm.post('/dashboard/admin/main-site-settings/basic');
    };

    const handleSeoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        seoForm.post('/dashboard/admin/main-site-settings/seo');
    };

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        contactForm.post('/dashboard/admin/main-site-settings/contact');
    };

    const handleAnalyticsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        analyticsForm.post('/dashboard/admin/main-site-settings/analytics');
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        paymentForm.post('/dashboard/admin/main-site-settings/payments');
    };

    const handleNotificationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        notificationForm.post(
            '/dashboard/admin/main-site-settings/notifications',
        );
    };

    const handleIntegrationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        integrationForm.post(
            '/dashboard/admin/main-site-settings/integrations',
        );
    };

    const handleReset = () => {
        if (
            confirm(
                'Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?',
            )
        ) {
            fetch('/dashboard/admin/main-site-settings/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            }).then(() => {
                window.location.reload();
            });
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Настройки главного сайта',
                    href: '/dashboard/admin/main-site-settings',
                },
            ]}
        >
            <Head title="Настройки главного сайта" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Настройки главного сайта
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Управление основными настройками, SEO, платежами и
                            интеграциями главного сайта
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                        >
                            <Globe className="h-3 w-3" />
                            Главный сайт
                        </Badge>
                    </div>
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-6"
                >
                    <TabsList className="grid w-full grid-cols-7">
                        <TabsTrigger value="basic">Основные</TabsTrigger>
                        <TabsTrigger value="seo">SEO</TabsTrigger>
                        <TabsTrigger value="contact">Контакты</TabsTrigger>
                        <TabsTrigger value="analytics">Аналитика</TabsTrigger>
                        <TabsTrigger value="payments">Платежи</TabsTrigger>
                        <TabsTrigger value="notifications">
                            Уведомления
                        </TabsTrigger>
                        <TabsTrigger value="integrations">
                            Интеграции
                        </TabsTrigger>
                    </TabsList>

                    {/* Основные настройки */}
                    <TabsContent value="basic">
                        <Card>
                            <CardHeader>
                                <CardTitle>Основные настройки</CardTitle>
                                <CardDescription>
                                    Настройте название, описание, цвета и тему
                                    главного сайта
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleBasicSubmit}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="site_name">
                                                Название сайта
                                            </Label>
                                            <Input
                                                id="site_name"
                                                value={basicForm.data.site_name}
                                                onChange={(e) =>
                                                    basicForm.setData(
                                                        'site_name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Платформа поддержки школ"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="site_theme">
                                                Тема сайта
                                            </Label>
                                            <Input
                                                id="site_theme"
                                                value={
                                                    basicForm.data.site_theme
                                                }
                                                onChange={(e) =>
                                                    basicForm.setData(
                                                        'site_theme',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="default"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="site_description">
                                            Описание сайта
                                        </Label>
                                        <Textarea
                                            id="site_description"
                                            value={
                                                basicForm.data.site_description
                                            }
                                            onChange={(e) =>
                                                basicForm.setData(
                                                    'site_description',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Описание главного сайта..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="primary_color">
                                                Основной цвет
                                            </Label>
                                            <Input
                                                id="primary_color"
                                                type="color"
                                                value={
                                                    basicForm.data.primary_color
                                                }
                                                onChange={(e) =>
                                                    basicForm.setData(
                                                        'primary_color',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="secondary_color">
                                                Дополнительный цвет
                                            </Label>
                                            <Input
                                                id="secondary_color"
                                                type="color"
                                                value={
                                                    basicForm.data
                                                        .secondary_color
                                                }
                                                onChange={(e) =>
                                                    basicForm.setData(
                                                        'secondary_color',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Темная тема</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Включить темную тему по
                                                умолчанию
                                            </p>
                                        </div>
                                        <Switch
                                            checked={basicForm.data.dark_mode}
                                            onCheckedChange={(checked) =>
                                                basicForm.setData(
                                                    'dark_mode',
                                                    checked,
                                                )
                                            }
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={basicForm.processing}
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        Сохранить основные настройки
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* SEO настройки */}
                    <TabsContent value="seo">
                        <Card>
                            <CardHeader>
                                <CardTitle>SEO настройки</CardTitle>
                                <CardDescription>
                                    Мета-теги, Open Graph и Twitter Card для
                                    поисковых систем и социальных сетей
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleSeoSubmit}
                                    className="space-y-6"
                                >
                                    <div>
                                        <Label htmlFor="meta_title">
                                            Meta Title
                                        </Label>
                                        <Input
                                            id="meta_title"
                                            value={seoForm.data.meta_title}
                                            onChange={(e) =>
                                                seoForm.setData(
                                                    'meta_title',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Заголовок для поисковых систем"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="meta_description">
                                            Meta Description
                                        </Label>
                                        <Textarea
                                            id="meta_description"
                                            value={
                                                seoForm.data.meta_description
                                            }
                                            onChange={(e) =>
                                                seoForm.setData(
                                                    'meta_description',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Описание для поисковых систем"
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="meta_keywords">
                                            Meta Keywords
                                        </Label>
                                        <Input
                                            id="meta_keywords"
                                            value={seoForm.data.meta_keywords}
                                            onChange={(e) =>
                                                seoForm.setData(
                                                    'meta_keywords',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="ключевые, слова, через, запятую"
                                        />
                                    </div>

                                    <Separator />

                                    <h3 className="text-lg font-semibold">
                                        Open Graph (Facebook, VK)
                                    </h3>

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="og_title">
                                                OG Title
                                            </Label>
                                            <Input
                                                id="og_title"
                                                value={seoForm.data.og_title}
                                                onChange={(e) =>
                                                    seoForm.setData(
                                                        'og_title',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Заголовок для соцсетей"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="og_type">
                                                OG Type
                                            </Label>
                                            <Input
                                                id="og_type"
                                                value={seoForm.data.og_type}
                                                onChange={(e) =>
                                                    seoForm.setData(
                                                        'og_type',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="website"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="og_description">
                                            OG Description
                                        </Label>
                                        <Textarea
                                            id="og_description"
                                            value={seoForm.data.og_description}
                                            onChange={(e) =>
                                                seoForm.setData(
                                                    'og_description',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Описание для соцсетей"
                                            rows={3}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={seoForm.processing}
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        Сохранить SEO настройки
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Контактная информация */}
                    <TabsContent value="contact">
                        <Card>
                            <CardHeader>
                                <CardTitle>Контактная информация</CardTitle>
                                <CardDescription>
                                    Email, телефон, адрес и ссылки на социальные
                                    сети
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleContactSubmit}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="contact_email">
                                                Email
                                            </Label>
                                            <Input
                                                id="contact_email"
                                                type="email"
                                                value={
                                                    contactForm.data
                                                        .contact_email
                                                }
                                                onChange={(e) =>
                                                    contactForm.setData(
                                                        'contact_email',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="contact@example.com"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="contact_phone">
                                                Телефон
                                            </Label>
                                            <Input
                                                id="contact_phone"
                                                value={
                                                    contactForm.data
                                                        .contact_phone
                                                }
                                                onChange={(e) =>
                                                    contactForm.setData(
                                                        'contact_phone',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="+7 (999) 123-45-67"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="contact_address">
                                            Адрес
                                        </Label>
                                        <Textarea
                                            id="contact_address"
                                            value={
                                                contactForm.data.contact_address
                                            }
                                            onChange={(e) =>
                                                contactForm.setData(
                                                    'contact_address',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Полный адрес организации"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="contact_telegram">
                                                Telegram
                                            </Label>
                                            <Input
                                                id="contact_telegram"
                                                value={
                                                    contactForm.data
                                                        .contact_telegram
                                                }
                                                onChange={(e) =>
                                                    contactForm.setData(
                                                        'contact_telegram',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="@username"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="contact_vk">
                                                ВКонтакте
                                            </Label>
                                            <Input
                                                id="contact_vk"
                                                value={
                                                    contactForm.data.contact_vk
                                                }
                                                onChange={(e) =>
                                                    contactForm.setData(
                                                        'contact_vk',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="https://vk.com/group"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={contactForm.processing}
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        Сохранить контакты
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Аналитика */}
                    <TabsContent value="analytics">
                        <Card>
                            <CardHeader>
                                <CardTitle>Настройки аналитики</CardTitle>
                                <CardDescription>
                                    Google Analytics, Яндекс.Метрика и
                                    пользовательские коды
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleAnalyticsSubmit}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="google_analytics_id">
                                                Google Analytics ID
                                            </Label>
                                            <Input
                                                id="google_analytics_id"
                                                value={
                                                    analyticsForm.data
                                                        .google_analytics_id
                                                }
                                                onChange={(e) =>
                                                    analyticsForm.setData(
                                                        'google_analytics_id',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="G-XXXXXXXXXX"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="yandex_metrika_id">
                                                Яндекс.Метрика ID
                                            </Label>
                                            <Input
                                                id="yandex_metrika_id"
                                                value={
                                                    analyticsForm.data
                                                        .yandex_metrika_id
                                                }
                                                onChange={(e) =>
                                                    analyticsForm.setData(
                                                        'yandex_metrika_id',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="12345678"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="custom_head_code">
                                            Код для &lt;head&gt;
                                        </Label>
                                        <Textarea
                                            id="custom_head_code"
                                            value={
                                                analyticsForm.data
                                                    .custom_head_code
                                            }
                                            onChange={(e) =>
                                                analyticsForm.setData(
                                                    'custom_head_code',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="<!-- Код для head -->"
                                            rows={5}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="custom_body_code">
                                            Код для &lt;body&gt;
                                        </Label>
                                        <Textarea
                                            id="custom_body_code"
                                            value={
                                                analyticsForm.data
                                                    .custom_body_code
                                            }
                                            onChange={(e) =>
                                                analyticsForm.setData(
                                                    'custom_body_code',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="<!-- Код для body -->"
                                            rows={5}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={analyticsForm.processing}
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        Сохранить настройки аналитики
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Платежи */}
                    <TabsContent value="payments">
                        <Card>
                            <CardHeader>
                                <CardTitle>Настройки платежей</CardTitle>
                                <CardDescription>
                                    Настройки для приема пожертвований на
                                    главном сайте
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handlePaymentSubmit}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                        <div>
                                            <Label htmlFor="min_amount">
                                                Минимальная сумма
                                            </Label>
                                            <Input
                                                id="min_amount"
                                                type="number"
                                                value={
                                                    paymentForm.data
                                                        .payment_settings
                                                        .min_amount
                                                }
                                                onChange={(e) =>
                                                    paymentForm.setData(
                                                        'payment_settings',
                                                        {
                                                            ...paymentForm.data
                                                                .payment_settings,
                                                            min_amount:
                                                                parseInt(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                        },
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="max_amount">
                                                Максимальная сумма
                                            </Label>
                                            <Input
                                                id="max_amount"
                                                type="number"
                                                value={
                                                    paymentForm.data
                                                        .payment_settings
                                                        .max_amount
                                                }
                                                onChange={(e) =>
                                                    paymentForm.setData(
                                                        'payment_settings',
                                                        {
                                                            ...paymentForm.data
                                                                .payment_settings,
                                                            max_amount:
                                                                parseInt(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                        },
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="currency">
                                                Валюта
                                            </Label>
                                            <Input
                                                id="currency"
                                                value={
                                                    paymentForm.data
                                                        .payment_settings
                                                        .currency
                                                }
                                                onChange={(e) =>
                                                    paymentForm.setData(
                                                        'payment_settings',
                                                        {
                                                            ...paymentForm.data
                                                                .payment_settings,
                                                            currency:
                                                                e.target.value,
                                                        },
                                                    )
                                                }
                                                placeholder="RUB"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Автоодобрение</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Автоматически одобрять
                                                пожертвования
                                            </p>
                                        </div>
                                        <Switch
                                            checked={
                                                paymentForm.data
                                                    .payment_settings
                                                    .auto_approve
                                            }
                                            onCheckedChange={(checked) =>
                                                paymentForm.setData(
                                                    'payment_settings',
                                                    {
                                                        ...paymentForm.data
                                                            .payment_settings,
                                                        auto_approve: checked,
                                                    },
                                                )
                                            }
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={paymentForm.processing}
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        Сохранить настройки платежей
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Уведомления */}
                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle>Настройки уведомлений</CardTitle>
                                <CardDescription>
                                    Управление уведомлениями для главного сайта
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleNotificationSubmit}
                                    className="space-y-6"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>Email уведомления</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Отправлять уведомления по
                                                    email
                                                </p>
                                            </div>
                                            <Switch
                                                checked={
                                                    notificationForm.data
                                                        .notification_settings
                                                        .email_notifications
                                                }
                                                onCheckedChange={(checked) =>
                                                    notificationForm.setData(
                                                        'notification_settings',
                                                        {
                                                            ...notificationForm
                                                                .data
                                                                .notification_settings,
                                                            email_notifications:
                                                                checked,
                                                        },
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>
                                                    Telegram уведомления
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Отправлять уведомления в
                                                    Telegram
                                                </p>
                                            </div>
                                            <Switch
                                                checked={
                                                    notificationForm.data
                                                        .notification_settings
                                                        .telegram_notifications
                                                }
                                                onCheckedChange={(checked) =>
                                                    notificationForm.setData(
                                                        'notification_settings',
                                                        {
                                                            ...notificationForm
                                                                .data
                                                                .notification_settings,
                                                            telegram_notifications:
                                                                checked,
                                                        },
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>
                                                    Уведомления о пожертвованиях
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Уведомлять о новых
                                                    пожертвованиях
                                                </p>
                                            </div>
                                            <Switch
                                                checked={
                                                    notificationForm.data
                                                        .notification_settings
                                                        .donation_notifications
                                                }
                                                onCheckedChange={(checked) =>
                                                    notificationForm.setData(
                                                        'notification_settings',
                                                        {
                                                            ...notificationForm
                                                                .data
                                                                .notification_settings,
                                                            donation_notifications:
                                                                checked,
                                                        },
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={notificationForm.processing}
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        Сохранить настройки уведомлений
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Интеграции */}
                    <TabsContent value="integrations">
                        <Card>
                            <CardHeader>
                                <CardTitle>Настройки интеграций</CardTitle>
                                <CardDescription>
                                    Внешние сервисы и API
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleIntegrationSubmit}
                                    className="space-y-6"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>
                                                    Тестовый режим ЮKassa
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Использовать тестовый режим
                                                    для платежей
                                                </p>
                                            </div>
                                            <Switch
                                                checked={
                                                    integrationForm.data
                                                        .integration_settings
                                                        .yookassa_test_mode
                                                }
                                                onCheckedChange={(checked) =>
                                                    integrationForm.setData(
                                                        'integration_settings',
                                                        {
                                                            ...integrationForm
                                                                .data
                                                                .integration_settings,
                                                            yookassa_test_mode:
                                                                checked,
                                                        },
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>Telegram бот</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Включить интеграцию с
                                                    Telegram ботом
                                                </p>
                                            </div>
                                            <Switch
                                                checked={
                                                    integrationForm.data
                                                        .integration_settings
                                                        .telegram_bot_enabled
                                                }
                                                onCheckedChange={(checked) =>
                                                    integrationForm.setData(
                                                        'integration_settings',
                                                        {
                                                            ...integrationForm
                                                                .data
                                                                .integration_settings,
                                                            telegram_bot_enabled:
                                                                checked,
                                                        },
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={integrationForm.processing}
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        Сохранить настройки интеграций
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Действия */}
                <Card>
                    <CardHeader>
                        <CardTitle>Действия</CardTitle>
                        <CardDescription>
                            Управление настройками главного сайта
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    fetch(
                                        '/dashboard/admin/main-site-settings/clear-cache',
                                        {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type':
                                                    'application/json',
                                                'X-CSRF-TOKEN':
                                                    document
                                                        .querySelector(
                                                            'meta[name="csrf-token"]',
                                                        )
                                                        ?.getAttribute(
                                                            'content',
                                                        ) || '',
                                            },
                                        },
                                    ).then(() => {
                                        alert('Кеш настроек очищен!');
                                        window.location.reload();
                                    });
                                }}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Очистить кеш
                            </Button>
                            <Button variant="outline" onClick={handleReset}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Сбросить к умолчанию
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

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
import {
    Download,
    Eye,
    RefreshCw,
    RotateCcw,
    Save,
    Settings,
} from 'lucide-react';
import React, { useState } from 'react';

interface GlobalSettingsPageProps {
    settings: {
        id: number;
        organization_singular: string;
        organization_plural: string;
        organization_genitive: string;
        organization_dative: string;
        organization_instrumental: string;
        member_singular: string;
        member_plural: string;
        member_genitive: string;
        action_join: string;
        action_leave: string;
        action_support: string;
        system_name: string;
        system_description: string;
        default_language: string;
        default_timezone: string;
        default_currency: string;
        default_organization_settings: any;
        default_payment_settings: any;
        default_notification_settings: any;
        system_settings: any;
        feature_flags: any;
        integration_settings: any;
        default_seo_settings: any;
    };
    terminology: any;
    systemSettings: any;
}

export default function GlobalSettingsPage({
    settings,
    terminology,
    systemSettings,
}: GlobalSettingsPageProps) {
    const [activeTab, setActiveTab] = useState('terminology');
    const [previewData, setPreviewData] = useState<any>(null);

    // Форма для терминологии
    const terminologyForm = useForm({
        organization_singular: settings.organization_singular,
        organization_plural: settings.organization_plural,
        organization_genitive: settings.organization_genitive,
        organization_dative: settings.organization_dative,
        organization_instrumental: settings.organization_instrumental,
        member_singular: settings.member_singular,
        member_plural: settings.member_plural,
        member_genitive: settings.member_genitive,
        action_join: settings.action_join,
        action_leave: settings.action_leave,
        action_support: settings.action_support,
    });

    // Форма для системных настроек
    const systemForm = useForm({
        system_name: settings.system_name,
        system_description: settings.system_description,
        default_language: settings.default_language,
        default_timezone: settings.default_timezone,
        default_currency: settings.default_currency,
    });

    // Форма для флагов функций
    const featuresForm = useForm({
        feature_flags: settings.feature_flags || {},
    });

    // Форма для системных настроек
    const systemConfigForm = useForm({
        system_settings: settings.system_settings || {},
    });

    const handleTerminologySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        terminologyForm.post('/dashboard/admin/global-settings/terminology', {
            onSuccess: () => {
                // Обновляем предварительный просмотр
                setPreviewData(terminologyForm.data);
            },
        });
    };

    const handleSystemSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        systemForm.post('/dashboard/admin/global-settings/system');
    };

    const handleFeaturesSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        featuresForm.post('/dashboard/admin/global-settings/features');
    };

    const handleSystemConfigSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        systemConfigForm.post('/dashboard/admin/global-settings/system-config');
    };

    const handleReset = () => {
        if (
            confirm(
                'Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?',
            )
        ) {
            // Отправляем POST запрос для сброса
            fetch('/dashboard/admin/global-settings/reset', {
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

    const handleExport = () => {
        window.open('/dashboard/admin/global-settings/export', '_blank');
    };

    const generatePreview = () => {
        const data = terminologyForm.data;
        const preview = {
            organization_forms: {
                1: data.organization_singular,
                2: data.organization_plural,
                5: data.organization_genitive,
            },
            member_forms: {
                1: data.member_singular,
                2: data.member_plural,
                5: data.member_genitive,
            },
            examples: [
                `Управление ${data.organization_plural}`,
                `Создать ${data.organization_singular}`,
                `Всего ${data.organization_genitive}: 5`,
                `Всего ${data.member_genitive}: 25`,
                `Последние ${data.organization_plural}`,
                `Последние ${data.member_plural}`,
            ],
        };
        setPreviewData(preview);
    };

    return (
        <AppLayout>
            <Head title="Глобальные настройки" />
            <div className="container mx-auto py-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Глобальные настройки</h1>
                    <p className="text-muted-foreground">
                        Управление терминологией и настройками системы
                    </p>
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-6"
                >
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="terminology">
                            Терминология
                        </TabsTrigger>
                        <TabsTrigger value="system">Система</TabsTrigger>
                        <TabsTrigger value="features">Функции</TabsTrigger>
                        <TabsTrigger value="config">Конфигурация</TabsTrigger>
                    </TabsList>

                    {/* Терминология */}
                    <TabsContent value="terminology" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Терминология системы
                                </CardTitle>
                                <CardDescription>
                                    Настройте названия и формы слов для
                                    организаций и их участников
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleTerminologySubmit}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        {/* Организации */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold">
                                                Организации
                                            </h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <Label htmlFor="organization_singular">
                                                        Единственное число
                                                    </Label>
                                                    <Input
                                                        id="organization_singular"
                                                        value={
                                                            terminologyForm.data
                                                                .organization_singular
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'organization_singular',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="школа"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="organization_plural">
                                                        Множественное число
                                                    </Label>
                                                    <Input
                                                        id="organization_plural"
                                                        value={
                                                            terminologyForm.data
                                                                .organization_plural
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'organization_plural',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="школы"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="organization_genitive">
                                                        Родительный падеж
                                                    </Label>
                                                    <Input
                                                        id="organization_genitive"
                                                        value={
                                                            terminologyForm.data
                                                                .organization_genitive
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'organization_genitive',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="школ"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="organization_dative">
                                                        Дательный падеж
                                                    </Label>
                                                    <Input
                                                        id="organization_dative"
                                                        value={
                                                            terminologyForm.data
                                                                .organization_dative
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'organization_dative',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="школе"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="organization_instrumental">
                                                        Творительный падеж
                                                    </Label>
                                                    <Input
                                                        id="organization_instrumental"
                                                        value={
                                                            terminologyForm.data
                                                                .organization_instrumental
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'organization_instrumental',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="школой"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Участники */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold">
                                                Участники
                                            </h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <Label htmlFor="member_singular">
                                                        Единственное число
                                                    </Label>
                                                    <Input
                                                        id="member_singular"
                                                        value={
                                                            terminologyForm.data
                                                                .member_singular
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'member_singular',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="выпускник"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="member_plural">
                                                        Множественное число
                                                    </Label>
                                                    <Input
                                                        id="member_plural"
                                                        value={
                                                            terminologyForm.data
                                                                .member_plural
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'member_plural',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="выпускники"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="member_genitive">
                                                        Родительный падеж
                                                    </Label>
                                                    <Input
                                                        id="member_genitive"
                                                        value={
                                                            terminologyForm.data
                                                                .member_genitive
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'member_genitive',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="выпускников"
                                                    />
                                                </div>
                                            </div>

                                            <Separator />

                                            <h3 className="text-lg font-semibold">
                                                Действия
                                            </h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <Label htmlFor="action_join">
                                                        Поступить
                                                    </Label>
                                                    <Input
                                                        id="action_join"
                                                        value={
                                                            terminologyForm.data
                                                                .action_join
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'action_join',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="поступить"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="action_leave">
                                                        Выпуститься
                                                    </Label>
                                                    <Input
                                                        id="action_leave"
                                                        value={
                                                            terminologyForm.data
                                                                .action_leave
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'action_leave',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="выпуститься"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="action_support">
                                                        Поддержать
                                                    </Label>
                                                    <Input
                                                        id="action_support"
                                                        value={
                                                            terminologyForm.data
                                                                .action_support
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'action_support',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="поддержать"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            type="submit"
                                            disabled={
                                                terminologyForm.processing
                                            }
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            Сохранить терминологию
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={generatePreview}
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            Предварительный просмотр
                                        </Button>
                                    </div>
                                </form>

                                {/* Предварительный просмотр */}
                                {previewData && (
                                    <div className="bg-muted mt-6 rounded-lg p-4">
                                        <h4 className="mb-3 font-semibold">
                                            Предварительный просмотр:
                                        </h4>
                                        <div className="space-y-2">
                                            {previewData.examples.map(
                                                (
                                                    example: string,
                                                    index: number,
                                                ) => (
                                                    <div
                                                        key={index}
                                                        className="text-sm"
                                                    >
                                                        <Badge
                                                            variant="outline"
                                                            className="mr-2"
                                                        >
                                                            Пример {index + 1}
                                                        </Badge>
                                                        {example}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Системные настройки */}
                    <TabsContent value="system" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Системные настройки</CardTitle>
                                <CardDescription>
                                    Основные настройки системы
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleSystemSubmit}
                                    className="space-y-4"
                                >
                                    <div>
                                        <Label htmlFor="system_name">
                                            Название системы
                                        </Label>
                                        <Input
                                            id="system_name"
                                            value={systemForm.data.system_name}
                                            onChange={(e) =>
                                                systemForm.setData(
                                                    'system_name',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="system_description">
                                            Описание системы
                                        </Label>
                                        <Textarea
                                            id="system_description"
                                            value={
                                                systemForm.data
                                                    .system_description
                                            }
                                            onChange={(e) =>
                                                systemForm.setData(
                                                    'system_description',
                                                    e.target.value,
                                                )
                                            }
                                            rows={3}
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="default_language">
                                                Язык по умолчанию
                                            </Label>
                                            <Input
                                                id="default_language"
                                                value={
                                                    systemForm.data
                                                        .default_language
                                                }
                                                onChange={(e) =>
                                                    systemForm.setData(
                                                        'default_language',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="default_timezone">
                                                Часовой пояс
                                            </Label>
                                            <Input
                                                id="default_timezone"
                                                value={
                                                    systemForm.data
                                                        .default_timezone
                                                }
                                                onChange={(e) =>
                                                    systemForm.setData(
                                                        'default_timezone',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="default_currency">
                                                Валюта
                                            </Label>
                                            <Input
                                                id="default_currency"
                                                value={
                                                    systemForm.data
                                                        .default_currency
                                                }
                                                onChange={(e) =>
                                                    systemForm.setData(
                                                        'default_currency',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={systemForm.processing}
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        Сохранить настройки
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Флаги функций */}
                    <TabsContent value="features" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Флаги функций</CardTitle>
                                <CardDescription>
                                    Включение и отключение функций системы
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleFeaturesSubmit}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>Пожертвования</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Возможность принимать
                                                    пожертвования
                                                </p>
                                            </div>
                                            <Switch
                                                checked={
                                                    featuresForm.data
                                                        .feature_flags
                                                        .donations_enabled
                                                }
                                                onCheckedChange={(checked) =>
                                                    featuresForm.setData(
                                                        'feature_flags',
                                                        {
                                                            ...featuresForm.data
                                                                .feature_flags,
                                                            donations_enabled:
                                                                checked,
                                                        },
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>Участники</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Управление участниками
                                                </p>
                                            </div>
                                            <Switch
                                                checked={
                                                    featuresForm.data
                                                        .feature_flags
                                                        .members_enabled
                                                }
                                                onCheckedChange={(checked) =>
                                                    featuresForm.setData(
                                                        'feature_flags',
                                                        {
                                                            ...featuresForm.data
                                                                .feature_flags,
                                                            members_enabled:
                                                                checked,
                                                        },
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>Проекты</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Создание и управление
                                                    проектами
                                                </p>
                                            </div>
                                            <Switch
                                                checked={
                                                    featuresForm.data
                                                        .feature_flags
                                                        .projects_enabled
                                                }
                                                onCheckedChange={(checked) =>
                                                    featuresForm.setData(
                                                        'feature_flags',
                                                        {
                                                            ...featuresForm.data
                                                                .feature_flags,
                                                            projects_enabled:
                                                                checked,
                                                        },
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>Новости</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Публикация новостей
                                                </p>
                                            </div>
                                            <Switch
                                                checked={
                                                    featuresForm.data
                                                        .feature_flags
                                                        .news_enabled
                                                }
                                                onCheckedChange={(checked) =>
                                                    featuresForm.setData(
                                                        'feature_flags',
                                                        {
                                                            ...featuresForm.data
                                                                .feature_flags,
                                                            news_enabled:
                                                                checked,
                                                        },
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>Галерея</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Загрузка и управление
                                                    изображениями
                                                </p>
                                            </div>
                                            <Switch
                                                checked={
                                                    featuresForm.data
                                                        .feature_flags
                                                        .gallery_enabled
                                                }
                                                onCheckedChange={(checked) =>
                                                    featuresForm.setData(
                                                        'feature_flags',
                                                        {
                                                            ...featuresForm.data
                                                                .feature_flags,
                                                            gallery_enabled:
                                                                checked,
                                                        },
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>Слайдер</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Создание слайдеров
                                                </p>
                                            </div>
                                            <Switch
                                                checked={
                                                    featuresForm.data
                                                        .feature_flags
                                                        .slider_enabled
                                                }
                                                onCheckedChange={(checked) =>
                                                    featuresForm.setData(
                                                        'feature_flags',
                                                        {
                                                            ...featuresForm.data
                                                                .feature_flags,
                                                            slider_enabled:
                                                                checked,
                                                        },
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={featuresForm.processing}
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        Сохранить флаги
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Системная конфигурация */}
                    <TabsContent value="config" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Системная конфигурация</CardTitle>
                                <CardDescription>
                                    Дополнительные настройки системы
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleSystemConfigSubmit}
                                    className="space-y-4"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>
                                                    Режим обслуживания
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Временно отключить сайт для
                                                    обслуживания
                                                </p>
                                            </div>
                                            <Switch
                                                checked={
                                                    systemConfigForm.data
                                                        .system_settings
                                                        .maintenance_mode
                                                }
                                                onCheckedChange={(checked) =>
                                                    systemConfigForm.setData(
                                                        'system_settings',
                                                        {
                                                            ...systemConfigForm
                                                                .data
                                                                .system_settings,
                                                            maintenance_mode:
                                                                checked,
                                                        },
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>
                                                    Регистрация разрешена
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Разрешить регистрацию новых
                                                    пользователей
                                                </p>
                                            </div>
                                            <Switch
                                                checked={
                                                    systemConfigForm.data
                                                        .system_settings
                                                        .registration_enabled
                                                }
                                                onCheckedChange={(checked) =>
                                                    systemConfigForm.setData(
                                                        'system_settings',
                                                        {
                                                            ...systemConfigForm
                                                                .data
                                                                .system_settings,
                                                            registration_enabled:
                                                                checked,
                                                        },
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>
                                                    Автоодобрение организаций
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Автоматически одобрять новые
                                                    организации
                                                </p>
                                            </div>
                                            <Switch
                                                checked={
                                                    systemConfigForm.data
                                                        .system_settings
                                                        .auto_approve_organizations
                                                }
                                                onCheckedChange={(checked) =>
                                                    systemConfigForm.setData(
                                                        'system_settings',
                                                        {
                                                            ...systemConfigForm
                                                                .data
                                                                .system_settings,
                                                            auto_approve_organizations:
                                                                checked,
                                                        },
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={systemConfigForm.processing}
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        Сохранить конфигурацию
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Действия */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Дополнительные действия</CardTitle>
                        <CardDescription>
                            Управление настройками системы
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4" />
                                Экспортировать настройки
                            </Button>
                            <Button variant="outline" onClick={handleReset}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Сбросить к умолчанию
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    fetch(
                                        '/dashboard/admin/global-settings/clear-cache',
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
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

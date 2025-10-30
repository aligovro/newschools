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
import React, { useEffect, useState } from 'react';
import CitySelector from '@/components/main-site/CitySelector';
import { fetchPublicCities } from '@/lib/api/public';

interface GlobalSettingsPageProps {
    settings: {
        id: number;
        // legacy fields (may be absent)
        organization_singular?: string;
        organization_plural?: string;
        organization_genitive?: string;
        organization_dative?: string;
        organization_instrumental?: string;
        member_singular?: string;
        member_plural?: string;
        member_genitive?: string;
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
        // new org/member fields (optional in payload)
        org_singular_nominative?: string;
        org_singular_genitive?: string;
        org_singular_dative?: string;
        org_singular_accusative?: string;
        org_singular_instrumental?: string;
        org_singular_prepositional?: string;
        org_plural_nominative?: string;
        org_plural_genitive?: string;
        org_plural_dative?: string;
        org_plural_accusative?: string;
        org_plural_instrumental?: string;
        org_plural_prepositional?: string;

        member_singular_nominative?: string;
        member_singular_genitive?: string;
        member_singular_dative?: string;
        member_singular_accusative?: string;
        member_singular_instrumental?: string;
        member_singular_prepositional?: string;
        member_plural_nominative?: string;
        member_plural_genitive?: string;
        member_plural_dative?: string;
        member_plural_accusative?: string;
        member_plural_instrumental?: string;
        member_plural_prepositional?: string;

        // sponsors optional
        sponsor_singular_nominative?: string;
        sponsor_singular_genitive?: string;
        sponsor_singular_dative?: string;
        sponsor_singular_accusative?: string;
        sponsor_singular_instrumental?: string;
        sponsor_singular_prepositional?: string;
        sponsor_plural_nominative?: string;
        sponsor_plural_genitive?: string;
        sponsor_plural_dative?: string;
        sponsor_plural_accusative?: string;
        sponsor_plural_instrumental?: string;
        sponsor_plural_prepositional?: string;
        [key: string]: any;
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
    const [selectedDefaultCity, setSelectedDefaultCity] = useState<{
        id: number;
        name: string;
        region?: { name: string };
    } | null>(null);

    // Форма для терминологии
    const terminologyForm = useForm({
        org_singular_nominative: settings.org_singular_nominative,
        org_singular_genitive: settings.org_singular_genitive,
        org_singular_dative: settings.org_singular_dative,
        org_singular_accusative: settings.org_singular_accusative,
        org_singular_instrumental: settings.org_singular_instrumental,
        org_singular_prepositional: settings.org_singular_prepositional,

        org_plural_nominative: settings.org_plural_nominative,
        org_plural_genitive: settings.org_plural_genitive,
        org_plural_dative: settings.org_plural_dative,
        org_plural_accusative: settings.org_plural_accusative,
        org_plural_instrumental: settings.org_plural_instrumental,
        org_plural_prepositional: settings.org_plural_prepositional,

        member_singular_nominative: settings.member_singular_nominative,
        member_singular_genitive: settings.member_singular_genitive,
        member_singular_dative: settings.member_singular_dative,
        member_singular_accusative: settings.member_singular_accusative,
        member_singular_instrumental: settings.member_singular_instrumental,
        member_singular_prepositional: settings.member_singular_prepositional,
        member_plural_nominative: settings.member_plural_nominative,
        member_plural_genitive: settings.member_plural_genitive,
        member_plural_dative: settings.member_plural_dative,
        member_plural_accusative: settings.member_plural_accusative,
        member_plural_instrumental: settings.member_plural_instrumental,
        member_plural_prepositional: settings.member_plural_prepositional,

        // Sponsors
        sponsor_singular_nominative: settings.sponsor_singular_nominative,
        sponsor_singular_genitive: settings.sponsor_singular_genitive,
        sponsor_singular_dative: settings.sponsor_singular_dative,
        sponsor_singular_accusative: settings.sponsor_singular_accusative,
        sponsor_singular_instrumental: settings.sponsor_singular_instrumental,
        sponsor_singular_prepositional: settings.sponsor_singular_prepositional,
        sponsor_plural_nominative: settings.sponsor_plural_nominative,
        sponsor_plural_genitive: settings.sponsor_plural_genitive,
        sponsor_plural_dative: settings.sponsor_plural_dative,
        sponsor_plural_accusative: settings.sponsor_plural_accusative,
        sponsor_plural_instrumental: settings.sponsor_plural_instrumental,
        sponsor_plural_prepositional: settings.sponsor_plural_prepositional,

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

    // Инициализация выбранного города по умолчанию из текущих настроек
    useEffect(() => {
        const init = async () => {
            const name = (systemConfigForm.data.system_settings as any)
                ?.default_city_fallback as string | undefined;
            if (name && name.trim() !== '') {
                try {
                    const results = await fetchPublicCities({ search: name });
                    const byExact = results.find(
                        (c) => c.name.toLowerCase() === name.toLowerCase(),
                    );
                    const byIncludes =
                        byExact ||
                        results.find((c) =>
                            c.name
                                .toLowerCase()
                                .includes(name.toLowerCase()),
                        );
                    if (byIncludes) {
                        setSelectedDefaultCity(byIncludes as any);
                    }
                } catch {}
            }
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDefaultCityChange = (
        city: { id: number; name: string; region?: { name: string } } | null,
    ) => {
        setSelectedDefaultCity(city);
        systemConfigForm.setData('system_settings', {
            ...systemConfigForm.data.system_settings,
            default_city_id: city?.id ?? '',
            default_city_fallback: city?.name ?? '',
        });
    };

    // Форма для интеграций (ключи Яндекс.Карт)
    const integrationsForm = useForm({
        integration_settings: {
            ...(settings.integration_settings || {}),
            yandex_map_apikey:
                settings.integration_settings?.yandex_map_apikey || '',
            yandex_suggest_apikey:
                settings.integration_settings?.yandex_suggest_apikey || '',
        },
    });

    const handleTerminologySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        terminologyForm.post('/dashboard/admin/global-settings/terminology', {
            onSuccess: () => {
                // Пересобираем превью из актуальных данных формы
                generatePreview();
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

    const handleIntegrationsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        integrationsForm.post('/dashboard/admin/global-settings/integrations');
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
        const d: any = terminologyForm.data;
        const orgSing = d.org_singular_nominative || 'Организация';
        const orgPl = d.org_plural_nominative || 'Организации';
        const orgGen = d.org_plural_genitive || 'организаций';

        const memSing = d.member_singular_nominative || 'участник';
        const memPl = d.member_plural_nominative || 'участники';
        const memGen = d.member_plural_genitive || 'участников';

        const preview = {
            organization_forms: {
                1: orgSing,
                2: orgPl,
                5: orgGen,
            },
            member_forms: {
                1: memSing,
                2: memPl,
                5: memGen,
            },
            examples: [
                `Управление ${d.org_plural_instrumental || 'организациями'}`,
                `Создать ${orgSing}`,
                `Всего ${orgGen}: 5`,
                `Всего ${memGen}: 25`,
                `Последние ${orgPl}`,
                `Последние ${memPl}`,
            ],
        } as const;
        setPreviewData(preview as any);
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
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="terminology">
                            Терминология
                        </TabsTrigger>
                        <TabsTrigger value="system">Система</TabsTrigger>
                        <TabsTrigger value="features">Функции</TabsTrigger>
                        <TabsTrigger value="config">Конфигурация</TabsTrigger>
                        <TabsTrigger value="integrations">
                            Интеграции
                        </TabsTrigger>
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
                                                    <Label htmlFor="org_singular_nominative">
                                                        Единственное число (им.)
                                                    </Label>
                                                    <Input
                                                        id="org_singular_nominative"
                                                        value={
                                                            terminologyForm.data
                                                                .org_singular_nominative
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'org_singular_nominative',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="школа"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="org_plural_nominative">
                                                        Множественное число
                                                        (им.)
                                                    </Label>
                                                    <Input
                                                        id="org_plural_nominative"
                                                        value={
                                                            terminologyForm.data
                                                                .org_plural_nominative
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'org_plural_nominative',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="школы"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="org_plural_genitive">
                                                        Родительный (мн.)
                                                    </Label>
                                                    <Input
                                                        id="org_plural_genitive"
                                                        value={
                                                            terminologyForm.data
                                                                .org_plural_genitive
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'org_plural_genitive',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="школ"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="org_singular_dative">
                                                        Дательный (ед.)
                                                    </Label>
                                                    <Input
                                                        id="org_singular_dative"
                                                        value={
                                                            terminologyForm.data
                                                                .org_singular_dative
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'org_singular_dative',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="школе"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="org_singular_instrumental">
                                                        Творительный (ед.)
                                                    </Label>
                                                    <Input
                                                        id="org_singular_instrumental"
                                                        value={
                                                            terminologyForm.data
                                                                .org_singular_instrumental
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'org_singular_instrumental',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="школой"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="org_singular_accusative">
                                                        Винительный (ед.)
                                                    </Label>
                                                    <Input
                                                        id="org_singular_accusative"
                                                        value={
                                                            terminologyForm.data
                                                                .org_singular_accusative
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'org_singular_accusative',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="школу"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="org_singular_prepositional">
                                                        Предложный (ед.)
                                                    </Label>
                                                    <Input
                                                        id="org_singular_prepositional"
                                                        value={
                                                            terminologyForm.data
                                                                .org_singular_prepositional
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'org_singular_prepositional',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="школе"
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
                                                    <Label htmlFor="member_singular_nominative">
                                                        Единственное число (им.)
                                                    </Label>
                                                    <Input
                                                        id="member_singular_nominative"
                                                        value={
                                                            terminologyForm.data
                                                                .member_singular_nominative
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'member_singular_nominative',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="выпускник"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="member_plural_nominative">
                                                        Множественное число
                                                        (им.)
                                                    </Label>
                                                    <Input
                                                        id="member_plural_nominative"
                                                        value={
                                                            terminologyForm.data
                                                                .member_plural_nominative
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'member_plural_nominative',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="выпускники"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="member_plural_genitive">
                                                        Родительный (мн.)
                                                    </Label>
                                                    <Input
                                                        id="member_plural_genitive"
                                                        value={
                                                            terminologyForm.data
                                                                .member_plural_genitive
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'member_plural_genitive',
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

                                        {/* Спонсоры */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold">
                                                Спонсоры
                                            </h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <Label htmlFor="sponsor_singular_nominative">
                                                        Единственное число (им.)
                                                    </Label>
                                                    <Input
                                                        id="sponsor_singular_nominative"
                                                        value={
                                                            terminologyForm.data
                                                                .sponsor_singular_nominative
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'sponsor_singular_nominative',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="спонсор"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="sponsor_plural_nominative">
                                                        Множественное число
                                                        (им.)
                                                    </Label>
                                                    <Input
                                                        id="sponsor_plural_nominative"
                                                        value={
                                                            terminologyForm.data
                                                                .sponsor_plural_nominative
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'sponsor_plural_nominative',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="спонсоры"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="sponsor_plural_genitive">
                                                        Родительный (мн.)
                                                    </Label>
                                                    <Input
                                                        id="sponsor_plural_genitive"
                                                        value={
                                                            terminologyForm.data
                                                                .sponsor_plural_genitive
                                                        }
                                                        onChange={(e) =>
                                                            terminologyForm.setData(
                                                                'sponsor_plural_genitive',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="спонсоров"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label htmlFor="sponsor_singular_dative">
                                                            Дательный (ед.)
                                                        </Label>
                                                        <Input
                                                            id="sponsor_singular_dative"
                                                            value={
                                                                terminologyForm
                                                                    .data
                                                                    .sponsor_singular_dative
                                                            }
                                                            onChange={(e) =>
                                                                terminologyForm.setData(
                                                                    'sponsor_singular_dative',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="спонсору"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="sponsor_singular_instrumental">
                                                            Творительный (ед.)
                                                        </Label>
                                                        <Input
                                                            id="sponsor_singular_instrumental"
                                                            value={
                                                                terminologyForm
                                                                    .data
                                                                    .sponsor_singular_instrumental
                                                            }
                                                            onChange={(e) =>
                                                                terminologyForm.setData(
                                                                    'sponsor_singular_instrumental',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="спонсором"
                                                        />
                                                    </div>
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
                                {previewData &&
                                    Array.isArray(previewData.examples) && (
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
                                                                Пример{' '}
                                                                {index + 1}
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
                                        {/* Город по умолчанию для карты */}
                                        <div className="space-y-2">
                                            <Label>Город по умолчанию</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Выберите город из списка вместо ручного ввода ID/названия
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <CitySelector
                                                    value={selectedDefaultCity}
                                                    onChange={handleDefaultCityChange}
                                                    defaultCityName={(systemConfigForm.data.system_settings as any)?.default_city_fallback || 'Казань'}
                                                    detectOnMount={false}
                                                />
                                                {selectedDefaultCity && (
                                                    <span className="text-sm text-muted-foreground">
                                                        ID: {selectedDefaultCity.id}
                                                    </span>
                                                )}
                                            </div>
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
                    {/* Интеграции */}
                    <TabsContent value="integrations" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Интеграции</CardTitle>
                                <CardDescription>
                                    Ключи и настройки внешних сервисов
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleIntegrationsSubmit}
                                    className="space-y-4"
                                >
                                    <div>
                                        <Label htmlFor="yandex_map_apikey">
                                            Яндекс.Карты API Key
                                        </Label>
                                        <Input
                                            id="yandex_map_apikey"
                                            value={
                                                integrationsForm.data
                                                    .integration_settings
                                                    .yandex_map_apikey
                                            }
                                            onChange={(e) =>
                                                integrationsForm.setData(
                                                    'integration_settings',
                                                    {
                                                        ...integrationsForm.data
                                                            .integration_settings,
                                                        yandex_map_apikey:
                                                            e.target.value,
                                                    },
                                                )
                                            }
                                            placeholder="Введите ключ API Яндекс.Карт"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="yandex_suggest_apikey">
                                            Яндекс.Suggest API Key
                                        </Label>
                                        <Input
                                            id="yandex_suggest_apikey"
                                            value={
                                                integrationsForm.data
                                                    .integration_settings
                                                    .yandex_suggest_apikey
                                            }
                                            onChange={(e) =>
                                                integrationsForm.setData(
                                                    'integration_settings',
                                                    {
                                                        ...integrationsForm.data
                                                            .integration_settings,
                                                        yandex_suggest_apikey:
                                                            e.target.value,
                                                    },
                                                )
                                            }
                                            placeholder="Введите ключ Suggest API"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={integrationsForm.processing}
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        Сохранить интеграции
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

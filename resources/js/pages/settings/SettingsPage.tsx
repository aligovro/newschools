import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { adminApi } from '@/lib/api/index';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    BarChart3,
    Bell,
    ChevronRight,
    Code,
    CreditCard,
    Database,
    Globe,
    Palette,
    Settings,
    Shield,
    Users,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Настройки',
        href: '/dashboard/settings',
    },
];

interface SettingsPageProps {
    globalSettings?: any;
    userSettings?: any;
}

export default function SettingsPage({
    globalSettings,
    userSettings,
}: SettingsPageProps) {
    const settingsCategories = [
        {
            id: 'global',
            title: 'Глобальные настройки',
            description: 'Терминология, системные настройки и флаги функций',
            icon: Shield,
            href: '/dashboard/admin/global-settings',
            color: 'bg-blue-500',
            status: 'active',
            features: [
                'Терминология системы',
                'Системные настройки',
                'Флаги функций',
                'Конфигурация',
            ],
        },
        {
            id: 'main-site',
            title: 'Конструктор главного сайта',
            description: 'Редактирование и настройка главного сайта',
            icon: Globe,
            href: '/dashboard/main-site/builder',
            color: 'bg-green-500',
            status: 'active',
            features: [
                'Конструктор сайта',
                'Управление виджетами',
                'Настройка дизайна',
                'SEO оптимизация',
            ],
        },
        {
            id: 'user',
            title: 'Пользовательские настройки',
            description: 'Профиль, пароль, внешний вид и безопасность',
            icon: Users,
            href: '/settings/profile',
            color: 'bg-purple-500',
            status: 'active',
            features: [
                'Профиль пользователя',
                'Смена пароля',
                'Внешний вид',
                'Двухфакторная аутентификация',
            ],
        },
        {
            id: 'organizations',
            title: 'Управление организациями',
            description: 'Создание, редактирование и управление организациями',
            icon: Database,
            href: '/dashboard/organizations',
            color: 'bg-orange-500',
            status: 'active',
            features: [
                'Список организаций',
                'Создание новых организаций',
                'Редактирование организаций',
                'Управление пользователями',
            ],
        },
        {
            id: 'payments',
            title: 'Платежная система',
            description: 'Настройки платежей, методы оплаты и транзакции',
            icon: CreditCard,
            href: '/dashboard/payments',
            color: 'bg-emerald-500',
            status: 'active',
            features: [
                'Методы оплаты',
                'Настройки платежей',
                'История транзакций',
                'Интеграции с платежными системами',
            ],
        },
        {
            id: 'notifications',
            title: 'Уведомления',
            description: 'Email, Telegram и другие уведомления',
            icon: Bell,
            href: '/dashboard/notifications',
            color: 'bg-yellow-500',
            status: 'active',
            features: [
                'Email уведомления',
                'Telegram уведомления',
                'Настройки уведомлений',
                'Шаблоны сообщений',
            ],
        },
        {
            id: 'analytics',
            title: 'Аналитика и отчеты',
            description: 'Статистика, отчеты и аналитика системы',
            icon: BarChart3,
            href: '/dashboard/statistics',
            color: 'bg-indigo-500',
            status: 'active',
            features: [
                'Общая статистика',
                'Отчеты по организациям',
                'Аналитика платежей',
                'Экспорт данных',
            ],
        },
        {
            id: 'appearance',
            title: 'Внешний вид',
            description: 'Темы, цвета и настройки интерфейса',
            icon: Palette,
            href: '/settings/appearance',
            color: 'bg-pink-500',
            status: 'active',
            features: [
                'Темы оформления',
                'Цветовые схемы',
                'Настройки интерфейса',
                'Персонализация',
            ],
        },
        {
            id: 'integrations',
            title: 'Интеграции',
            description: 'Внешние сервисы и API',
            icon: Code,
            href: '/dashboard/integrations',
            color: 'bg-gray-500',
            status: 'active',
            features: [
                'API настройки',
                'Внешние сервисы',
                'Webhook настройки',
                'Синхронизация данных',
            ],
        },
    ];

    const quickActions = [
        {
            title: 'Очистить кеш',
            description: 'Очистить кеш всех настроек',
            action: async () => {
                try {
                    await adminApi.clearCache();
                    alert('Кеш настроек очищен!');
                    window.location.reload();
                } catch (error) {
                    console.error('Error clearing cache:', error);
                    alert('Ошибка при очистке кеша');
                }
            },
        },
        {
            title: 'Экспорт настроек',
            description: 'Скачать все настройки в файл',
            action: () => {
                window.open(
                    '/dashboard/admin/global-settings/export',
                    '_blank',
                );
            },
        },
        {
            title: 'Сброс к умолчанию',
            description: 'Вернуть все настройки к значениям по умолчанию',
            action: async () => {
                if (
                    confirm(
                        'Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?',
                    )
                ) {
                    try {
                        await adminApi.resetSettings();
                        window.location.reload();
                    } catch (error) {
                        console.error('Error resetting settings:', error);
                        alert('Ошибка при сбросе настроек');
                    }
                }
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Настройки системы" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Настройки системы
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Управление всеми настройками платформы поддержки
                            школ
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                        >
                            <Settings className="h-3 w-3" />
                            Администратор
                        </Badge>
                    </div>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Быстрые действия</CardTitle>
                        <CardDescription>
                            Часто используемые операции с настройками
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            {quickActions.map((action, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    onClick={action.action}
                                    className="h-auto flex-col items-start p-4 text-left"
                                >
                                    <div className="font-medium">
                                        {action.title}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {action.description}
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Settings Categories */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {settingsCategories.map((category) => {
                        const IconComponent = category.icon;
                        return (
                            <Card
                                key={category.id}
                                className="group transition-shadow hover:shadow-lg"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`rounded-lg p-2 ${category.color} text-white`}
                                        >
                                            <IconComponent className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">
                                                {category.title}
                                            </CardTitle>
                                            <Badge
                                                variant="outline"
                                                className="mt-1"
                                            >
                                                {category.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <CardDescription className="mb-4">
                                        {category.description}
                                    </CardDescription>

                                    <div className="mb-4 space-y-2">
                                        {category.features.map(
                                            (feature, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 text-sm text-muted-foreground"
                                                >
                                                    <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                                                    {feature}
                                                </div>
                                            ),
                                        )}
                                    </div>

                                    <Button
                                        asChild
                                        className="group-hover:bg-primary/90 w-full"
                                    >
                                        <Link href={category.href}>
                                            {category.id === 'main-site'
                                                ? 'Открыть конструктор'
                                                : 'Перейти к настройкам'}
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* System Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Статус системы</CardTitle>
                        <CardDescription>
                            Текущее состояние настроек и компонентов системы
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <div>
                                    <div className="font-medium text-green-900 dark:text-green-100">
                                        Глобальные настройки
                                    </div>
                                    <div className="text-sm text-green-600 dark:text-green-300">
                                        Активны
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <div>
                                    <div className="font-medium text-green-900 dark:text-green-100">
                                        Главный сайт
                                    </div>
                                    <div className="text-sm text-green-600 dark:text-green-300">
                                        Настроен
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <div>
                                    <div className="font-medium text-green-900 dark:text-green-100">
                                        Платежи
                                    </div>
                                    <div className="text-sm text-green-600 dark:text-green-300">
                                        Работают
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <div>
                                    <div className="font-medium text-green-900 dark:text-green-100">
                                        Уведомления
                                    </div>
                                    <div className="text-sm text-green-600 dark:text-green-300">
                                        Активны
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Последние изменения</CardTitle>
                        <CardDescription>
                            Недавние обновления настроек системы
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                <div className="flex-1">
                                    <div className="font-medium">
                                        Обновлены глобальные настройки
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Терминология и системные настройки
                                    </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Сегодня
                                </div>
                            </div>
                            <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <div className="flex-1">
                                    <div className="font-medium">
                                        Обновлен конструктор главного сайта
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Виджеты, дизайн и SEO настройки
                                    </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Сегодня
                                </div>
                            </div>
                            <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
                                <div className="h-2 w-2 rounded-full bg-purple-500" />
                                <div className="flex-1">
                                    <div className="font-medium">
                                        Добавлены новые функции
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Флаги функций и интеграции
                                    </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Сегодня
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

import { Card, CardContent } from '@/components/ui/card';
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
import { widgetsApi } from '@/lib/api/index';
import { cn } from '@/lib/utils';
import {
    ChevronDown,
    ChevronUp,
    CreditCard,
    MapPin,
    Settings,
    Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface DonationData {
    id: number;
    amount: number;
    donor_name?: string;
    donor_email?: string;
    donor_phone?: string;
    is_anonymous: boolean;
    payment_method?: string;
    status: string;
    created_at: string;
    region_name?: string;
    message?: string;
}

interface DonationsListWidgetConfig {
    title?: string;
    subtitle?: string;
    show_amount?: boolean;
    show_donor_name?: boolean;
    show_payment_method?: boolean;
    show_date?: boolean;
    show_region?: boolean;
    show_message?: boolean;
    items_per_page?: number;
    sort_by?: 'date' | 'amount' | 'donor_name';
    sort_order?: 'asc' | 'desc';
    show_pagination?: boolean;
    show_search?: boolean;
    show_filters?: boolean;
    currency?: 'RUB' | 'USD' | 'EUR';
    layout?: 'list' | 'grid' | 'compact';
    card_style?: 'default' | 'modern' | 'minimal';
    color_scheme?: 'light' | 'dark' | 'auto';
    primary_color?: string;
    border_radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
    shadow?: 'none' | 'small' | 'medium' | 'large';
}

interface DonationsListWidgetProps {
    config?: DonationsListWidgetConfig;
    isEditable?: boolean;
    autoExpandSettings?: boolean;
    onSave?: (config: Record<string, unknown>) => Promise<void>;
    onConfigChange?: (config: Record<string, unknown>) => void;
    widgetId?: string;
    organizationId?: number;
}

const CURRENCY_SYMBOLS = {
    RUB: '₽',
    USD: '$',
    EUR: '€',
};

const SORT_OPTIONS = [
    { value: 'date', label: 'По дате' },
    { value: 'amount', label: 'По сумме' },
    { value: 'donor_name', label: 'По имени донора' },
];

const LAYOUT_OPTIONS = [
    { value: 'list', label: 'Список' },
    { value: 'grid', label: 'Сетка' },
    { value: 'compact', label: 'Компактный' },
];

const CARD_STYLE_OPTIONS = [
    { value: 'default', label: 'Стандартный' },
    { value: 'modern', label: 'Современный' },
    { value: 'minimal', label: 'Минималистичный' },
];

export const DonationsListWidget: React.FC<DonationsListWidgetProps> = ({
    config = {},
    isEditable = false,
    autoExpandSettings = false,
    onSave,
    onConfigChange,
    widgetId: _widgetId,
    organizationId,
}) => {
    const [isSettingsExpanded, setIsSettingsExpanded] =
        useState(autoExpandSettings);
    const [localConfig, setLocalConfig] =
        useState<DonationsListWidgetConfig>(config);

    // Состояние для публичного виджета
    const [donations, setDonations] = useState<DonationData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'amount' | 'donor_name'>(
        'date',
    );
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Синхронизация локального состояния с внешним config
    useEffect(() => {
        setLocalConfig(config);
        setSortBy(config.sort_by || 'date');
        setSortOrder(config.sort_order || 'desc');
    }, [config]);

    // Автоматическое раскрытие настроек
    useEffect(() => {
        if (autoExpandSettings || isEditable) {
            setIsSettingsExpanded(true);
        }
    }, [autoExpandSettings, isEditable]);

    // Функция для обновления конфигурации
    const updateConfig = (updates: Partial<DonationsListWidgetConfig>) => {
        const newConfig = { ...localConfig, ...updates };
        setLocalConfig(newConfig);
        onConfigChange?.(newConfig);
    };

    const loadDonationsData = React.useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await widgetsApi.getDonations(organizationId!, {
                page: currentPage,
                per_page: localConfig.items_per_page || 10,
                search: searchQuery,
                sort_by: sortBy,
                sort_order: sortOrder,
            });

            setDonations(response.data || []);
        } catch (err: unknown) {
            console.error('Error loading donations data:', err);
            setError('Ошибка загрузки данных пожертвований');
        } finally {
            setIsLoading(false);
        }
    }, [
        organizationId,
        currentPage,
        searchQuery,
        sortBy,
        sortOrder,
        localConfig.items_per_page,
    ]);

    // Загрузка данных виджета
    useEffect(() => {
        if (!isEditable && organizationId) {
            loadDonationsData();
        }
    }, [isEditable, organizationId, loadDonationsData]);

    // Автоматическое сохранение конфигурации при изменении (с debounce)
    useEffect(() => {
        if (!onSave || !isEditable) return;

        const timer = setTimeout(() => {
            onSave(localConfig as Record<string, unknown>);
        }, 500);

        return () => clearTimeout(timer);
    }, [localConfig, onSave, isEditable]);

    const formatAmount = (amount: number): string => {
        const currency = localConfig.currency || 'RUB';
        const symbol = CURRENCY_SYMBOLS[currency];
        return `${amount.toLocaleString()} ${symbol}`;
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getPaymentMethodLabel = (method?: string): string => {
        const methods: Record<string, string> = {
            sbp: 'СБП',
            sberpay: 'SberPay',
            tpay: 'T-Pay',
            yoomoney: 'ЮMoney',
            card: 'Банковская карта',
        };
        return methods[method?.toLowerCase() || ''] || method || 'Не указан';
    };

    const renderDonationItem = (donation: DonationData) => {
        const {
            title: _title = 'Последние пожертвования',
            subtitle: _subtitle = 'Список поступлений на текущую организацию',
            show_amount = true,
            show_donor_name = true,
            show_payment_method = true,
            show_date = true,
            show_region = false,
            show_message = false,
            layout = 'list',
            card_style = 'default',
            color_scheme = 'light',
        } = localConfig;

        const isDark =
            color_scheme === 'dark' ||
            (color_scheme === 'auto' &&
                window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (layout === 'compact') {
            return (
                <div
                    key={donation.id}
                    className={cn(
                        'flex items-center justify-between border-b border-gray-200 p-3 last:border-b-0',
                        isDark && 'border-gray-700',
                    )}
                >
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                <CreditCard className="h-4 w-4 text-green-600" />
                            </div>
                        </div>
                        <div>
                            {show_donor_name && (
                                <div className="text-sm font-medium">
                                    {donation.is_anonymous
                                        ? 'Анонимное пожертвование'
                                        : donation.donor_name || 'Не указано'}
                                </div>
                            )}
                            {show_date && (
                                <div className="text-xs text-gray-500">
                                    {formatDate(donation.created_at)}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        {show_amount && (
                            <div className="font-semibold text-green-600">
                                {formatAmount(donation.amount)}
                            </div>
                        )}
                        {show_payment_method && (
                            <div className="text-xs text-gray-500">
                                {getPaymentMethodLabel(donation.payment_method)}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <Card
                key={donation.id}
                className={cn(
                    'mb-3',
                    card_style === 'modern' && 'border-0 shadow-lg',
                    card_style === 'minimal' && 'border-gray-100',
                    isDark && 'border-gray-700 bg-gray-800',
                )}
            >
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                    <CreditCard className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                            <div className="flex-1">
                                {show_donor_name && (
                                    <div className="mb-1 font-semibold text-gray-900">
                                        {donation.is_anonymous
                                            ? 'Анонимное пожертвование'
                                            : donation.donor_name ||
                                              'Не указано'}
                                    </div>
                                )}
                                <div className="space-y-1">
                                    {show_date && (
                                        <div className="text-sm text-gray-500">
                                            {formatDate(donation.created_at)}
                                        </div>
                                    )}
                                    {show_region && donation.region_name && (
                                        <div className="flex items-center text-sm text-gray-500">
                                            <MapPin className="mr-1 h-4 w-4" />
                                            {donation.region_name}
                                        </div>
                                    )}
                                    {show_message && donation.message && (
                                        <div className="text-sm italic text-gray-600">
                                            "{donation.message}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            {show_amount && (
                                <div className="text-lg font-bold text-green-600">
                                    {formatAmount(donation.amount)}
                                </div>
                            )}
                            {show_payment_method && (
                                <div className="mt-1 text-sm text-gray-500">
                                    {getPaymentMethodLabel(
                                        donation.payment_method,
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    if (isEditable) {
        const {
            title = 'Последние пожертвования',
            subtitle = 'Список поступлений на текущую организацию',
            show_amount = true,
            show_donor_name = true,
            show_payment_method = true,
            show_date = true,
            show_region = false,
            show_message = false,
            show_search = true,
            show_filters = true,
            show_pagination = true,
            items_per_page: _items_per_page = 10,
            layout = 'list',
            card_style = 'default',
            currency: _currency = 'RUB',
        } = localConfig;

        return (
            <div className="donations-list-widget">
                {/* Заголовок */}
                <div className="mb-4">
                    <h3 className="mb-1 text-lg font-semibold text-gray-900">
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-sm text-gray-600">{subtitle}</p>
                    )}
                </div>

                {/* Кнопка настроек */}
                <div className="mb-4">
                    <button
                        onClick={() =>
                            setIsSettingsExpanded(!isSettingsExpanded)
                        }
                        className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                        <Settings className="h-4 w-4" />
                        <span>Настройки виджета</span>
                        {isSettingsExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </button>
                </div>

                {/* Настройки */}
                {isSettingsExpanded && (
                    <div className="mb-4 rounded-lg border bg-gray-50 p-4">
                        <div className="space-y-4">
                            {/* Основные настройки */}
                            <div>
                                <h4 className="mb-3 font-medium text-gray-900">
                                    Основные настройки
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="title">Заголовок</Label>
                                        <Input
                                            id="title"
                                            value={title}
                                            onChange={(e) =>
                                                updateConfig({
                                                    title: e.target.value,
                                                })
                                            }
                                            placeholder="Последние пожертвования"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="subtitle">
                                            Подзаголовок
                                        </Label>
                                        <Input
                                            id="subtitle"
                                            value={subtitle || ''}
                                            onChange={(e) =>
                                                updateConfig({
                                                    subtitle: e.target.value,
                                                })
                                            }
                                            placeholder="Список поступлений на текущую организацию"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="items_per_page">
                                            Количество на странице
                                        </Label>
                                        <Input
                                            id="items_per_page"
                                            type="number"
                                            value={
                                                localConfig.items_per_page || 10
                                            }
                                            onChange={(e) =>
                                                updateConfig({
                                                    items_per_page:
                                                        parseInt(
                                                            e.target.value,
                                                        ) || 10,
                                                })
                                            }
                                            min="5"
                                            max="50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Настройки отображения */}
                            <div>
                                <h4 className="mb-3 font-medium text-gray-900">
                                    Настройки отображения
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="layout">Макет</Label>
                                        <Select
                                            value={layout}
                                            onValueChange={(
                                                value:
                                                    | 'list'
                                                    | 'grid'
                                                    | 'compact',
                                            ) =>
                                                updateConfig({
                                                    layout: value,
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {LAYOUT_OPTIONS.map(
                                                    (option) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="card_style">
                                            Стиль карточек
                                        </Label>
                                        <Select
                                            value={card_style}
                                            onValueChange={(
                                                value:
                                                    | 'default'
                                                    | 'modern'
                                                    | 'minimal',
                                            ) =>
                                                updateConfig({
                                                    card_style: value,
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CARD_STYLE_OPTIONS.map(
                                                    (option) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Элементы отображения */}
                            <div>
                                <h4 className="mb-3 font-medium text-gray-900">
                                    Элементы отображения
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="show_amount"
                                            checked={show_amount}
                                            onCheckedChange={(checked) =>
                                                updateConfig({
                                                    show_amount:
                                                        checked as boolean,
                                                })
                                            }
                                        />
                                        <Label htmlFor="show_amount">
                                            Показывать сумму пожертвования
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="show_donor_name"
                                            checked={show_donor_name}
                                            onCheckedChange={(checked) =>
                                                updateConfig({
                                                    show_donor_name:
                                                        checked as boolean,
                                                })
                                            }
                                        />
                                        <Label htmlFor="show_donor_name">
                                            Показывать имя донора
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="show_payment_method"
                                            checked={show_payment_method}
                                            onCheckedChange={(checked) =>
                                                updateConfig({
                                                    show_payment_method:
                                                        checked as boolean,
                                                })
                                            }
                                        />
                                        <Label htmlFor="show_payment_method">
                                            Показывать способ оплаты
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="show_date"
                                            checked={show_date}
                                            onCheckedChange={(checked) =>
                                                updateConfig({
                                                    show_date:
                                                        checked as boolean,
                                                })
                                            }
                                        />
                                        <Label htmlFor="show_date">
                                            Показывать дату
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="show_region"
                                            checked={show_region}
                                            onCheckedChange={(checked) =>
                                                updateConfig({
                                                    show_region:
                                                        checked as boolean,
                                                })
                                            }
                                        />
                                        <Label htmlFor="show_region">
                                            Показывать регион
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="show_message"
                                            checked={show_message}
                                            onCheckedChange={(checked) =>
                                                updateConfig({
                                                    show_message:
                                                        checked as boolean,
                                                })
                                            }
                                        />
                                        <Label htmlFor="show_message">
                                            Показывать сообщение донора
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="show_search"
                                            checked={show_search}
                                            onCheckedChange={(checked) =>
                                                updateConfig({
                                                    show_search:
                                                        checked as boolean,
                                                })
                                            }
                                        />
                                        <Label htmlFor="show_search">
                                            Показывать поиск
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="show_filters"
                                            checked={show_filters}
                                            onCheckedChange={(checked) =>
                                                updateConfig({
                                                    show_filters:
                                                        checked as boolean,
                                                })
                                            }
                                        />
                                        <Label htmlFor="show_filters">
                                            Показывать фильтры
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="show_pagination"
                                            checked={show_pagination}
                                            onCheckedChange={(checked) =>
                                                updateConfig({
                                                    show_pagination:
                                                        checked as boolean,
                                                })
                                            }
                                        />
                                        <Label htmlFor="show_pagination">
                                            Показывать пагинацию
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Превью */}
                <div className="rounded-lg border bg-white p-4">
                    <div className="py-8 text-center text-gray-500">
                        <Users className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                        <p>Превью виджета списка пожертвований</p>
                        <p className="text-sm">
                            Настройте виджет и сохраните для просмотра
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Публичный виджет
    const {
        title = 'Последние пожертвования',
        subtitle = 'Список поступлений на текущую организацию',
        show_search = true,
        show_filters = true,
        show_pagination = true,
        layout: _layout = 'list',
    } = localConfig;

    if (error) {
        return (
            <div className="donations-list-widget">
                <div className="py-8 text-center text-red-600">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="donations-list-widget">
            {/* Заголовок */}
            <div className="mb-6">
                <h3 className="mb-2 text-xl font-bold text-gray-900">
                    {title}
                </h3>
                {subtitle && <p className="text-gray-600">{subtitle}</p>}
            </div>

            {/* Поиск и фильтры */}
            {(show_search || show_filters) && (
                <div className="mb-6 space-y-4">
                    {show_search && (
                        <div className="relative">
                            <Input
                                placeholder="Поиск пожертвований..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                            <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                        </div>
                    )}

                    {show_filters && (
                        <div className="flex space-x-4">
                            <Select
                                value={sortBy}
                                onValueChange={(
                                    value: 'date' | 'amount' | 'donor_name',
                                ) => setSortBy(value)}
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {SORT_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={sortOrder}
                                onValueChange={(value: 'asc' | 'desc') =>
                                    setSortOrder(value)
                                }
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="desc">
                                        По убыванию
                                    </SelectItem>
                                    <SelectItem value="asc">
                                        По возрастанию
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            )}

            {/* Список пожертвований */}
            {isLoading ? (
                <div className="py-8 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-green-600"></div>
                    <p className="mt-2 text-gray-600">Загрузка...</p>
                </div>
            ) : donations.length === 0 ? (
                <div className="py-8 text-center">
                    <Users className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">Пожертвования не найдены</p>
                </div>
            ) : (
                <div className="space-y-0">
                    {donations.map(renderDonationItem)}
                </div>
            )}

            {/* Пагинация */}
            {show_pagination && donations.length > 0 && (
                <div className="mt-6 flex justify-center">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() =>
                                setCurrentPage(Math.max(1, currentPage - 1))
                            }
                            disabled={currentPage === 1}
                            className="rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Назад
                        </button>
                        <span className="px-3 py-1 text-sm">
                            Страница {currentPage}
                        </span>
                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            className="rounded border px-3 py-1 text-sm"
                        >
                            Далее
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

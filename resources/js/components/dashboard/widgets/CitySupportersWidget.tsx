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
    MapPin,
    Settings,
    TrendingUp,
    Users,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface CityData {
    id: number;
    name: string;
    region_name?: string;
    schools_count: number;
    supporters_count: number;
    donation_count: number;
    total_amount: number;
    alumni_count?: number | null;
    subscriptions_count?: number | null;
    code?: string;
    flag_image?: string;
    change_amount?: number;
    change_count?: number;
    region_url?: string;
}

interface CitySupportersWidgetConfig {
    title?: string;
    subtitle?: string;
    show_regions_count?: boolean;
    show_donation_count?: boolean;
    show_change_indicators?: boolean;
    show_regional_flags?: boolean;
    items_per_page?: number;
    sort_by?: 'amount' | 'supporters' | 'schools' | 'name';
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

interface CitySupportersWidgetProps {
    config?: CitySupportersWidgetConfig;
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
    { value: 'amount', label: 'По сумме пожертвований' },
    { value: 'supporters', label: 'По количеству поддерживающих' },
    { value: 'schools', label: 'По количеству школ' },
    { value: 'name', label: 'По названию города' },
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

export const CitySupportersWidget: React.FC<CitySupportersWidgetProps> = ({
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
        useState<CitySupportersWidgetConfig>(config);

    // Состояние для публичного виджета
    const [regions, setRegions] = useState<CityData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<
        'amount' | 'supporters' | 'schools' | 'name'
    >('amount');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Синхронизация локального состояния с внешним config
    useEffect(() => {
        setLocalConfig(config);
        setSortBy(
            (config.sort_by as 'amount' | 'supporters' | 'schools' | 'name') ||
                'amount',
        );
        setSortOrder(config.sort_order || 'desc');
    }, [config]);

    // Автоматическое раскрытие настроек
    useEffect(() => {
        if (autoExpandSettings || isEditable) {
            setIsSettingsExpanded(true);
        }
    }, [autoExpandSettings, isEditable]);

    // Функция для обновления конфигурации
    const hasUserEditedRef = useRef(false);

    const updateConfig = (updates: Partial<CitySupportersWidgetConfig>) => {
        const newConfig = { ...localConfig, ...updates };
        setLocalConfig(newConfig);
        onConfigChange?.(newConfig);
        hasUserEditedRef.current = true;
    };

    const loadRegionsData = React.useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await widgetsApi.getCitySupporters(
                organizationId!,
                {
                    page: currentPage,
                    per_page: localConfig.items_per_page || 10,
                    search: searchQuery,
                    sort_by: sortBy as
                        | 'amount'
                        | 'supporters'
                        | 'schools'
                        | 'name',
                    sort_order: sortOrder,
                },
            );

            // Маппим данные из API в формат CityData
            const mappedData: CityData[] = (response.data || []).map(
                (city) => ({
                    id: city.id,
                    name: city.name,
                    region_name: city.region_name,
                    schools_count: city.schools_count,
                    supporters_count: city.supporters_count,
                    donation_count: city.donation_count,
                    total_amount: city.total_amount,
                    alumni_count: city.alumni_count,
                    subscriptions_count: city.subscriptions_count,
                    code: '', // Можно добавить если есть в API
                    flag_image: undefined,
                    change_amount: undefined,
                    change_count: undefined,
                }),
            );
            setRegions(mappedData);
        } catch (err: unknown) {
            console.error('Error loading regions data:', err);
            setError('Ошибка загрузки данных регионов');
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
            loadRegionsData();
        }
    }, [isEditable, organizationId, loadRegionsData]);

    // Автоматическое сохранение конфигурации при изменении (с debounce)
    useEffect(() => {
        if (!onSave || !isEditable || !hasUserEditedRef.current) return;

        const timer = setTimeout(() => {
            onSave(localConfig as Record<string, unknown>);
        }, 500);

        return () => clearTimeout(timer);
    }, [localConfig, onSave, isEditable]);

    const formatAmount = (amount: number) => {
        const currency = localConfig.currency || 'RUB';
        const symbol = CURRENCY_SYMBOLS[currency];

        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(1)}M ${symbol}`;
        } else if (amount >= 1000) {
            return `${(amount / 1000).toFixed(1)}K ${symbol}`;
        }
        return `${amount.toLocaleString('ru-RU')} ${symbol}`;
    };

    const formatCount = (count: number) => {
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    };

    const getChangeIndicator = (change?: number) => {
        if (!change || change === 0) return null;

        const isPositive = change > 0;
        const Icon = isPositive ? TrendingUp : TrendingUp;
        const className = isPositive ? 'text-green-600' : 'text-red-600';
        const prefix = isPositive ? '+' : '';

        return (
            <div className={cn('flex items-center gap-1 text-sm', className)}>
                <Icon
                    className="h-3 w-3"
                    style={{
                        transform: isPositive ? 'none' : 'rotate(180deg)',
                    }}
                />
                <span>
                    {prefix}
                    {Math.abs(change)}
                </span>
            </div>
        );
    };

    const {
        title = 'Топ поддерживающих городов',
        subtitle,
        show_regions_count = true,
        show_donation_count = true,
        show_change_indicators = true,
        show_regional_flags = true,
        show_pagination = true,
        show_search = true,
        show_filters = true,
        layout = 'list',
        card_style = 'modern',
        border_radius = 'medium',
        shadow = 'medium',
    } = localConfig;

    const borderRadiusClass = {
        none: 'rounded-none',
        small: 'rounded-sm',
        medium: 'rounded-md',
        large: 'rounded-lg',
        full: 'rounded-full',
    }[border_radius];

    const shadowClass = {
        none: 'shadow-none',
        small: 'shadow-sm',
        medium: 'shadow-md',
        large: 'shadow-lg',
    }[shadow];

    // Режим редактирования
    if (isEditable) {
        return (
            <div className="city-supporters-widget-editor w-full">
                <Card className="w-full">
                    <CardContent className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <MapPin className="h-5 w-5 text-blue-500" />
                                Топ поддерживающих городов
                            </h3>
                            <button
                                onClick={() =>
                                    setIsSettingsExpanded(!isSettingsExpanded)
                                }
                                className="flex items-center space-x-2 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                            >
                                <Settings className="h-4 w-4" />
                                <span>Настройки</span>
                                {isSettingsExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </button>
                        </div>

                        {isSettingsExpanded && (
                            <div className="space-y-6">
                                {/* Основные настройки */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-700">
                                        Основное
                                    </h4>
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
                                            placeholder="Топ поддерживающих городов"
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
                                            placeholder="Города с наибольшей поддержкой"
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

                                {/* Внешний вид */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-700">
                                        Внешний вид
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="layout">
                                                Макет
                                            </Label>
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
                                                                key={
                                                                    option.value
                                                                }
                                                                value={
                                                                    option.value
                                                                }
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
                                                                key={
                                                                    option.value
                                                                }
                                                                value={
                                                                    option.value
                                                                }
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

                                {/* Опции отображения */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-700">
                                        Отображение
                                    </h4>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="show_regions_count"
                                            checked={show_regions_count}
                                            onCheckedChange={(checked) =>
                                                updateConfig({
                                                    show_regions_count:
                                                        checked as boolean,
                                                })
                                            }
                                        />
                                        <Label htmlFor="show_regions_count">
                                            Показывать количество городов
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="show_donation_count"
                                            checked={show_donation_count}
                                            onCheckedChange={(checked) =>
                                                updateConfig({
                                                    show_donation_count:
                                                        checked as boolean,
                                                })
                                            }
                                        />
                                        <Label htmlFor="show_donation_count">
                                            Показывать количество пожертвований
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="show_change_indicators"
                                            checked={show_change_indicators}
                                            onCheckedChange={(checked) =>
                                                updateConfig({
                                                    show_change_indicators:
                                                        checked as boolean,
                                                })
                                            }
                                        />
                                        <Label htmlFor="show_change_indicators">
                                            Показывать индикаторы изменений
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="show_regional_flags"
                                            checked={show_regional_flags}
                                            onCheckedChange={(checked) =>
                                                updateConfig({
                                                    show_regional_flags:
                                                        checked as boolean,
                                                })
                                            }
                                        />
                                        <Label htmlFor="show_regional_flags">
                                            Показывать флаги регионов
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
                        )}

                        {/* Предварительный просмотр */}
                        <div className="mt-6 rounded-lg border-2 border-dashed border-gray-300 p-6">
                            <h4 className="mb-4 text-sm font-semibold text-gray-700">
                                Предварительный просмотр
                            </h4>
                            <div
                                className={`${borderRadiusClass} ${shadowClass} border bg-white p-6`}
                            >
                                <div className="text-center">
                                    <h3 className="mb-2 text-2xl font-bold">
                                        {title}
                                    </h3>
                                    {subtitle && (
                                        <p className="mb-4 text-gray-600">
                                            {subtitle}
                                        </p>
                                    )}
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between rounded-lg border p-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                                                    <span className="text-sm">
                                                        Регион {i}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-medium">
                                                    100,000 ₽
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Режим публичного отображения
    return (
        <div
            className={`city-supporters-widget ${borderRadiusClass} ${shadowClass} border bg-white`}
        >
            <div className="p-6">
                {/* Заголовок */}
                <div className="mb-6 text-center">
                    <h3 className="mb-2 text-2xl font-bold">{title}</h3>
                    {subtitle && (
                        <p className="text-sm text-gray-600">{subtitle}</p>
                    )}
                    {show_regions_count && regions.length > 0 && (
                        <p className="text-sm text-gray-500">
                            Показано {regions.length} городов
                        </p>
                    )}
                </div>

                {/* Поиск и фильтры */}
                {(show_search || show_filters) && (
                    <div className="mb-6 space-y-4">
                        {show_search && (
                            <div className="relative">
                                <Input
                                    placeholder="Поиск по городам..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-10"
                                />
                                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            </div>
                        )}

                        {show_filters && (
                            <div className="flex gap-4">
                                <Select
                                    value={sortBy}
                                    onValueChange={(
                                        value:
                                            | 'amount'
                                            | 'supporters'
                                            | 'schools'
                                            | 'name',
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

                                <button
                                    onClick={() =>
                                        setSortOrder(
                                            sortOrder === 'asc'
                                                ? 'desc'
                                                : 'asc',
                                        )
                                    }
                                    className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                                >
                                    {sortOrder === 'asc' ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                    {sortOrder === 'asc'
                                        ? 'По возрастанию'
                                        : 'По убыванию'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Список регионов */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-gray-500">Загрузка...</div>
                    </div>
                ) : error ? (
                    <div className="rounded-lg bg-red-50 p-4 text-center text-red-600">
                        {error}
                    </div>
                ) : regions.length === 0 ? (
                    <div className="rounded-lg bg-gray-50 p-4 text-center text-gray-500">
                        Регионы не найдены
                    </div>
                ) : (
                    <div
                        className={cn(
                            layout === 'grid'
                                ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'
                                : layout === 'compact'
                                  ? 'space-y-2'
                                  : 'space-y-3',
                        )}
                    >
                        {regions.map((region, index) => (
                            <div
                                key={region.id}
                                className={cn(
                                    'flex items-center justify-between transition-colors hover:bg-gray-50',
                                    layout === 'compact'
                                        ? 'rounded-md border p-3'
                                        : 'rounded-lg border p-4',
                                    card_style === 'modern' && 'shadow-sm',
                                    card_style === 'minimal' &&
                                        'border-none bg-gray-50',
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    {show_regional_flags &&
                                        region.flag_image && (
                                            <img
                                                src={region.flag_image}
                                                alt={region.name}
                                                className="h-8 w-8 rounded-full object-cover"
                                            />
                                        )}
                                    {!show_regional_flags && (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                            <span className="text-sm font-semibold">
                                                {index + 1}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {region.name}
                                            </span>
                                            {region.code && (
                                                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                                    {region.code}
                                                </span>
                                            )}
                                        </div>
                                        {show_donation_count && (
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Users className="h-3 w-3" />
                                                {formatCount(
                                                    region.supporters_count ||
                                                        region.donation_count,
                                                )}{' '}
                                                {region.supporters_count
                                                    ? 'поддерживающих'
                                                    : 'пожертвований'}
                                                {show_change_indicators &&
                                                    region.change_count &&
                                                    getChangeIndicator(
                                                        region.change_count,
                                                    )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="font-semibold text-gray-900">
                                        {formatAmount(region.total_amount)}
                                    </div>
                                    {show_change_indicators &&
                                        region.change_amount &&
                                        getChangeIndicator(
                                            region.change_amount,
                                        )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Пагинация */}
                {show_pagination && regions.length > 0 && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex gap-2">
                            <button
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(1, prev - 1),
                                    )
                                }
                                disabled={currentPage === 1}
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
                            >
                                Предыдущая
                            </button>
                            <span className="flex items-center px-3 py-2 text-sm">
                                Страница {currentPage}
                            </span>
                            <button
                                onClick={() =>
                                    setCurrentPage((prev) => prev + 1)
                                }
                                disabled={
                                    regions.length <
                                    (localConfig.items_per_page || 10)
                                }
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
                            >
                                Следующая
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

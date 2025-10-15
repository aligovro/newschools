import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { widgetsSystemApi } from '@/lib/api/index';
import {
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    CreditCard,
    Heart,
    Loader2,
    QrCode,
    Settings,
    Smartphone,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface PaymentMethod {
    id: number;
    name: string;
    slug: string;
    icon: string;
    description: string;
    min_amount: number;
    max_amount: number;
}

interface Fundraiser {
    id: number;
    title: string;
    short_description?: string;
    target_amount: number;
    collected_amount: number;
    progress_percentage: number;
}

interface Terminology {
    organization_singular: string;
    organization_genitive: string;
    action_support: string;
    member_singular: string;
    member_plural: string;
}

interface DonationWidgetConfig {
    title?: string;
    description?: string;
    fundraiser_id?: number;
    project_id?: number;
    show_progress?: boolean;
    show_target_amount?: boolean;
    show_collected_amount?: boolean;
    preset_amounts?: number[];
    default_amount?: number;
    min_amount?: number;
    max_amount?: number;
    currency?: 'RUB' | 'USD' | 'EUR';
    payment_methods?: string[];
    default_payment_method?: string;
    show_payment_icons?: boolean;
    allow_recurring?: boolean;
    recurring_periods?: string[];
    default_recurring_period?: 'daily' | 'weekly' | 'monthly';
    require_name?: boolean;
    require_email?: boolean;
    require_phone?: boolean;
    allow_anonymous?: boolean;
    show_message_field?: boolean;
    send_receipt?: boolean;
    thank_you_message?: string;
    button_text?: string;
    button_style?: 'primary' | 'secondary' | 'success' | 'gradient';
    color_scheme?: 'light' | 'dark' | 'auto';
    primary_color?: string;
    border_radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
    shadow?: 'none' | 'small' | 'medium' | 'large';
}

interface DonationWidgetProps {
    config?: DonationWidgetConfig;
    isEditable?: boolean;
    autoExpandSettings?: boolean;
    onSave?: (config: Record<string, unknown>) => Promise<void>;
    widgetId?: string;
    organizationId?: number;
}

const CURRENCY_SYMBOLS = {
    RUB: '₽',
    USD: '$',
    EUR: '€',
};

const RECURRING_PERIOD_LABELS = {
    daily: 'Ежедневно',
    weekly: 'Еженедельно',
    monthly: 'Ежемесячно',
};

export const DonationWidget: React.FC<DonationWidgetProps> = ({
    config = {},
    isEditable = false,
    autoExpandSettings = false,
    onSave,
    widgetId,
    organizationId,
}) => {
    const [isSettingsExpanded, setIsSettingsExpanded] =
        useState(autoExpandSettings);
    const [localConfig, setLocalConfig] =
        useState<DonationWidgetConfig>(config);

    // Состояние для публичного виджета
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [fundraiser, setFundraiser] = useState<Fundraiser | null>(null);
    const [terminology, setTerminology] = useState<Terminology | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Форма пожертвования
    const [amount, setAmount] = useState<number>(config.default_amount || 100);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringPeriod, setRecurringPeriod] = useState<
        'daily' | 'weekly' | 'monthly'
    >(config.default_recurring_period || 'daily');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(
        config.default_payment_method || 'yookassa',
    );
    const [donorName, setDonorName] = useState('');
    const [donorEmail, setDonorEmail] = useState('');
    const [donorPhone, setDonorPhone] = useState('');
    const [donorMessage, setDonorMessage] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [agreedToPolicy, setAgreedToPolicy] = useState(false);
    const [agreedToRecurring, setAgreedToRecurring] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Синхронизация локального состояния с внешним config
    useEffect(() => {
        setLocalConfig(config);
        setAmount(config.default_amount || 100);
        setRecurringPeriod(config.default_recurring_period || 'daily');
        setSelectedPaymentMethod(config.default_payment_method || 'yookassa');
    }, [config]);

    // Автоматическое раскрытие настроек
    useEffect(() => {
        if (autoExpandSettings || isEditable) {
            setIsSettingsExpanded(true);
        }
    }, [autoExpandSettings, isEditable]);

    // Загрузка данных виджета
    useEffect(() => {
        if (!isEditable && organizationId) {
            loadWidgetData();
        }
    }, [isEditable, organizationId, localConfig.fundraiser_id]);

    const loadWidgetData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Загружаем данные виджета (включая терминологию)
            const widgetData = await widgetsSystemApi.getDonationWidgetData(
                organizationId,
                { fundraiser_id: localConfig.fundraiser_id },
            );

            // Устанавливаем терминологию
            if (widgetData.terminology) {
                setTerminology(widgetData.terminology);
            }

            // Устанавливаем fundraiser если есть
            if (widgetData.fundraiser) {
                setFundraiser(widgetData.fundraiser);
            }

            // Загружаем методы оплаты
            const paymentMethods =
                await widgetsSystemApi.getDonationWidgetPaymentMethods(
                    organizationId,
                );
            setPaymentMethods(paymentMethods || []);
        } catch (err: any) {
            console.error('Error loading widget data:', err);
            setError('Ошибка загрузки данных виджета');
        } finally {
            setIsLoading(false);
        }
    };

    // Автоматическое сохранение конфигурации при изменении (с debounce)
    useEffect(() => {
        if (!onSave || !isEditable) return;

        const timer = setTimeout(() => {
            onSave(localConfig as Record<string, unknown>);
        }, 500); // Задержка 500мс для debounce

        return () => clearTimeout(timer);
    }, [localConfig, onSave, isEditable]);

    // Отправка пожертвования
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Валидация
        if (!isAnonymous && localConfig.require_name && !donorName.trim()) {
            setError('Пожалуйста, введите ваше имя');
            return;
        }

        if (localConfig.require_email && !donorEmail.trim()) {
            setError('Пожалуйста, введите ваш email');
            return;
        }

        if (localConfig.require_phone && !donorPhone.trim()) {
            setError('Пожалуйста, введите ваш телефон');
            return;
        }

        if (!agreedToPolicy) {
            setError(
                'Необходимо принять условия обработки персональных данных',
            );
            return;
        }

        if (isRecurring && !agreedToRecurring) {
            setError('Необходимо согласиться на подписку на платежи');
            return;
        }

        const minAmount = localConfig.min_amount || 1;
        const maxAmount = localConfig.max_amount || 0;

        if (amount < minAmount) {
            setError(
                `Минимальная сумма: ${minAmount} ${CURRENCY_SYMBOLS[localConfig.currency || 'RUB']}`,
            );
            return;
        }

        if (maxAmount > 0 && amount > maxAmount) {
            setError(
                `Максимальная сумма: ${maxAmount} ${CURRENCY_SYMBOLS[localConfig.currency || 'RUB']}`,
            );
            return;
        }

        setIsProcessing(true);

        try {
            const response = await widgetsSystemApi.submitDonation(
                organizationId,
                {
                    amount,
                    currency: localConfig.currency || 'RUB',
                    payment_method_slug: selectedPaymentMethod,
                    fundraiser_id: localConfig.fundraiser_id || undefined,
                    project_id: localConfig.project_id || undefined,
                    donor_name: isAnonymous ? undefined : donorName,
                    donor_email: donorEmail || undefined,
                    donor_phone: donorPhone || undefined,
                    donor_message: donorMessage || undefined,
                    is_anonymous: isAnonymous,
                    is_recurring: isRecurring,
                    recurring_period: isRecurring ? recurringPeriod : undefined,
                    send_receipt: localConfig.send_receipt !== false,
                    success_url: window.location.href,
                    failure_url: window.location.href,
                },
            );

            if (response.success && response.payment_url) {
                // Перенаправление на страницу оплаты
                window.location.href = response.payment_url;
            } else {
                setSuccess('Пожертвование успешно создано!');
                // Сброс формы
                setAmount(localConfig.default_amount || 100);
                setDonorName('');
                setDonorEmail('');
                setDonorPhone('');
                setDonorMessage('');
                setIsAnonymous(false);
                setIsRecurring(false);
                setAgreedToPolicy(false);
                setAgreedToRecurring(false);
            }
        } catch (err: any) {
            console.error('Error creating donation:', err);
            setError(
                err.response?.data?.message ||
                    'Ошибка при создании пожертвования',
            );
        } finally {
            setIsProcessing(false);
        }
    };

    // Используем терминологию если не указаны кастомные значения
    const defaultTitle = terminology?.action_support || 'Поддержать';
    const defaultButtonText = terminology?.action_support || 'Поддержать';

    const {
        title = defaultTitle,
        description,
        show_progress = true,
        show_target_amount = true,
        show_collected_amount = true,
        preset_amounts = [100, 300, 500, 1000],
        currency = 'RUB',
        allow_recurring = true,
        recurring_periods = ['daily', 'weekly', 'monthly'],
        require_name = true,
        allow_anonymous = true,
        show_message_field = false,
        button_text = defaultButtonText,
        button_style = 'primary',
        primary_color = '#3b82f6',
        border_radius = 'medium',
        shadow = 'small',
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

    const buttonStyleClass = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
        success: 'bg-green-600 hover:bg-green-700 text-white',
        gradient:
            'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white',
    }[button_style];

    // Режим редактирования
    if (isEditable) {
        return (
            <div className="donation-widget-editor w-full">
                <Card className="w-full">
                    <CardContent className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <Heart className="h-5 w-5 text-red-500" />
                                Виджет пожертвований
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
                                                setLocalConfig((prev) => ({
                                                    ...prev,
                                                    title: e.target.value,
                                                }))
                                            }
                                            placeholder="Поддержать мечеть"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="description">
                                            Описание
                                        </Label>
                                        <Input
                                            id="description"
                                            value={description || ''}
                                            onChange={(e) =>
                                                setLocalConfig((prev) => ({
                                                    ...prev,
                                                    description: e.target.value,
                                                }))
                                            }
                                            placeholder="Ваша поддержка поможет..."
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="button_text">
                                            Текст кнопки
                                        </Label>
                                        <Input
                                            id="button_text"
                                            value={button_text}
                                            onChange={(e) =>
                                                setLocalConfig((prev) => ({
                                                    ...prev,
                                                    button_text: e.target.value,
                                                }))
                                            }
                                            placeholder="Поддержать"
                                        />
                                    </div>
                                </div>

                                {/* Суммы */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-700">
                                        Суммы пожертвований
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="default_amount">
                                                Сумма по умолчанию
                                            </Label>
                                            <Input
                                                id="default_amount"
                                                type="number"
                                                value={
                                                    localConfig.default_amount ||
                                                    100
                                                }
                                                onChange={(e) =>
                                                    setLocalConfig((prev) => ({
                                                        ...prev,
                                                        default_amount:
                                                            parseInt(
                                                                e.target.value,
                                                            ) || 100,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="min_amount">
                                                Минимум
                                            </Label>
                                            <Input
                                                id="min_amount"
                                                type="number"
                                                value={
                                                    localConfig.min_amount ||
                                                    100
                                                }
                                                onChange={(e) =>
                                                    setLocalConfig((prev) => ({
                                                        ...prev,
                                                        min_amount:
                                                            parseInt(
                                                                e.target.value,
                                                            ) || 1,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="max_amount">
                                                Максимум (0 = нет)
                                            </Label>
                                            <Input
                                                id="max_amount"
                                                type="number"
                                                value={
                                                    localConfig.max_amount || 0
                                                }
                                                onChange={(e) =>
                                                    setLocalConfig((prev) => ({
                                                        ...prev,
                                                        max_amount:
                                                            parseInt(
                                                                e.target.value,
                                                            ) || 0,
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Опции */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-700">
                                        Опции
                                    </h4>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="allow_recurring"
                                            checked={allow_recurring}
                                            onCheckedChange={(checked) =>
                                                setLocalConfig((prev) => ({
                                                    ...prev,
                                                    allow_recurring:
                                                        checked as boolean,
                                                }))
                                            }
                                        />
                                        <Label htmlFor="allow_recurring">
                                            Разрешить регулярные платежи
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="allow_anonymous"
                                            checked={allow_anonymous}
                                            onCheckedChange={(checked) =>
                                                setLocalConfig((prev) => ({
                                                    ...prev,
                                                    allow_anonymous:
                                                        checked as boolean,
                                                }))
                                            }
                                        />
                                        <Label htmlFor="allow_anonymous">
                                            Разрешить анонимные пожертвования
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="show_progress"
                                            checked={show_progress}
                                            onCheckedChange={(checked) =>
                                                setLocalConfig((prev) => ({
                                                    ...prev,
                                                    show_progress:
                                                        checked as boolean,
                                                }))
                                            }
                                        />
                                        <Label htmlFor="show_progress">
                                            Показывать прогресс сбора
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
                                    {description && (
                                        <p className="mb-4 text-gray-600">
                                            {description}
                                        </p>
                                    )}
                                    <div
                                        className={`mt-4 ${buttonStyleClass} px-6 py-3 ${borderRadiusClass} inline-flex items-center gap-2`}
                                    >
                                        <Heart className="h-5 w-5" />
                                        {button_text}
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
            className={`donation-widget ${borderRadiusClass} ${shadowClass} border bg-white`}
        >
            <div className="p-6">
                {/* Заголовок */}
                <div className="mb-6 text-center">
                    <h3 className="mb-2 text-2xl font-bold">{title}</h3>
                    {description && (
                        <p className="text-sm text-gray-600">{description}</p>
                    )}
                </div>

                {/* Прогресс сбора */}
                {show_progress && fundraiser && (
                    <div className="mb-6 space-y-2">
                        {show_target_amount && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    Необходимо
                                </span>
                                <span className="font-semibold">
                                    {fundraiser.target_amount.toLocaleString(
                                        'ru-RU',
                                    )}{' '}
                                    {CURRENCY_SYMBOLS[currency]}
                                </span>
                            </div>
                        )}
                        {show_collected_amount && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Собрали</span>
                                <span className="font-semibold text-green-600">
                                    {fundraiser.collected_amount.toLocaleString(
                                        'ru-RU',
                                    )}{' '}
                                    {CURRENCY_SYMBOLS[currency]}
                                </span>
                            </div>
                        )}
                        <Progress
                            value={fundraiser.progress_percentage}
                            className="h-2"
                        />
                    </div>
                )}

                {/* Форма пожертвования */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Имя донора */}
                    {!isAnonymous && require_name && (
                        <div>
                            <Label htmlFor="donor_name">Ваше имя</Label>
                            <Input
                                id="donor_name"
                                value={donorName}
                                onChange={(e) => setDonorName(e.target.value)}
                                placeholder="Александр"
                                required={require_name}
                            />
                        </div>
                    )}

                    {/* Анонимное пожертвование */}
                    {allow_anonymous && (
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_anonymous"
                                checked={isAnonymous}
                                onCheckedChange={(checked) =>
                                    setIsAnonymous(checked as boolean)
                                }
                            />
                            <Label htmlFor="is_anonymous" className="text-sm">
                                Анонимное пожертвование
                            </Label>
                        </div>
                    )}

                    {/* Сумма */}
                    <div>
                        <Label htmlFor="amount">Сумма</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) =>
                                setAmount(parseInt(e.target.value) || 0)
                            }
                            min={localConfig.min_amount || 1}
                            max={localConfig.max_amount || undefined}
                            required
                        />
                    </div>

                    {/* Предустановленные суммы */}
                    <div className="grid grid-cols-4 gap-2">
                        {preset_amounts.map((presetAmount) => (
                            <button
                                key={presetAmount}
                                type="button"
                                onClick={() => setAmount(presetAmount)}
                                className={`px-4 py-2 ${borderRadiusClass} border transition-colors ${
                                    amount === presetAmount
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {presetAmount} {CURRENCY_SYMBOLS[currency]}
                            </button>
                        ))}
                    </div>

                    {/* Регулярные платежи */}
                    {allow_recurring && (
                        <div className="space-y-3 border-t pt-4">
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsRecurring(false)}
                                    className={`flex-1 px-4 py-2 ${borderRadiusClass} border transition-colors ${
                                        !isRecurring
                                            ? 'border-blue-600 bg-blue-600 text-white'
                                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    Единоразово
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsRecurring(true)}
                                    className={`flex-1 px-4 py-2 ${borderRadiusClass} border transition-colors ${
                                        isRecurring
                                            ? 'border-blue-600 bg-blue-600 text-white'
                                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    Регулярно
                                </button>
                            </div>

                            {isRecurring && (
                                <>
                                    <div className="grid grid-cols-3 gap-2">
                                        {recurring_periods.map((period) => (
                                            <button
                                                key={period}
                                                type="button"
                                                onClick={() =>
                                                    setRecurringPeriod(
                                                        period as any,
                                                    )
                                                }
                                                className={`px-3 py-2 text-sm ${borderRadiusClass} border transition-colors ${
                                                    recurringPeriod === period
                                                        ? 'border-blue-600 bg-blue-600 text-white'
                                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {
                                                    RECURRING_PERIOD_LABELS[
                                                        period as keyof typeof RECURRING_PERIOD_LABELS
                                                    ]
                                                }
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex items-start space-x-2">
                                        <Checkbox
                                            id="agreed_to_recurring"
                                            checked={agreedToRecurring}
                                            onCheckedChange={(checked) =>
                                                setAgreedToRecurring(
                                                    checked as boolean,
                                                )
                                            }
                                            required={isRecurring}
                                        />
                                        <Label
                                            htmlFor="agreed_to_recurring"
                                            className="text-xs text-gray-600"
                                        >
                                            Я согласен на подписку на платежи на
                                            сумму {amount}{' '}
                                            {CURRENCY_SYMBOLS[currency]}.
                                            Подписка будет списываться{' '}
                                            {
                                                RECURRING_PERIOD_LABELS[
                                                    recurringPeriod
                                                ]
                                            }
                                        </Label>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Способы оплаты */}
                    <div className="border-t pt-4">
                        <Label className="mb-3 block">Способ оплаты</Label>
                        <div className="space-y-2">
                            {paymentMethods.length > 0 ? (
                                paymentMethods.map((method) => (
                                    <label
                                        key={method.slug}
                                        className={`flex items-center gap-3 border p-3 ${borderRadiusClass} cursor-pointer transition-colors ${
                                            selectedPaymentMethod ===
                                            method.slug
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-300 bg-white hover:bg-gray-50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value={method.slug}
                                            checked={
                                                selectedPaymentMethod ===
                                                method.slug
                                            }
                                            onChange={(e) =>
                                                setSelectedPaymentMethod(
                                                    e.target.value,
                                                )
                                            }
                                            className="text-blue-600"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium">
                                                {method.name}
                                            </div>
                                            {method.description && (
                                                <div className="text-xs text-gray-600">
                                                    {method.description}
                                                </div>
                                            )}
                                        </div>
                                        {method.slug === 'sbp' && (
                                            <QrCode className="h-5 w-5 text-gray-400" />
                                        )}
                                        {(method.slug === 'yookassa' ||
                                            method.slug === 'tinkoff') && (
                                            <CreditCard className="h-5 w-5 text-gray-400" />
                                        )}
                                        {method.slug === 'sberpay' && (
                                            <Smartphone className="h-5 w-5 text-gray-400" />
                                        )}
                                    </label>
                                ))
                            ) : (
                                <div className="py-4 text-center text-gray-500">
                                    Загрузка способов оплаты...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Политика */}
                    <div className="flex items-start space-x-2 border-t pt-4">
                        <Checkbox
                            id="agreed_to_policy"
                            checked={agreedToPolicy}
                            onCheckedChange={(checked) =>
                                setAgreedToPolicy(checked as boolean)
                            }
                            required
                        />
                        <Label
                            htmlFor="agreed_to_policy"
                            className="text-xs text-gray-600"
                        >
                            Принимаю{' '}
                            <a
                                href="/policy/"
                                target="_blank"
                                className="text-blue-600 underline"
                            >
                                условия обработки
                            </a>{' '}
                            персональных данных
                        </Label>
                    </div>

                    {/* Сообщения об ошибках и успехе */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-600">
                                {success}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Кнопка отправки */}
                    <button
                        type="submit"
                        disabled={isProcessing}
                        className={`w-full px-6 py-3 ${borderRadiusClass} ${buttonStyleClass} flex items-center justify-center gap-2 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Обработка...
                            </>
                        ) : (
                            <>
                                <Heart className="h-5 w-5" />
                                {button_text}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

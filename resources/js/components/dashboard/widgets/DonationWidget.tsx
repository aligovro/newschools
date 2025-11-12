import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    widgetsSystemApi,
    type PaymentMethod as ApiPaymentMethod,
    type DonationWidgetData,
} from '@/lib/api/index';
import { formatCurrency } from '@/lib/helpers';
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

type OrganizationNeeds = NonNullable<DonationWidgetData['organization_needs']>;
type ProjectSummary = NonNullable<DonationWidgetData['project']>;

interface PublicDonationContext {
    organizationId?: number;
    projectId?: number;
    projectStageId?: number;
    progress?: {
        targetAmount: number;
        collectedAmount: number;
        currency?: string;
        labelTarget?: string;
        labelCollected?: string;
    };
}

const normalizePaymentSlug = (method: ApiPaymentMethod): string => {
    const meta = method as unknown as {
        slug?: string | null;
        id?: string | number | null;
        type?: string | null;
        name?: string | null;
    };

    if (typeof meta.slug === 'string' && meta.slug.trim() !== '') {
        return meta.slug;
    }

    if (meta.id !== undefined && meta.id !== null && meta.id !== '') {
        return String(meta.id);
    }

    if (typeof meta.type === 'string' && meta.type.trim() !== '') {
        return meta.type;
    }

    if (typeof meta.name === 'string' && meta.name.trim() !== '') {
        return meta.name.trim().toLowerCase().replace(/\s+/g, '-');
    }

    return 'payment-method';
};

interface DonationWidgetConfig {
    title?: string;
    show_title?: boolean; // Показывать заголовок на сайте
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

export interface DonationWidgetProps {
    config?: DonationWidgetConfig;
    isEditable?: boolean;
    autoExpandSettings?: boolean;
    onSave?: (config: Record<string, unknown>) => Promise<void>;
    widgetId?: string;
    organizationId?: number;
    publicContext?: PublicDonationContext;
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

const parseNumericId = (value: unknown): number | undefined => {
    if (value === null || value === undefined) {
        return undefined;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return undefined;
    }

    return parsed > 0 ? parsed : undefined;
};

export const DonationWidget: React.FC<DonationWidgetProps> = ({
    config = {},
    isEditable = false,
    autoExpandSettings = false,
    onSave,
    widgetId: _widgetId,
    organizationId,
    publicContext,
}) => {
    const [isSettingsExpanded, setIsSettingsExpanded] =
        useState(autoExpandSettings);
    const [localConfig, setLocalConfig] =
        useState<DonationWidgetConfig>(config);

    // Состояние для публичного виджета
    const [paymentMethods, setPaymentMethods] = useState<ApiPaymentMethod[]>(
        [],
    );
    const [fundraiser, setFundraiser] = useState<Fundraiser | null>(null);
    const [projectInfo, setProjectInfo] = useState<ProjectSummary | null>(null);
    const [organizationNeeds, setOrganizationNeeds] =
        useState<OrganizationNeeds | null>(null);
    const [terminology, setTerminology] = useState<Terminology | null>(null);
    const [_isLoading, setIsLoading] = useState(false);
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

    const resolvedOrganizationId =
        parseNumericId(organizationId) ??
        parseNumericId(publicContext?.organizationId) ??
        null;
    const contextProjectId = parseNumericId(publicContext?.projectId);
    const contextStageId = parseNumericId(publicContext?.projectStageId);

    const ensureSelectedPaymentMethod = React.useCallback(
        (methodsList: ApiPaymentMethod[] | null | undefined) => {
            if (!methodsList || methodsList.length === 0) {
                return;
            }

            setSelectedPaymentMethod((prev) => {
                if (
                    prev &&
                    methodsList.some(
                        (method) => normalizePaymentSlug(method) === prev,
                    )
                ) {
                    return prev;
                }

                return normalizePaymentSlug(methodsList[0]);
            });
        },
        [],
    );

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

    const loadWidgetData = React.useCallback(async () => {
        if (!resolvedOrganizationId) {
            setFundraiser(null);
            setProjectInfo(null);
            setOrganizationNeeds(null);
            setIsLoading(true);
            setError(null);

            try {
                const methods =
                    await widgetsSystemApi.getDonationWidgetPaymentMethodsPublic();
                const methodsList = methods || [];
                setPaymentMethods(methodsList);
                ensureSelectedPaymentMethod(methodsList);
            } catch (err) {
                console.error('Error loading public payment methods:', err);
                setError('Ошибка загрузки данных виджета');
            } finally {
                setIsLoading(false);
            }

            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const params: {
                fundraiser_id?: number;
                project_id?: number;
                project_stage_id?: number;
            } = {};

            const fundraiserId = parseNumericId(localConfig.fundraiser_id);
            if (fundraiserId) {
                params.fundraiser_id = fundraiserId;
            }

            if (contextProjectId) {
                params.project_id = contextProjectId;
            } else {
                const configProjectId = parseNumericId(localConfig.project_id);
                if (configProjectId) {
                    params.project_id = configProjectId;
                }
            }

            if (contextStageId) {
                params.project_stage_id = contextStageId;
            }

            const widgetData = await widgetsSystemApi.getDonationWidgetData(
                resolvedOrganizationId,
                params,
            );

            if (widgetData.terminology) {
                setTerminology(
                    widgetData.terminology as unknown as Terminology,
                );
            }

            if (widgetData.organization_needs) {
                setOrganizationNeeds(
                    widgetData.organization_needs as OrganizationNeeds,
                );
            } else {
                setOrganizationNeeds(null);
            }

            if (widgetData.project) {
                setProjectInfo(widgetData.project as ProjectSummary);
            } else {
                setProjectInfo(null);
            }

            if (widgetData.fundraiser) {
                const f = widgetData.fundraiser;
                const targetRub =
                    f.target_amount_rubles ?? f.target_amount ?? 0;
                const collectedRub =
                    f.collected_amount_rubles ?? f.collected_amount ?? 0;
                const targetAmount = Number(targetRub) || 0;
                const collectedAmount = Number(collectedRub) || 0;
                const progress =
                    targetAmount > 0
                        ? Math.min(100, (collectedAmount / targetAmount) * 100)
                        : (f.progress_percentage ?? 0);

                setFundraiser({
                    id: f.id,
                    title: f.title,
                    short_description: f.short_description,
                    target_amount: targetAmount,
                    collected_amount: collectedAmount,
                    progress_percentage: progress,
                });
            } else {
                setFundraiser(null);
            }

            const methods =
                await widgetsSystemApi.getDonationWidgetPaymentMethods(
                    resolvedOrganizationId,
                );
            const methodsList = methods || [];
            setPaymentMethods(methodsList);
            ensureSelectedPaymentMethod(methodsList);
        } catch (err: unknown) {
            console.error('Error loading widget data:', err);
            setError('Ошибка загрузки данных виджета');
        } finally {
            setIsLoading(false);
        }
    }, [
        resolvedOrganizationId,
        localConfig.fundraiser_id,
        localConfig.project_id,
        contextProjectId,
        contextStageId,
        ensureSelectedPaymentMethod,
    ]);

    // Загрузка данных виджета
    useEffect(() => {
        if (!isEditable) {
            loadWidgetData();
        }
    }, [isEditable, loadWidgetData]);

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
            if (!resolvedOrganizationId) {
                setError('Пожертвования доступны на страницах организаций');
                return;
            }

            const response = await widgetsSystemApi.submitDonation(
                resolvedOrganizationId,
                {
                    amount,
                    currency: localConfig.currency || 'RUB',
                    payment_method_slug: selectedPaymentMethod,
                    fundraiser_id: localConfig.fundraiser_id || undefined,
                    project_id: derivedProjectId || undefined,
                    project_stage_id: derivedStageId || undefined,
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
        } catch (err: unknown) {
            console.error('Error creating donation:', err);
            const errorMessage =
                err instanceof Error && 'response' in err
                    ? (err as { response?: { data?: { message?: string } } })
                          .response?.data?.message ||
                      'Ошибка при создании пожертвования'
                    : 'Ошибка при создании пожертвования';
            setError(errorMessage);
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
        show_message_field: _show_message_field = false,
        button_text = defaultButtonText,
        button_style = 'primary',
        primary_color: _primary_color = '#3b82f6',
        border_radius = 'medium',
        shadow = 'small',
    } = localConfig;

    const progressData = React.useMemo(() => {
        if (!show_progress) {
            return null;
        }

        const effectiveCurrency = currency || 'RUB';

        const buildProgress = (
            targetAmount: number,
            collectedAmount: number,
            labelTarget: string,
            labelCollected = 'Собрали',
        ) => {
            if (!targetAmount || targetAmount <= 0) {
                return null;
            }

            const percentage = Math.min(
                100,
                targetAmount > 0 ? (collectedAmount / targetAmount) * 100 : 0,
            );

            return {
                targetAmount,
                collectedAmount,
                percentage,
                labelTarget,
                labelCollected,
                currency: effectiveCurrency,
            } as {
                targetAmount: number;
                collectedAmount: number;
                percentage: number;
                labelTarget: string;
                labelCollected: string;
                currency: string;
            } | null;
        };

        const getAmount = (raw?: number | null, fallback?: number | null) => {
            if (typeof raw === 'number') {
                return raw;
            }
            if (typeof fallback === 'number') {
                return fallback;
            }
            return 0;
        };

        if (publicContext?.progress) {
            const {
                targetAmount,
                collectedAmount,
                labelTarget,
                labelCollected,
                currency: ctxCurrency,
            } = publicContext.progress;
            const target = getAmount(targetAmount);
            const collected = getAmount(collectedAmount);
            const progress = buildProgress(
                target,
                collected,
                labelTarget ?? 'Цель',
                labelCollected ?? 'Собрали',
            );

            if (progress) {
                progress.currency = ctxCurrency || effectiveCurrency;
                return progress;
            }
        }

        const stage = projectInfo?.active_stage;
        if (stage) {
            const target = getAmount(
                stage.target_amount_rubles,
                stage.target_amount ? stage.target_amount / 100 : 0,
            );
            const collected = getAmount(
                stage.collected_amount_rubles,
                stage.collected_amount ? stage.collected_amount / 100 : 0,
            );
            const progress = buildProgress(target, collected, 'Цель этапа');
            if (progress) {
                return progress;
            }
        }

        if (projectInfo) {
            const target = getAmount(
                projectInfo.target_amount_rubles,
                projectInfo.target_amount ? projectInfo.target_amount / 100 : 0,
            );
            const collected = getAmount(
                projectInfo.collected_amount_rubles,
                projectInfo.collected_amount
                    ? projectInfo.collected_amount / 100
                    : 0,
            );
            const progress = buildProgress(target, collected, 'Цель проекта');
            if (progress) {
                return progress;
            }
        }

        if (organizationNeeds) {
            const target = getAmount(
                organizationNeeds.target_amount_rubles,
                organizationNeeds.target_amount,
            );
            const collected = getAmount(
                organizationNeeds.collected_amount_rubles,
                organizationNeeds.collected_amount,
            );
            const progress = buildProgress(target, collected, 'Нужды школы');
            if (progress) {
                return progress;
            }
        }

        if (fundraiser) {
            const progress = buildProgress(
                fundraiser.target_amount,
                fundraiser.collected_amount,
                'Цель сбора',
            );
            if (progress) {
                return progress;
            }
        }

        return null;
    }, [
        show_progress,
        currency,
        publicContext?.progress,
        projectInfo,
        organizationNeeds,
        fundraiser,
    ]);

    const derivedProjectId =
        contextProjectId ??
        projectInfo?.id ??
        parseNumericId(localConfig.project_id);

    const derivedStageId =
        contextStageId ??
        parseNumericId(projectInfo?.active_stage?.id) ??
        undefined;

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

    // Утилита: метаданные способов оплаты для отображения
    const getPaymentMeta = (m: ApiPaymentMethod) => {
        const slug = (m.slug || m.type || m.name || '').toLowerCase();
        if (slug.includes('sbp') || slug === 'sbp' || slug.includes('qr')) {
            return {
                title: 'По QR коду через СБП',
                description: 'Через приложение вашего банка',
                icon: <QrCode className="h-5 w-5 text-gray-400" />,
            };
        }
        if (slug.includes('sber')) {
            return {
                title: 'Оплата через SberPay',
                description: 'В приложении банка',
                icon: <Smartphone className="h-5 w-5 text-gray-400" />,
            };
        }
        if (
            slug.includes('tinkoff') ||
            slug.includes('tpay') ||
            slug.includes('t-pay')
        ) {
            return {
                title: 'Оплата через T‑Pay',
                description: 'В приложении банка',
                icon: <Smartphone className="h-5 w-5 text-gray-400" />,
            };
        }
        // default: банковская карта
        return {
            title: m.name || 'Банковской картой',
            description: 'Visa, Mastercard, МИР и другие',
            icon: <CreditCard className="h-5 w-5 text-gray-400" />,
        };
    };

    // Рендер публичной версии (используем и в предпросмотре)
    const renderPublic = () => {
        return (
            <div
                className={`donation-widget ${borderRadiusClass} ${shadowClass}`}
            >
                <div className="p-6">
                    {/* Заголовок */}
                    {(title && (config.show_title ?? true)) || description ? (
                        <div className="donation-widget__header">
                            {title && (config.show_title ?? true) && (
                                <h3 className="donation-widget__title">
                                    {title}
                                </h3>
                            )}
                            {description && (
                                <p className="text-sm text-gray-600">
                                    {description}
                                </p>
                            )}
                        </div>
                    ) : null}

                    {progressData && (
                        <div className="organization-donation-info mb-6 space-y-3">
                            {(show_target_amount || show_collected_amount) && (
                                <div className="organization-donation-labels flex justify-between text-xs uppercase tracking-wide text-gray-500">
                                    {show_target_amount && (
                                        <span>{progressData.labelTarget}</span>
                                    )}
                                    {show_collected_amount && (
                                        <span>
                                            {progressData.labelCollected}
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="organization-donation-progress-wrapper">
                                <div className="organization-donation-progress-bar relative h-2 overflow-hidden rounded-full bg-gray-200">
                                    <div
                                        className="organization-donation-progress-fill absolute left-0 top-0 h-full rounded-full bg-blue-500 transition-all"
                                        style={{
                                            width: `${Math.min(progressData.percentage, 100)}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                            <div className="organization-donation-amounts flex justify-between text-sm font-semibold">
                                {show_target_amount && (
                                    <span className="organization-donation-target text-gray-800">
                                        {formatCurrency(
                                            progressData.targetAmount,
                                            progressData.currency,
                                        )}
                                    </span>
                                )}
                                {show_collected_amount && (
                                    <span className="organization-donation-collected text-blue-600">
                                        {formatCurrency(
                                            progressData.collectedAmount,
                                            progressData.currency,
                                        )}
                                    </span>
                                )}
                            </div>
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
                                    onChange={(e) =>
                                        setDonorName(e.target.value)
                                    }
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
                                <Label
                                    htmlFor="is_anonymous"
                                    className="text-sm"
                                >
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
                                                            period as
                                                                | 'daily'
                                                                | 'weekly'
                                                                | 'monthly',
                                                        )
                                                    }
                                                    className={`px-3 py-2 text-sm ${borderRadiusClass} border transition-colors ${
                                                        recurringPeriod ===
                                                        period
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
                                                Я согласен на подписку на
                                                платежи на сумму {amount}{' '}
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

                        {/* Способы оплаты - чекбоксы с иконками, одиночный выбор */}
                        <div className="border-t pt-4">
                            <Label className="mb-3 block">Способ оплаты</Label>
                            <div className="space-y-2">
                                {paymentMethods.length > 0 ? (
                                    // Убираем дубликаты по slug (или по name, если slug отсутствует)
                                    paymentMethods
                                        .filter((m, idx, arr) => {
                                            const slugKey = normalizePaymentSlug(
                                                m,
                                            ).toLowerCase();
                                            return (
                                                arr.findIndex(
                                                    (x) =>
                                                        normalizePaymentSlug(
                                                            x,
                                                        ).toLowerCase() ===
                                                        slugKey,
                                                ) === idx
                                            );
                                        })
                                        .map((method) => {
                                            const meta = getPaymentMeta(method);
                                            const slug = normalizePaymentSlug(
                                                method,
                                            );
                                            const checked =
                                                selectedPaymentMethod ===
                                                slug;
                                            return (
                                                <label
                                                    key={slug}
                                                    className={`flex items-center gap-3 border p-3 ${borderRadiusClass} cursor-pointer transition-colors ${
                                                        checked
                                                            ? 'border-blue-600 bg-blue-50'
                                                            : 'border-gray-300 bg-white hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        role="checkbox"
                                                        value={slug}
                                                        aria-checked={checked}
                                                        checked={checked}
                                                        onChange={() =>
                                                            setSelectedPaymentMethod(
                                                                slug,
                                                            )
                                                        }
                                                        className="text-blue-600"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-medium">
                                                            {meta.title}
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            {meta.description}
                                                        </div>
                                                    </div>
                                                    {meta.icon}
                                                </label>
                                            );
                                        })
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

                        {/* Сообщения */}
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

                        {/* Кнопка */}
                        <button
                            type="submit"
                            disabled={isProcessing}
                            className={`btn-accent w-full px-6 py-3 ${borderRadiusClass} flex items-center justify-center gap-2 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${buttonStyleClass || ''}`}
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
                            {renderPublic()}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Режим публичного отображения
    return renderPublic();
};

import {
    widgetsSystemApi,
    type PaymentMethod as ApiPaymentMethod,
    type DonationWidgetData,
} from '@/lib/api/index';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DonationWidgetEditor } from './donation/DonationWidgetEditor';
import { DonationWidgetPublicView } from './donation/DonationWidgetPublicView';
import type {
    DonationProgressData,
    DonationWidgetConfig,
    Fundraiser,
    OrganizationNeeds,
    ProjectSummary,
    PublicDonationContext,
    Terminology,
} from './donation/types';
import { useDonationFormState } from './donation/useDonationFormState';
import {
    CURRENCY_SYMBOLS,
    normalizePaymentSlug,
    parseNumericId,
} from './donation/utils';

export interface DonationWidgetProps {
    config?: DonationWidgetConfig;
    isEditable?: boolean;
    autoExpandSettings?: boolean;
    onSave?: (config: Record<string, unknown>) => Promise<void>;
    widgetId?: string;
    organizationId?: number;
    publicContext?: PublicDonationContext;
}

export const DonationWidget: React.FC<DonationWidgetProps> = ({
    config = {},
    isEditable = false,
    autoExpandSettings = false,
    onSave,
    organizationId,
    publicContext,
}) => {
    const [isSettingsExpanded, setIsSettingsExpanded] =
        useState(autoExpandSettings);
    const [localConfig, setLocalConfig] =
        useState<DonationWidgetConfig>(config);

    const [paymentMethods, setPaymentMethods] = useState<ApiPaymentMethod[]>(
        [],
    );
    const [fundraiser, setFundraiser] = useState<Fundraiser | null>(null);
    const [projectInfo, setProjectInfo] = useState<ProjectSummary | null>(null);
    const [organizationNeeds, setOrganizationNeeds] =
        useState<OrganizationNeeds | null>(null);
    const [terminology, setTerminology] = useState<Terminology | null>(null);
    const [_isLoading, setIsLoading] = useState(false);
    const [merchant, setMerchant] = useState<
        DonationWidgetData['merchant'] | null
    >(null);
    const [subscribersCount, setSubscribersCount] = useState<number | null>(
        null,
    );

    const resolvedOrganizationId =
        parseNumericId(organizationId) ??
        parseNumericId(publicContext?.organizationId) ??
        null;
    const contextProjectId = parseNumericId(publicContext?.projectId);
    const contextStageId = parseNumericId(publicContext?.projectStageId);

    const isMerchantActive = merchant?.is_operational ?? true;

    const {
        values: {
            amount,
            isRecurring,
            recurringPeriod,
            selectedPaymentMethod,
            donorName,
            donorEmail,
            donorPhone,
            donorMessage,
            isAnonymous,
            agreedToPolicy,
            agreedToRecurring,
            isProcessing,
            error,
            success,
        },
        handlers: {
            handleAmountInputChange,
            handlePresetAmountSelect,
            handleRecurringChange,
            handleRecurringPeriodChange,
            handleDonorNameChange,
            handleDonorEmailChange,
            handleDonorPhoneChange,
            handleDonorMessageChange,
            handleAnonymousChange,
            handleAgreedToPolicyChange,
            handleAgreedToRecurringChange,
            handlePaymentMethodSelect,
        },
        setError: setFormError,
        setSuccess: setFormSuccess,
        setIsProcessing: setFormProcessing,
        setPendingPayment: setFormPendingPayment,
        resetForm,
        paymentModal,
        isSelectedMethodAvailable,
    } = useDonationFormState({
        config: localConfig,
        paymentMethods,
        isMerchantActive,
    });

    useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    useEffect(() => {
        if (autoExpandSettings || isEditable) {
            setIsSettingsExpanded(true);
        }
    }, [autoExpandSettings, isEditable]);

    const loadWidgetData = useCallback(async () => {
        if (!resolvedOrganizationId) {
            setFundraiser(null);
            setProjectInfo(null);
            setOrganizationNeeds(null);
            setMerchant(null);
            setIsLoading(true);
            setFormError(null);

            try {
                const methods =
                    await widgetsSystemApi.getDonationWidgetPaymentMethodsPublic();
                const methodsList = methods || [];
                setPaymentMethods(methodsList);
            } catch (err) {
                console.error('Error loading public payment methods:', err);
                setFormError('Ошибка загрузки данных виджета');
            } finally {
                setIsLoading(false);
            }

            return;
        }

        setIsLoading(true);
        setFormError(null);

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

            setMerchant(widgetData.merchant ?? null);
            setSubscribersCount(widgetData.subscribers_count ?? null);

            if (widgetData.terminology) {
                setTerminology(
                    widgetData.terminology as unknown as Terminology,
                );
            }

            setOrganizationNeeds(
                (widgetData.organization_needs as OrganizationNeeds | null) ??
                    null,
            );

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
        } catch (err: unknown) {
            console.error('Error loading widget data:', err);
            setFormError('Ошибка загрузки данных виджета');
        } finally {
            setIsLoading(false);
        }
    }, [
        resolvedOrganizationId,
        localConfig.fundraiser_id,
        localConfig.project_id,
        contextProjectId,
        contextStageId,
        setFormError,
    ]);

    useEffect(() => {
        if (!isEditable) {
            loadWidgetData();
        }
    }, [isEditable, loadWidgetData]);

    useEffect(() => {
        if (!onSave || !isEditable) return;

        const timer = setTimeout(() => {
            onSave(localConfig as Record<string, unknown>);
        }, 500);

        return () => clearTimeout(timer);
    }, [localConfig, onSave, isEditable]);

    const derivedProjectId =
        contextProjectId ??
        projectInfo?.id ??
        parseNumericId(localConfig.project_id);

    const derivedStageId =
        contextStageId ??
        parseNumericId(projectInfo?.active_stage?.id) ??
        undefined;

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setFormError(null);
            setFormSuccess(null);

            if (!isAnonymous && localConfig.require_name && !donorName.trim()) {
                setFormError('Пожалуйста, введите ваше имя');
                return;
            }

            if (localConfig.require_email && !donorEmail.trim()) {
                setFormError('Пожалуйста, введите ваш email');
                return;
            }

            if (localConfig.require_phone && !donorPhone.trim()) {
                setFormError('Пожалуйста, введите ваш телефон');
                return;
            }

            if (!agreedToPolicy) {
                setFormError(
                    'Необходимо принять условия обработки персональных данных',
                );
                return;
            }

            if (isRecurring && !agreedToRecurring) {
                setFormError('Необходимо согласиться на подписку на платежи');
                return;
            }

            const minAmount = localConfig.min_amount || 1;
            const maxAmount = localConfig.max_amount || 0;

            if (amount < minAmount) {
                setFormError(
                    `Минимальная сумма: ${minAmount} ${CURRENCY_SYMBOLS[localConfig.currency ?? 'RUB']}`,
                );
                return;
            }

            if (maxAmount > 0 && amount > maxAmount) {
                setFormError(
                    `Максимальная сумма: ${maxAmount} ${CURRENCY_SYMBOLS[localConfig.currency ?? 'RUB']}`,
                );
                return;
            }

            const selectedMethod = paymentMethods.find(
                (method) =>
                    normalizePaymentSlug(method) === selectedPaymentMethod,
            );

            if (!selectedMethod || selectedMethod.available === false) {
                setFormError(
                    'Оплата временно недоступна. Выберите другой способ или попробуйте позже.',
                );
                return;
            }

            setFormError(null);
            setFormSuccess(null);
            setFormPendingPayment(null);
            setFormProcessing(true);

            try {
                if (!resolvedOrganizationId) {
                    setFormError(
                        'Пожертвования доступны на страницах организаций',
                    );
                    return;
                }

                const response = await widgetsSystemApi.submitDonation(
                    resolvedOrganizationId,
                    {
                        amount,
                        currency: localConfig.currency ?? 'RUB',
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
                        recurring_period: isRecurring
                            ? recurringPeriod
                            : undefined,
                        send_receipt: localConfig.send_receipt !== false,
                        success_url: window.location.href,
                        failure_url: window.location.href,
                    },
                );

                if (response.success) {
                    const paymentData = response.data;

                    if (paymentData && paymentData.success === false) {
                        setFormError(
                            paymentData.error ||
                                response.message ||
                                'Ошибка при создании пожертвования',
                        );
                        return;
                    }

                    // 1. Если у нас есть сгенерированный SVG — всегда показываем модалку с QR
                    if (paymentData?.qr_code_svg) {
                        setFormPendingPayment(paymentData);
                        setFormSuccess(null);
                        return;
                    }

                    // 2. Если есть qr_code
                    if (paymentData?.qr_code) {
                        const rawCode = paymentData.qr_code.trim();
                        const isUrl = /^https?:\/\//i.test(rawCode);

                        // 2a. "Голый" base64 / data URL — показываем модалку
                        if (!isUrl) {
                            setFormPendingPayment(paymentData);
                            setFormSuccess(null);
                            return;
                        }

                        // 2b. URL, но svg не пришел (значит на нашей стороне не удалось собрать QR) —
                        // просто перенаправляем пользователя по этому адресу, как для других методов оплаты.
                        window.location.href = rawCode;
                        return;
                    }

                    if (paymentData?.redirect_url) {
                        window.location.href = paymentData.redirect_url;
                        return;
                    }

                    if (paymentData?.confirmation_url) {
                        window.location.href = paymentData.confirmation_url;
                        return;
                    }

                    if (paymentData?.deep_link) {
                        window.location.href = paymentData.deep_link;
                        return;
                    }

                    setFormSuccess('Пожертвование успешно создано!');
                    resetForm();
                } else {
                    setFormError(
                        response.message || 'Ошибка при создании пожертвования',
                    );
                }
            } catch (err: unknown) {
                console.error('Error creating donation:', err);
                const message =
                    err instanceof Error && 'response' in err
                        ? (
                              err as {
                                  response?: { data?: { message?: string } };
                              }
                          ).response?.data?.message ||
                          'Ошибка при создании пожертвования'
                        : 'Ошибка при создании пожертвования';
                setFormError(message);
            } finally {
                setFormProcessing(false);
            }
        },
        [
            agreedToPolicy,
            agreedToRecurring,
            amount,
            derivedProjectId,
            derivedStageId,
            donorEmail,
            donorMessage,
            donorName,
            donorPhone,
            isAnonymous,
            isRecurring,
            localConfig.currency,
            localConfig.fundraiser_id,
            localConfig.min_amount,
            localConfig.max_amount,
            localConfig.require_email,
            localConfig.require_name,
            localConfig.require_phone,
            localConfig.send_receipt,
            paymentMethods,
            resolvedOrganizationId,
            resetForm,
            selectedPaymentMethod,
            recurringPeriod,
            setFormError,
            setFormPendingPayment,
            setFormProcessing,
            setFormSuccess,
        ],
    );

    const defaultTitle = terminology?.action_support || 'Поддержать';
    const defaultButtonText = terminology?.action_support || 'Поддержать';

    const {
        title = defaultTitle,
        description,
        show_progress = true,
        preset_amounts = [100, 300, 500, 1000],
        currency = 'RUB',
        allow_recurring = true,
        recurring_periods = ['daily', 'weekly', 'monthly'],
        require_name = true,
        require_email = false,
        require_phone = false,
        allow_anonymous = true,
        show_message_field = false,
        button_text = defaultButtonText,
        button_style = 'primary',
        border_radius = 'medium',
        shadow = 'small',
    } = localConfig;

    const progressData = useMemo<DonationProgressData | null>(() => {
        if (!show_progress) {
            return null;
        }

        const effectiveCurrency = currency ?? 'RUB';

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
                currency: effectiveCurrency as string,
            };
        };

        const getAmount = (
            raw?: number | { value?: number } | null,
            fallback?: number | null,
        ) => {
            if (raw && typeof raw === 'object' && 'value' in raw) {
                const value = raw.value;
                return typeof value === 'number' ? value : 0;
            }
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
                progress.currency = (ctxCurrency ??
                    effectiveCurrency) as string;
                return progress;
            }
        }

        const stage = projectInfo?.active_stage;
        if (stage) {
            const target = getAmount(
                stage.funding?.target,
                stage.target_amount ? stage.target_amount / 100 : 0,
            );
            const collected = getAmount(
                stage.funding?.collected,
                stage.collected_amount ? stage.collected_amount / 100 : 0,
            );
            const progress = buildProgress(target, collected, 'Цель этапа');
            if (progress) {
                return progress;
            }
        }

        if (projectInfo) {
            const target = getAmount(
                projectInfo.funding?.target,
                projectInfo.target_amount ? projectInfo.target_amount / 100 : 0,
            );
            const collected = getAmount(
                projectInfo.funding?.collected,
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
            const target = getAmount(organizationNeeds.target);
            const collected = getAmount(organizationNeeds.collected);
            const progress = buildProgress(target, collected, 'Нужды школы');
            if (progress) {
                progress.currency =
                    organizationNeeds.target.currency ?? progress.currency;
                progress.percentage =
                    organizationNeeds.progress_percentage ?? progress.percentage;
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

    const toggleSettings = useCallback(() => {
        setIsSettingsExpanded((prev) => !prev);
    }, [setIsSettingsExpanded]);

    const renderPublic = () => (
        <DonationWidgetPublicView
            config={localConfig}
            title={title}
            description={description}
            showTitle={localConfig.show_title ?? true}
            progressData={progressData}
            borderRadiusClass={borderRadiusClass}
            shadowClass={shadowClass}
            buttonStyleClass={buttonStyleClass || ''}
            buttonText={button_text}
            paymentModal={paymentModal}
            form={{
                amount,
                onAmountInputChange: handleAmountInputChange,
                onPresetAmountSelect: handlePresetAmountSelect,
                presetAmounts: preset_amounts,
                minAmount: localConfig.min_amount || 1,
                maxAmount: localConfig.max_amount || 0,
                currency,
                allowRecurring: allow_recurring,
                recurringPeriods: recurring_periods,
                isRecurring,
                onRecurringChange: handleRecurringChange,
                recurringPeriod,
                onRecurringPeriodChange: handleRecurringPeriodChange,
                agreedToRecurring,
                onAgreedToRecurringChange: handleAgreedToRecurringChange,
                donorName,
                onDonorNameChange: handleDonorNameChange,
                donorEmail,
                onDonorEmailChange: handleDonorEmailChange,
                donorPhone,
                onDonorPhoneChange: handleDonorPhoneChange,
                donorMessage,
                onDonorMessageChange: handleDonorMessageChange,
                isAnonymous,
                onAnonymousChange: handleAnonymousChange,
                agreedToPolicy,
                onAgreedToPolicyChange: handleAgreedToPolicyChange,
                requireName: require_name,
                requireEmail: require_email,
                requirePhone: require_phone,
                allowAnonymous: allow_anonymous,
                showMessageField: show_message_field,
                isProcessing,
                isSelectedMethodAvailable,
                error,
                success,
                onSubmit: handleSubmit,
            }}
            paymentMethods={{
                items: paymentMethods,
                selectedMethod: selectedPaymentMethod,
                onSelect: handlePaymentMethodSelect,
                isMerchantActive,
            }}
            subscribersCount={subscribersCount}
        />
    );

    if (isEditable) {
        return (
            <DonationWidgetEditor
                isSettingsExpanded={isSettingsExpanded}
                onToggleSettings={toggleSettings}
                localConfig={localConfig}
                setLocalConfig={setLocalConfig}
            />
        );
    }

    return renderPublic();
};

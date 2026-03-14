import { Alert, AlertDescription } from '@/components/ui/alert';
import RussianPhoneInput from '@/components/ui/RussianPhoneInput';
import {
    widgetsSystemApi,
    type PaymentMethod as ApiPaymentMethod,
} from '@/lib/api/index';
import { usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DonationPaymentModal } from '../donation/DonationPaymentModal';
import { useDonationFormState } from '../donation/useDonationFormState';
import {
    CURRENCY_SYMBOLS,
    normalizePaymentSlug,
    parseNumericId,
} from '../donation/utils';
import { SchoolSubscribeConfig } from '../SchoolSubscribeWidget';
import { WidgetOutputProps } from './types';

const SCHOOL_ICONS = '/icons/school-template';

const getPaymentMeta = (method: ApiPaymentMethod) => {
    const slug = (method.slug || method.type || method.name || '').toLowerCase();
    if (slug.includes('sbp') || slug === 'sbp' || slug.includes('qr')) {
        return {
            title: 'Через СПБ по QR-коду',
            icon: `${SCHOOL_ICONS}/sbp-qr.svg`,
        };
    }
    if (slug.includes('sber')) {
        return {
            title: 'Оплата SberPay',
            icon: `${SCHOOL_ICONS}/sber.svg`,
        };
    }
    if (slug.includes('tinkoff') || slug.includes('tpay') || slug.includes('t-pay')) {
        return {
            title: 'Оплата T-Pay',
            icon: `${SCHOOL_ICONS}/t-bank.svg`,
        };
    }

    return {
        title: method.name || 'Банковской картой',
        icon: `${SCHOOL_ICONS}/card.svg`,
    };
};

interface TopRow {
    donor_label: string;
    total_amount: number;
    total_amount_formatted: string;
    donations_count: number;
}

export const SchoolSubscribeOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = (widget.config || {}) as SchoolSubscribeConfig;
    const page = usePage();
    const propsAny = (page?.props as any) || {};

    const { auth } = propsAny;
    const userPhone = auth?.user?.phone?.trim() || undefined;
    const userName = auth?.user?.name?.trim() || undefined;

    const {
        title = 'Подпишись\nна постоянную\nпомощь школе',
        subtitle = 'Оформление регулярной подписки — это самый надежный\nи эффективный способ поддержать деятельность и развитие школы.',
        default_amount = 250,
        preset_amounts = [250, 500, 1000],
        min_amount = 100,
        max_amount = 0,
        currency = 'RUB',
        require_name = true,
        require_email = false,
        allow_anonymous = true,
        button_text = 'Подписаться на помощь',
    } = config;

    const organizationId = useMemo(
        () =>
            parseNumericId(config.organizationId) ??
            parseNumericId(propsAny?.site?.organization_id),
        [config.organizationId, propsAny?.site?.organization_id],
    );

    const organizationSlug = propsAny?.organization?.slug || propsAny?.site?.organization?.slug;

    const [paymentMethods, setPaymentMethods] = useState<ApiPaymentMethod[]>([]);
    const [subscribersCount, setSubscribersCount] = useState<number>(0);
    const [isMerchantActive, setIsMerchantActive] = useState(true);
    const [topSponsors, setTopSponsors] = useState<TopRow[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const loadData = useCallback(async () => {
        if (!organizationId) return;
        setIsLoadingData(true);
        try {
            const widgetData = await widgetsSystemApi.getDonationWidgetData(organizationId);
            setSubscribersCount(widgetData.subscribers_count ?? 0);
            setIsMerchantActive(widgetData.merchant?.is_operational ?? true);

            const methods = await widgetsSystemApi.getDonationWidgetPaymentMethods(organizationId);
            setPaymentMethods(methods || []);

            if (organizationSlug) {
                const topResponse = await fetch(`/organization/${encodeURIComponent(organizationSlug)}/donations/top?period=all&limit=6`);
                const topJson = await topResponse.json();
                if (topJson.success && Array.isArray(topJson.data)) {
                    setTopSponsors(topJson.data);
                }
            }
        } catch (err) {
            console.error('SchoolSubscribeOutput: failed to load data', err);
        } finally {
            setIsLoadingData(false);
        }
    }, [organizationId, organizationSlug]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const {
        values: {
            amount,
            isRecurring,
            recurringPeriod,
            selectedPaymentMethod,
            donorName,
            donorEmail,
            donorPhone,
            isAnonymous,
            agreedToPolicy,
            isProcessing,
            error,
            success,
        },
        handlers: {
            handleAmountInputChange,
            handlePresetAmountSelect,
            handleRecurringPeriodChange,
            handleDonorNameChange,
            handleDonorEmailChange,
            handleDonorPhoneChange,
            handleAnonymousChange,
            handleAgreedToPolicyChange,
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
        config: {
            default_amount,
            default_recurring_period: 'monthly',
        },
        paymentMethods,
        isMerchantActive,
        initialDonorPhone: userPhone,
        initialDonorName: userName,
    });

    const displayMethods = paymentMethods.filter((method, idx, arr) => {
        const slugKey = normalizePaymentSlug(method).toLowerCase();
        if (slugKey.includes('cash') || slugKey.includes('bank_requisites')) return false;
        return arr.findIndex((item) => normalizePaymentSlug(item).toLowerCase() === slugKey) === idx;
    });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        if (!isAnonymous && require_name && !donorName.trim()) {
            setFormError('Пожалуйста, введите ваше имя');
            return;
        }

        if (require_email && !donorEmail.trim()) {
            setFormError('Пожалуйста, введите ваш email');
            return;
        }

        if (!agreedToPolicy) {
            setFormError('Необходимо принять условия обработки персональных данных');
            return;
        }

        if (amount < min_amount) {
            setFormError(`Минимальная сумма: ${min_amount} ${CURRENCY_SYMBOLS[currency]}`);
            return;
        }

        if (max_amount > 0 && amount > max_amount) {
            setFormError(`Максимальная сумма: ${max_amount} ${CURRENCY_SYMBOLS[currency]}`);
            return;
        }

        const selectedMethod = paymentMethods.find(
            (method) => normalizePaymentSlug(method) === selectedPaymentMethod,
        );

        if (!selectedMethod || selectedMethod.available === false) {
            setFormError('Оплата временно недоступна. Выберите другой способ или попробуйте позже.');
            return;
        }

        setFormPendingPayment(null);
        setFormProcessing(true);

        try {
            if (!organizationId) {
                setFormError('Пожертвования недоступны');
                return;
            }

            const response = await widgetsSystemApi.submitDonation(organizationId, {
                amount,
                currency,
                payment_method_slug: selectedPaymentMethod,
                donor_name: isAnonymous ? undefined : donorName,
                donor_email: donorEmail || undefined,
                donor_phone: donorPhone || undefined,
                is_anonymous: isAnonymous,
                is_recurring: true, // Всегда подписка в этом виджете
                recurring_period: recurringPeriod,
                send_receipt: true,
                success_url: window.location.href,
                failure_url: window.location.href,
            });

            if (response.success) {
                const paymentData = response.data;

                if (paymentData && paymentData.success === false) {
                    setFormError(paymentData.error || response.message || 'Ошибка при создании пожертвования');
                    return;
                }

                if (paymentData?.qr_code_svg || paymentData?.qr_code) {
                    const rawCode = paymentData.qr_code?.trim();
                    const isUrl = rawCode && /^https?:\/\//i.test(rawCode);
                    if (paymentData.qr_code_svg || !isUrl) {
                        setFormPendingPayment(paymentData);
                        return;
                    }
                    if (isUrl) {
                        window.location.href = rawCode;
                        return;
                    }
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
                setFormError(response.message || 'Ошибка при создании пожертвования');
            }
        } catch (err: unknown) {
            console.error('Error creating donation:', err);
            const message = err instanceof Error && 'response' in err
                ? (err as any).response?.data?.message || 'Ошибка при создании пожертвования'
                : 'Ошибка при создании пожертвования';
            setFormError(message);
        } finally {
            setFormProcessing(false);
        }
    };

    return (
        <div className={`school-subscribe-widget ${className || ''}`} style={style}>
            <DonationPaymentModal
                visible={paymentModal.visible}
                payment={paymentModal.payment}
                qrImageSrc={paymentModal.qrImageSrc}
                onClose={paymentModal.onClose}
            />

            <div className="school-subscribe-widget__container">
                <div className="school-subscribe-widget__left">
                    <div className="school-subscribe-widget__header">
                        <h2 className="school-subscribe-widget__title">
                            {title.split('\n').map((line, i) => (
                                <React.Fragment key={i}>
                                    {line}
                                    <br />
                                </React.Fragment>
                            ))}
                        </h2>
                        
                        <div className="school-subscribe-widget__stats">
                            <div className="school-subscribe-widget__stats-count">
                                {subscribersCount.toLocaleString('ru-RU')}
                                <br />
                                доноров
                            </div>
                            <div className="school-subscribe-widget__stats-label">
                                подключили автоплатёж
                            </div>
                            <div className="school-subscribe-widget__stats-icon">
                                <img src={`${SCHOOL_ICONS}/flash-circle.svg`} alt="" />
                            </div>
                        </div>
                    </div>

                    <p className="school-subscribe-widget__subtitle">
                        {subtitle.split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                                {line}
                                <br />
                            </React.Fragment>
                        ))}
                    </p>

                    {topSponsors.length > 0 && (
                        <div className="school-subscribe-widget__sponsors">
                            <h3 className="school-subscribe-widget__sponsors-title">Топ спонсоров</h3>
                            <div className="school-subscribe-widget__sponsors-list">
                                {topSponsors.map((sponsor, idx) => (
                                    <div key={idx} className="school-subscribe-widget__sponsor">
                                        <div className="school-subscribe-widget__sponsor-avatar">
                                            {/* Плейсхолдер для аватарки, если нет реальной */}
                                            <div className="school-subscribe-widget__sponsor-avatar-placeholder">
                                                {sponsor.donor_label.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="school-subscribe-widget__sponsor-info">
                                            <div className="school-subscribe-widget__sponsor-count">
                                                {sponsor.donations_count} пожертвований
                                            </div>
                                            <div className="school-subscribe-widget__sponsor-name">
                                                {sponsor.donor_label}
                                            </div>
                                        </div>
                                        <div className="school-subscribe-widget__sponsor-amount">
                                            {sponsor.total_amount_formatted}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="school-subscribe-widget__right">
                    <form className="school-subscribe-widget__form" onSubmit={handleSubmit}>
                        <div className="school-subscribe-widget__frequency">
                            {[
                                { id: 'monthly', label: 'Ежемесячно' },
                                { id: 'weekly', label: 'Еженедельно' },
                                { id: 'daily', label: 'Ежедневно' },
                            ].map((period) => (
                                <label key={period.id} className="school-subscribe-widget__frequency-item">
                                    <input
                                        type="radio"
                                        name="recurring_period"
                                        value={period.id}
                                        checked={recurringPeriod === period.id}
                                        onChange={() => handleRecurringPeriodChange(period.id as any)}
                                        className="sr-only"
                                    />
                                    <div className={`school-subscribe-widget__frequency-radio ${recurringPeriod === period.id ? 'active' : ''}`}>
                                        {recurringPeriod === period.id && <div className="inner" />}
                                    </div>
                                    <span className="school-subscribe-widget__frequency-label">{period.label}</span>
                                </label>
                            ))}
                        </div>

                        <div className="school-subscribe-widget__amount-wrapper">
                            <input
                                type="text"
                                inputMode="numeric"
                                value={amount ? `${amount} ₽` : ''}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^\d]/g, '');
                                    handleAmountInputChange(value ? Number.parseInt(value, 10) : 0);
                                }}
                                required
                                className="school-subscribe-widget__amount-input"
                            />
                            <div className="school-subscribe-widget__presets">
                                {preset_amounts.slice(0, 3).map((presetAmount) => (
                                    <button
                                        key={presetAmount}
                                        type="button"
                                        onClick={() => handlePresetAmountSelect(presetAmount)}
                                        className={`school-subscribe-widget__preset ${amount === presetAmount ? 'active' : ''}`}
                                    >
                                        {presetAmount} {CURRENCY_SYMBOLS[currency]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="school-subscribe-widget__payment-methods">
                            {displayMethods.map((method) => {
                                const slug = normalizePaymentSlug(method);
                                const checked = selectedPaymentMethod === slug;
                                const disabled = !isMerchantActive && method.available === false;
                                const meta = getPaymentMeta(method);

                                return (
                                    <button
                                        key={slug}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => handlePaymentMethodSelect(slug)}
                                        className={`school-subscribe-widget__payment-method ${checked ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                                    >
                                        <div className="school-subscribe-widget__payment-icon">
                                            <img src={meta.icon} alt="" />
                                        </div>
                                        <span className="school-subscribe-widget__payment-name">{meta.title}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="school-subscribe-widget__inputs">
                            {require_name && (
                                <div className="school-subscribe-widget__input-group relative">
                                    <input
                                        type="text"
                                        value={donorName}
                                        onChange={(e) => handleDonorNameChange(e.target.value)}
                                        placeholder="Ваше имя"
                                        required={require_name && !isAnonymous}
                                        disabled={isAnonymous}
                                        className="school-subscribe-widget__input"
                                    />
                                    {allow_anonymous && (
                                        <label className="school-subscribe-widget__anonymous">
                                            <span>Анонимно</span>
                                            <div className={`school-subscribe-widget__checkbox ${isAnonymous ? 'active' : ''}`}>
                                                {isAnonymous && (
                                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                )}
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={isAnonymous}
                                                onChange={(e) => handleAnonymousChange(e.target.checked)}
                                                className="sr-only"
                                            />
                                        </label>
                                    )}
                                </div>
                            )}

                            <div className="school-subscribe-widget__input-group">
                                {userPhone ? (
                                    <RussianPhoneInput
                                        id="donor_phone"
                                        value={donorPhone}
                                        onValueChange={() => {}}
                                        disabled
                                        readOnly
                                        className="school-subscribe-widget__input opacity-70"
                                    />
                                ) : (
                                    <RussianPhoneInput
                                        id="donor_phone"
                                        value={donorPhone}
                                        onValueChange={(val) => handleDonorPhoneChange(val)}
                                        className="school-subscribe-widget__input"
                                        placeholder="Номер телефона"
                                    />
                                )}
                            </div>

                            {require_email && (
                                <div className="school-subscribe-widget__input-group">
                                    <input
                                        type="email"
                                        value={donorEmail}
                                        onChange={(e) => handleDonorEmailChange(e.target.value)}
                                        placeholder="Email"
                                        required={require_email}
                                        className="school-subscribe-widget__input"
                                    />
                                </div>
                            )}
                        </div>

                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {success && (
                            <Alert className="mb-4">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-600">{success}</AlertDescription>
                            </Alert>
                        )}

                        <div className="school-subscribe-widget__policy">
                            <div
                                className={`school-subscribe-widget__checkbox ${agreedToPolicy ? 'active' : ''}`}
                                onClick={() => handleAgreedToPolicyChange(!agreedToPolicy)}
                            >
                                {agreedToPolicy && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                )}
                            </div>
                            <input
                                type="checkbox"
                                checked={agreedToPolicy}
                                onChange={(e) => handleAgreedToPolicyChange(e.target.checked)}
                                className="sr-only"
                                required
                            />
                            <div className="school-subscribe-widget__policy-text">
                                Принимаю <a href="/policy/" target="_blank">условия обработки</a> персональных данных
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isProcessing || !isSelectedMethodAvailable}
                            className="school-subscribe-widget__submit"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Обработка...
                                </>
                            ) : (
                                button_text
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

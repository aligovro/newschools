import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
    DonationPaymentData,
    PaymentMethod as ApiPaymentMethod,
} from '@/lib/api/index';
import type { DonationWidgetConfig } from './types';
import { normalizePaymentSlug } from './utils';

interface UseDonationFormStateOptions {
    config: DonationWidgetConfig;
    paymentMethods: ApiPaymentMethod[];
    isMerchantActive: boolean;
}

export interface DonationFormValues {
    amount: number;
    isRecurring: boolean;
    recurringPeriod: 'daily' | 'weekly' | 'monthly';
    selectedPaymentMethod: string;
    donorName: string;
    donorEmail: string;
    donorPhone: string;
    donorMessage: string;
    isAnonymous: boolean;
    agreedToPolicy: boolean;
    agreedToRecurring: boolean;
    isProcessing: boolean;
    error: string | null;
    success: string | null;
}

export interface DonationFormHandlers {
    handleAmountInputChange: (value: number) => void;
    handlePresetAmountSelect: (value: number) => void;
    handleRecurringChange: (value: boolean) => void;
    handleRecurringPeriodChange: (value: 'daily' | 'weekly' | 'monthly') => void;
    handleDonorNameChange: (value: string) => void;
    handleDonorEmailChange: (value: string) => void;
    handleDonorPhoneChange: (value: string) => void;
    handleDonorMessageChange: (value: string) => void;
    handleAnonymousChange: (value: boolean) => void;
    handleAgreedToPolicyChange: (value: boolean) => void;
    handleAgreedToRecurringChange: (value: boolean) => void;
    handlePaymentMethodSelect: (slug: string) => void;
}

export interface DonationPaymentModalState {
    visible: boolean;
    payment: DonationPaymentData | null;
    qrImageSrc: string | null;
    onClose: () => void;
}

export interface DonationFormStateHook {
    values: DonationFormValues;
    handlers: DonationFormHandlers;
    setError: (value: string | null) => void;
    setSuccess: (value: string | null) => void;
    setIsProcessing: (value: boolean) => void;
    setPendingPayment: (value: DonationPaymentData | null) => void;
    resetForm: () => void;
    paymentModal: DonationPaymentModalState;
    isSelectedMethodAvailable: boolean;
}

export const useDonationFormState = ({
    config,
    paymentMethods,
    isMerchantActive,
}: UseDonationFormStateOptions): DonationFormStateHook => {
    const defaultAmount = config.default_amount ?? 100;
    const defaultRecurringPeriod = config.default_recurring_period ?? 'daily';
    const defaultPaymentMethod = config.default_payment_method ?? 'bankcard';

    const [amount, setAmount] = useState<number>(defaultAmount);
    const [isRecurring, setIsRecurring] = useState<boolean>(false);
    const [recurringPeriod, setRecurringPeriod] =
        useState<'daily' | 'weekly' | 'monthly'>(defaultRecurringPeriod);
    const [selectedPaymentMethod, setSelectedPaymentMethod] =
        useState<string>(defaultPaymentMethod);
    const [donorName, setDonorName] = useState('');
    const [donorEmail, setDonorEmail] = useState('');
    const [donorPhone, setDonorPhone] = useState('');
    const [donorMessage, setDonorMessage] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [agreedToPolicy, setAgreedToPolicy] = useState(false);
    const [agreedToRecurring, setAgreedToRecurring] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [pendingPayment, setPendingPayment] =
        useState<DonationPaymentData | null>(null);

    useEffect(() => {
        setAmount(config.default_amount ?? 100);
        setRecurringPeriod(config.default_recurring_period ?? 'daily');
        setSelectedPaymentMethod(config.default_payment_method ?? 'yookassa');
    }, [
        config.default_amount,
        config.default_payment_method,
        config.default_recurring_period,
    ]);

    useEffect(() => {
        if (!paymentMethods || paymentMethods.length === 0) {
            setSelectedPaymentMethod((prev) => (prev ? prev : ''));
            return;
        }

        const availableMethods = paymentMethods.filter(
            (method) => method.available !== false,
        );

        setSelectedPaymentMethod((prev) => {
            if (
                prev &&
                availableMethods.some(
                    (method) => normalizePaymentSlug(method) === prev,
                )
            ) {
                return prev;
            }

            if (availableMethods.length > 0) {
                return normalizePaymentSlug(availableMethods[0]);
            }

            return '';
        });
    }, [paymentMethods]);

    const handleAmountInputChange = useCallback((value: number) => {
        setAmount(value);
    }, []);

    const handlePresetAmountSelect = useCallback((value: number) => {
        setAmount(value);
    }, []);

    const handleRecurringChange = useCallback((value: boolean) => {
        setIsRecurring(value);
    }, []);

    const handleRecurringPeriodChange = useCallback(
        (value: 'daily' | 'weekly' | 'monthly') => {
            setRecurringPeriod(value);
        },
        [],
    );

    const handleDonorNameChange = useCallback((value: string) => {
        setDonorName(value);
    }, []);

    const handleDonorEmailChange = useCallback((value: string) => {
        setDonorEmail(value);
    }, []);

    const handleDonorPhoneChange = useCallback((value: string) => {
        setDonorPhone(value);
    }, []);

    const handleDonorMessageChange = useCallback((value: string) => {
        setDonorMessage(value);
    }, []);

    const handleAnonymousChange = useCallback((value: boolean) => {
        setIsAnonymous(value);
    }, []);

    const handleAgreedToPolicyChange = useCallback((value: boolean) => {
        setAgreedToPolicy(value);
    }, []);

    const handleAgreedToRecurringChange = useCallback((value: boolean) => {
        setAgreedToRecurring(value);
    }, []);

    const handlePaymentMethodSelect = useCallback((slug: string) => {
        setSelectedPaymentMethod(slug);
    }, []);

    const resetForm = useCallback(() => {
        setAmount(config.default_amount ?? 100);
        setDonorName('');
        setDonorEmail('');
        setDonorPhone('');
        setDonorMessage('');
        setIsAnonymous(false);
        setIsRecurring(false);
        setAgreedToPolicy(false);
        setAgreedToRecurring(false);
    }, [
        config.default_amount,
        setAmount,
        setDonorName,
        setDonorEmail,
        setDonorPhone,
        setDonorMessage,
        setIsAnonymous,
        setIsRecurring,
        setAgreedToPolicy,
        setAgreedToRecurring,
    ]);

    const paymentQrImageSrc = useMemo(() => {
        const rawCode = pendingPayment?.qr_code?.trim();
        if (!rawCode) {
            return null;
        }

        if (rawCode.startsWith('data:image')) {
            return rawCode;
        }

        return `data:image/png;base64,${rawCode}`;
    }, [pendingPayment]);

    const paymentModalVisible = useMemo(
        () =>
            Boolean(
                pendingPayment &&
                    (pendingPayment.qr_code ||
                        pendingPayment.confirmation_url ||
                        pendingPayment.deep_link),
            ),
        [pendingPayment],
    );

    const handleClosePaymentModal = useCallback(() => {
        setPendingPayment(null);
    }, []);

    const isSelectedMethodAvailable = useMemo(() => {
        return paymentMethods.some((method) => {
            const slug = normalizePaymentSlug(method);
            const available = isMerchantActive || method.available !== false;
            return available && slug === selectedPaymentMethod;
        });
    }, [paymentMethods, selectedPaymentMethod, isMerchantActive]);

    return {
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
        setError,
        setSuccess,
        setIsProcessing,
        setPendingPayment,
        resetForm,
        paymentModal: {
            visible: paymentModalVisible,
            payment: pendingPayment,
            qrImageSrc: paymentQrImageSrc,
            onClose: handleClosePaymentModal,
        },
        isSelectedMethodAvailable,
    };
};


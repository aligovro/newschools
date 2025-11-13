import { useCallback, useMemo, useState } from 'react';
import type { SetStateAction } from 'react';
import type { OrganizationLite, Status } from '../../types';
import type { PaymentGatewaysSettingsValue } from '@/components/dashboard/payments/PaymentGatewaysSettings';
import type { UploadedImage } from '@/components/ui/image-uploader/MultiImageUploader';
import { normalizePaymentSettings } from '@/lib/payments/normalizePaymentSettings';

interface UseOrganizationFormStateProps {
    organization?: OrganizationLite;
    organizationSettings?: { payment_settings?: unknown };
    isEdit: boolean;
    defaultPaymentSettings?: PaymentGatewaysSettingsValue;
}

interface FormState {
    name: string;
    description: string;
    type: string;
    status: Status;
    phone: string;
    email: string;
    website: string;
    isPublic: boolean;
    logoValue: string | File | null;
    galleryImages: UploadedImage[];
    paymentSettings: PaymentGatewaysSettingsValue;
}

interface FormErrors {
    clientErrors: Record<string, string>;
    serverErrors: Record<string, string>;
    dirty: Record<string, boolean>;
}

export function useOrganizationFormState({
    organization,
    organizationSettings,
    isEdit,
    defaultPaymentSettings,
}: UseOrganizationFormStateProps) {
    const [name, setName] = useState(organization?.name ?? '');
    const [description, setDescription] = useState(
        organization?.description ?? '',
    );
    const [type, setType] = useState<string>(organization?.type ?? 'school');
    const [status, setStatus] = useState<Status>(
        (organization?.status as Status) ?? 'active',
    );
    const [phone, setPhone] = useState(organization?.phone ?? '');
    const [email, setEmail] = useState(organization?.email ?? '');
    const [website, setWebsite] = useState(organization?.website ?? '');
    const [isPublic, setIsPublic] = useState<boolean>(
        organization?.is_public ?? true,
    );
    const [needsTargetAmount, setNeedsTargetAmount] = useState<string>(
        organization?.needs?.target?.value !== undefined &&
            organization?.needs?.target?.value !== null
            ? String(organization.needs.target.value)
            : '',
    );
    const [needsCollectedAmount, setNeedsCollectedAmount] = useState<string>(
        organization?.needs?.collected?.value !== undefined &&
            organization?.needs?.collected?.value !== null
            ? String(organization.needs.collected.value)
            : '',
    );

    const [dirty, setDirty] = useState<Record<string, boolean>>({});
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    const initialGallery: UploadedImage[] = useMemo(
        () =>
            Array.isArray(organization?.images)
                ? organization!.images!.map((path, idx) => ({
                      id: `${idx}`,
                      url: `/storage/${path}`,
                      file: undefined,
                      name: path.split('/').pop() || `image-${idx + 1}.jpg`,
                      size: 0,
                      type: 'image/*',
                      status: 'success',
                  }))
                : [],
        [organization?.images],
    );

    const [logoValue, setLogoValue] = useState<string | File | null>(
        organization?.logo || null,
    );
    const [galleryImages, setGalleryImages] =
        useState<UploadedImage[]>(initialGallery);

    const initialPayments: PaymentGatewaysSettingsValue = useMemo(() => {
        const normalized = normalizePaymentSettings(
            (organizationSettings?.payment_settings ?? defaultPaymentSettings) as any,
        );

        return {
            enabled_gateways: normalized.enabled_gateways,
            credentials: normalized.credentials,
            currency: normalized.currency,
            test_mode: normalized.test_mode,
            donation_min_amount: normalized.donation_min_amount,
            donation_max_amount: normalized.donation_max_amount,
        };
    }, [organizationSettings, defaultPaymentSettings]);

    const [paymentSettings, setPaymentSettings] =
        useState<PaymentGatewaysSettingsValue>(initialPayments);

    const markDirty = useCallback((field: string) => {
        setDirty((prev) => ({ ...prev, [field]: true }));
    }, []);

    const setClientError = useCallback((field: string, error: string) => {
        setClientErrors((prev) => ({
            ...prev,
            [field]: error,
        }));
    }, []);

    const clearClientError = useCallback((field: string) => {
        setClientErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }, []);

    return {
        // State
        name,
        description,
        type,
        status,
        phone,
        email,
        website,
        isPublic,
        needsTargetAmount,
        needsCollectedAmount,
        logoValue,
        galleryImages,
        paymentSettings,
        dirty,
        clientErrors,

        // Setters
        setName,
        setDescription,
        setType,
        setStatus,
        setPhone,
        setEmail,
        setWebsite,
        setIsPublic,
        setNeedsTargetAmount,
        setNeedsCollectedAmount,
        setLogoValue,
        setGalleryImages,
        setPaymentSettings: (updater: SetStateAction<PaymentGatewaysSettingsValue>) => {
            setPaymentSettings((prev) => {
                const next =
                    typeof updater === 'function'
                        ? (updater as (value: PaymentGatewaysSettingsValue) => PaymentGatewaysSettingsValue)(prev)
                        : updater;

                const normalized = normalizePaymentSettings(next as any);

                return {
                    enabled_gateways: normalized.enabled_gateways,
                    credentials: normalized.credentials,
                    currency: normalized.currency,
                    test_mode: normalized.test_mode,
                    donation_min_amount: normalized.donation_min_amount,
                    donation_max_amount: normalized.donation_max_amount,
                };
            });
        },
        markDirty,
        setClientError,
        clearClientError,
    };
}


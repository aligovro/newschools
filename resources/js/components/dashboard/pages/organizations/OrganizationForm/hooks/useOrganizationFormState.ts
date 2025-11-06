import { useCallback, useMemo, useState } from 'react';
import type { OrganizationLite, Status } from '../../types';
import type { PaymentGatewaysSettingsValue } from '@/components/dashboard/payments/PaymentGatewaysSettings';
import type { UploadedImage } from '@/components/ui/image-uploader/MultiImageUploader';

interface UseOrganizationFormStateProps {
    organization?: OrganizationLite;
    organizationSettings?: { payment_settings?: unknown };
    isEdit: boolean;
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
        const ps = (organizationSettings?.payment_settings || {}) as any;
        const enabled = Array.isArray(ps.enabled_gateways)
            ? ps.enabled_gateways
            : ps.gateway
              ? [ps.gateway]
              : ['yookassa'];
        return {
            enabled_gateways: enabled,
            credentials: ps.credentials || {},
            currency: ps.currency || 'RUB',
            test_mode: typeof ps.test_mode === 'boolean' ? ps.test_mode : true,
            donation_min_amount:
                typeof ps.donation_min_amount === 'number'
                    ? ps.donation_min_amount
                    : 100,
            donation_max_amount:
                typeof ps.donation_max_amount === 'number'
                    ? ps.donation_max_amount
                    : 0,
        };
    }, [organizationSettings]);

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
        setLogoValue,
        setGalleryImages,
        setPaymentSettings,
        markDirty,
        setClientError,
        clearClientError,
    };
}


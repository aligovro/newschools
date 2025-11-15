export interface Organization {
    id: number;
    name: string;
    slug: string;
    type_config?: {
        categories: Record<string, string>;
    };
}

export interface ProjectStage {
    id?: number;
    title: string;
    description: string;
    target_amount_rubles?: number | string;
    target_amount?: number | string;
    image?: string;
    gallery?: string[];
}

export interface ProjectCategory {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

export interface Project {
    id?: number;
    title: string;
    slug: string;
    short_description?: string;
    description?: string;
    category: string;
    target_amount: number;
    collected_amount?: number;
    status: 'draft' | 'active' | 'completed' | 'cancelled' | 'suspended';
    featured: boolean;
    start_date?: string;
    end_date?: string;
    image?: string;
    gallery?: string[];
    tags?: unknown[];
    beneficiaries?: unknown[];
    has_stages?: boolean;
    stages?: ProjectStage[];
    payment_settings?: PaymentSettings;
    categories?: ProjectCategory[];
}

export interface PaymentSettings {
    gateway?: 'sbp' | 'yookassa' | 'tinkoff';
    enabled_gateways?: Array<'sbp' | 'yookassa' | 'tinkoff'>;
    credentials?: Record<string, Record<string, string>>;
    options?: Record<string, unknown>;
    donation_min_amount?: number;
    donation_max_amount?: number;
    currency?: string;
    test_mode?: boolean;
}

export interface ProjectFormData {
    title: string;
    slug: string;
    short_description: string;
    description: string;
    category: string;
    category_ids: number[];
    target_amount: number | null;
    start_date: string | null;
    end_date: string | null;
    featured: boolean;
    status: Project['status'];
    tags: string[];
    beneficiaries: string[];
    progress_updates: string[];
    image: File | null;
    gallery: File[];
    existing_gallery: string[];
    has_stages: boolean;
    stages: ProjectStageFormData[];
    payment_settings: PaymentSettings;
}

export interface ProjectStageFormData {
    id?: number;
    title: string;
    description: string;
    target_amount: number;
    image?: File | string;
    imageFile?: File | null;
    gallery?: string[];
    galleryFiles?: UploadedImage[];
    existing_image?: string;
    removeImage?: boolean;
}

export interface UploadedImage {
    id: string;
    url: string;
    file?: File;
    name: string;
    size: number;
    type: string;
    status: 'success' | 'error' | 'uploading';
}

export interface ProjectFormProps {
    organization: Organization;
    projectCategories?: ProjectCategory[];
    defaultPaymentSettings?: PaymentSettings;
    project?: Project;
    isEdit?: boolean;
}

export interface SlugValidationState {
    isUnique: boolean;
    isValid: boolean;
    suggestedSlug?: string;
}

export interface BasicInfoSectionProps {
    data: ProjectFormData;
    errors: Record<string, string>;
    projectCategories?: ProjectCategory[];
    onDataChange: (key: keyof ProjectFormData, value: unknown) => void;
    slug: string;
    autoGenerateSlug: boolean;
    isSlugGenerating: boolean;
    slugValidation: SlugValidationState;
    onSlugChange: (value: string) => void;
    onAutoGenerateSlugChange: (checked: boolean) => void;
    onRegenerateSlug: () => void;
}

export interface FinancialInfoSectionProps {
    data: ProjectFormData;
    errors: Record<string, string>;
    onDataChange: (key: keyof ProjectFormData, value: unknown) => void;
}

export interface PaymentSettingsSectionProps {
    paymentSettings: PaymentSettings;
    onPaymentChange: (key: keyof PaymentSettings, value: unknown) => void;
    onCredentialChange: (key: string, value: string) => void;
}

export interface ProjectDatesSectionProps {
    data: ProjectFormData;
    errors: Record<string, string>;
    onDataChange: (key: keyof ProjectFormData, value: unknown) => void;
}

export interface ProjectStagesSectionProps {
    data: ProjectFormData;
    stages: ProjectStageFormData[];
    onStagesChange: (stages: ProjectStageFormData[]) => void;
    onDataChange: (key: keyof ProjectFormData, value: unknown) => void;
    hideMedia?: boolean;
}

export interface MediaSectionProps {
    projectImage: string | File | null;
    projectImages: UploadedImage[];
    errors: Record<string, string>;
    onProjectImageChange: (file: string | File | null) => void;
    onProjectImagesChange: (images: UploadedImage[]) => void;
    onDataChange: (key: keyof ProjectFormData, value: unknown) => void;
}

export interface SettingsSectionProps {
    data: ProjectFormData;
    onDataChange: (key: keyof ProjectFormData, value: unknown) => void;
}

export interface StatusOption {
    value: Project['status'];
    label: string;
}

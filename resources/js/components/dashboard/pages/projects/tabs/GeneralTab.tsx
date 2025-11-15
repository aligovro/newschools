import { BasicInfoSection } from '../ProjectForm/BasicInfoSection';
import { FinancialInfoSection } from '../ProjectForm/FinancialInfoSection';
import { MediaSection } from '../ProjectForm/MediaSection';
import { PaymentSettingsSection } from '../ProjectForm/PaymentSettingsSection';
import { ProjectDatesSection } from '../ProjectForm/ProjectDatesSection';
import { SettingsSection } from '../ProjectForm/SettingsSection';
import type {
    PaymentSettings,
    ProjectFormData,
    SlugValidationState,
    UploadedImage,
} from '../ProjectForm/types';

interface GeneralTabProps {
    data: ProjectFormData;
    errors: Record<string, string>;
    projectCategories?: Array<{
        id: number;
        name: string;
        slug: string;
        description?: string;
    }>;
    paymentSettings: PaymentSettings;
    onDataChange: (key: keyof ProjectFormData, value: unknown) => void;
    onPaymentChange: (key: keyof PaymentSettings, value: unknown) => void;
    onCredentialChange: (key: string, value: string) => void;
    projectImage: string | File | null;
    projectImages: UploadedImage[];
    onProjectImageChange: (file: string | File | null) => void;
    onProjectImagesChange: (images: UploadedImage[]) => void;
    slug: string;
    autoGenerateSlug: boolean;
    isSlugGenerating: boolean;
    slugValidation: SlugValidationState;
    onSlugChange: (value: string) => void;
    onAutoGenerateSlugChange: (checked: boolean) => void;
    onRegenerateSlug: () => void;
}

export default function GeneralTab({
    data,
    errors,
    projectCategories = [],
    paymentSettings,
    onDataChange,
    onPaymentChange,
    onCredentialChange,
    projectImage,
    projectImages,
    onProjectImageChange,
    onProjectImagesChange,
    slug,
    autoGenerateSlug,
    isSlugGenerating,
    slugValidation,
    onSlugChange,
    onAutoGenerateSlugChange,
    onRegenerateSlug,
}: GeneralTabProps) {
    return (
        <>
            <div className="create-organization__main-content">
                <BasicInfoSection
                    data={data}
                    errors={errors}
                    projectCategories={projectCategories}
                    onDataChange={onDataChange}
                    slug={slug}
                    autoGenerateSlug={autoGenerateSlug}
                    isSlugGenerating={isSlugGenerating}
                    slugValidation={slugValidation}
                    onSlugChange={onSlugChange}
                    onAutoGenerateSlugChange={onAutoGenerateSlugChange}
                    onRegenerateSlug={onRegenerateSlug}
                />

                <FinancialInfoSection
                    data={data}
                    errors={errors}
                    onDataChange={onDataChange}
                />

                <PaymentSettingsSection
                    paymentSettings={paymentSettings}
                    onPaymentChange={onPaymentChange}
                    onCredentialChange={onCredentialChange}
                />

                <ProjectDatesSection
                    data={data}
                    errors={errors}
                    onDataChange={onDataChange}
                />
            </div>

            <div className="create-organization__sidebar">
                <MediaSection
                    projectImage={projectImage}
                    projectImages={projectImages}
                    errors={errors}
                    onProjectImageChange={onProjectImageChange}
                    onProjectImagesChange={onProjectImagesChange}
                    onDataChange={onDataChange}
                />

                <SettingsSection data={data} onDataChange={onDataChange} />
            </div>
        </>
    );
}

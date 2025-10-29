import { BasicInfoSection } from '../ProjectForm/BasicInfoSection';
import { FinancialInfoSection } from '../ProjectForm/FinancialInfoSection';
import { MediaSection } from '../ProjectForm/MediaSection';
import { PaymentSettingsSection } from '../ProjectForm/PaymentSettingsSection';
import { ProjectDatesSection } from '../ProjectForm/ProjectDatesSection';
import { SettingsSection } from '../ProjectForm/SettingsSection';
import type {
    PaymentSettings,
    ProjectFormData,
    UploadedImage,
} from '../ProjectForm/types';

interface GeneralTabProps {
    data: ProjectFormData;
    errors: Record<string, string>;
    categories: Record<string, string>;
    paymentSettings: PaymentSettings;
    onDataChange: (key: keyof ProjectFormData, value: unknown) => void;
    onPaymentChange: (key: keyof PaymentSettings, value: unknown) => void;
    onCredentialChange: (key: string, value: string) => void;
    projectImage: string | File | null;
    projectImages: UploadedImage[];
    onProjectImageChange: (file: string | File | null) => void;
    onProjectImagesChange: (images: UploadedImage[]) => void;
}

export default function GeneralTab({
    data,
    errors,
    categories,
    paymentSettings,
    onDataChange,
    onPaymentChange,
    onCredentialChange,
    projectImage,
    projectImages,
    onProjectImageChange,
    onProjectImagesChange,
}: GeneralTabProps) {
    return (
        <>
            <div className="create-organization__main-content">
                <BasicInfoSection
                    data={data}
                    errors={errors}
                    categories={categories}
                    onDataChange={onDataChange}
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

import { BasicInfoSection } from '../ProjectForm/BasicInfoSection';
import { FinancialInfoSection } from '../ProjectForm/FinancialInfoSection';
import { MediaSection } from '../ProjectForm/MediaSection';
import { PaymentSettingsSection } from '../ProjectForm/PaymentSettingsSection';
import { ProjectDatesSection } from '../ProjectForm/ProjectDatesSection';
import { SettingsSection } from '../ProjectForm/SettingsSection';
import { BankRequisitesSettings } from '@/components/dashboard/bank-requisites/BankRequisitesSettings';
import { MonthlyGoalSettings } from '@/components/dashboard/monthly-goal/MonthlyGoalSettings';
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
    organization?: { id: number; name?: string; slug?: string; settings?: { payment_settings?: any } };
    projectId?: number;
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
    organization,
    projectId,
}: GeneralTabProps) {
    // Извлекаем реквизиты проекта из paymentSettings
    const projectRequisites = projectId && paymentSettings ? {
        // Структурированные поля (если есть)
        recipient_name: (paymentSettings as any).bank_requisites_structured?.recipient_name || null,
        organization_form: (paymentSettings as any).bank_requisites_structured?.organization_form || null,
        logo: (paymentSettings as any).bank_requisites_structured?.logo || null,
        bank_name: (paymentSettings as any).bank_requisites_structured?.bank_name || null,
        inn: (paymentSettings as any).bank_requisites_structured?.inn || null,
        kpp: (paymentSettings as any).bank_requisites_structured?.kpp || null,
        bik: (paymentSettings as any).bank_requisites_structured?.bik || null,
        account: (paymentSettings as any).bank_requisites_structured?.account || null,
        corr_account: (paymentSettings as any).bank_requisites_structured?.corr_account || null,
        beneficiary_name: (paymentSettings as any).bank_requisites_structured?.beneficiary_name || null,
        ogrn: (paymentSettings as any).bank_requisites_structured?.ogrn || null,
        address: (paymentSettings as any).bank_requisites_structured?.address || null,
        // Текстовое поле (для обратной совместимости)
        bank_requisites: paymentSettings.bank_requisites as string | null,
        sber_card: paymentSettings.sber_card as string | null,
        tinkoff_card: paymentSettings.tinkoff_card as string | null,
        card_recipient: paymentSettings.card_recipient as string | null,
    } : null;

    // Извлекаем реквизиты организации
    const organizationRequisites = organization?.settings?.payment_settings ? {
        // Структурированные поля
        recipient_name: organization.settings.payment_settings.bank_requisites_structured?.recipient_name,
        organization_form: organization.settings.payment_settings.bank_requisites_structured?.organization_form,
        logo: organization.settings.payment_settings.bank_requisites_structured?.logo,
        bank_name: organization.settings.payment_settings.bank_requisites_structured?.bank_name,
        inn: organization.settings.payment_settings.bank_requisites_structured?.inn,
        kpp: organization.settings.payment_settings.bank_requisites_structured?.kpp,
        bik: organization.settings.payment_settings.bank_requisites_structured?.bik,
        account: organization.settings.payment_settings.bank_requisites_structured?.account,
        corr_account: organization.settings.payment_settings.bank_requisites_structured?.corr_account,
        beneficiary_name: organization.settings.payment_settings.bank_requisites_structured?.beneficiary_name,
        ogrn: organization.settings.payment_settings.bank_requisites_structured?.ogrn,
        address: organization.settings.payment_settings.bank_requisites_structured?.address,
        // Текстовое поле (для обратной совместимости)
        bank_requisites: organization.settings.payment_settings.bank_requisites as string | null,
        sber_card: organization.settings.payment_settings.sber_card as string | null,
        tinkoff_card: organization.settings.payment_settings.tinkoff_card as string | null,
        card_recipient: organization.settings.payment_settings.card_recipient as string | null,
    } : null;

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

                {projectId && organization && (
                    <>
                        <BankRequisitesSettings
                            entityId={projectId}
                            entityType="project"
                            initialRequisites={projectRequisites}
                            organizationRequisites={organizationRequisites}
                            showInheritanceInfo={true}
                        />
                        <MonthlyGoalSettings
                            entityId={projectId}
                            entityType="project"
                            initialGoal={(paymentSettings as any)?.monthly_goal ?? null}
                            initialCollected={(paymentSettings as any)?.monthly_collected ?? null}
                            organizationGoal={organization.settings?.payment_settings?.monthly_goal ?? null}
                            showInheritanceInfo={true}
                        />
                    </>
                )}

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

import type { PaymentSettings } from '@/components/dashboard/pages/projects/ProjectForm/types';
import ProjectForm from './ProjectForm';

interface Organization {
    id: number;
    name: string;
    slug: string;
    type_config?: {
        categories: Record<string, string>;
    };
}

interface ProjectCategory {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

interface Props {
    organization: Organization;
    projectCategories?: ProjectCategory[];
    defaultPaymentSettings?: PaymentSettings;
}

export default function CreateProject({
    organization,
    projectCategories = [],
    defaultPaymentSettings,
}: Props) {
    return (
        <ProjectForm
            organization={organization}
            projectCategories={projectCategories}
            defaultPaymentSettings={defaultPaymentSettings}
            isEdit={false}
        />
    );
}

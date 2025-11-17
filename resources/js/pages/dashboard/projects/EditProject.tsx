import type { PaymentSettings } from '@/components/dashboard/pages/projects/ProjectForm/types';
import ProjectForm from './ProjectForm';

interface Organization {
    id: number;
    name: string;
    slug: string;
}

interface ProjectCategory {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

interface Project {
    id: number;
    title: string;
    slug: string;
    short_description?: string;
    description?: string;
    category?: string | null;
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
    categories?: ProjectCategory[];
}

interface Props {
    organization: Organization;
    project: Project;
    projectCategories?: ProjectCategory[];
    defaultPaymentSettings?: PaymentSettings;
}

export default function EditProject({
    organization,
    project,
    projectCategories = [],
    defaultPaymentSettings,
}: Props) {
    return (
        <ProjectForm
            organization={organization}
            project={project}
            projectCategories={projectCategories}
            defaultPaymentSettings={defaultPaymentSettings}
            isEdit={true}
        />
    );
}

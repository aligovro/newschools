import ProjectForm from '@/components/dashboard/pages/projects/ProjectForm/ProjectForm';
import type {
    Organization,
    PaymentSettings,
    Project,
    ProjectCategory,
} from '@/components/dashboard/pages/projects/ProjectForm/types';

interface Props {
    organization: Organization;
    projectCategories?: ProjectCategory[];
    defaultPaymentSettings?: PaymentSettings;
    project?: Project;
    isEdit?: boolean;
}

export default function ProjectFormPage(props: Props) {
    return <ProjectForm {...props} />;
}

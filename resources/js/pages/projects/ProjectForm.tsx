import ProjectForm from '@/components/projects/ProjectForm';
import type {
    Organization,
    Project,
} from '@/components/projects/ProjectForm/types';

interface Props {
    organization: Organization;
    categories: Record<string, string>;
    project?: Project;
    isEdit?: boolean;
}

export default function ProjectFormPage(props: Props) {
    return <ProjectForm {...props} />;
}

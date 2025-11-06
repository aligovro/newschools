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
    categories: Record<string, string>;
    projectCategories?: ProjectCategory[];
}

export default function CreateProject({
    organization,
    categories,
    projectCategories = [],
}: Props) {
    return (
        <ProjectForm
            organization={organization}
            categories={categories}
            projectCategories={projectCategories}
            isEdit={false}
        />
    );
}

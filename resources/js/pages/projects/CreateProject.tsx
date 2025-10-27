import ProjectForm from './ProjectForm';

interface Organization {
    id: number;
    name: string;
    slug: string;
    type_config?: {
        categories: Record<string, string>;
    };
}

interface Props {
    organization: Organization;
    categories: Record<string, string>;
}

export default function CreateProject({ organization, categories }: Props) {
    return (
        <ProjectForm
            organization={organization}
            categories={categories}
            isEdit={false}
        />
    );
}

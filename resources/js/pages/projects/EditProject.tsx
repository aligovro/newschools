import ProjectForm from './ProjectForm';

interface Organization {
    id: number;
    name: string;
    slug: string;
}

interface Project {
    id: number;
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
    tags?: any[];
    beneficiaries?: any[];
}

interface Props {
    organization: Organization;
    project: Project;
    categories: Record<string, string>;
}

export default function EditProject({
    organization,
    project,
    categories,
}: Props) {
    return (
        <ProjectForm
            organization={organization}
            project={project}
            categories={categories}
            isEdit={true}
        />
    );
}

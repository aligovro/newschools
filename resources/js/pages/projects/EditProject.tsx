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
    categories?: ProjectCategory[];
}

interface Props {
    organization: Organization;
    project: Project;
    categories: Record<string, string>;
    projectCategories?: ProjectCategory[];
}

export default function EditProject({
    organization,
    project,
    categories,
    projectCategories = [],
}: Props) {
    return (
        <ProjectForm
            organization={organization}
            project={project}
            categories={categories}
            projectCategories={projectCategories}
            isEdit={true}
        />
    );
}

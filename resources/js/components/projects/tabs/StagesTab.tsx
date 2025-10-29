import { ProjectStagesSection } from '../ProjectForm/ProjectStagesSection';
import type {
    ProjectFormData,
    ProjectStageFormData,
} from '../ProjectForm/types';

interface StagesTabProps {
    data: ProjectFormData;
    stages: ProjectStageFormData[];
    onStagesChange: (stages: ProjectStageFormData[]) => void;
    onDataChange: (key: keyof ProjectFormData, value: unknown) => void;
}

export default function StagesTab({
    data,
    stages,
    onStagesChange,
    onDataChange,
}: StagesTabProps) {
    return (
        <>
            <div className="create-organization__main-content">
                <ProjectStagesSection
                    data={data}
                    stages={stages}
                    onStagesChange={onStagesChange}
                    onDataChange={onDataChange}
                />
            </div>
        </>
    );
}

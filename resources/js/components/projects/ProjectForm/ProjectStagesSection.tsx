import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ProjectStageMedia from './ProjectStageMedia';
import type { ProjectStageFormData, ProjectStagesSectionProps } from './types';

export function ProjectStagesSection({
    data,
    stages,
    onStagesChange,
    onDataChange,
    hideMedia: _hideMedia = false,
}: ProjectStagesSectionProps) {
    const addStage = () => {
        const newStage = {
            title: '',
            description: '',
            target_amount: 0,
            image: undefined,
            imageFile: undefined,
            gallery: [],
            galleryFiles: [],
        };
        onStagesChange([...stages, newStage]);
    };

    const removeStage = (index: number) => {
        onStagesChange(stages.filter((_, i) => i !== index));
    };

    const updateStage = (
        index: number,
        field: keyof ProjectStageFormData,
        value: ProjectStageFormData[keyof ProjectStageFormData],
    ) => {
        const newStages = [...stages];
        (newStages[index] as ProjectStageFormData)[field] = value as never;
        onStagesChange(newStages);
    };

    const handleRemoveGalleryImage = (stageIndex: number, imageId: string) => {
        const newStages = [...stages];
        if (newStages[stageIndex].galleryFiles) {
            newStages[stageIndex].galleryFiles = newStages[
                stageIndex
            ].galleryFiles!.filter((img) => img.id !== imageId);
        }
        onStagesChange(newStages);
    };

    return (
        <div className="create-organization__section">
            <div className="create-organization__section-header">
                <h2 className="create-organization__section-title">
                    Этапы проекта
                </h2>
            </div>
            <div className="create-organization__section-content space-y-6">
                <div className="create-organization__checkbox-group">
                    <Checkbox
                        id="has_stages"
                        checked={data.has_stages}
                        onCheckedChange={(checked) =>
                            onDataChange('has_stages', !!checked)
                        }
                    />
                    <Label
                        htmlFor="has_stages"
                        className="create-organization__checkbox-label"
                    >
                        У проекта есть этапы
                    </Label>
                </div>

                {data.has_stages && (
                    <div className="space-y-4">
                        {stages.map((stage, index) => (
                            <div key={index} className="rounded-lg border p-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <h4 className="text-lg font-semibold">
                                        Этап {index + 1}
                                    </h4>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeStage(index)}
                                    >
                                        Удалить
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Название этапа</Label>
                                        <Input
                                            value={stage.title}
                                            onChange={(e) =>
                                                updateStage(
                                                    index,
                                                    'title',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Название этапа"
                                        />
                                    </div>
                                    <div>
                                        <Label>Описание этапа</Label>
                                        <Textarea
                                            value={stage.description}
                                            onChange={(e) =>
                                                updateStage(
                                                    index,
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Описание этапа"
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <Label>Целевая сумма (руб.)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={stage.target_amount ?? ''}
                                            onChange={(e) =>
                                                updateStage(
                                                    index,
                                                    'target_amount',
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : 0,
                                                )
                                            }
                                            placeholder="0"
                                        />
                                    </div>
                                    {/* Медиа этапа */}
                                    <ProjectStageMedia
                                        index={index}
                                        stage={stage}
                                        updateStage={updateStage}
                                        onRemoveGalleryImage={
                                            handleRemoveGalleryImage
                                        }
                                    />
                                    {/* Медиа этапа */}
                                </div>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addStage}
                        >
                            Добавить этап
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

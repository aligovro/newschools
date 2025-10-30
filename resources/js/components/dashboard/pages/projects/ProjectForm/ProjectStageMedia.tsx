import LogoUploader from '@/components/ui/image-uploader/LogoUploader';
import MultiImageUploader from '@/components/ui/image-uploader/MultiImageUploader';
import { Label } from '@/components/ui/label';
import type { ProjectStageFormData } from './types';

interface StageMediaProps {
    index: number;
    stage: ProjectStageFormData;
    updateStage: (
        index: number,
        field: keyof ProjectStageFormData,
        value: ProjectStageFormData[keyof ProjectStageFormData],
    ) => void;
    onRemoveGalleryImage: (index: number, imageId: string) => void;
}

export default function ProjectStageMedia({
    index,
    updateStage,
    stage,
    onRemoveGalleryImage,
}: StageMediaProps) {
    return (
        <div key={index} className="rounded-lg border p-4">
            <div className="mb-3 text-sm font-semibold">
                Медиа этапа #{index + 1}
            </div>

            <div className="space-y-4">
                <div>
                    <Label>Изображение этапа</Label>
                    <LogoUploader
                        value={
                            stage.imageFile instanceof File
                                ? stage.imageFile
                                : typeof stage.image === 'string'
                                  ? stage.image
                                  : null
                        }
                        onChange={(file, previewUrl) => {
                            updateStage(index, 'imageFile', file);
                            if (file) {
                                updateStage(index, 'removeImage', false);
                                updateStage(
                                    index,
                                    'image',
                                    previewUrl ||
                                        (file instanceof File
                                            ? URL.createObjectURL(file)
                                            : ''),
                                );
                            } else {
                                // deletion via built-in delete icon
                                updateStage(index, 'image', '');
                                updateStage(index, 'removeImage', true);
                            }
                        }}
                        maxSize={5 * 1024 * 1024}
                        aspectRatio={null}
                        showCropControls={true}
                        onUpload={async (file) => URL.createObjectURL(file)}
                    />
                </div>

                <div>
                    <Label>Галерея этапа</Label>
                    <MultiImageUploader
                        images={stage.galleryFiles || []}
                        onChange={(images) => {
                            const clonedImages = images.map((img) => ({
                                ...img,
                            }));
                            updateStage(
                                index,
                                'galleryFiles',
                                clonedImages as any,
                            );
                            const existing = images
                                .filter((img) => !img.file)
                                .map((img) => img.url.replace('/storage/', ''));
                            updateStage(index, 'gallery', existing);
                        }}
                        maxFiles={10}
                        maxSize={2 * 1024 * 1024}
                        onUpload={async (file) => URL.createObjectURL(file)}
                        onDelete={async (imageId) => {
                            onRemoveGalleryImage(index, imageId);
                        }}
                        enableSorting={true}
                        enableDeletion={true}
                        showPreview={true}
                        showFileInfo={true}
                        layout="grid"
                        previewSize="md"
                    />
                </div>
            </div>
        </div>
    );
}

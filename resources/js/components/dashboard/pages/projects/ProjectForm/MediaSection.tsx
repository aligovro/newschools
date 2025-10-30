import LogoUploader from '@/components/ui/image-uploader/LogoUploader';
import MultiImageUploader from '@/components/ui/image-uploader/MultiImageUploader';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon } from 'lucide-react';
import type { MediaSectionProps } from './types';

export function MediaSection({
    projectImage,
    projectImages,
    errors,
    onProjectImageChange,
    onProjectImagesChange,
    onDataChange,
}: MediaSectionProps) {
    return (
        <div className="create-organization__section">
            <div className="create-organization__section-header">
                <ImageIcon className="create-organization__section-icon" />
                <h2 className="create-organization__section-title">Медиа</h2>
            </div>
            <div className="create-organization__section-content">
                <div className="create-organization__field-group">
                    <div className="create-organization__field">
                        <LogoUploader
                            value={projectImage}
                            onChange={(file) => {
                                onProjectImageChange(file);
                                onDataChange('image', file);
                            }}
                            label="Основное изображение"
                            maxSize={5 * 1024 * 1024}
                            aspectRatio={null}
                            showCropControls={true}
                            onUpload={async (file) => {
                                return URL.createObjectURL(file);
                            }}
                        />
                        {errors.image && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.image}
                            </p>
                        )}
                    </div>
                </div>

                <div className="create-organization__field-group">
                    <div className="create-organization__field">
                        <Label className="mb-2 block">Галерея проекта</Label>
                        <MultiImageUploader
                            images={projectImages}
                            onChange={(images) => {
                                onProjectImagesChange(images);
                                const files = images
                                    .filter((img) => img.file)
                                    .map((img) => img.file!);
                                onDataChange('gallery', files);
                            }}
                            maxFiles={10}
                            maxSize={2 * 1024 * 1024}
                            onUpload={async (file) => {
                                return URL.createObjectURL(file);
                            }}
                            onDelete={async (imageId) => {
                                console.log('Delete image:', imageId);
                            }}
                            enableSorting={true}
                            enableDeletion={true}
                            showPreview={true}
                            showFileInfo={true}
                            layout="grid"
                            previewSize="md"
                        />
                        {errors.gallery && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.gallery}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

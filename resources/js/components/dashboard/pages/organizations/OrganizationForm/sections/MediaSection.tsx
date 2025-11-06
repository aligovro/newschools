import { memo } from 'react';
import LogoUploader from '@/components/ui/image-uploader/LogoUploader';
import MultiImageUploader, {
    type UploadedImage,
} from '@/components/ui/image-uploader/MultiImageUploader';
import { Label } from '@/components/ui/label';

interface MediaSectionProps {
    logoValue: string | File | null;
    galleryImages: UploadedImage[];
    onLogoChange: (file: string | File | null) => void;
    onGalleryChange: (images: UploadedImage[]) => void;
}

export const MediaSection = memo(function MediaSection({
    logoValue,
    galleryImages,
    onLogoChange,
    onGalleryChange,
}: MediaSectionProps) {
    return (
        <div className="rounded-lg border bg-white p-4">
            <Label className="mb-2 block">Логотип организации</Label>
            <LogoUploader
                value={logoValue}
                onChange={onLogoChange}
                label="Логотип"
                maxSize={10 * 1024 * 1024}
                aspectRatio={null}
                showCropControls={true}
                onUpload={async (file) => URL.createObjectURL(file)}
            />
            <div className="mt-4">
                <Label className="mb-2 block">Галерея</Label>
                <MultiImageUploader
                    images={galleryImages}
                    onChange={onGalleryChange}
                    maxFiles={20}
                    maxSize={10 * 1024 * 1024}
                    enableSorting
                    enableDeletion
                    showPreview
                    showFileInfo
                    layout="grid"
                    previewSize="md"
                />
            </div>
        </div>
    );
});


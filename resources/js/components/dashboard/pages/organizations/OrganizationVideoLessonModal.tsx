import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import LogoUploader from '@/components/ui/image-uploader/LogoUploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { VideoLessonFormData } from './types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formData: VideoLessonFormData;
    onFormDataChange: <K extends keyof VideoLessonFormData>(
        key: K,
        value: VideoLessonFormData[K],
    ) => void;
    onSubmit: (e: React.FormEvent) => void;
    isEditing: boolean;
}

export default function OrganizationVideoLessonModal({
    open,
    onOpenChange,
    formData,
    onFormDataChange,
    onSubmit,
    isEditing,
}: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing
                            ? 'Редактировать видео урок'
                            : 'Добавить видео урок'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="video-title">Название</Label>
                        <Input
                            id="video-title"
                            value={formData.title}
                            onChange={(e) =>
                                onFormDataChange('title', e.target.value)
                            }
                            required
                            placeholder="Название урока"
                        />
                    </div>
                    <div>
                        <Label htmlFor="video-url">Ссылка на видео</Label>
                        <Input
                            id="video-url"
                            type="url"
                            value={formData.video_url}
                            onChange={(e) =>
                                onFormDataChange('video_url', e.target.value)
                            }
                            required
                            placeholder="https://youtube.com/... или https://vimeo.com/..."
                        />
                    </div>
                    <div>
                        <Label htmlFor="video-description">
                            Описание (опционально)
                        </Label>
                        <Textarea
                            id="video-description"
                            value={formData.description}
                            onChange={(e) =>
                                onFormDataChange('description', e.target.value)
                            }
                            rows={3}
                            placeholder="Краткое описание"
                        />
                    </div>
                    <div>
                        <Label>Превью (опционально)</Label>
                        <LogoUploader
                            value={
                                typeof formData.thumbnail === 'string'
                                    ? formData.thumbnail
                                    : formData.thumbnail instanceof File
                                      ? formData.thumbnail
                                      : null
                            }
                            onChange={(file) =>
                                onFormDataChange('thumbnail', file ?? null)
                            }
                        />
                    </div>
                    <div>
                        <Label htmlFor="video-sort">Порядок</Label>
                        <Input
                            id="video-sort"
                            type="number"
                            min={0}
                            value={formData.sort_order ?? 0}
                            onChange={(e) =>
                                onFormDataChange(
                                    'sort_order',
                                    parseInt(e.target.value || '0', 10),
                                )
                            }
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Отмена
                        </Button>
                        <Button type="submit">
                            {isEditing ? 'Сохранить' : 'Добавить'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

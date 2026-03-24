import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import LogoUploader from '@/components/ui/image-uploader/LogoUploader';
import MultiImageUploader from '@/components/ui/image-uploader/MultiImageUploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ClubFormData, ClubSchedule } from './types';

const SCHEDULE_DAYS: Array<{ key: keyof ClubSchedule; label: string }> = [
    { key: 'mon', label: 'Пн' },
    { key: 'tue', label: 'Вт' },
    { key: 'wed', label: 'Ср' },
    { key: 'thu', label: 'Чт' },
    { key: 'fri', label: 'Пт' },
    { key: 'sat', label: 'Сб' },
    { key: 'sun', label: 'Вс' },
];

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formData: ClubFormData;
    onFormDataChange: <K extends keyof ClubFormData>(
        key: K,
        value: ClubFormData[K],
    ) => void;
    onSubmit: (e: React.FormEvent) => void;
    isEditing: boolean;
}

export default function OrganizationClubModal({
    open,
    onOpenChange,
    formData,
    onFormDataChange,
    onSubmit,
    isEditing,
}: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing
                            ? 'Редактировать кружок/секцию'
                            : 'Добавить кружок/секцию'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="club-name">Название</Label>
                        <Input
                            id="club-name"
                            value={formData.name}
                            onChange={(e) =>
                                onFormDataChange('name', e.target.value)
                            }
                            required
                            placeholder="Например: Баскетбольная секция"
                        />
                    </div>
                    <div>
                        <Label htmlFor="club-description">
                            Описание (опционально)
                        </Label>
                        <Textarea
                            id="club-description"
                            value={formData.description}
                            onChange={(e) =>
                                onFormDataChange('description', e.target.value)
                            }
                            rows={3}
                            placeholder="Краткое описание кружка или секции"
                        />
                    </div>
                    <div>
                        <Label>Изображение (опционально)</Label>
                        <LogoUploader
                            value={
                                typeof formData.image === 'string'
                                    ? formData.image
                                    : formData.image instanceof File
                                      ? formData.image
                                      : null
                            }
                            onChange={(file) =>
                                onFormDataChange(
                                    'image',
                                    file ?? null,
                                )
                            }
                        />
                    </div>
                    <div>
                        <Label className="mb-2 block">Галерея</Label>
                        <MultiImageUploader
                            images={formData.galleryItems}
                            onChange={(images) =>
                                onFormDataChange('galleryItems', images)
                            }
                            maxFiles={10}
                            maxSize={2 * 1024 * 1024}
                            onUpload={async (file) => URL.createObjectURL(file)}
                            enableSorting
                            enableDeletion
                            showPreview
                            showFileInfo
                            layout="grid"
                            previewSize="md"
                        />
                    </div>
                    <div>
                        <Label className="mb-2 block">Расписание по дням (время)</Label>
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                            {SCHEDULE_DAYS.map(({ key, label }) => (
                                <div key={key}>
                                    <Label
                                        htmlFor={`club-schedule-${key}`}
                                        className="text-xs text-muted-foreground"
                                    >
                                        {label}
                                    </Label>
                                    <Input
                                        id={`club-schedule-${key}`}
                                        type="text"
                                        placeholder="12:00"
                                        value={
                                            (formData.schedule?.[key] as string) || ''
                                        }
                                        onChange={(e) =>
                                            onFormDataChange('schedule', {
                                                ...(formData.schedule ?? {}),
                                                [key]:
                                                    e.target.value.trim() ||
                                                    null,
                                            })
                                        }
                                        className="h-9 text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="club-sort">Порядок отображения</Label>
                        <Input
                            id="club-sort"
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

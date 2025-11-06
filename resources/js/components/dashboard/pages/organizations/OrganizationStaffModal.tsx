import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import LogoUploader from '@/components/ui/image-uploader/LogoUploader';
import { Link } from '@inertiajs/react';
import type { OrganizationDirector, StaffFormData } from './types';

interface OrganizationStaffModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formData: StaffFormData;
    onFormDataChange: <K extends keyof StaffFormData>(
        key: K,
        value: StaffFormData[K],
    ) => void;
    onSubmit: (e: React.FormEvent) => void;
    isEditing: boolean;
    organizationId: number;
    director?: OrganizationDirector;
}

export default function OrganizationStaffModal({
    open,
    onOpenChange,
    formData,
    onFormDataChange,
    onSubmit,
    isEditing,
    organizationId,
    director,
}: OrganizationStaffModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Редактировать персонал' : 'Добавить персонал'}
                    </DialogTitle>
                    <DialogDescription>
                        Заполните информацию о сотруднике организации
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_director"
                                checked={formData.is_director}
                                onCheckedChange={(checked) =>
                                    onFormDataChange(
                                        'is_director',
                                        checked === true,
                                    )
                                }
                            />
                            <Label htmlFor="is_director">
                                Директор организации
                            </Label>
                        </div>

                        {director && formData.is_director && !isEditing && (
                            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    У данной организации уже есть директор:{' '}
                                    <Link
                                        href={`/dashboard/organizations/${organizationId}/staff/${director.id}`}
                                        className="font-medium underline"
                                    >
                                        {director.full_name}
                                    </Link>
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="last_name">Фамилия *</Label>
                                <Input
                                    id="last_name"
                                    value={formData.last_name}
                                    onChange={(e) =>
                                        onFormDataChange(
                                            'last_name',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="first_name">Имя *</Label>
                                <Input
                                    id="first_name"
                                    value={formData.first_name}
                                    onChange={(e) =>
                                        onFormDataChange(
                                            'first_name',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="middle_name">Отчество</Label>
                                <Input
                                    id="middle_name"
                                    value={formData.middle_name}
                                    onChange={(e) =>
                                        onFormDataChange(
                                            'middle_name',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        {!formData.is_director && (
                            <div>
                                <Label htmlFor="position">Должность *</Label>
                                <Input
                                    id="position"
                                    value={formData.position}
                                    onChange={(e) =>
                                        onFormDataChange(
                                            'position',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    onFormDataChange('email', e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <Label htmlFor="address">Адрес</Label>
                            <Textarea
                                id="address"
                                value={formData.address}
                                onChange={(e) =>
                                    onFormDataChange('address', e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <LogoUploader
                                value={formData.photo}
                                onChange={(file) =>
                                    onFormDataChange('photo', file)
                                }
                                label="Фотография"
                                maxSize={10 * 1024 * 1024}
                                aspectRatio={null}
                                showCropControls={true}
                                onUpload={async (file) =>
                                    URL.createObjectURL(file)
                                }
                            />
                        </div>
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
                            {isEditing ? 'Сохранить' : 'Создать'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


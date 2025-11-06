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
import LogoUploader from '@/components/ui/image-uploader/LogoUploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';
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
    director: _initialDirector,
}: OrganizationStaffModalProps) {
    // При создании нового сотрудника не используем initialDirector, проверяем через API
    // При редактировании используем initialDirector только если редактируемый сотрудник не директор
    const [currentDirector, setCurrentDirector] = useState<
        OrganizationDirector | undefined
    >(undefined);
    const [isCheckingDirector, setIsCheckingDirector] = useState(false);

    // Сбрасываем директора при открытии модалки
    useEffect(() => {
        if (open) {
            // При создании нового сотрудника всегда сбрасываем
            // При редактировании тоже сбрасываем, проверка будет при клике на галочку
            setCurrentDirector(undefined);
        }
    }, [open]);

    // Проверяем директора при изменении галочки
    const handleDirectorChange = async (checked: boolean) => {
        onFormDataChange('is_director', checked === true);

        if (checked) {
            // Всегда проверяем через API при установке галочки
            setIsCheckingDirector(true);
            setCurrentDirector(undefined); // Сбрасываем перед проверкой
            try {
                const response = await fetch(
                    `/dashboard/organizations/${organizationId}/staff/check-director`,
                );
                const data = await response.json();
                if (data.has_director && data.director) {
                    setCurrentDirector(data.director);
                } else {
                    setCurrentDirector(undefined);
                }
            } catch (error) {
                console.error('Error checking director:', error);
                setCurrentDirector(undefined);
            } finally {
                setIsCheckingDirector(false);
            }
        } else {
            setCurrentDirector(undefined);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto sm:max-w-6xl">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing
                            ? 'Редактировать персонал'
                            : 'Добавить персонал'}
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
                                disabled={isCheckingDirector}
                                onCheckedChange={handleDirectorChange}
                            />
                            <Label htmlFor="is_director">
                                Директор организации
                            </Label>
                        </div>

                        {currentDirector &&
                            formData.is_director &&
                            !isEditing && (
                                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                        У данной организации уже есть директор:{' '}
                                        <i>{currentDirector.full_name}</i>
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

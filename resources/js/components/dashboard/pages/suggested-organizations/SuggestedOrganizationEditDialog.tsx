import { useEffect, useMemo, useState } from 'react';

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
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import type {
    SuggestedOrganization,
    SuggestedOrganizationsStatus,
} from './types';
import type { UpdateSuggestedOrganizationPayload } from '@/lib/api/suggested-organizations';

interface SuggestedOrganizationEditDialogProps {
    open: boolean;
    organization: SuggestedOrganization | null;
    statuses: SuggestedOrganizationsStatus[];
    isSubmitting?: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (
        organizationId: number,
        payload: UpdateSuggestedOrganizationPayload,
    ) => Promise<void> | void;
}

type FormState = {
    name: string;
    city_name: string;
    address: string;
    latitude: string;
    longitude: string;
    status: SuggestedOrganizationsStatus;
    admin_notes: string;
};

const EMPTY_STATE: FormState = {
    name: '',
    city_name: '',
    address: '',
    latitude: '',
    longitude: '',
    status: 'pending',
    admin_notes: '',
};

export const SuggestedOrganizationEditDialog = ({
    open,
    organization,
    statuses,
    isSubmitting = false,
    onOpenChange,
    onSubmit,
}: SuggestedOrganizationEditDialogProps) => {
    const [formState, setFormState] = useState<FormState>(EMPTY_STATE);

    useEffect(() => {
        if (!organization) {
            setFormState(EMPTY_STATE);
            return;
        }

        setFormState({
            name: organization.name ?? '',
            city_name: organization.city_name ?? '',
            address: organization.address ?? '',
            latitude:
                organization.latitude !== null
                    ? String(organization.latitude)
                    : '',
            longitude:
                organization.longitude !== null
                    ? String(organization.longitude)
                    : '',
            status: organization.status,
            admin_notes: organization.admin_notes ?? '',
        });
    }, [organization]);

    const nameIsValid = useMemo(
        () => formState.name.trim().length > 0,
        [formState.name],
    );

    if (!organization) {
        return null;
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const payload: UpdateSuggestedOrganizationPayload = {
            name: formState.name.trim(),
            city_name:
                formState.city_name.trim().length > 0
                    ? formState.city_name.trim()
                    : null,
            address:
                formState.address.trim().length > 0
                    ? formState.address.trim()
                    : null,
            status: formState.status,
            admin_notes:
                formState.admin_notes.trim().length > 0
                    ? formState.admin_notes.trim()
                    : null,
            latitude:
                formState.latitude.trim().length > 0
                    ? Number.parseFloat(formState.latitude.trim())
                    : null,
            longitude:
                formState.longitude.trim().length > 0
                    ? Number.parseFloat(formState.longitude.trim())
                    : null,
        };

        await onSubmit(organization.id, payload);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Редактирование школы</DialogTitle>
                    <DialogDescription>
                        Обновите информацию о предложенной школе перед
                        принятием решения
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="organization-name">Название</Label>
                            <Input
                                id="organization-name"
                                value={formState.name}
                                onChange={(event) =>
                                    setFormState((prev) => ({
                                        ...prev,
                                        name: event.target.value,
                                    }))
                                }
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="organization-city">Город</Label>
                            <Input
                                id="organization-city"
                                value={formState.city_name}
                                onChange={(event) =>
                                    setFormState((prev) => ({
                                        ...prev,
                                        city_name: event.target.value,
                                    }))
                                }
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="organization-address">
                            Адрес (опционально)
                        </Label>
                        <Input
                            id="organization-address"
                            value={formState.address}
                            onChange={(event) =>
                                setFormState((prev) => ({
                                    ...prev,
                                    address: event.target.value,
                                }))
                            }
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="organization-latitude">
                                Широта
                            </Label>
                            <Input
                                id="organization-latitude"
                                value={formState.latitude}
                                onChange={(event) =>
                                    setFormState((prev) => ({
                                        ...prev,
                                        latitude: event.target.value,
                                    }))
                                }
                                placeholder="Например, 55.7558"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="organization-longitude">
                                Долгота
                            </Label>
                            <Input
                                id="organization-longitude"
                                value={formState.longitude}
                                onChange={(event) =>
                                    setFormState((prev) => ({
                                        ...prev,
                                        longitude: event.target.value,
                                    }))
                                }
                                placeholder="Например, 37.6176"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Статус</Label>
                        <Select
                            value={formState.status}
                            onValueChange={(value) =>
                                setFormState((prev) => ({
                                    ...prev,
                                    status: value as SuggestedOrganizationsStatus,
                                }))
                            }
                            disabled={isSubmitting}
                        >
                            <SelectTrigger className="w-full md:w-[220px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status === 'pending'
                                            ? 'Ожидает рассмотрения'
                                            : status === 'approved'
                                            ? 'Одобрена'
                                            : 'Отклонена'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="organization-notes">
                            Заметки администратора
                        </Label>
                        <Textarea
                            id="organization-notes"
                            value={formState.admin_notes}
                            onChange={(event) =>
                                setFormState((prev) => ({
                                    ...prev,
                                    admin_notes: event.target.value,
                                }))
                            }
                            rows={4}
                            disabled={isSubmitting}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            disabled={!nameIsValid || isSubmitting}
                        >
                            Сохранить изменения
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};



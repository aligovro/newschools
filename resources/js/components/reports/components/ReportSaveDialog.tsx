import { useCallback, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ReportSaveDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reportType: string;
    onSubmit: (data: {
        title: string;
        description?: string;
        visibility: string;
        status: string;
    }) => Promise<void>;
}

const visibilityOptions = [
    { value: 'private', label: 'Только я' },
    { value: 'organization', label: 'Организация' },
    { value: 'public', label: 'Публично' },
];

const statusOptions = [
    { value: 'draft', label: 'Черновик' },
    { value: 'ready', label: 'Готов' },
];

export function ReportSaveDialog({
    open,
    onOpenChange,
    reportType,
    onSubmit,
}: ReportSaveDialogProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState('organization');
    const [status, setStatus] = useState('draft');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClose = useCallback(() => {
        if (isSubmitting) return;
        setTitle('');
        setDescription('');
        setVisibility('organization');
        setStatus('draft');
        setError(null);
        onOpenChange(false);
    }, [isSubmitting, onOpenChange]);

    const handleSubmit = useCallback(async () => {
        if (!title.trim()) {
            setError('Укажите название отчета');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await onSubmit({
                title: title.trim(),
                description: description.trim() || undefined,
                visibility,
                status,
            });
            handleClose();
        } catch (err: any) {
            console.error(err);
            setError(
                err?.response?.data?.message ??
                    'Не удалось сохранить отчет. Попробуйте позже.',
            );
        } finally {
            setIsSubmitting(false);
        }
    }, [title, description, visibility, status, onSubmit, handleClose]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Сохранение отчета</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">
                            Название отчета
                        </label>
                        <Input
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            placeholder="Например, Доходы за квартал"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">
                            Описание (необязательно)
                        </label>
                        <Textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            rows={4}
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">
                                Видимость
                            </label>
                            <Select
                                value={visibility}
                                onValueChange={setVisibility}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {visibilityOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">
                                Статус
                            </label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
                        Тип отчета: <strong>{reportType}</strong>
                    </div>

                    {error && (
                        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Отмена
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}



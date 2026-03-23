import React, { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface ClubSignUpPayload {
    clubId: number;
    clubName: string;
    organizationId?: number;
    name: string;
    phone: string;
    comment: string;
}

export interface ClubSignUpModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    club: { id: number; name: string };
    organizationId?: number;
    onSubmit?: (payload: ClubSignUpPayload) => void | Promise<void>;
}

export const ClubSignUpModal: React.FC<ClubSignUpModalProps> = ({
    open,
    onOpenChange,
    club,
    organizationId,
    onSubmit,
}) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError(null);
            setSubmitting(true);
            try {
                await onSubmit?.({
                    clubId: club.id,
                    clubName: club.name,
                    organizationId,
                    name: name.trim(),
                    phone: phone.trim(),
                    comment: comment.trim(),
                });
                setSuccess(true);
                setName('');
                setPhone('');
                setComment('');
                setTimeout(() => {
                    setSuccess(false);
                    onOpenChange(false);
                }, 1500);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Произошла ошибка. Попробуйте ещё раз.');
            } finally {
                setSubmitting(false);
            }
        },
        [club.id, club.name, organizationId, name, phone, comment, onSubmit, onOpenChange]
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Записаться в секцию</DialogTitle>
                    <DialogDescription>{club.name}</DialogDescription>
                </DialogHeader>
                {success ? (
                    <div className="py-6 text-center">
                        <p className="text-lg font-semibold text-green-700">Заявка отправлена!</p>
                        <p className="mt-1 text-sm text-gray-500">Администратор свяжется с вами.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                            <label className="flex flex-col">
                                Имя
                                <Input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ваше имя"
                                    required
                                    className="mt-1"
                                />
                            </label>
                            <label className="flex flex-col">
                                Телефон
                                <Input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+7 (999) 000-00-00"
                                    required
                                    className="mt-1"
                                />
                            </label>
                            <label className="flex flex-col">
                                Комментарий
                                <Textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Необязательно"
                                    rows={3}
                                    className="mt-1"
                                />
                            </label>
                        </div>
                        {error && (
                            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                                {error}
                            </p>
                        )}
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Отмена
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Отправка…' : 'Отправить заявку'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ClubSignUpModal;

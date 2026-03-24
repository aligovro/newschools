import type { ClubSignUpPayload } from '@/components/clubs/clubSignUpTypes';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PersonalDataConsent } from '@/components/ui/personal-data-consent/PersonalDataConsent';
import { Textarea } from '@/components/ui/textarea';
import React, { useCallback, useEffect, useState } from 'react';

export interface ClubSignUpFormProps {
    club: { id: number; name: string };
    organizationId?: number;
    onSubmit?: (payload: ClubSignUpPayload) => void | Promise<void>;
    variant?: 'modal' | 'sidebar';
    submitLabel?: string;
    className?: string;
    /** Только variant=&quot;modal&quot;: кнопка Отмена */
    onCancel?: () => void;
    /** После успешной отправки (modal: обычно закрыть окно с задержкой) */
    onSubmitted?: () => void;
}

export function ClubSignUpForm({
    club,
    organizationId,
    onSubmit,
    variant = 'sidebar',
    submitLabel,
    className = '',
    onCancel,
    onSubmitted,
}: ClubSignUpFormProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [comment, setComment] = useState('');
    const [consent, setConsent] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const defaultSubmit =
        variant === 'modal' ? 'Отправить заявку' : 'Оставить заявку';

    useEffect(() => {
        if (!success || variant !== 'modal') return;
        const t = window.setTimeout(() => onSubmitted?.(), 1500);
        return () => window.clearTimeout(t);
    }, [success, variant, onSubmitted]);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!consent) {
                setError(
                    'Необходимо принять условия обработки персональных данных',
                );
                return;
            }
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
                setConsent(false);
                if (variant === 'sidebar') {
                    onSubmitted?.();
                }
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Произошла ошибка. Попробуйте ещё раз.',
                );
            } finally {
                setSubmitting(false);
            }
        },
        [
            club.id,
            club.name,
            organizationId,
            name,
            phone,
            comment,
            consent,
            onSubmit,
            onSubmitted,
            variant,
        ],
    );

    if (success && variant === 'sidebar') {
        return (
            <div className={`club-signup-form club-signup-form--success ${className}`}>
                <p className="club-signup-form__success-title">Заявка отправлена</p>
                <p className="club-signup-form__success-text">
                    Администратор свяжется с вами.
                </p>
            </div>
        );
    }

    if (success && variant === 'modal') {
        return (
            <div className="py-6 text-center">
                <p className="text-lg font-semibold text-green-700">
                    Заявка отправлена!
                </p>
                <p className="mt-1 text-sm text-gray-500">
                    Администратор свяжется с вами.
                </p>
            </div>
        );
    }

    const fields =
        variant === 'modal' ? (
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
                <PersonalDataConsent
                    id="club-signup-consent-modal"
                    checked={consent}
                    onChange={setConsent}
                    policyHref="/policy/"
                    className="text-muted-foreground text-xs"
                />
            </div>
        ) : (
            <>
                <h2 className="club-signup-form__title">
                    Запишите вашего ребенка на кружок
                </h2>
                <div className="club-signup-form__field">
                    <Label
                        htmlFor="club-signup-name"
                        className="club-signup-form__label"
                    >
                        Ваше имя
                    </Label>
                    <Input
                        id="club-signup-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ваше имя"
                        required
                        className="club-signup-form__input"
                    />
                </div>
                <div className="club-signup-form__field">
                    <Label
                        htmlFor="club-signup-phone"
                        className="club-signup-form__label"
                    >
                        Номер телефона
                    </Label>
                    <Input
                        id="club-signup-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+7 (999) 000-00-00"
                        required
                        className="club-signup-form__input"
                    />
                </div>
                <div className="club-signup-form__field">
                    <Label
                        htmlFor="club-signup-comment"
                        className="club-signup-form__label"
                    >
                        Комментарий
                    </Label>
                    <Textarea
                        id="club-signup-comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Необязательно"
                        rows={3}
                        className="club-signup-form__textarea"
                    />
                </div>
                <PersonalDataConsent
                    id="club-signup-consent-sidebar"
                    checked={consent}
                    onChange={setConsent}
                    policyHref="/policy/"
                    className="club-signup-form__consent"
                />
            </>
        );

    return (
        <form
            onSubmit={handleSubmit}
            className={
                variant === 'modal'
                    ? `flex flex-col gap-4 ${className}`
                    : `club-signup-form ${className}`
            }
        >
            {fields}
            {error && (
                <p
                    className={
                        variant === 'sidebar'
                            ? 'club-signup-form__error'
                            : 'rounded-md bg-red-50 px-3 py-2 text-sm text-red-600'
                    }
                >
                    {error}
                </p>
            )}
            {variant === 'modal' ? (
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                    >
                        Отмена
                    </Button>
                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Отправка…' : submitLabel ?? defaultSubmit}
                    </Button>
                </DialogFooter>
            ) : (
                <button
                    type="submit"
                    className="club-signup-form__submit"
                    disabled={submitting}
                >
                    {submitting ? 'Отправка…' : submitLabel ?? defaultSubmit}
                </button>
            )}
        </form>
    );
}

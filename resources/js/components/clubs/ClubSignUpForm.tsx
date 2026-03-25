import type { ClubSignUpPayload } from '@/components/clubs/clubSignUpTypes';
import RussianPhoneInput from '@/components/ui/RussianPhoneInput';
import { PersonalDataConsent } from '@/components/ui/personal-data-consent/PersonalDataConsent';
import React, { useCallback, useEffect, useId, useState } from 'react';

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

function isCompleteRussianMobile(phone: string): boolean {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 11 && digits.startsWith('7');
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
    const uid = useId().replace(/:/g, '');
    const fieldSuffix = variant === 'modal' ? 'm' : 's';
    const nameId = `club-signup-name-${fieldSuffix}-${uid}`;
    const phoneId = `club-signup-phone-${fieldSuffix}-${uid}`;
    const emailId = `club-signup-email-${fieldSuffix}-${uid}`;
    const commentId = `club-signup-comment-${fieldSuffix}-${uid}`;
    const consentId =
        variant === 'modal'
            ? `club-signup-consent-modal-${uid}`
            : `club-signup-consent-sidebar-${uid}`;

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
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
            if (!name.trim()) {
                setError('Укажите имя');
                return;
            }
            if (!isCompleteRussianMobile(phone)) {
                setError('Укажите полный номер телефона');
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
                    email: email.trim(),
                    comment: comment.trim(),
                });
                setSuccess(true);
                setName('');
                setPhone('');
                setEmail('');
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
            email,
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
            <div className={`club-signup-form club-signup-form--success ${className}`}>
                <p className="club-signup-form__success-title">Заявка отправлена</p>
                <p className="club-signup-form__success-text">
                    Администратор свяжется с вами.
                </p>
            </div>
        );
    }

    const fields = (
        <>
            {variant === 'sidebar' && (
                <h2 className="club-signup-form__title">
                    Запишите вашего ребенка на кружок
                </h2>
            )}
            <div className="club-signup-form__control">
                <label
                    htmlFor={nameId}
                    className="club-signup-form__control-label"
                >
                    Ваше имя
                </label>
                <input
                    id={nameId}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ваше имя"
                    autoComplete="name"
                    className="club-signup-form__control-input"
                />
            </div>
            <div className="club-signup-form__control">
                <label
                    htmlFor={phoneId}
                    className="club-signup-form__control-label"
                >
                    Номер телефона
                </label>
                <RussianPhoneInput
                    id={phoneId}
                    value={phone}
                    onValueChange={setPhone}
                    className="club-signup-form__phone"
                    autoComplete="tel"
                />
            </div>
            <div className="club-signup-form__control">
                <label
                    htmlFor={emailId}
                    className="club-signup-form__control-label"
                >
                    Электронная почта
                </label>
                <input
                    id={emailId}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="myname@mail.com"
                    autoComplete="email"
                    className="club-signup-form__control-input"
                />
            </div>
            {variant === 'modal' && (
                <div className="club-signup-form__control club-signup-form__control--textarea">
                    <label
                        htmlFor={commentId}
                        className="club-signup-form__control-label"
                    >
                        Комментарий
                    </label>
                    <textarea
                        id={commentId}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Необязательно"
                        rows={3}
                        className="club-signup-form__control-textarea"
                    />
                </div>
            )}
            <PersonalDataConsent
                id={consentId}
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
                    ? `club-signup-form club-signup-form--modal ${className}`.trim()
                    : `club-signup-form ${className}`.trim()
            }
            noValidate
        >
            {fields}
            {error && (
                <p className="club-signup-form__error">{error}</p>
            )}
            {variant === 'modal' ? (
                <div className="club-signup-form__actions">
                    <button
                        type="button"
                        className="club-signup-form__btn-cancel"
                        onClick={onCancel}
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        className="club-signup-form__submit club-signup-form__submit--modal"
                        disabled={submitting}
                    >
                        {submitting ? 'Отправка…' : submitLabel ?? defaultSubmit}
                    </button>
                </div>
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

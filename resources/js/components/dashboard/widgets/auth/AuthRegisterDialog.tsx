import { memo, useCallback } from 'react';

import RussianPhoneInput from '@/components/ui/RussianPhoneInput';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { type RegisterField, type RegisterFormState } from './useAuthModals';

const PASSWORD_AUTOCOMPLETE = 'new-password';
const NAME_AUTOCOMPLETE = 'name';
const EMAIL_AUTOCOMPLETE = 'email';

interface AuthRegisterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    state: RegisterFormState;
    onFieldChange: (field: RegisterField, value: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
    globalError?: string | null;
    organizationId?: number | null;
    siteId?: number | null;
}

export const AuthRegisterDialog = memo(
    ({
        open,
        onOpenChange,
        state,
        onFieldChange,
        onSubmit,
        isLoading,
        globalError,
        organizationId,
        siteId,
    }: AuthRegisterDialogProps) => {
        const handleSubmit = useCallback(
            (event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                onSubmit();
            },
            [onSubmit],
        );

        const generalError = state.errors.general ?? globalError ?? null;

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Регистрация</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    id="auth-register-name"
                                    value={state.name}
                                    onChange={(event) =>
                                        onFieldChange(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                    autoComplete={NAME_AUTOCOMPLETE}
                                    placeholder="Имя и фамилия"
                                    className="profile-section__input w-full rounded-[10px] border border-[#e8ecf3] px-4 pb-3 pt-[33px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                                <label
                                    htmlFor="auth-register-name"
                                    className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                                >
                                    Имя
                                </label>
                            </div>
                            {state.errors.name && (
                                <p className="profile-section__field-error">
                                    {state.errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    id="auth-register-email"
                                    type="email"
                                    inputMode="email"
                                    autoComplete={EMAIL_AUTOCOMPLETE}
                                    value={state.email}
                                    onChange={(event) =>
                                        onFieldChange(
                                            'email',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="email@example.com"
                                    className="profile-section__input w-full rounded-[10px] border border-[#e8ecf3] px-4 pb-3 pt-[33px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                                <label
                                    htmlFor="auth-register-email"
                                    className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                                >
                                    Email (необязательно)
                                </label>
                            </div>
                            {state.errors.email && (
                                <p className="profile-section__field-error">
                                    {state.errors.email}
                                </p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="relative">
                                <RussianPhoneInput
                                    id="auth-register-phone"
                                    value={state.phone}
                                    onValueChange={(value) =>
                                        onFieldChange('phone', value)
                                    }
                                    autoComplete="tel"
                                    className="phone-input--with-label"
                                />
                                <label
                                    htmlFor="auth-register-phone"
                                    className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                                >
                                    Телефон (необязательно)
                                </label>
                            </div>
                            {state.errors.phone && (
                                <p className="profile-section__field-error">
                                    {state.errors.phone}
                                </p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    id="auth-register-password"
                                    type="password"
                                    autoComplete={PASSWORD_AUTOCOMPLETE}
                                    value={state.password}
                                    onChange={(event) =>
                                        onFieldChange(
                                            'password',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Пароль"
                                    className="profile-section__input w-full rounded-[10px] border border-[#e8ecf3] px-4 pb-3 pt-[33px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                                <label
                                    htmlFor="auth-register-password"
                                    className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                                >
                                    Пароль
                                </label>
                            </div>
                            {state.errors.password && (
                                <p className="profile-section__field-error">
                                    {state.errors.password}
                                </p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    id="auth-register-password-confirm"
                                    type="password"
                                    autoComplete="new-password"
                                    value={state.passwordConfirmation}
                                    onChange={(event) =>
                                        onFieldChange(
                                            'passwordConfirmation',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Повторите пароль"
                                    className="profile-section__input w-full rounded-[10px] border border-[#e8ecf3] px-4 pb-3 pt-[33px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                                <label
                                    htmlFor="auth-register-password-confirm"
                                    className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                                >
                                    Подтверждение пароля
                                </label>
                            </div>
                            {state.errors.passwordConfirmation && (
                                <p className="profile-section__field-error">
                                    {state.errors.passwordConfirmation}
                                </p>
                            )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Укажите хотя бы один из контактов: email или
                            телефон.
                        </p>

                        {generalError && (
                            <div className="bg-destructive/10 rounded-md p-2 text-sm text-destructive">
                                {generalError}
                            </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>
                                organization_id: {organizationId ?? '-'}
                            </span>
                            <span>site_id: {siteId ?? '-'}</span>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                className="rounded-[10px] border border-[#e8ecf3] px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                                onClick={() => onOpenChange(false)}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className="flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#96bdff] to-[#3259ff] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? 'Регистрация...'
                                    : 'Зарегистрироваться'}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        );
    },
);

AuthRegisterDialog.displayName = 'AuthRegisterDialog';

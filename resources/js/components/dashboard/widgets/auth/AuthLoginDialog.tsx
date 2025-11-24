import { memo, useCallback } from 'react';

import RussianPhoneInput from '@/components/ui/RussianPhoneInput';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import {
    type LoginField,
    type LoginFormState,
    type LoginMode,
} from './useAuthModals';

const PASSWORD_AUTOCOMPLETE = 'current-password';
const EMAIL_AUTOCOMPLETE = 'email';
const PHONE_AUTOCOMPLETE = 'tel';

interface AuthLoginDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    state: LoginFormState;
    onFieldChange: (field: LoginField, value: string | boolean) => void;
    onSubmit: () => void;
    isLoading: boolean;
    globalError?: string | null;
}

export const AuthLoginDialog = memo(
    ({
        open,
        onOpenChange,
        state,
        onFieldChange,
        onSubmit,
        isLoading,
        globalError,
    }: AuthLoginDialogProps) => {
        const handleSubmit = useCallback(
            (event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                onSubmit();
            },
            [onSubmit],
        );

        const handleModeChange = useCallback(
            (value: string) => {
                onFieldChange('mode', value as LoginMode);
            },
            [onFieldChange],
        );

        const handleRememberChange = useCallback(
            (checked: boolean | 'indeterminate') => {
                onFieldChange('remember', checked === true);
            },
            [onFieldChange],
        );

        const identifierError = state.errors.identifier;
        const passwordError = state.errors.password;
        const generalError = state.errors.general ?? globalError ?? null;

        const emailValue = state.mode === 'email' ? state.identifier : '';
        const phoneValue = state.mode === 'phone' ? state.identifier : '';

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Вход</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3 text-xs">
                                <span className="text-[11px] text-muted-foreground">
                                    Способ входа
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        className={`rounded-full px-3 py-1 ${
                                            state.mode === 'email'
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'bg-slate-50 text-slate-600'
                                        }`}
                                        onClick={() =>
                                            handleModeChange('email')
                                        }
                                    >
                                        По email
                                    </button>
                                    <button
                                        type="button"
                                        className={`rounded-full px-3 py-1 ${
                                            state.mode === 'phone'
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'bg-slate-50 text-slate-600'
                                        }`}
                                        onClick={() =>
                                            handleModeChange('phone')
                                        }
                                    >
                                        По телефону
                                    </button>
                                </div>
                            </div>

                            {state.mode === 'email' ? (
                                <div className="relative">
                                    <input
                                        id="auth-login-email"
                                        type="email"
                                        inputMode="email"
                                        autoComplete={EMAIL_AUTOCOMPLETE}
                                        value={emailValue}
                                        onChange={(event) =>
                                            onFieldChange(
                                                'identifier',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="email@example.com"
                                        className="profile-section__input w-full rounded-[10px] border border-[#e8ecf3] px-4 pb-3 pt-[33px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    />
                                    <label
                                        htmlFor="auth-login-email"
                                        className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                                    >
                                        Email
                                    </label>
                                </div>
                            ) : (
                                <div className="relative">
                                    <RussianPhoneInput
                                        id="auth-login-phone"
                                        value={phoneValue}
                                        onValueChange={(value) =>
                                            onFieldChange('identifier', value)
                                        }
                                        autoComplete={PHONE_AUTOCOMPLETE}
                                        className="phone-input--with-label"
                                    />
                                    <label
                                        htmlFor="auth-login-phone"
                                        className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                                    >
                                        Телефон
                                    </label>
                                </div>
                            )}
                            {identifierError && (
                                <p className="profile-section__field-error">
                                    {identifierError}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <input
                                    id="auth-login-password"
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
                                    htmlFor="auth-login-password"
                                    className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                                >
                                    Пароль
                                </label>
                            </div>
                            {passwordError && (
                                <p className="profile-section__field-error">
                                    {passwordError}
                                </p>
                            )}
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={state.remember}
                                onCheckedChange={handleRememberChange}
                                id="auth-login-remember"
                            />
                            <span>Запомнить меня</span>
                        </label>

                        {generalError && (
                            <div className="bg-destructive/10 rounded-md p-2 text-sm text-destructive">
                                {generalError}
                            </div>
                        )}

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
                                {isLoading ? 'Вход...' : 'Войти'}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        );
    },
);

AuthLoginDialog.displayName = 'AuthLoginDialog';

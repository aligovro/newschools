import { memo, useCallback } from 'react';

import RussianPhoneInput from '@/components/ui/RussianPhoneInput';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
    type RegisterField,
    type RegisterFormState,
} from './useAuthModals';

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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="auth-register-name">Имя</Label>
                            <Input
                                id="auth-register-name"
                                value={state.name}
                                onChange={(event) =>
                                    onFieldChange('name', event.target.value)
                                }
                                autoComplete={NAME_AUTOCOMPLETE}
                                placeholder="Введите имя"
                            />
                            {state.errors.name && (
                                <p className="text-sm text-destructive">
                                    {state.errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="auth-register-email">
                                Email (необязательно)
                            </Label>
                            <Input
                                id="auth-register-email"
                                type="email"
                                inputMode="email"
                                autoComplete={EMAIL_AUTOCOMPLETE}
                                value={state.email}
                                onChange={(event) =>
                                    onFieldChange('email', event.target.value)
                                }
                                placeholder="user@example.com"
                            />
                            {state.errors.email && (
                                <p className="text-sm text-destructive">
                                    {state.errors.email}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="auth-register-phone">
                                Телефон (необязательно)
                            </Label>
                            <RussianPhoneInput
                                id="auth-register-phone"
                                value={state.phone}
                                onValueChange={(value) =>
                                    onFieldChange('phone', value)
                                }
                                autoComplete="tel"
                            />
                            {state.errors.phone && (
                                <p className="text-sm text-destructive">
                                    {state.errors.phone}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="auth-register-password">Пароль</Label>
                            <Input
                                id="auth-register-password"
                                type="password"
                                autoComplete={PASSWORD_AUTOCOMPLETE}
                                value={state.password}
                                onChange={(event) =>
                                    onFieldChange('password', event.target.value)
                                }
                                placeholder="Введите пароль"
                            />
                            {state.errors.password && (
                                <p className="text-sm text-destructive">
                                    {state.errors.password}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="auth-register-password-confirm">
                                Подтверждение пароля
                            </Label>
                            <Input
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
                            />
                            {state.errors.passwordConfirmation && (
                                <p className="text-sm text-destructive">
                                    {state.errors.passwordConfirmation}
                                </p>
                            )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Укажите хотя бы один из контактов: email или телефон.
                        </p>

                        {generalError && (
                            <div className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                                {generalError}
                            </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>organization_id: {organizationId ?? '-'}</span>
                            <span>site_id: {siteId ?? '-'}</span>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                className="btn-outline-primary auth-btn"
                                onClick={() => onOpenChange(false)}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className="btn-accent auth-btn"
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



import { memo, useCallback } from 'react';

import RussianPhoneInput from '@/components/ui/RussianPhoneInput';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Способ входа</Label>
                            <Tabs
                                value={state.mode}
                                onValueChange={handleModeChange}
                            >
                                <TabsList className="grid grid-cols-2">
                                    <TabsTrigger value="email">
                                        Email
                                    </TabsTrigger>
                                    <TabsTrigger value="phone">
                                        Телефон
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="email" forceMount>
                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="auth-login-email"
                                            className="text-xs text-muted-foreground"
                                        >
                                            Электронная почта
                                        </Label>
                                        <Input
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
                                            placeholder={
                                                'user@example.com'
                                            }
                                        />
                                    </div>
                                </TabsContent>
                                <TabsContent value="phone" forceMount>
                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="auth-login-phone"
                                            className="text-xs text-muted-foreground"
                                        >
                                            Номер телефона
                                        </Label>
                                        <RussianPhoneInput
                                            id="auth-login-phone"
                                            value={phoneValue}
                                            onValueChange={(value) =>
                                                onFieldChange(
                                                    'identifier',
                                                    value,
                                                )
                                            }
                                            autoComplete={PHONE_AUTOCOMPLETE}
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>
                            {identifierError && (
                                <p className="text-sm text-destructive">
                                    {identifierError}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="auth-login-password">Пароль</Label>
                            <Input
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
                                placeholder="Введите пароль"
                            />
                            {passwordError && (
                                <p className="text-sm text-destructive">
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
                            <div className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                                {generalError}
                            </div>
                        )}

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



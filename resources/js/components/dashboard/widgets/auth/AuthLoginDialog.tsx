import { memo, useCallback, useEffect, useRef, useState } from 'react';

import RussianPhoneInput from '@/components/ui/RussianPhoneInput';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import {
    type ForgotPasswordState,
    type LoginField,
    type LoginFormState,
    type LoginMode,
    type LoginView,
    type PhoneCodeState,
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
    onRequestPhoneCode: () => void;
    onVerifyPhoneCode: () => void;
    onForgotPassword: () => void;
    onPhoneCodeStateChange: (payload: Partial<PhoneCodeState>) => void;
    onForgotPasswordStateChange: (payload: Partial<ForgotPasswordState>) => void;
    isLoading: boolean;
    globalError?: string | null;
}

const TITLES: Record<LoginView, string> = {
    credentials: 'Вход',
    phone_code: 'Вход по коду',
    forgot_password: 'Восстановление пароля',
};

const FloatingInput = memo(({
    id,
    type = 'text',
    inputMode,
    autoComplete,
    value,
    onChange,
    placeholder,
    label,
    maxLength,
    autoFocus,
}: {
    id: string;
    type?: string;
    inputMode?: 'email' | 'numeric' | 'tel' | 'text';
    autoComplete?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label: string;
    maxLength?: number;
    autoFocus?: boolean;
}) => (
    <div className="relative">
        <input
            id={id}
            type={type}
            inputMode={inputMode}
            autoComplete={autoComplete}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            autoFocus={autoFocus}
            className="profile-section__input w-full rounded-[10px] border border-[#e8ecf3] px-4 pb-3 pt-[33px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <label
            htmlFor={id}
            className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
        >
            {label}
        </label>
    </div>
));
FloatingInput.displayName = 'FloatingInput';

const FieldError = memo(({ message }: { message?: string }) =>
    message ? <p className="profile-section__field-error">{message}</p> : null,
);
FieldError.displayName = 'FieldError';

const GeneralError = memo(({ message }: { message?: string | null }) =>
    message ? (
        <div className="bg-destructive/10 rounded-md p-2 text-sm text-destructive">
            {message}
        </div>
    ) : null,
);
GeneralError.displayName = 'GeneralError';

const SuccessMessage = memo(({ message }: { message?: string | null }) =>
    message ? (
        <div className="rounded-md bg-green-50 p-2 text-sm text-green-700">
            {message}
        </div>
    ) : null,
);
SuccessMessage.displayName = 'SuccessMessage';

const SubmitButton = memo(({
    isLoading,
    label,
    loadingLabel,
}: {
    isLoading: boolean;
    label: string;
    loadingLabel: string;
}) => (
    <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#96bdff] to-[#3259ff] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isLoading}
    >
        {isLoading ? loadingLabel : label}
    </button>
));
SubmitButton.displayName = 'SubmitButton';

const BackLink = memo(({ onClick, label }: { onClick: () => void; label?: string }) => (
    <button
        type="button"
        onClick={onClick}
        className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
    >
        ← {label ?? 'Назад'}
    </button>
));
BackLink.displayName = 'BackLink';

const ResendTimer = memo(({
    seconds,
    onResend,
    isLoading,
}: {
    seconds: number;
    onResend: () => void;
    isLoading: boolean;
}) => {
    const [countdown, setCountdown] = useState(seconds);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        setCountdown(seconds);
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (seconds <= 0) return;

        intervalRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [seconds]);

    if (countdown > 0) {
        return (
            <span className="text-xs text-muted-foreground">
                Повторная отправка через {countdown} сек.
            </span>
        );
    }

    return (
        <button
            type="button"
            onClick={onResend}
            disabled={isLoading}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
        >
            Отправить код повторно
        </button>
    );
});
ResendTimer.displayName = 'ResendTimer';

/* ──── Credential view (default login) ──── */
const CredentialsView = memo(({
    state,
    onFieldChange,
    isLoading,
}: {
    state: LoginFormState;
    onFieldChange: (field: LoginField, value: string | boolean) => void;
    isLoading: boolean;
}) => {
    const handleModeChange = useCallback(
        (mode: string) => onFieldChange('mode', mode as LoginMode),
        [onFieldChange],
    );

    const handleRememberChange = useCallback(
        (checked: boolean | 'indeterminate') => onFieldChange('remember', checked === true),
        [onFieldChange],
    );

    const emailValue = state.mode === 'email' ? state.identifier : '';
    const phoneValue = state.mode === 'phone' ? state.identifier : '';

    return (
        <>
            <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] text-muted-foreground">Способ входа</span>
                    <div className="flex gap-2">
                        {(['email', 'phone'] as const).map((m) => (
                            <button
                                key={m}
                                type="button"
                                className={`rounded-full px-3 py-1 transition-colors ${
                                    state.mode === m
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                                onClick={() => handleModeChange(m)}
                            >
                                {m === 'email' ? 'По email' : 'По телефону'}
                            </button>
                        ))}
                    </div>
                </div>

                {state.mode === 'email' ? (
                    <FloatingInput
                        id="auth-login-email"
                        type="email"
                        inputMode="email"
                        autoComplete={EMAIL_AUTOCOMPLETE}
                        value={emailValue}
                        onChange={(v) => onFieldChange('identifier', v)}
                        placeholder="email@example.com"
                        label="Email"
                    />
                ) : (
                    <div className="relative">
                        <RussianPhoneInput
                            id="auth-login-phone"
                            value={phoneValue}
                            onValueChange={(v) => onFieldChange('identifier', v)}
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
                <FieldError message={state.errors.identifier} />
            </div>

            <div className="space-y-2">
                <FloatingInput
                    id="auth-login-password"
                    type="password"
                    autoComplete={PASSWORD_AUTOCOMPLETE}
                    value={state.password}
                    onChange={(v) => onFieldChange('password', v)}
                    placeholder="Пароль"
                    label="Пароль"
                />
                <FieldError message={state.errors.password} />
            </div>

            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                        checked={state.remember}
                        onCheckedChange={handleRememberChange}
                        id="auth-login-remember"
                    />
                    <span>Запомнить</span>
                </label>
                <div className="flex gap-3">
                    {state.mode === 'phone' && (
                        <button
                            type="button"
                            onClick={() => onFieldChange('view', 'phone_code')}
                            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            Войти по коду
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => onFieldChange('view', 'forgot_password')}
                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        Забыли пароль?
                    </button>
                </div>
            </div>

            <SubmitButton isLoading={isLoading} label="Войти" loadingLabel="Вход..." />
        </>
    );
});
CredentialsView.displayName = 'CredentialsView';

/* ──── Phone code view ──── */
const PhoneCodeView = memo(({
    state,
    onFieldChange,
    onRequestPhoneCode,
    onVerifyPhoneCode,
    isLoading,
}: {
    state: LoginFormState;
    onFieldChange: (field: LoginField, value: string | boolean) => void;
    onRequestPhoneCode: () => void;
    onVerifyPhoneCode: () => void;
    isLoading: boolean;
}) => {
    const hasToken = Boolean(state.phoneCode.token);
    const phoneValue = state.mode === 'phone' ? state.identifier : state.identifier;

    if (!hasToken) {
        return (
            <>
                <BackLink onClick={() => onFieldChange('view', 'credentials')} />
                <p className="text-sm text-muted-foreground">
                    Введите номер телефона. Мы отправим SMS с кодом для входа.
                </p>
                <div className="relative">
                    <RussianPhoneInput
                        id="auth-phone-code-phone"
                        value={phoneValue}
                        onValueChange={(v) => onFieldChange('identifier', v)}
                        autoComplete={PHONE_AUTOCOMPLETE}
                        className="phone-input--with-label"
                    />
                    <label
                        htmlFor="auth-phone-code-phone"
                        className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                    >
                        Телефон
                    </label>
                </div>
                <FieldError message={state.errors.identifier} />
                <SubmitButton isLoading={isLoading} label="Получить код" loadingLabel="Отправка..." />
            </>
        );
    }

    return (
        <>
            <BackLink onClick={() => onFieldChange('view', 'credentials')} />
            <p className="text-sm text-muted-foreground">
                Код отправлен на{' '}
                <span className="font-medium text-gray-900">{state.phoneCode.maskedPhone}</span>
            </p>
            <FloatingInput
                id="auth-phone-code-input"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={state.phoneCode.code}
                onChange={(v) => onFieldChange('code', v.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                label="Код из SMS"
                maxLength={6}
                autoFocus
            />
            <FieldError message={state.errors.code} />
            <div className="flex items-center justify-between">
                <ResendTimer
                    seconds={state.phoneCode.resendAvailableIn}
                    onResend={onRequestPhoneCode}
                    isLoading={isLoading}
                />
            </div>
            <SubmitButton isLoading={isLoading} label="Подтвердить" loadingLabel="Проверка..." />
        </>
    );
});
PhoneCodeView.displayName = 'PhoneCodeView';

/* ──── Forgot password view ──── */
const ForgotPasswordView = memo(({
    state,
    onFieldChange,
    onForgotPasswordStateChange,
    isLoading,
}: {
    state: LoginFormState;
    onFieldChange: (field: LoginField, value: string | boolean) => void;
    onForgotPasswordStateChange: (payload: Partial<ForgotPasswordState>) => void;
    isLoading: boolean;
}) => {
    const { forgotPassword } = state;

    if (forgotPassword.sent) {
        return (
            <>
                <BackLink onClick={() => onFieldChange('view', 'credentials')} />
                <SuccessMessage message={forgotPassword.message} />
                <button
                    type="button"
                    onClick={() => onFieldChange('view', 'credentials')}
                    className="w-full rounded-[10px] border border-[#e8ecf3] px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                    Вернуться ко входу
                </button>
            </>
        );
    }

    const isEmail = state.mode === 'email';

    return (
        <>
            <BackLink onClick={() => onFieldChange('view', 'credentials')} />
            <p className="text-sm text-muted-foreground">
                {isEmail
                    ? 'Введите email. Мы отправим ссылку для сброса пароля.'
                    : 'Введите номер телефона. Ссылка для сброса будет отправлена на привязанный email.'}
            </p>
            {isEmail ? (
                <FloatingInput
                    id="auth-forgot-email"
                    type="email"
                    inputMode="email"
                    autoComplete={EMAIL_AUTOCOMPLETE}
                    value={forgotPassword.identifier}
                    onChange={(v) => onForgotPasswordStateChange({ identifier: v })}
                    placeholder="email@example.com"
                    label="Email"
                    autoFocus
                />
            ) : (
                <div className="relative">
                    <RussianPhoneInput
                        id="auth-forgot-phone"
                        value={forgotPassword.identifier}
                        onValueChange={(v) => onForgotPasswordStateChange({ identifier: v })}
                        autoComplete={PHONE_AUTOCOMPLETE}
                        className="phone-input--with-label"
                    />
                    <label
                        htmlFor="auth-forgot-phone"
                        className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                    >
                        Телефон
                    </label>
                </div>
            )}
            <FieldError message={state.errors.identifier} />
            <SubmitButton
                isLoading={isLoading}
                label="Отправить ссылку"
                loadingLabel="Отправка..."
            />
        </>
    );
});
ForgotPasswordView.displayName = 'ForgotPasswordView';

/* ──── Main Dialog ──── */
export const AuthLoginDialog = memo(
    ({
        open,
        onOpenChange,
        state,
        onFieldChange,
        onSubmit,
        onRequestPhoneCode,
        onVerifyPhoneCode,
        onForgotPassword,
        onPhoneCodeStateChange: _onPhoneCodeStateChange,
        onForgotPasswordStateChange,
        isLoading,
        globalError,
    }: AuthLoginDialogProps) => {
        const handleSubmit = useCallback(
            (event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                switch (state.view) {
                    case 'credentials':
                        onSubmit();
                        break;
                    case 'phone_code':
                        if (state.phoneCode.token) {
                            onVerifyPhoneCode();
                        } else {
                            onRequestPhoneCode();
                        }
                        break;
                    case 'forgot_password':
                        onForgotPassword();
                        break;
                }
            },
            [state.view, state.phoneCode.token, onSubmit, onRequestPhoneCode, onVerifyPhoneCode, onForgotPassword],
        );

        const generalError = state.errors.general ?? globalError ?? null;

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>{TITLES[state.view]}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {state.view === 'credentials' && (
                            <CredentialsView
                                state={state}
                                onFieldChange={onFieldChange}
                                isLoading={isLoading}
                            />
                        )}
                        {state.view === 'phone_code' && (
                            <PhoneCodeView
                                state={state}
                                onFieldChange={onFieldChange}
                                onRequestPhoneCode={onRequestPhoneCode}
                                onVerifyPhoneCode={onVerifyPhoneCode}
                                isLoading={isLoading}
                            />
                        )}
                        {state.view === 'forgot_password' && (
                            <ForgotPasswordView
                                state={state}
                                onFieldChange={onFieldChange}
                                onForgotPasswordStateChange={onForgotPasswordStateChange}
                                isLoading={isLoading}
                            />
                        )}
                        <GeneralError message={generalError} />
                    </form>
                </DialogContent>
            </Dialog>
        );
    },
);

AuthLoginDialog.displayName = 'AuthLoginDialog';

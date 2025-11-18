import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/store';
import { Plus } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { AuthLoginDialog } from './auth/AuthLoginDialog';
import { AuthRegisterDialog } from './auth/AuthRegisterDialog';
import { useAuthModals } from './auth/useAuthModals';

interface AuthMenuWidgetProps {
    config?: Record<string, unknown>;
    isEditable?: boolean;
    onConfigChange?: (config: Record<string, unknown>) => void;
}

export const AuthMenuWidget: React.FC<AuthMenuWidgetProps> = ({ config }) => {
    const {
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        clearAuthError,
    } = useAuth();
    const currentSite = useAppSelector((s) => s.sites.currentSite);

    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [sessionUser, setSessionUser] = useState<Record<
        string,
        unknown
    > | null>(null);
    const [isCheckingSession, setIsCheckingSession] = useState(false);

    const {
        loginState,
        registerState,
        setLoginField,
        setRegisterField,
        setLoginErrors,
        setRegisterErrors,
        resetLoginState,
        resetRegisterState,
        validateLogin,
        validateRegister,
    } = useAuthModals();

    const organizationId = useMemo(() => {
        // 1) из конфига
        const cfgOrg = (config?.organization_id as number) || undefined;
        if (cfgOrg) return cfgOrg;
        // 2) из текущего сайта
        const siteOrg = currentSite?.organizationId;
        return siteOrg;
    }, [config, currentSite]);

    const siteId = useMemo(() => {
        // 1) из конфига
        const cfgSite = (config?.site_id as number) || undefined;
        if (cfgSite) return cfgSite;
        // 2) из текущего сайта
        return currentSite?.id;
    }, [config, currentSite]);

    useEffect(() => {
        return () => {
            clearAuthError();
        };
    }, [clearAuthError]);

    // Гидратация из web-сессии, если нет токена/Redux авторизации
    useEffect(() => {
        const needSessionFetch =
            !isAuthenticated && !localStorage.getItem('token');
        if (!needSessionFetch) {
            setIsCheckingSession(false);
            return;
        }
        let cancelled = false;
        setIsCheckingSession(true);
        (async () => {
            try {
                const res = await fetch('/api/public/session-user', {
                    credentials: 'include',
                });
                if (!res.ok) {
                    if (!cancelled) {
                        setIsCheckingSession(false);
                        setSessionUser(null);
                    }
                    return;
                }
                const data = await res.json();
                const isValidUser = data && typeof data.id === 'number';
                if (!cancelled) {
                    setSessionUser(isValidUser ? data : null);
                    setIsCheckingSession(false);
                }
            } catch {
                if (!cancelled) {
                    setIsCheckingSession(false);
                    setSessionUser(null);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [isAuthenticated]);

    const handleLoginOpenChange = useCallback(
        (open: boolean) => {
            setIsLoginOpen(open);
            if (!open) {
                resetLoginState();
                clearAuthError();
                return;
            }
            setLoginErrors({});
            clearAuthError();
        },
        [clearAuthError, resetLoginState, setLoginErrors],
    );

    const handleRegisterOpenChange = useCallback(
        (open: boolean) => {
            setIsRegisterOpen(open);
            if (!open) {
                resetRegisterState();
                clearAuthError();
                return;
            }
            setRegisterErrors({});
            clearAuthError();
        },
        [clearAuthError, resetRegisterState, setRegisterErrors],
    );

    const handleLoginSubmit = useCallback(async () => {
        if (!validateLogin()) {
            return;
        }

        clearAuthError();
        setLoginErrors({});

        type AuthResult = { type?: string; payload?: unknown };
        const result = (await login({
            login: loginState.identifier.trim(),
            password: loginState.password,
            remember: loginState.remember,
        })) as AuthResult;

        if (result.type?.endsWith('/fulfilled')) {
            resetLoginState();
            setIsLoginOpen(false);
            return;
        }

        const message =
            typeof result.payload === 'string'
                ? result.payload
                : 'Не удалось выполнить вход';
        setLoginErrors({ general: message });
    }, [
        clearAuthError,
        login,
        loginState.identifier,
        loginState.password,
        loginState.remember,
        resetLoginState,
        setLoginErrors,
        validateLogin,
    ]);

    const handleRegisterSubmit = useCallback(async () => {
        if (!validateRegister()) {
            return;
        }

        clearAuthError();
        setRegisterErrors({});

        const payload: {
            name: string;
            email?: string;
            phone?: string;
            password: string;
            password_confirmation: string;
            organization_id?: number;
            site_id?: number;
        } = {
            name: registerState.name.trim(),
            password: registerState.password,
            password_confirmation: registerState.passwordConfirmation,
        };

        const trimmedEmail = registerState.email.trim();
        const trimmedPhone = registerState.phone.trim();

        if (trimmedEmail) {
            payload.email = trimmedEmail;
        }
        if (trimmedPhone) {
            payload.phone = trimmedPhone;
        }
        if (organizationId) {
            payload.organization_id = organizationId;
        }
        if (siteId) {
            payload.site_id = siteId;
        }

        type AuthResult = { type?: string; payload?: unknown };
        const result = (await register(payload)) as AuthResult;

        if (result.type?.endsWith('/fulfilled')) {
            resetRegisterState();
            setIsRegisterOpen(false);
            return;
        }

        const message =
            typeof result.payload === 'string'
                ? result.payload
                : 'Не удалось завершить регистрацию';
        setRegisterErrors({ general: message });
    }, [
        clearAuthError,
        organizationId,
        register,
        registerState.email,
        registerState.name,
        registerState.password,
        registerState.passwordConfirmation,
        registerState.phone,
        resetRegisterState,
        setRegisterErrors,
        siteId,
        validateRegister,
    ]);

    const handleLogout = async () => {
        try {
            if (isAuthenticated) {
                await logout();
            }
            // всегда пробуем завершить web-сессию, чтобы при обновлении не подтянулся session-user
            await fetch('/api/public/session-logout', {
                method: 'GET',
                credentials: 'include',
            });
        } catch {
            // ignore
        } finally {
            setSessionUser(null);
            if (typeof window !== 'undefined') {
                window.location.reload();
            }
        }
    };

    const effectiveUser =
        (user as unknown as Record<string, unknown>) || sessionUser;
    const effectiveIsAuthenticated = isAuthenticated || Boolean(sessionUser);
    const displayName =
        (effectiveUser?.name as string) ||
        (effectiveUser?.email as string) ||
        'Пользователь';
    const avatarUrl = (effectiveUser as any)?.avatar as string | undefined;
    const rawRoles = (effectiveUser as Record<string, unknown>)
        ?.roles as unknown;
    const roles = Array.isArray(rawRoles)
        ? (rawRoles as Array<{ name: string }>)
              .map((r) => r?.name)
              .filter(Boolean)
        : [];
    const isSuperAdmin = roles.includes('super_admin');
    const isOrgAdmin = roles.includes('organization_admin');

    const cfg = (config || {}) as Record<string, unknown>;
    const showLogin = Boolean(cfg.showLogin ?? true);
    const showRegister = Boolean(cfg.showRegister ?? true);
    const showExtraButton = Boolean(cfg.showExtraButton ?? false);
    const extraButtonText = String(cfg.extraButtonText ?? 'Подробнее');
    const extraButtonUrl = String(cfg.extraButtonUrl ?? '');
    const loginButtonText = String(cfg.loginText ?? 'Войти');
    const registerButtonText = String(cfg.registerText ?? 'Регистрация');

    // Показываем скелетон во время проверки сессии
    if (isCheckingSession) {
        return (
            <div className="auth-menu-widget flex items-center justify-end gap-2">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-9 w-48" />
            </div>
        );
    }

    return (
        <div className="auth-menu-widget flex items-center justify-end gap-2">
            {!effectiveIsAuthenticated ? (
                <>
                    {showLogin && (
                        <button
                            type="button"
                            className="btn-outline-primary auth-btn login-btn"
                            onClick={() => handleLoginOpenChange(true)}
                            aria-label={loginButtonText}
                        >
                            <span className="login-btn__text">{loginButtonText}</span>
                            <Plus className="login-btn__icon" />
                        </button>
                    )}
                    {showRegister && (
                        <button
                            type="button"
                            className="btn-accent auth-btn register-btn"
                            onClick={() => handleRegisterOpenChange(true)}
                        >
                            {registerButtonText}
                        </button>
                    )}
                    {showExtraButton && extraButtonUrl && (
                        <a
                            href={extraButtonUrl}
                            className="btn-accent auth-btn extra-btn"
                        >
                            {extraButtonText}
                        </a>
                    )}

                    <AuthLoginDialog
                        open={isLoginOpen}
                        onOpenChange={handleLoginOpenChange}
                        state={loginState}
                        onFieldChange={setLoginField}
                        onSubmit={handleLoginSubmit}
                        isLoading={isLoading}
                        globalError={null}
                    />

                    <AuthRegisterDialog
                        open={isRegisterOpen}
                        onOpenChange={handleRegisterOpenChange}
                        state={registerState}
                        onFieldChange={setRegisterField}
                        onSubmit={handleRegisterSubmit}
                        isLoading={isLoading}
                        globalError={null}
                        organizationId={organizationId}
                        siteId={siteId}
                    />
                </>
            ) : (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="btn-outline-primary"
                            >
                                {/* Показываем аватар только если есть картинка и showAvatar не отключён */}
                                {Boolean(
                                    (cfg.showAvatar ?? true) && avatarUrl,
                                ) && (
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage
                                            src={avatarUrl}
                                            alt={displayName}
                                        />
                                        <AvatarFallback className="hidden" />
                                    </Avatar>
                                )}
                                {Boolean(cfg.showName ?? true) && (
                                    <span>{displayName}</span>
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="min-w-[220px]"
                        >
                            {isSuperAdmin && (
                                <DropdownMenuItem asChild>
                                    <a href="/dashboard">Панель управления</a>
                                </DropdownMenuItem>
                            )}
                            {isOrgAdmin && (
                                <DropdownMenuItem asChild>
                                    <a href="/organization/admin">
                                        Админка организации
                                    </a>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                                <a href="/profile">Профиль</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a href="/settings">Настройки</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left"
                                >
                                    Выйти
                                </button>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {showExtraButton && extraButtonUrl && (
                        <a
                            href={extraButtonUrl}
                            className="btn-accent auth-btn extra-btn"
                        >
                            {extraButtonText}
                        </a>
                    )}
                </>
            )}
        </div>
    );
};
export default AuthMenuWidget;

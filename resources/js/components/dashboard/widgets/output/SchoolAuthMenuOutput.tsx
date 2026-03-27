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
import { usePage } from '@inertiajs/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { SchoolDonationModal } from '@/components/dashboard/widgets/donation/SchoolDonationModal';
import { AuthLoginDialog } from '../auth/AuthLoginDialog';
import { useAuthModals } from '../auth/useAuthModals';

interface SchoolAuthMenuOutputProps {
    config?: Record<string, unknown>;
}

const getCsrfToken = (): string =>
    document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.content ?? '';

function parseOrganizationId(raw: unknown): number | undefined {
    if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
        return raw;
    }
    if (typeof raw === 'string' && raw.trim() !== '') {
        const n = Number.parseInt(raw, 10);
        return Number.isFinite(n) && n > 0 ? n : undefined;
    }
    return undefined;
}

export const SchoolAuthMenuOutput: React.FC<SchoolAuthMenuOutputProps> = ({
    config,
}) => {
    const { user, isAuthenticated, isLoading, login, logout, clearAuthError } =
        useAuth();
    const currentSite = useAppSelector((s) => s.sites.currentSite);
    const { props: pageProps } = usePage<{
        site?: {
            organization_id?: unknown;
            organization?: { id?: unknown };
        };
    }>();

    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [sessionUser, setSessionUser] = useState<Record<
        string,
        unknown
    > | null>(null);
    const [isCheckingSession, setIsCheckingSession] = useState(false);
    const [phoneAuthLoading, setPhoneAuthLoading] = useState(false);
    const [forgotLoading, setForgotLoading] = useState(false);
    const [donationModalOpen, setDonationModalOpen] = useState(false);

    const {
        loginState,
        setLoginField,
        setLoginErrors,
        setPhoneCodeState,
        setForgotPasswordState,
        resetLoginState,
        validateLogin,
        validatePhoneForCode,
    } = useAuthModals();

    const cfg = (config || {}) as Record<string, unknown>;

    const donateUrl = String(cfg.donate_url ?? '#donation');
    const donateText = String(cfg.donate_text ?? 'Помочь школе');
    const profileText = String(cfg.profile_text ?? 'Профиль');

    const organizationId = useMemo(() => {
        const fromWidget = parseOrganizationId(cfg.organization_id);
        if (fromWidget) {
            return fromWidget;
        }
        const fromRedux = parseOrganizationId(currentSite?.organizationId);
        if (fromRedux) {
            return fromRedux;
        }
        const site = pageProps.site;
        if (!site) {
            return undefined;
        }
        return (
            parseOrganizationId(site.organization_id) ??
            parseOrganizationId(site.organization?.id)
        );
    }, [cfg.organization_id, currentSite?.organizationId, pageProps.site]);

    const opensDonationModal = useMemo(() => {
        const u = donateUrl.trim();
        if (/^https?:\/\//i.test(u)) {
            return false;
        }
        return u === '#donation' || u === '#';
    }, [donateUrl]);

    const openDonationModal = useCallback(() => {
        if (!organizationId) {
            return;
        }
        setDonationModalOpen(true);
        if (typeof window !== 'undefined' && window.location.hash !== '#donation') {
            window.history.replaceState(
                null,
                '',
                `${window.location.pathname}${window.location.search}#donation`,
            );
        }
    }, [organizationId]);

    const handleDonationModalOpenChange = useCallback((open: boolean) => {
        setDonationModalOpen(open);
        if (
            !open &&
            typeof window !== 'undefined' &&
            window.location.hash === '#donation'
        ) {
            window.history.replaceState(
                null,
                '',
                window.location.pathname + window.location.search,
            );
        }
    }, []);

    useEffect(() => {
        if (!organizationId || !opensDonationModal) {
            return;
        }
        const syncFromHash = () => {
            if (window.location.hash === '#donation') {
                setDonationModalOpen(true);
            }
        };
        syncFromHash();
        window.addEventListener('hashchange', syncFromHash);
        return () => window.removeEventListener('hashchange', syncFromHash);
    }, [organizationId, opensDonationModal]);

    // На сайте организации — личный кабинет /my-account, на главном — /profile
    const profileUrl = String(
        cfg.profile_url ?? (organizationId ? '/my-account' : '/profile'),
    );

    useEffect(() => {
        return () => {
            clearAuthError();
        };
    }, [clearAuthError]);

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
            } else {
                setLoginErrors({});
                clearAuthError();
            }
        },
        [clearAuthError, resetLoginState, setLoginErrors],
    );

    const handleLoginSubmit = useCallback(async () => {
        if (!validateLogin()) return;
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

    const handleRequestPhoneCode = useCallback(async () => {
        if (!validatePhoneForCode()) return;
        setPhoneAuthLoading(true);
        setLoginErrors({});
        try {
            const res = await fetch('/api/auth/phone/request-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                credentials: 'include',
                body: JSON.stringify({
                    phone: loginState.identifier.trim(),
                    organization_id: organizationId ?? null,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                const errMsg =
                    data?.errors?.phone?.[0] ??
                    data?.message ??
                    'Не удалось отправить код';
                setLoginErrors({ identifier: errMsg });
                return;
            }
            setPhoneCodeState({
                token: data.token,
                maskedPhone: data.masked_phone ?? '',
                code: '',
                resendAvailableIn: data.resend_available_in ?? 60,
                expiresAt: data.expires_at ?? null,
            });
        } catch {
            setLoginErrors({ general: 'Ошибка сети. Попробуйте позже.' });
        } finally {
            setPhoneAuthLoading(false);
        }
    }, [
        loginState.identifier,
        organizationId,
        setLoginErrors,
        setPhoneCodeState,
        validatePhoneForCode,
    ]);

    const handleVerifyPhoneCode = useCallback(async () => {
        const code = loginState.phoneCode.code.trim();
        if (code.length !== 6) {
            setLoginErrors({ code: 'Введите 6-значный код' });
            return;
        }
        setPhoneAuthLoading(true);
        setLoginErrors({});
        try {
            const res = await fetch('/api/auth/phone/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                credentials: 'include',
                body: JSON.stringify({
                    token: loginState.phoneCode.token,
                    code,
                    organization_id: organizationId ?? null,
                    remember: loginState.remember,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                const errMsg =
                    data?.errors?.code?.[0] ?? data?.message ?? 'Неверный код';
                setLoginErrors({ code: errMsg });
                return;
            }
            resetLoginState();
            setIsLoginOpen(false);
            if (typeof window !== 'undefined') window.location.reload();
        } catch {
            setLoginErrors({ general: 'Ошибка сети. Попробуйте позже.' });
        } finally {
            setPhoneAuthLoading(false);
        }
    }, [
        loginState.phoneCode.code,
        loginState.phoneCode.token,
        loginState.remember,
        organizationId,
        resetLoginState,
        setLoginErrors,
    ]);

    const handleForgotPassword = useCallback(async () => {
        const { identifier } = loginState.forgotPassword;
        const isEmail = loginState.mode === 'email';
        if (!identifier.trim()) {
            setLoginErrors({
                identifier: isEmail ? 'Укажите email' : 'Укажите телефон',
            });
            return;
        }
        setForgotLoading(true);
        setLoginErrors({});
        try {
            const body: Record<string, string> = {};
            if (isEmail) {
                body.email = identifier.trim();
            } else {
                body.phone = identifier.trim();
            }
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                credentials: 'include',
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) {
                setLoginErrors({
                    general: data?.message ?? 'Не удалось отправить ссылку',
                });
                return;
            }
            setForgotPasswordState({
                sent: true,
                message:
                    data.message ??
                    'Ссылка для сброса пароля отправлена на email.',
            });
        } catch {
            setLoginErrors({ general: 'Ошибка сети. Попробуйте позже.' });
        } finally {
            setForgotLoading(false);
        }
    }, [
        loginState.forgotPassword,
        loginState.mode,
        setForgotPasswordState,
        setLoginErrors,
    ]);

    const handleLogout = async () => {
        try {
            if (isAuthenticated) await logout();
            await fetch('/api/public/session-logout', {
                method: 'GET',
                credentials: 'include',
            });
        } catch {
            // ignore
        } finally {
            setSessionUser(null);
            if (typeof window !== 'undefined') window.location.reload();
        }
    };

    const combinedLoading = isLoading || phoneAuthLoading || forgotLoading;
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

    if (isCheckingSession) {
        return (
            <div className="school-auth-menu">
                <Skeleton className="w-[170px] rounded-[var(--school-header-auth-btn-radius)] [height:var(--school-header-auth-btn-height)]" />
                <Skeleton className="w-[120px] rounded-[var(--school-header-auth-btn-radius)] [height:var(--school-header-auth-btn-height)]" />
            </div>
        );
    }

    return (
        <div className="school-auth-menu">
            {!effectiveIsAuthenticated ? (
                <>
                    <button
                        type="button"
                        className="school-auth-menu__profile-btn"
                        onClick={() => handleLoginOpenChange(true)}
                    >
                        {profileText}
                    </button>

                    <AuthLoginDialog
                        open={isLoginOpen}
                        onOpenChange={handleLoginOpenChange}
                        state={loginState}
                        onFieldChange={setLoginField}
                        onSubmit={handleLoginSubmit}
                        onRequestPhoneCode={handleRequestPhoneCode}
                        onVerifyPhoneCode={handleVerifyPhoneCode}
                        onForgotPassword={handleForgotPassword}
                        onPhoneCodeStateChange={setPhoneCodeState}
                        onForgotPasswordStateChange={setForgotPasswordState}
                        isLoading={combinedLoading}
                        globalError={null}
                    />
                </>
            ) : (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="school-auth-menu__profile-btn school-auth-menu__profile-btn--active"
                        >
                            {Boolean(avatarUrl) && (
                                <Avatar className="h-6 w-6">
                                    <AvatarImage
                                        src={avatarUrl}
                                        alt={displayName}
                                    />
                                    <AvatarFallback className="hidden" />
                                </Avatar>
                            )}
                            <span>{displayName}</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[220px]">
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
                            <a href={profileUrl}>
                                {organizationId
                                    ? 'Личный кабинет'
                                    : 'Профиль'}
                            </a>
                        </DropdownMenuItem>
                        {!organizationId && (
                            <DropdownMenuItem asChild>
                                <a href="/settings">Настройки</a>
                            </DropdownMenuItem>
                        )}
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
            )}
            {/* «Помочь школе» — gradient, always visible */}
            <a
                href={donateUrl}
                className="school-auth-menu__donate-btn"
                {...(opensDonationModal && organizationId != null
                    ? { 'data-no-smooth-scroll': 'true' }
                    : {})}
                onClick={(e) => {
                    if (!opensDonationModal) {
                        return;
                    }
                    if (!organizationId) {
                        // Нет id организации в контексте — не перехватываем клик (якорь / внешняя ссылка)
                        return;
                    }
                    e.preventDefault();
                    openDonationModal();
                }}
            >
                {donateText}
            </a>
            {organizationId != null && (
                <SchoolDonationModal
                    open={donationModalOpen}
                    onOpenChange={handleDonationModalOpenChange}
                    organizationId={organizationId}
                />
            )}
        </div>
    );
};

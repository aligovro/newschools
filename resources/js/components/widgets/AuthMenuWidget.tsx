import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/store';
import React, { useEffect, useMemo, useState } from 'react';

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
        error,
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

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regPassword2, setRegPassword2] = useState('');

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
        if (!needSessionFetch) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/api/public/session-user', {
                    credentials: 'include',
                });
                if (!res.ok) return;
                const data = await res.json();
                if (!cancelled) setSessionUser(data || null);
            } catch {
                // ignore
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [isAuthenticated]);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!loginEmail || !loginPassword) return;
        type WithType = { type?: string };
        const res = (await login({
            email: loginEmail,
            password: loginPassword,
        })) as unknown as WithType;
        if (res.type?.endsWith('/fulfilled')) {
            setIsLoginOpen(false);
            setLoginEmail('');
            setLoginPassword('');
        }
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!regName || !regEmail || !regPassword || !regPassword2) return;
        const payload: {
            name: string;
            email: string;
            password: string;
            password_confirmation: string;
            organization_id?: number;
            site_id?: number;
        } = {
            name: regName,
            email: regEmail,
            password: regPassword,
            password_confirmation: regPassword2,
        };
        if (organizationId) payload.organization_id = organizationId;
        if (siteId) payload.site_id = siteId;

        type WithType = { type?: string };
        const res = (await register(payload)) as unknown as WithType;
        if (res.type?.endsWith('/fulfilled')) {
            setIsRegisterOpen(false);
            setRegName('');
            setRegEmail('');
            setRegPassword('');
            setRegPassword2('');
        }
    };

    const handleLogout = async () => {
        if (isAuthenticated) {
            await logout();
        } else {
            try {
                await fetch('/api/public/session-logout', {
                    method: 'POST',
                    credentials: 'include',
                });
            } catch {
                // ignore
            }
            setSessionUser(null);
        }
    };

    const effectiveUser =
        (user as unknown as Record<string, unknown>) || sessionUser;
    const effectiveIsAuthenticated = isAuthenticated || Boolean(sessionUser);
    const displayName =
        (effectiveUser?.name as string) ||
        (effectiveUser?.email as string) ||
        'Пользователь';
    const initial = (displayName[0] || '?').toUpperCase();
    const rawRoles = (effectiveUser as Record<string, unknown>)
        ?.roles as unknown;
    const roles = Array.isArray(rawRoles)
        ? (rawRoles as Array<{ name: string }>)
              .map((r) => r?.name)
              .filter(Boolean)
        : [];
    const isSuperAdmin = roles.includes('super_admin');
    const isOrgAdmin = roles.includes('organization_admin');

    return (
        <div className="flex items-center gap-2">
            {!effectiveIsAuthenticated ? (
                <>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsLoginOpen(true)}
                    >
                        Войти
                    </Button>
                    <Button size="sm" onClick={() => setIsRegisterOpen(true)}>
                        Регистрация
                    </Button>

                    <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Вход</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleLogin} className="space-y-3">
                                <div>
                                    <Label htmlFor="login_email">Email</Label>
                                    <Input
                                        id="login_email"
                                        type="email"
                                        value={loginEmail}
                                        onChange={(e) =>
                                            setLoginEmail(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="login_password">
                                        Пароль
                                    </Label>
                                    <Input
                                        id="login_password"
                                        type="password"
                                        value={loginPassword}
                                        onChange={(e) =>
                                            setLoginPassword(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                {error && (
                                    <div className="text-sm text-red-600">
                                        {error}
                                    </div>
                                )}
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsLoginOpen(false)}
                                    >
                                        Отмена
                                    </Button>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? 'Вход...' : 'Войти'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog
                        open={isRegisterOpen}
                        onOpenChange={setIsRegisterOpen}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Регистрация</DialogTitle>
                            </DialogHeader>
                            <form
                                onSubmit={handleRegister}
                                className="space-y-3"
                            >
                                <div>
                                    <Label htmlFor="reg_name">Имя</Label>
                                    <Input
                                        id="reg_name"
                                        value={regName}
                                        onChange={(e) =>
                                            setRegName(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="reg_email">Email</Label>
                                    <Input
                                        id="reg_email"
                                        type="email"
                                        value={regEmail}
                                        onChange={(e) =>
                                            setRegEmail(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="reg_password">Пароль</Label>
                                    <Input
                                        id="reg_password"
                                        type="password"
                                        value={regPassword}
                                        onChange={(e) =>
                                            setRegPassword(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="reg_password2">
                                        Подтверждение пароля
                                    </Label>
                                    <Input
                                        id="reg_password2"
                                        type="password"
                                        value={regPassword2}
                                        onChange={(e) =>
                                            setRegPassword2(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                {error && (
                                    <div className="text-sm text-red-600">
                                        {error}
                                    </div>
                                )}
                                <div className="flex justify-between text-xs text-gray-500">
                                    <div>
                                        organization_id: {organizationId ?? '-'}
                                    </div>
                                    <div>site_id: {siteId ?? '-'}</div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsRegisterOpen(false)}
                                    >
                                        Отмена
                                    </Button>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading
                                            ? 'Регистрация...'
                                            : 'Зарегистрироваться'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </>
            ) : (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 rounded-md border px-2 py-1 hover:bg-gray-50">
                            <Avatar className="h-6 w-6">
                                <AvatarFallback>{initial}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-800">
                                {displayName}
                            </span>
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
            )}
        </div>
    );
};
export default AuthMenuWidget;

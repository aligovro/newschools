import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginEmail || !loginPassword) return;
        const res = await login({ email: loginEmail, password: loginPassword });
        if ((res as any).type?.endsWith('/fulfilled')) {
            setIsLoginOpen(false);
            setLoginEmail('');
            setLoginPassword('');
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!regName || !regEmail || !regPassword || !regPassword2) return;
        const payload: any = {
            name: regName,
            email: regEmail,
            password: regPassword,
            password_confirmation: regPassword2,
        };
        if (organizationId) payload.organization_id = organizationId;
        if (siteId) payload.site_id = siteId;

        const res = await register(payload);
        if ((res as any).type?.endsWith('/fulfilled')) {
            setIsRegisterOpen(false);
            setRegName('');
            setRegEmail('');
            setRegPassword('');
            setRegPassword2('');
        }
    };

    return (
        <div className="flex items-center gap-2">
            {!isAuthenticated ? (
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
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">{user?.name}</span>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => logout()}
                    >
                        Выйти
                    </Button>
                </div>
            )}
        </div>
    );
};
export default AuthMenuWidget;

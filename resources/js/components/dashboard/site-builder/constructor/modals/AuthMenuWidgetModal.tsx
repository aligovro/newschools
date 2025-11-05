import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useCallback, useMemo } from 'react';

interface AuthMenuWidgetModalProps {
    widget: {
        id: string;
        configs?: Array<{
            config_key: string;
            config_value: string;
            config_type: string;
        }>;
        config?: Record<string, unknown>;
        widget_slug: string;
    };
    pendingConfig: Record<string, unknown> | null;
    onConfigUpdate: (config: Record<string, unknown>) => void;
}

// Утилитарная функция для работы с configs
const convertConfigsToConfig = (configs: any[]): Record<string, unknown> => {
    if (!configs || configs.length === 0) return {};

    const config: any = {};
    configs.forEach((item) => {
        let value = item.config_value;

        switch (item.config_type) {
            case 'number':
                value = parseFloat(value);
                break;
            case 'boolean':
                value = value === '1' || value === 'true';
                break;
            case 'json':
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    console.warn(
                        'Failed to parse JSON config:',
                        item.config_key,
                        value,
                    );
                }
                break;
            default:
                // string - оставляем как есть
                break;
        }

        config[item.config_key] = value;
    });

    return config;
};

export const AuthMenuWidgetModal: React.FC<AuthMenuWidgetModalProps> = ({
    widget,
    pendingConfig,
    onConfigUpdate,
}) => {
    const baseConfig = useMemo(() => {
        return widget.configs
            ? convertConfigsToConfig(widget.configs)
            : widget.config || {};
    }, [widget.configs, widget.config]);

    const fromCfg = useMemo(() => {
        return (pendingConfig as any) || baseConfig;
    }, [pendingConfig, baseConfig]);

    const showAvatar = Boolean(fromCfg.showAvatar ?? true);
    const showName = Boolean(fromCfg.showName ?? true);
    const loginText = String(fromCfg.loginText ?? 'Войти');
    const registerText = String(fromCfg.registerText ?? 'Регистрация');
    const showLogin = Boolean(fromCfg.showLogin ?? true);
    const showRegister = Boolean(fromCfg.showRegister ?? true);
    const showExtraButton = Boolean(fromCfg.showExtraButton ?? false);
    const extraButtonText = String(fromCfg.extraButtonText ?? 'Подробнее');
    const extraButtonUrl = String(fromCfg.extraButtonUrl ?? '');

    const handleConfigUpdate = useCallback(
        (updates: Record<string, unknown>) => {
            // Важно: сливаем с текущей конфигурацией, иначе частичные обновления
            // могут "стёреть" другие поля и вызвать скрытие разделов
            onConfigUpdate({ ...fromCfg, ...updates });
        },
        [onConfigUpdate, fromCfg],
    );

    return (
        <div className="space-y-4">
            {/* Основные переключатели видимости кнопок */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                    <input
                        id="auth_show_login"
                        type="checkbox"
                        checked={showLogin}
                        onChange={(e) =>
                            handleConfigUpdate({
                                showLogin: e.target.checked,
                            })
                        }
                        className="rounded border-gray-300"
                    />
                    <Label htmlFor="auth_show_login">
                        Показывать кнопку входа
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        id="auth_show_register"
                        type="checkbox"
                        checked={showRegister}
                        onChange={(e) =>
                            handleConfigUpdate({
                                showRegister: e.target.checked,
                            })
                        }
                        className="rounded border-gray-300"
                    />
                    <Label htmlFor="auth_show_register">
                        Показывать кнопку регистрации
                    </Label>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="auth_login_text">Текст кнопки входа</Label>
                    <Input
                        id="auth_login_text"
                        value={loginText}
                        onChange={(e) =>
                            handleConfigUpdate({
                                loginText: e.target.value,
                            })
                        }
                        placeholder="Войти"
                    />
                </div>
                <div>
                    <Label htmlFor="auth_register_text">
                        Текст кнопки регистрации
                    </Label>
                    <Input
                        id="auth_register_text"
                        value={registerText}
                        onChange={(e) =>
                            handleConfigUpdate({
                                registerText: e.target.value,
                            })
                        }
                        placeholder="Регистрация"
                    />
                </div>
            </div>

            {/* Дополнительная кнопка */}
            <div className="space-y-3">
                <div className="flex items-center space-x-2">
                    <input
                        id="auth_show_extra"
                        type="checkbox"
                        checked={showExtraButton}
                        onChange={(e) =>
                            handleConfigUpdate({
                                showExtraButton: e.target.checked,
                            })
                        }
                        className="rounded border-gray-300"
                    />
                    <Label htmlFor="auth_show_extra">
                        Показывать дополнительную кнопку
                    </Label>
                </div>

                {showExtraButton && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="auth_extra_text">
                                Текст доп. кнопки
                            </Label>
                            <Input
                                id="auth_extra_text"
                                value={extraButtonText}
                                onChange={(e) =>
                                    handleConfigUpdate({
                                        extraButtonText: e.target.value,
                                    })
                                }
                                placeholder="Подробнее"
                            />
                        </div>
                        <div>
                            <Label htmlFor="auth_extra_url">
                                Ссылка доп. кнопки
                            </Label>
                            <Input
                                id="auth_extra_url"
                                value={extraButtonUrl}
                                onChange={(e) =>
                                    handleConfigUpdate({
                                        extraButtonUrl: e.target.value,
                                    })
                                }
                                placeholder="https://example.com"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                    <input
                        id="auth_show_avatar"
                        type="checkbox"
                        checked={showAvatar}
                        onChange={(e) =>
                            handleConfigUpdate({
                                showAvatar: e.target.checked,
                            })
                        }
                        className="rounded border-gray-300"
                    />
                    <Label htmlFor="auth_show_avatar">Показывать аватар</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        id="auth_show_name"
                        type="checkbox"
                        checked={showName}
                        onChange={(e) =>
                            handleConfigUpdate({
                                showName: e.target.checked,
                            })
                        }
                        className="rounded border-gray-300"
                    />
                    <Label htmlFor="auth_show_name">Показывать имя</Label>
                </div>
            </div>

            <div className="rounded border bg-white p-3 text-xs text-gray-500">
                Эти настройки управляют отображением кнопок и профиля
                пользователя в меню авторизации.
            </div>
        </div>
    );
};

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DonationWidget } from '@/components/widgets/DonationWidget';
import { DonationsListWidget } from '@/components/widgets/DonationsListWidget';
import { FormWidget } from '@/components/widgets/FormWidget';
import { HeroWidget } from '@/components/widgets/HeroWidgetRefactored';
import { MenuWidget } from '@/components/widgets/MenuWidget';
import { ReferralLeaderboardWidget } from '@/components/widgets/ReferralLeaderboardWidget';
import { RegionRatingWidget } from '@/components/widgets/RegionRatingWidget';
import { TextWidget } from '@/components/widgets/TextWidget';
import {
    StylingPanel,
    type StylingConfig,
} from '@/components/widgets/common/StylingPanel';
import { getOrganizationId, isCustomWidget } from '@/utils/widgetHelpers';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

type WidgetConfig = Record<string, unknown>;

// Утилитарная функция для работы с configs
const getConfigValue = (
    configs: any[],
    key: string,
    defaultValue: any = null,
) => {
    const config = configs.find((c) => c.config_key === key);
    if (!config) return defaultValue;

    switch (config.config_type) {
        case 'number':
            return parseFloat(config.config_value);
        case 'boolean':
            return (
                config.config_value === '1' || config.config_value === 'true'
            );
        case 'json':
            try {
                return JSON.parse(config.config_value);
            } catch (e) {
                return defaultValue;
            }
        default:
            return config.config_value;
    }
};

// Преобразуем configs в config для совместимости
const convertConfigsToConfig = (configs: any[]): WidgetConfig => {
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

interface WidgetData {
    id: string;
    widget_id: number;
    name: string;
    widget_slug: string;
    config: WidgetConfig;
    configs: Array<{
        config_key: string;
        config_value: string;
        config_type: string;
    }>;
    settings: Record<string, unknown>;
    is_active: boolean;
    is_visible: boolean;
    order: number;
    position_name: string;
    position_slug: string;
    created_at: string;
    updated_at?: string;
    // Специализированные данные
    hero_slides?: Array<{
        id: string;
        title: string;
        subtitle?: string;
        description?: string;
        button_text?: string;
        button_link?: string;
        button_link_type: string;
        button_open_in_new_tab: boolean;
        background_image?: string;
        overlay_color?: string;
        overlay_opacity?: number;
        overlay_gradient?: string;
        overlay_gradient_intensity?: number;
        overlay_style?: string;
        sort_order: number;
        is_active: boolean;
    }>;
}

interface WidgetEditModalProps {
    widget: WidgetData | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (widget: WidgetData) => void;
    onSaveConfig?: (widgetId: string, config: WidgetConfig) => Promise<void>;
    positions?: Array<{ id: number; name: string; slug: string }>;
    onMove?: (widgetId: string, positionSlug: string) => Promise<void> | void;
    siteId?: number;
}

export const WidgetEditModal: React.FC<WidgetEditModalProps> = ({
    widget,
    isOpen,
    onClose,
    onSave,
    onSaveConfig,
    positions = [],
    onMove,
    siteId = 0,
}) => {
    const [formData, setFormData] = useState({
        name: '',
        widget_slug: '',
        config: {} as WidgetConfig,
        settings: {},
        is_active: true,
        is_visible: true,
    });

    const [_pendingConfig, setPendingConfig] = useState<WidgetConfig | null>(
        null,
    );

    // Синхронизация формы с виджетом
    useEffect(() => {
        if (widget) {

            const config = widget.configs
                ? convertConfigsToConfig(widget.configs)
                : widget.config || {};


            setFormData({
                name: widget.name || '',
                widget_slug: widget.widget_slug || '',
                config: config,
                settings: widget.settings || {},
                is_active: widget.is_active,
                is_visible: widget.is_visible,
            });
            setPendingConfig(config);
        }
    }, [widget]);

    // Мемоизированная функция сохранения
    const handleSave = useCallback(async () => {
        if (!widget) return;

        try {
            // Сначала сохраняем конфигурацию, если есть изменения
            if (onSaveConfig && _pendingConfig) {
                await onSaveConfig(widget.id, _pendingConfig);
            }

            // Затем сохраняем основные поля виджета
            const minimalUpdates = {
                id: widget.id,
                name: formData.name,
                widget_slug: formData.widget_slug,
                is_active: formData.is_active,
                is_visible: formData.is_visible,
                config: _pendingConfig || formData.config,
            } as unknown as WidgetData;

            onSave(minimalUpdates);
            onClose();
        } catch (error) {
            console.error('Error saving widget:', error);
        }
    }, [widget, formData, _pendingConfig, onSaveConfig, onSave, onClose]);

    // Мемоизированная функция изменения полей
    const handleInputChange = useCallback((field: string, value: unknown) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    // Мемоизированная функция сохранения конфига
    const handleConfigUpdate = useCallback(async (cfg: WidgetConfig) => {
        setPendingConfig(cfg);
        // Обновляем локальное состояние формы
        setFormData((prev) => ({
            ...prev,
            config: cfg,
        }));
    }, []);

    // Мемоизируем ID организации
    const organizationId = useMemo(
        () => getOrganizationId(widget?.config),
        [widget?.config],
    );

    // Рендерер для кастомных виджетов
    const renderCustomWidget = useMemo(() => {
        if (!widget) return null;

        switch (widget.widget_slug) {
            case 'text':
                return (
                    <TextWidget
                        config={
                            widget.configs
                                ? convertConfigsToConfig(widget.configs)
                                : widget.config
                        }
                        isEditable
                        autoExpandSettings
                        onSave={handleConfigUpdate}
                        widgetId={widget.id}
                    />
                );

            case 'hero':
                const heroConfig = widget.configs
                    ? convertConfigsToConfig(widget.configs)
                    : widget.config || {};


                return (
                    <HeroWidget
                        config={heroConfig}
                        isEditable
                        autoExpandSettings
                        onConfigChange={setPendingConfig}
                        configs={widget.configs}
                        styling={widget.config?.styling as Record<string, any>}
                        hero_slides={widget.hero_slides}
                    />
                );

            case 'menu':
                return (
                    <MenuWidget
                        configs={widget.configs || []}
                        isEditable
                        onConfigChange={setPendingConfig}
                    />
                );

            case 'form': {
                const formWidget = {
                    id: parseInt(widget.id),
                    site_id: siteId,
                    name: widget.name,
                    widget_slug: widget.widget_slug as 'form',
                    description: (widget.configs
                        ? convertConfigsToConfig(widget.configs)
                        : widget.config
                    ).description as string,
                    settings: ((widget.configs
                        ? convertConfigsToConfig(widget.configs)
                        : widget.config
                    ).settings || {}) as Record<string, unknown>,
                    styling: ((widget.configs
                        ? convertConfigsToConfig(widget.configs)
                        : widget.config
                    ).styling || {}) as Record<string, unknown>,
                    fields: ((widget.configs
                        ? convertConfigsToConfig(widget.configs)
                        : widget.config
                    ).fields || []) as any[],
                    actions: ((widget.configs
                        ? convertConfigsToConfig(widget.configs)
                        : widget.config
                    ).actions || []) as any[],
                    css_class: (widget.configs
                        ? convertConfigsToConfig(widget.configs)
                        : widget.config
                    ).css_class as string,
                    is_active: widget.is_active,
                    sort_order: widget.order,
                    created_at: widget.created_at,
                    updated_at: widget.updated_at,
                };

                return (
                    <FormWidget
                        widget={formWidget}
                        isEditable
                        onConfigChange={(config) =>
                            setPendingConfig((prev) => ({ ...prev, ...config }))
                        }
                    />
                );
            }

            case 'donation':
                return (
                    <DonationWidget
                        config={widget.config || {}}
                        isEditable
                        autoExpandSettings
                        onSave={handleConfigUpdate}
                        widgetId={widget.id}
                        organizationId={organizationId}
                    />
                );

            case 'region_rating':
                return (
                    <RegionRatingWidget
                        config={widget.config || {}}
                        isEditable
                        autoExpandSettings
                        onSave={handleConfigUpdate}
                        widgetId={widget.id}
                        organizationId={organizationId}
                        onConfigChange={setPendingConfig}
                    />
                );

            case 'donations_list':
                return (
                    <DonationsListWidget
                        config={widget.config || {}}
                        isEditable
                        autoExpandSettings
                        onSave={handleConfigUpdate}
                        widgetId={widget.id}
                        organizationId={organizationId}
                        onConfigChange={setPendingConfig}
                    />
                );

            case 'referral_leaderboard':
                return (
                    <ReferralLeaderboardWidget
                        config={widget.config || {}}
                        isEditable
                        autoExpandSettings
                        onSave={handleConfigUpdate}
                        widgetId={widget.id}
                        organizationId={organizationId}
                        onConfigChange={setPendingConfig}
                    />
                );

            default:
                return null;
        }
    }, [widget, siteId, organizationId, handleConfigUpdate]);

    // Стандартные поля для остальных виджетов
    const renderStandardFields = useMemo(
        () => (
            <>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name">Название</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                handleInputChange('name', e.target.value)
                            }
                            placeholder="Введите название виджета"
                        />
                    </div>
                    <div>
                        <Label htmlFor="widget_slug">Widget Slug</Label>
                        <Input
                            id="widget_slug"
                            value={formData.widget_slug}
                            onChange={(e) =>
                                handleInputChange('widget_slug', e.target.value)
                            }
                            placeholder="widget-slug"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) =>
                                handleInputChange('is_active', e.target.checked)
                            }
                            className="rounded border-gray-300"
                        />
                        <Label htmlFor="is_active">Активен</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="is_visible"
                            checked={formData.is_visible}
                            onChange={(e) =>
                                handleInputChange(
                                    'is_visible',
                                    e.target.checked,
                                )
                            }
                            className="rounded border-gray-300"
                        />
                        <Label htmlFor="is_visible">Видимый</Label>
                    </div>
                </div>

                <div>
                    <Label htmlFor="config">Конфигурация (JSON)</Label>
                    <Textarea
                        id="config"
                        value={JSON.stringify(formData.config, null, 2)}
                        onChange={(e) => {
                            try {
                                const parsed = JSON.parse(e.target.value);
                                handleInputChange('config', parsed);
                                setPendingConfig(parsed as WidgetConfig);
                            } catch {
                                // Игнорируем ошибки парсинга во время ввода
                            }
                        }}
                        placeholder="{}"
                        rows={4}
                        className="font-mono text-sm"
                    />
                </div>

                <div>
                    <Label htmlFor="settings">Настройки (JSON)</Label>
                    <Textarea
                        id="settings"
                        value={JSON.stringify(formData.settings, null, 2)}
                        onChange={(e) => {
                            try {
                                const parsed = JSON.parse(e.target.value);
                                handleInputChange(
                                    'settings',
                                    parsed as WidgetConfig,
                                );
                            } catch {
                                // Игнорируем ошибки парсинга во время ввода
                            }
                        }}
                        placeholder="{}"
                        rows={4}
                        className="font-mono text-sm"
                    />
                </div>
            </>
        ),
        [formData, handleInputChange],
    );

    // Проверяем, есть ли виджет с кастомным редактором
    const hasCustomEditor = useMemo(
        () => widget && isCustomWidget(widget.widget_slug),
        [widget],
    );

    // Универсальная вкладка стилизации
    const [activeTab, setActiveTab] = useState<'editor' | 'styling'>('editor');
    const stylingConfig = (formData.config?.styling || {}) as StylingConfig;

    if (!widget) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="flex max-h-[90vh] min-w-[1000px] flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>Редактирование виджета</DialogTitle>
                    <DialogDescription>
                        Настройте параметры виджета и его содержимое
                    </DialogDescription>
                </DialogHeader>

                <div className="mb-3 flex flex-shrink-0 items-center gap-2">
                    <button
                        className={`form-widget-editor__tab ${activeTab === 'editor' ? 'active' : ''}`}
                        onClick={() => setActiveTab('editor')}
                    >
                        Редактор
                    </button>
                    <button
                        className={`form-widget-editor__tab ${activeTab === 'styling' ? 'active' : ''}`}
                        onClick={() => setActiveTab('styling')}
                    >
                        Стилизация
                    </button>
                </div>

                <div className="max-h-[70vh] min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 pb-4">
                    {/* Выбор позиции */}
                    {positions.length > 0 && (
                        <div>
                            <Label htmlFor="position">Позиция</Label>
                            <Select
                                value={widget.position_slug}
                                onValueChange={async (slug) => {
                                    if (onMove) {
                                        await onMove(widget.id, slug);
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите позицию" />
                                </SelectTrigger>
                                <SelectContent>
                                    {positions.map((p) => (
                                        <SelectItem key={p.id} value={p.slug}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Кастомный редактор/стандартные поля + вкладка стилизации */}
                    {activeTab === 'editor' ? (
                        hasCustomEditor ? (
                            renderCustomWidget
                        ) : (
                            renderStandardFields
                        )
                    ) : (
                        <div className="rounded-lg border bg-white p-4">
                            <h4 className="mb-3 text-sm font-semibold text-gray-700">
                                Стилизация
                            </h4>
                            <StylingPanel
                                value={stylingConfig}
                                onChange={(val) => {
                                    const cfg = {
                                        ...(formData.config || {}),
                                        styling: val,
                                    };
                                    setPendingConfig(cfg);
                                    handleInputChange('config', cfg);
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-shrink-0 justify-end space-x-2 border-t bg-white pt-4">
                    <Button variant="outline" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button onClick={handleSave}>Сохранить</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

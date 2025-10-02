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
import { FormWidget } from '@/components/widgets/FormWidget';
import { HeroWidget } from '@/components/widgets/HeroWidgetRefactored';
import { MenuWidget } from '@/components/widgets/MenuWidget';
import React, { useEffect, useState } from 'react';

type WidgetConfig = Record<string, unknown>;

interface WidgetData {
    id: string;
    widget_id: number;
    name: string;
    slug: string;
    config: WidgetConfig;
    settings: Record<string, unknown>;
    is_active: boolean;
    is_visible: boolean;
    order: number;
    position_name: string;
    position_slug: string;
    created_at: string;
    updated_at?: string;
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
        slug: '',
        config: {} as WidgetConfig,
        settings: {},
        is_active: true,
        is_visible: true,
    });

    const [pendingConfig, setPendingConfig] = useState<WidgetConfig | null>(
        null,
    );

    useEffect(() => {
        if (widget) {
            setFormData({
                name: widget.name || '',
                slug: widget.slug || '',
                config: widget.config || {},
                settings: widget.settings || {},
                is_active: widget.is_active,
                is_visible: widget.is_visible,
            });
            setPendingConfig(widget.config || {});
        }
    }, [widget]);

    const handleSave = async () => {
        if (!widget) return;
        try {
            if (onSaveConfig && pendingConfig) {
                await onSaveConfig(widget.id, pendingConfig);
            }
            const minimalUpdates = {
                id: widget.id,
                name: formData.name,
                slug: formData.slug,
                is_active: formData.is_active,
                is_visible: formData.is_visible,
            } as unknown as WidgetData;
            onSave(minimalUpdates);
            onClose();
        } catch {
            // ignore
        }
    };

    const handleInputChange = (field: string, value: unknown) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    if (!widget) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[85vh] min-w-[1000px]">
                <DialogHeader>
                    <DialogTitle>Редактирование виджета</DialogTitle>
                    <DialogDescription>
                        Настройте параметры виджета и его содержимое
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
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

                    {(widget.slug === 'hero' ||
                        widget.slug === 'hero-slider') && (
                        <HeroWidget
                            config={widget.config}
                            isEditable
                            autoExpandSettings
                            onSave={undefined}
                            widgetId={widget.id}
                            onConfigChange={(cfg) => setPendingConfig(cfg)}
                        />
                    )}

                    {(widget.slug === 'menu' ||
                        widget.slug === 'header-menu') && (
                        <MenuWidget
                            config={widget.config}
                            isEditable
                            onConfigChange={(cfg) => setPendingConfig(cfg)}
                        />
                    )}

                    {widget.slug === 'form' && (
                        <FormWidget
                            widget={{
                                id: parseInt(widget.id),
                                site_id: siteId,
                                name: widget.name,
                                slug: widget.slug,
                                config: widget.config,
                                settings: widget.settings,
                                fields: (widget.config.fields as any[]) || [],
                                actions: (widget.config.actions as any[]) || [],
                                styling: widget.config.styling || {},
                                is_active: widget.is_active,
                                is_visible: widget.is_visible,
                                created_at: widget.created_at,
                                updated_at: widget.updated_at,
                            }}
                            isEditable
                            onConfigChange={(cfg) => setPendingConfig(cfg)}
                            onSave={undefined}
                        />
                    )}

                    {!(
                        widget.slug === 'menu' ||
                        widget.slug === 'header-menu' ||
                        widget.slug === 'hero' ||
                        widget.slug === 'hero-slider' ||
                        widget.slug === 'form'
                    ) && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Название</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Введите название виджета"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'slug',
                                                e.target.value,
                                            )
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
                                            handleInputChange(
                                                'is_active',
                                                e.target.checked,
                                            )
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
                                <Label htmlFor="config">
                                    Конфигурация (JSON)
                                </Label>
                                <Textarea
                                    id="config"
                                    value={JSON.stringify(
                                        formData.config,
                                        null,
                                        2,
                                    )}
                                    onChange={(e) => {
                                        try {
                                            const parsed = JSON.parse(
                                                e.target.value,
                                            );
                                            handleInputChange('config', parsed);
                                            setPendingConfig(
                                                parsed as WidgetConfig,
                                            );
                                        } catch {
                                            // ignore
                                        }
                                    }}
                                    placeholder="{}"
                                    rows={4}
                                    className="font-mono text-sm"
                                />
                            </div>

                            <div>
                                <Label htmlFor="settings">
                                    Настройки (JSON)
                                </Label>
                                <Textarea
                                    id="settings"
                                    value={JSON.stringify(
                                        formData.settings,
                                        null,
                                        2,
                                    )}
                                    onChange={(e) => {
                                        try {
                                            const parsed = JSON.parse(
                                                e.target.value,
                                            );
                                            handleInputChange(
                                                'settings',
                                                parsed as WidgetConfig,
                                            );
                                        } catch {
                                            // ignore
                                        }
                                    }}
                                    placeholder="{}"
                                    rows={4}
                                    className="font-mono text-sm"
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button onClick={handleSave}>Сохранить</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import React, { useEffect, useState } from 'react';

interface WidgetData {
    id: string;
    widget_id: number;
    name: string;
    slug: string;
    config: Record<string, unknown>;
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
}

export const WidgetEditModal: React.FC<WidgetEditModalProps> = ({
    widget,
    isOpen,
    onClose,
    onSave,
}) => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        config: {},
        settings: {},
        is_active: true,
        is_visible: true,
    });

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
        }
    }, [widget]);

    const handleSave = () => {
        if (widget) {
            const updatedWidget = {
                ...widget,
                ...formData,
            };
            onSave(updatedWidget);
            onClose();
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    if (!widget) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Редактирование виджета</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
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
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) =>
                                    handleInputChange('slug', e.target.value)
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
                        <Label htmlFor="config">Конфигурация (JSON)</Label>
                        <Textarea
                            id="config"
                            value={JSON.stringify(formData.config, null, 2)}
                            onChange={(e) => {
                                try {
                                    const parsed = JSON.parse(e.target.value);
                                    handleInputChange('config', parsed);
                                } catch {
                                    // Игнорируем ошибки парсинга
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
                                    handleInputChange('settings', parsed);
                                } catch {
                                    // Игнорируем ошибки парсинга
                                }
                            }}
                            placeholder="{}"
                            rows={4}
                            className="font-mono text-sm"
                        />
                    </div>
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

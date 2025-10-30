import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface WidgetConfig {
    [key: string]: any;
}

interface WidgetSettings {
    [key: string]: any;
}

interface Widget {
    id: number;
    name: string;
    slug: string;
    description: string;
    fields_config: WidgetConfig;
    settings_config: WidgetSettings;
    component_name?: string;
}

interface SiteWidget {
    id: number;
    name: string;
    position_name: string;
    config: WidgetConfig;
    settings: WidgetSettings;
    order: number;
    is_active: boolean;
    is_visible: boolean;
    widget: Widget;
}

interface WidgetEditorProps {
    siteWidget: SiteWidget;
    isOpen: boolean;
    onClose: () => void;
    onSave: (
        siteWidget: SiteWidget,
        config: WidgetConfig,
        settings: WidgetSettings,
    ) => void;
    onDelete?: (siteWidget: SiteWidget) => void;
}

export const WidgetEditor: React.FC<WidgetEditorProps> = ({
    siteWidget,
    isOpen,
    onClose,
    onSave,
    onDelete,
}) => {
    const [config, setConfig] = useState<WidgetConfig>(siteWidget.config || {});
    const [settings, setSettings] = useState<WidgetSettings>(
        siteWidget.settings || {},
    );
    const [name, setName] = useState(siteWidget.name);
    const [isActive, setIsActive] = useState(siteWidget.is_active);
    const [isVisible, setIsVisible] = useState(siteWidget.is_visible);
    const [activeTab, setActiveTab] = useState<'config' | 'settings'>('config');

    useEffect(() => {
        setConfig(siteWidget.config || {});
        setSettings(siteWidget.settings || {});
        setName(siteWidget.name);
        setIsActive(siteWidget.is_active);
        setIsVisible(siteWidget.is_visible);
    }, [siteWidget]);

    const handleSave = () => {
        onSave(siteWidget, config, settings);
        onClose();
    };

    const renderField = (
        key: string,
        fieldConfig: any,
        value: any,
        onChange: (value: any) => void,
    ) => {
        const {
            type,
            label,
            required,
            options,
            min,
            max,
            default: defaultValue,
        } = fieldConfig;

        switch (type) {
            case 'text':
                return (
                    <div key={key}>
                        <Label htmlFor={key}>
                            {label} {required && '*'}
                        </Label>
                        <Input
                            id={key}
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={label}
                            className="mt-1"
                        />
                    </div>
                );

            case 'textarea':
                return (
                    <div key={key}>
                        <Label htmlFor={key}>
                            {label} {required && '*'}
                        </Label>
                        <Textarea
                            id={key}
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={label}
                            className="mt-1"
                            rows={3}
                        />
                    </div>
                );

            case 'richtext':
                return (
                    <div key={key}>
                        <Label htmlFor={key}>
                            {label} {required && '*'}
                        </Label>
                        <Textarea
                            id={key}
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={label}
                            className="mt-1"
                            rows={5}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Поддерживается HTML разметка
                        </p>
                    </div>
                );

            case 'number':
                return (
                    <div key={key}>
                        <Label htmlFor={key}>
                            {label} {required && '*'}
                        </Label>
                        <Input
                            id={key}
                            type="number"
                            value={value || ''}
                            onChange={(e) =>
                                onChange(parseInt(e.target.value) || 0)
                            }
                            min={min}
                            max={max}
                            placeholder={label}
                            className="mt-1"
                        />
                    </div>
                );

            case 'select':
                return (
                    <div key={key}>
                        <Label htmlFor={key}>
                            {label} {required && '*'}
                        </Label>
                        <Select value={value || ''} onValueChange={onChange}>
                            <option value="">
                                Выберите {label.toLowerCase()}
                            </option>
                            {options?.map((option: string) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </Select>
                    </div>
                );

            case 'checkbox':
                return (
                    <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                            id={key}
                            checked={value || false}
                            onCheckedChange={onChange}
                        />
                        <Label htmlFor={key}>{label}</Label>
                    </div>
                );

            case 'color':
                return (
                    <div key={key}>
                        <Label htmlFor={key}>
                            {label} {required && '*'}
                        </Label>
                        <div className="mt-1 flex items-center space-x-2">
                            <Input
                                id={key}
                                type="color"
                                value={value || '#000000'}
                                onChange={(e) => onChange(e.target.value)}
                                className="h-10 w-16"
                            />
                            <Input
                                value={value || ''}
                                onChange={(e) => onChange(e.target.value)}
                                placeholder="#000000"
                                className="flex-1"
                            />
                        </div>
                    </div>
                );

            case 'url':
                return (
                    <div key={key}>
                        <Label htmlFor={key}>
                            {label} {required && '*'}
                        </Label>
                        <Input
                            id={key}
                            type="url"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="https://example.com"
                            className="mt-1"
                        />
                    </div>
                );

            case 'image':
                return (
                    <div key={key}>
                        <Label htmlFor={key}>
                            {label} {required && '*'}
                        </Label>
                        <div className="mt-1">
                            <Input
                                id={key}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        // Здесь можно добавить загрузку файла
                                        onChange(file.name);
                                    }
                                }}
                            />
                            {value && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Выбран: {value}
                                </p>
                            )}
                        </div>
                    </div>
                );

            case 'images':
                return (
                    <div key={key}>
                        <Label htmlFor={key}>
                            {label} {required && '*'}
                        </Label>
                        <div className="mt-1">
                            <Input
                                id={key}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                    const files = Array.from(
                                        e.target.files || [],
                                    );
                                    onChange(files.map((f) => f.name));
                                }}
                            />
                            {value && value.length > 0 && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Выбрано файлов: {value.length}
                                </p>
                            )}
                        </div>
                    </div>
                );

            case 'range':
                return (
                    <div key={key}>
                        <Label htmlFor={key}>
                            {label} {required && '*'}
                        </Label>
                        <div className="mt-1">
                            <Input
                                id={key}
                                type="range"
                                value={value || defaultValue || 0}
                                onChange={(e) =>
                                    onChange(parseInt(e.target.value))
                                }
                                min={min || 0}
                                max={max || 100}
                                className="w-full"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Значение: {value || defaultValue || 0}
                            </p>
                        </div>
                    </div>
                );

            default:
                return (
                    <div key={key}>
                        <Label htmlFor={key}>
                            {label} {required && '*'}
                        </Label>
                        <Input
                            id={key}
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={label}
                            className="mt-1"
                        />
                    </div>
                );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Настройка виджета: {siteWidget.widget.name}</span>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Основные настройки */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Основные настройки</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="widget-name">
                                    Название виджета
                                </Label>
                                <Input
                                    id="widget-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is-active"
                                        checked={isActive}
                                        onCheckedChange={(checked) =>
                                            setIsActive(!!checked)
                                        }
                                    />
                                    <Label htmlFor="is-active">Активен</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is-visible"
                                        checked={isVisible}
                                        onCheckedChange={(checked) =>
                                            setIsVisible(!!checked)
                                        }
                                    />
                                    <Label htmlFor="is-visible">Видим</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Вкладки конфигурации */}
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('config')}
                                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                                    activeTab === 'config'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                }`}
                            >
                                Конфигурация
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                                    activeTab === 'settings'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                }`}
                            >
                                Настройки
                            </button>
                        </nav>
                    </div>

                    {/* Конфигурация виджета */}
                    {activeTab === 'config' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Конфигурация виджета</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {Object.entries(
                                    siteWidget.widget.fields_config || {},
                                ).map(([key, fieldConfig]) =>
                                    renderField(
                                        key,
                                        fieldConfig,
                                        config[key],
                                        (value) =>
                                            setConfig((prev) => ({
                                                ...prev,
                                                [key]: value,
                                            })),
                                    ),
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Настройки виджета */}
                    {activeTab === 'settings' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Настройки отображения</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {Object.entries(
                                    siteWidget.widget.settings_config || {},
                                ).map(([key, settingConfig]) =>
                                    renderField(
                                        key,
                                        settingConfig,
                                        settings[key],
                                        (value) =>
                                            setSettings((prev) => ({
                                                ...prev,
                                                [key]: value,
                                            })),
                                    ),
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Действия */}
                    <div className="flex justify-between">
                        <div>
                            {onDelete && (
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        onDelete(siteWidget);
                                        onClose();
                                    }}
                                >
                                    Удалить виджет
                                </Button>
                            )}
                        </div>

                        <div className="flex space-x-2">
                            <Button variant="outline" onClick={onClose}>
                                Отмена
                            </Button>
                            <Button onClick={handleSave}>
                                <Save className="mr-2 h-4 w-4" />
                                Сохранить
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

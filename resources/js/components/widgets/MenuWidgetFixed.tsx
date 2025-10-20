import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MoveDown, MoveUp, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

type LinkType = 'internal' | 'external';

type AlignmentType = 'start' | 'center' | 'end' | 'between';

interface MenuItem {
    id: string;
    title: string;
    url: string;
    type: LinkType; // internal|external
    newTab?: boolean; // open in new tab for external
}

interface MenuWidgetConfig {
    title?: string;
    orientation?: 'row' | 'column';
    alignment?: AlignmentType;
    fontSize?: string; // e.g. '16px'
    uppercase?: boolean;
    gap?: number; // px
    css_class?: string;
    items?: MenuItem[];
}

interface MenuWidgetProps {
    config?: MenuWidgetConfig;
    isEditable?: boolean;
    onConfigChange?: (config: MenuWidgetConfig) => void;
}

const defaultItems: MenuItem[] = [
    { id: 'm1', title: 'Главная', url: '/', type: 'internal' },
    { id: 'm2', title: 'О нас', url: '/about', type: 'internal' },
];

export const MenuWidget: React.FC<MenuWidgetProps> = ({
    config = {},
    isEditable = false,
    onConfigChange,
}) => {
    const [activeTab, setActiveTab] = useState<'settings' | 'menu'>('settings');
    const initialConfig: MenuWidgetConfig = useMemo(
        () => ({
            title: config.title ?? '',
            orientation: config.orientation ?? 'row',
            alignment: (config.alignment as AlignmentType) ?? 'start',
            fontSize: config.fontSize ?? '16px',
            uppercase: config.uppercase ?? false,
            gap: typeof config.gap === 'number' ? config.gap : 12,
            items:
                Array.isArray(config.items) && config.items.length > 0
                    ? (config.items as MenuItem[])
                    : defaultItems,
        }),
        [config],
    );

    const [localConfig, setLocalConfig] =
        useState<MenuWidgetConfig>(initialConfig);

    // Синхронизируем с внешним config
    useEffect(() => {
        setLocalConfig(initialConfig);
    }, [initialConfig]);

    // Уведомляем о изменениях
    useEffect(() => {
        if (onConfigChange) {
            onConfigChange(localConfig);
        }
    }, [localConfig, onConfigChange]);

    const { title, orientation, alignment, fontSize, uppercase, gap, items } =
        localConfig;

    const directionClass = orientation === 'column' ? 'flex-col' : 'flex-row';
    const alignClass = {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
    }[alignment || 'start'];

    const gapStyle = gap ? { gap: `${gap}px` } : {};

    const textStyle: React.CSSProperties = {
        fontSize: fontSize || '16px',
        textTransform: uppercase ? 'uppercase' : 'none',
    };

    const addItem = () => {
        const newItem: MenuItem = {
            id: `m${Date.now()}`,
            title: 'Новый пункт',
            url: '/',
            type: 'internal',
        };
        setLocalConfig((prev) => ({
            ...prev,
            items: [...(prev.items || []), newItem],
        }));
    };

    const updateItem = (id: string, updates: Partial<MenuItem>) => {
        setLocalConfig((prev) => ({
            ...prev,
            items: (prev.items || []).map((item) =>
                item.id === id ? { ...item, ...updates } : item,
            ),
        }));
    };

    const removeItem = (id: string) => {
        setLocalConfig((prev) => ({
            ...prev,
            items: (prev.items || []).filter((item) => item.id !== id),
        }));
    };

    const moveItem = (id: string, direction: 'up' | 'down') => {
        setLocalConfig((prev) => {
            const arr = [...(prev.items || [])];
            const idx = arr.findIndex((it) => it.id === id);
            if (idx === -1) return prev;
            const swapWith = direction === 'up' ? idx - 1 : idx + 1;
            if (swapWith < 0 || swapWith >= arr.length) return prev;
            [arr[idx], arr[swapWith]] = [arr[swapWith], arr[idx]];
            return { ...prev, items: arr };
        });
    };

    if (isEditable) {
        return (
            <div className="menu-widget-editor">
                <Card>
                    <CardContent className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Меню</h3>
                        </div>

                        <div className="menu-widget-editor">
                            <div className="menu-widget-editor__tabs">
                                <button
                                    className={`menu-widget-editor__tab ${activeTab === 'settings' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('settings')}
                                >
                                    Настройки
                                </button>
                                <button
                                    className={`menu-widget-editor__tab ${activeTab === 'menu' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('menu')}
                                >
                                    Меню
                                </button>
                            </div>

                            <div className="menu-widget-editor__content">
                                {activeTab === 'settings' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="menu-title">
                                                    Заголовок меню
                                                    (необязательно)
                                                </Label>
                                                <Input
                                                    id="menu-title"
                                                    value={title || ''}
                                                    onChange={(e) =>
                                                        setLocalConfig((p) => ({
                                                            ...p,
                                                            title: e.target
                                                                .value,
                                                        }))
                                                    }
                                                    placeholder="Например: Навигация"
                                                />
                                            </div>

                                            <div>
                                                <Label>Ориентация</Label>
                                                <Select
                                                    value={orientation}
                                                    onValueChange={(v) =>
                                                        setLocalConfig((p) => ({
                                                            ...p,
                                                            orientation: v as
                                                                | 'row'
                                                                | 'column',
                                                        }))
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="row">
                                                            Горизонтально
                                                        </SelectItem>
                                                        <SelectItem value="column">
                                                            Вертикально
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label>Выравнивание</Label>
                                                <Select
                                                    value={alignment}
                                                    onValueChange={(v) =>
                                                        setLocalConfig((p) => ({
                                                            ...p,
                                                            alignment:
                                                                v as AlignmentType,
                                                        }))
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="start">
                                                            По левому краю
                                                        </SelectItem>
                                                        <SelectItem value="center">
                                                            По центру
                                                        </SelectItem>
                                                        <SelectItem value="end">
                                                            По правому краю
                                                        </SelectItem>
                                                        <SelectItem value="between">
                                                            По краям
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="font-size">
                                                    Размер шрифта (px)
                                                </Label>
                                                <Input
                                                    id="font-size"
                                                    type="number"
                                                    value={parseInt(
                                                        fontSize || '16',
                                                    )}
                                                    onChange={(e) =>
                                                        setLocalConfig((p) => ({
                                                            ...p,
                                                            fontSize: `${e.target.value || 16}px`,
                                                        }))
                                                    }
                                                />
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id="uppercase"
                                                    checked={!!uppercase}
                                                    onCheckedChange={(v) =>
                                                        setLocalConfig((p) => ({
                                                            ...p,
                                                            uppercase: v,
                                                        }))
                                                    }
                                                />
                                                <Label htmlFor="uppercase">
                                                    ЗАГЛАВНЫЕ буквы
                                                </Label>
                                            </div>

                                            <div>
                                                <Label htmlFor="gap">
                                                    Отступ между пунктами (px)
                                                </Label>
                                                <Input
                                                    id="gap"
                                                    type="number"
                                                    value={gap || 0}
                                                    onChange={(e) =>
                                                        setLocalConfig((p) => ({
                                                            ...p,
                                                            gap: Number(
                                                                e.target.value,
                                                            ),
                                                        }))
                                                    }
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <Label htmlFor="css_class">
                                                    CSS класс для обертки
                                                </Label>
                                                <Input
                                                    id="css_class"
                                                    value={
                                                        config.css_class || ''
                                                    }
                                                    onChange={(e) =>
                                                        setLocalConfig((p) => ({
                                                            ...p,
                                                            css_class:
                                                                e.target.value,
                                                        }))
                                                    }
                                                    placeholder="my-custom-menu-class"
                                                />
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Добавьте CSS класс для
                                                    кастомной стилизации меню.
                                                </p>
                                            </div>
                                        </div>

                                        <div
                                            className={`mt-2 flex ${directionClass} ${alignClass}`}
                                            style={gapStyle}
                                        >
                                            {(title || '').trim() !== '' && (
                                                <div
                                                    className="font-medium text-gray-900"
                                                    style={textStyle}
                                                >
                                                    {title}
                                                </div>
                                            )}
                                            <nav className="flex items-center space-x-4">
                                                {(items || []).map((item) => (
                                                    <a
                                                        key={item.id}
                                                        href={item.url}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        style={textStyle}
                                                    >
                                                        {item.title}
                                                    </a>
                                                ))}
                                            </nav>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'menu' && (
                                    <div>
                                        <div className="mb-2 flex items-center justify-between">
                                            <h4 className="text-md font-semibold">
                                                Пункты меню
                                            </h4>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={addItem}
                                                className="flex items-center space-x-2"
                                            >
                                                <Plus className="h-4 w-4" />
                                                <span>Добавить пункт</span>
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {(items || []).map(
                                                (item, index) => (
                                                    <div
                                                        key={item.id}
                                                        className="rounded-md border p-3"
                                                    >
                                                        <div className="mb-2 flex items-center justify-between">
                                                            <div className="text-sm text-gray-600">
                                                                #{index + 1}
                                                            </div>
                                                            <div className="flex space-x-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() =>
                                                                        moveItem(
                                                                            item.id,
                                                                            'up',
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        index ===
                                                                        0
                                                                    }
                                                                >
                                                                    <MoveUp className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() =>
                                                                        moveItem(
                                                                            item.id,
                                                                            'down',
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        index ===
                                                                        (
                                                                            items ||
                                                                            []
                                                                        )
                                                                            .length -
                                                                            1
                                                                    }
                                                                >
                                                                    <MoveDown className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() =>
                                                                        removeItem(
                                                                            item.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                            <div>
                                                                <Label
                                                                    htmlFor={`title-${item.id}`}
                                                                >
                                                                    Название
                                                                </Label>
                                                                <Input
                                                                    id={`title-${item.id}`}
                                                                    value={
                                                                        item.title
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateItem(
                                                                            item.id,
                                                                            {
                                                                                title: e
                                                                                    .target
                                                                                    .value,
                                                                            },
                                                                        )
                                                                    }
                                                                />
                                                            </div>

                                                            <div>
                                                                <Label
                                                                    htmlFor={`url-${item.id}`}
                                                                >
                                                                    URL
                                                                </Label>
                                                                <Input
                                                                    id={`url-${item.id}`}
                                                                    value={
                                                                        item.url
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateItem(
                                                                            item.id,
                                                                            {
                                                                                url: e
                                                                                    .target
                                                                                    .value,
                                                                            },
                                                                        )
                                                                    }
                                                                />
                                                            </div>

                                                            <div>
                                                                <Label
                                                                    htmlFor={`type-${item.id}`}
                                                                >
                                                                    Тип ссылки
                                                                </Label>
                                                                <Select
                                                                    value={
                                                                        item.type
                                                                    }
                                                                    onValueChange={(
                                                                        v,
                                                                    ) =>
                                                                        updateItem(
                                                                            item.id,
                                                                            {
                                                                                type: v as LinkType,
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="internal">
                                                                            Внутренняя
                                                                        </SelectItem>
                                                                        <SelectItem value="external">
                                                                            Внешняя
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>

                                                        {item.type ===
                                                            'external' && (
                                                            <div className="mt-2 flex items-center space-x-2">
                                                                <Switch
                                                                    id={`newtab-${item.id}`}
                                                                    checked={
                                                                        !!item.newTab
                                                                    }
                                                                    onCheckedChange={(
                                                                        v,
                                                                    ) =>
                                                                        updateItem(
                                                                            item.id,
                                                                            {
                                                                                newTab: v,
                                                                            },
                                                                        )
                                                                    }
                                                                />
                                                                <Label
                                                                    htmlFor={`newtab-${item.id}`}
                                                                >
                                                                    Открывать в
                                                                    новой
                                                                    вкладке
                                                                </Label>
                                                            </div>
                                                        )}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer buttons handled by parent modal */}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Публичный рендер
    return (
        <div
            className={`menu-widget flex ${directionClass} ${alignClass} ${config.css_class || ''}`}
            style={gapStyle}
        >
            {(title || '').trim() !== '' && (
                <div className="font-medium text-gray-900" style={textStyle}>
                    {title}
                </div>
            )}
            <nav className="flex items-center space-x-4">
                {(items || []).map((item) => (
                    <a
                        key={item.id}
                        href={item.url}
                        className="text-blue-600 hover:text-blue-800"
                        style={textStyle}
                        {...(item.type === 'external' && item.newTab
                            ? { target: '_blank', rel: 'noopener noreferrer' }
                            : {})}
                    >
                        {item.title}
                    </a>
                ))}
            </nav>
        </div>
    );
};

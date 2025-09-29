import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Edit, Eye, EyeOff, GripVertical, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

interface MenuItem {
    id: number;
    title: string;
    url?: string;
    route_name?: string;
    external_url?: string;
    page_id?: number;
    icon?: string;
    css_classes?: string[];
    sort_order: number;
    is_active: boolean;
    open_in_new_tab: boolean;
    children?: MenuItem[];
    final_url?: string;
    link_type?: string;
}

interface Menu {
    id: number;
    name: string;
    location: 'header' | 'footer' | 'sidebar' | 'mobile';
    is_active: boolean;
    css_classes?: string[];
    description?: string;
    items: MenuItem[];
}

interface MenuManagerProps {
    organizationId: number;
    menus: Menu[];
    locations: Record<string, string>;
    pages: Array<{ id: number; title: string; slug: string }>;
    types: Record<string, string>;
}

const MenuManager: React.FC<MenuManagerProps> = ({
    organizationId,
    menus,
    locations,
    pages,
    types,
}) => {
    const [currentMenus, setCurrentMenus] = useState<Menu[]>(menus);
    const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [showCreateMenu, setShowCreateMenu] = useState(false);
    const [showCreateItem, setShowCreateItem] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

    const handleCreateMenu = async (formData: any) => {
        try {
            const response = await fetch(
                `/api/organizations/${organizationId}/menus`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify(formData),
                },
            );

            if (response.ok) {
                const data = await response.json();
                setCurrentMenus([...currentMenus, data.menu]);
                setShowCreateMenu(false);
            }
        } catch (error) {
            console.error('Error creating menu:', error);
        }
    };

    const handleUpdateMenu = async (menuId: number, formData: any) => {
        try {
            const response = await fetch(
                `/api/organizations/${organizationId}/menus/menu/${menuId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify(formData),
                },
            );

            if (response.ok) {
                const data = await response.json();
                setCurrentMenus(
                    currentMenus.map((menu) =>
                        menu.id === menuId ? data.menu : menu,
                    ),
                );
                setEditingMenu(null);
            }
        } catch (error) {
            console.error('Error updating menu:', error);
        }
    };

    const handleDeleteMenu = async (menuId: number) => {
        if (!confirm('Вы уверены, что хотите удалить это меню?')) return;

        try {
            const response = await fetch(
                `/api/organizations/${organizationId}/menus/menu/${menuId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );

            if (response.ok) {
                setCurrentMenus(
                    currentMenus.filter((menu) => menu.id !== menuId),
                );
            }
        } catch (error) {
            console.error('Error deleting menu:', error);
        }
    };

    const handleToggleMenu = async (menuId: number) => {
        try {
            const response = await fetch(
                `/api/organizations/${organizationId}/menus/menu/${menuId}/toggle`,
                {
                    method: 'PATCH',
                    headers: {
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );

            if (response.ok) {
                const data = await response.json();
                setCurrentMenus(
                    currentMenus.map((menu) =>
                        menu.id === menuId ? data.menu : menu,
                    ),
                );
            }
        } catch (error) {
            console.error('Error toggling menu:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Управление меню</h2>
                <Button onClick={() => setShowCreateMenu(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Создать меню
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {currentMenus.map((menu) => (
                    <Card key={menu.id} className="relative">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        {menu.name}
                                        <Badge
                                            variant={
                                                menu.is_active
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {menu.is_active
                                                ? 'Активно'
                                                : 'Неактивно'}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>
                                        {locations[menu.location]} •{' '}
                                        {menu.items.length} элементов
                                    </CardDescription>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            handleToggleMenu(menu.id)
                                        }
                                    >
                                        {menu.is_active ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingMenu(menu)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            handleDeleteMenu(menu.id)
                                        }
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setSelectedMenu(menu)}
                                >
                                    Управлять элементами
                                </Button>
                                {menu.description && (
                                    <p className="text-sm text-muted-foreground">
                                        {menu.description}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {showCreateMenu && (
                <MenuForm
                    onSubmit={handleCreateMenu}
                    onCancel={() => setShowCreateMenu(false)}
                    locations={locations}
                />
            )}

            {editingMenu && (
                <MenuForm
                    menu={editingMenu}
                    onSubmit={(data) => handleUpdateMenu(editingMenu.id, data)}
                    onCancel={() => setEditingMenu(null)}
                    locations={locations}
                />
            )}

            {selectedMenu && (
                <MenuItemManager
                    organizationId={organizationId}
                    menu={selectedMenu}
                    pages={pages}
                    types={types}
                    onClose={() => setSelectedMenu(null)}
                />
            )}
        </div>
    );
};

interface MenuFormProps {
    menu?: Menu;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    locations: Record<string, string>;
}

const MenuForm: React.FC<MenuFormProps> = ({
    menu,
    onSubmit,
    onCancel,
    locations,
}) => {
    const [formData, setFormData] = useState({
        name: menu?.name || '',
        location: menu?.location || 'header',
        is_active: menu?.is_active ?? true,
        description: menu?.description || '',
        css_classes: menu?.css_classes || [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {menu ? 'Редактировать меню' : 'Создать меню'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Название меню</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="location">Расположение</Label>
                        <Select
                            value={formData.location}
                            onValueChange={(value) =>
                                setFormData({
                                    ...formData,
                                    location: value as any,
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(locations).map(
                                    ([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="description">Описание</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="is_active"
                            checked={formData.is_active}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, is_active: checked })
                            }
                        />
                        <Label htmlFor="is_active">Активно</Label>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit">
                            {menu ? 'Обновить' : 'Создать'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                        >
                            Отмена
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

interface MenuItemManagerProps {
    organizationId: number;
    menu: Menu;
    pages: Array<{ id: number; title: string; slug: string }>;
    types: Record<string, string>;
    onClose: () => void;
}

const MenuItemManager: React.FC<MenuItemManagerProps> = ({
    organizationId,
    menu,
    pages,
    types,
    onClose,
}) => {
    const [items, setItems] = useState<MenuItem[]>(menu.items);

    const renderMenuItem = (item: MenuItem, level: number = 0) => (
        <div key={item.id} className={`ml-${level * 4} rounded border p-2`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span>{item.title}</span>
                    <Badge variant="outline">
                        {types[item.link_type || 'internal']}
                    </Badge>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            {item.children &&
                item.children.map((child) => renderMenuItem(child, level + 1))}
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Элементы меню: {menu.name}</CardTitle>
                    <Button variant="outline" onClick={onClose}>
                        Закрыть
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {items.map((item) => renderMenuItem(item))}
                </div>
                <Button className="mt-4 w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить элемент
                </Button>
            </CardContent>
        </Card>
    );
};

export default MenuManager;

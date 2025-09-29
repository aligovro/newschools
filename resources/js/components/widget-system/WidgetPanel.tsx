import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Widget {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon?: string;
    category: string;
    component_name?: string;
    is_premium: boolean;
}

interface WidgetPosition {
    id: number;
    name: string;
    slug: string;
    description: string;
    area: string;
    order: number;
    allowed_widgets: string[];
    is_required: boolean;
}

interface WidgetPanelProps {
    template: any;
    onAddWidget: (widget: Widget, position: string) => void;
    className?: string;
}

export const WidgetPanel: React.FC<WidgetPanelProps> = ({
    template,
    onAddWidget,
    className,
}) => {
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [positions, setPositions] = useState<WidgetPosition[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        loadWidgets();
    }, [template]);

    const loadWidgets = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `/api/widgets/template/${template.id}`,
            );
            const data = await response.json();

            setWidgets(data.widgets || []);
            setPositions(data.positions || []);

            // Получаем уникальные категории
            const uniqueCategories = [
                ...new Set(data.widgets?.map((w: Widget) => w.category) || []),
            ];
            setCategories(['all', ...uniqueCategories]);
        } catch (error) {
            console.error('Error loading widgets:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredWidgets = widgets.filter((widget) => {
        const matchesCategory =
            selectedCategory === 'all' || widget.category === selectedCategory;
        const matchesSearch =
            widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            widget.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getCategoryIcon = (category: string) => {
        const icons: Record<string, string> = {
            layout: '🎨',
            content: '📝',
            media: '🖼️',
            forms: '📋',
            navigation: '🧭',
        };
        return icons[category] || '🔧';
    };

    const getCategoryName = (category: string) => {
        const names: Record<string, string> = {
            layout: 'Макет',
            content: 'Контент',
            media: 'Медиа',
            forms: 'Формы',
            navigation: 'Навигация',
        };
        return names[category] || category;
    };

    if (loading) {
        return (
            <div
                className={`w-80 border-r border-gray-200 bg-white p-4 ${className}`}
            >
                <div className="animate-pulse">
                    <div className="mb-4 h-8 rounded bg-gray-200"></div>
                    <div className="space-y-2">
                        <div className="h-4 rounded bg-gray-200"></div>
                        <div className="h-4 rounded bg-gray-200"></div>
                        <div className="h-4 rounded bg-gray-200"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`flex w-80 flex-col border-r border-gray-200 bg-white ${className}`}
        >
            <div className="border-b border-gray-200 p-4">
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                    Виджеты
                </h3>

                {/* Поиск */}
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                        type="text"
                        placeholder="Поиск виджетов..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Категории */}
                <Tabs
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="all">Все</TabsTrigger>
                        <TabsTrigger value="free">Бесплатные</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {/* Категории виджетов */}
                {categories
                    .filter((cat) => cat !== 'all')
                    .map((category) => (
                        <div key={category} className="mb-6">
                            <div className="mb-3 flex items-center space-x-2">
                                <span className="text-lg">
                                    {getCategoryIcon(category)}
                                </span>
                                <h4 className="font-medium text-gray-900">
                                    {getCategoryName(category)}
                                </h4>
                            </div>

                            <div className="space-y-2">
                                {filteredWidgets
                                    .filter(
                                        (widget) =>
                                            widget.category === category,
                                    )
                                    .map((widget) => (
                                        <Card
                                            key={widget.id}
                                            className="cursor-pointer transition-shadow hover:shadow-md"
                                            onClick={() =>
                                                onAddWidget(widget, 'content')
                                            }
                                        >
                                            <CardHeader className="pb-2">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-sm font-medium text-gray-900">
                                                            {widget.name}
                                                        </CardTitle>
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {widget.description}
                                                        </p>
                                                    </div>
                                                    {widget.is_premium && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            Pro
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    ))}
                            </div>
                        </div>
                    ))}

                {filteredWidgets.length === 0 && (
                    <div className="py-8 text-center">
                        <p className="text-gray-500">Виджеты не найдены</p>
                    </div>
                )}
            </div>

            {/* Позиции */}
            <div className="border-t border-gray-200 p-4">
                <h4 className="mb-3 font-medium text-gray-900">Позиции</h4>
                <div className="space-y-2">
                    {positions.map((position) => (
                        <div
                            key={position.id}
                            className="flex items-center justify-between rounded-lg bg-gray-50 p-2"
                        >
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {position.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {position.area}
                                </p>
                            </div>
                            {position.is_required && (
                                <Badge variant="outline" className="text-xs">
                                    Обязательная
                                </Badge>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

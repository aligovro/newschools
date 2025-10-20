import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { getCategoryIcon, getCategoryName } from '@/config/widgetCategories';
import { Widget, widgetsSystemApi } from '@/lib/api/index';
import { Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDrag } from 'react-dnd';

interface WidgetPanelProps {
    template: LayoutConfig;
    className?: string;
}

// Компонент для draggable виджета
const DraggableWidget: React.FC<{
    widget: Widget;
}> = ({ widget }) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'widget',
        item: () => {
            const widgetSlug = widget.widget_slug;
            console.log('[DND] drag start from panel', { widgetSlug, widget });
            return { widget: { ...widget, widget_slug: widgetSlug } };
        },
        end: (item, monitor) => {
            const didDrop = monitor.didDrop();
            console.log('[DND] drag end from panel', {
                didDrop,
                item,
            });
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div
            ref={drag as any}
            className={`cursor-grab transition-opacity hover:shadow-md ${
                isDragging ? 'opacity-50' : 'opacity-100'
            }`}
            style={{ pointerEvents: 'auto' }}
        >
            <Card className="h-full">
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
                        {widget.icon && (
                            <span className="text-lg">{widget.icon}</span>
                        )}
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
};

export const WidgetPanel: React.FC<WidgetPanelProps> = ({
    template,
    className,
}) => {
    const [widgets, setWidgets] = useState<Widget[]>([]);
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
            const response = await widgetsSystemApi.getWidgets();

            if (response.success) {
                setWidgets(response.data || []);

                // Получаем уникальные категории
                const categories =
                    response.data?.map((w: Widget) => w.category) || [];
                const uniqueCategories = [...new Set(categories)] as string[];
                setCategories(['all', ...uniqueCategories]);
            }
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
            className={`flex h-full w-full flex-col overflow-hidden bg-white ${className}`}
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
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                            selectedCategory === 'all'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Все
                    </button>
                    {categories
                        .filter((cat) => cat !== 'all')
                        .map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                                    selectedCategory === category
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {getCategoryName(category)}
                            </button>
                        ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="pb-20">
                    {/* Категории виджетов */}
                    {categories
                        .filter((cat) => cat !== 'all')
                        .map((category) => {
                            // Фильтруем виджеты для этой категории
                            const categoryWidgets = filteredWidgets.filter(
                                (widget) => widget.category === category,
                            );

                            // Скрываем категорию если в ней нет виджетов
                            if (categoryWidgets.length === 0) {
                                return null;
                            }

                            return (
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
                                        {categoryWidgets.map((widget) => (
                                            <DraggableWidget
                                                key={widget.id}
                                                widget={widget}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                    {filteredWidgets.length === 0 && (
                        <div className="py-8 text-center">
                            <p className="text-gray-500">Виджеты не найдены</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

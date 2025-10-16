import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WidgetOutputRenderer, WidgetRenderer } from '@/components/widgets';
import { Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
import React from 'react';

interface WidgetData {
    id: string;
    widget_id: number;
    name: string;
    widget_slug: string;
    config: Record<string, unknown>;
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

interface WidgetDisplayProps {
    widget: WidgetData;
    onEdit?: (widget: WidgetData) => void;
    onDelete?: (widget: WidgetData) => void;
    onToggleVisibility?: (widget: WidgetData) => void;
    onSave?: (
        widgetId: string,
        config: Record<string, unknown>,
    ) => Promise<void>;
    isEditable?: boolean;
    autoExpandSettings?: boolean;
    className?: string;
    suppressRender?: boolean;
    useOutputRenderer?: boolean; // New prop to use optimized output renderer
}

export const WidgetDisplay: React.FC<WidgetDisplayProps> = ({
    widget,
    onEdit,
    onDelete,
    onToggleVisibility,
    onSave: _onSave,
    isEditable = true,
    autoExpandSettings: _autoExpandSettings,
    className,
    suppressRender = false,
    useOutputRenderer = false,
}) => {
    const handleEdit = () => {
        if (onEdit) {
            onEdit(widget);
        }
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(widget);
        }
    };

    const handleToggleVisibility = () => {
        if (onToggleVisibility) {
            onToggleVisibility(widget);
        }
    };

    return (
        <div className={`group relative ${className}`}>
            {/* Виджет */}
            <div className="widget-content">
                {suppressRender ? (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                        Настройки виджета открыты. Предварительный просмотр
                        скрыт.
                    </div>
                ) : useOutputRenderer ? (
                    <WidgetOutputRenderer widget={widget} />
                ) : (
                    <WidgetRenderer
                        widget={widget}
                        isEditable={false}
                        autoExpandSettings={false}
                        previewMode={true}
                    />
                )}
            </div>

            {/* Панель управления (только в режиме редактирования) */}
            {isEditable && (
                <div className="pointer-events-none absolute right-2 top-2 z-50 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                    <div className="pointer-events-auto flex space-x-1">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleToggleVisibility}
                            title={widget.is_visible ? 'Скрыть' : 'Показать'}
                        >
                            {widget.is_visible ? (
                                <Eye className="h-4 w-4" />
                            ) : (
                                <EyeOff className="h-4 w-4" />
                            )}
                        </Button>

                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleEdit}
                            title="Редактировать"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleDelete}
                            title="Удалить"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Индикатор неактивного виджета */}
            {!widget.is_active && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
                    <Card className="p-4">
                        <CardContent className="text-center">
                            <p className="mb-2 text-sm text-gray-500">
                                Виджет неактивен
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleEdit}
                            >
                                Активировать
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Индикатор скрытого виджета */}
            {!widget.is_visible && widget.is_active && (
                <div className="absolute inset-0 flex items-center justify-center bg-yellow-100 bg-opacity-75">
                    <Card className="p-4">
                        <CardContent className="text-center">
                            <p className="mb-2 text-sm text-yellow-700">
                                Виджет скрыт
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleToggleVisibility}
                            >
                                Показать
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

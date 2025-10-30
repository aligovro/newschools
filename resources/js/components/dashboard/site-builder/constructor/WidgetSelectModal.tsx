import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Widget } from '@/lib/api/widgets-system';
import React from 'react';

interface WidgetSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectWidget: (widget: Widget) => void;
    widgets: Widget[];
    positionName: string;
    loading?: boolean;
}

export const WidgetSelectModal: React.FC<WidgetSelectModalProps> = ({
    isOpen,
    onClose,
    onSelectWidget,
    widgets,
    positionName,
    loading = false,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="flex max-h-[80vh] max-w-4xl flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>
                        Выберите виджет для позиции "{positionName}"
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                            <p className="text-gray-600">
                                Загрузка доступных виджетов...
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2">
                            {widgets.map((widget) => (
                                <Card
                                    key={widget.id}
                                    className="cursor-pointer transition-shadow hover:shadow-md"
                                    onClick={() => onSelectWidget(widget)}
                                >
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">
                                            {widget.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <p className="mb-3 text-xs text-muted-foreground">
                                            {widget.description ||
                                                'Описание отсутствует'}
                                        </p>
                                        <Button
                                            size="sm"
                                            className="w-full"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectWidget(widget);
                                            }}
                                        >
                                            Выбрать
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {widgets.length === 0 && (
                            <div className="py-8 text-center text-muted-foreground">
                                Нет доступных виджетов
                            </div>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default WidgetSelectModal;

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { WidgetConfig } from '@/types/global';
import React from 'react';

interface WidgetSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectWidget: (widget: WidgetConfig) => void;
    widgets: WidgetConfig[];
    positionName: string;
}

export const WidgetSelectModal: React.FC<WidgetSelectModalProps> = ({
    isOpen,
    onClose,
    onSelectWidget,
    widgets,
    positionName,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Выберите виджет для позиции "{positionName}"
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            </DialogContent>
        </Dialog>
    );
};

export default WidgetSelectModal;

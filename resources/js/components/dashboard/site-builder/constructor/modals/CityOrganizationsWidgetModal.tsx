import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import React from 'react';
import type { WidgetData } from '../../types';
import type { WidgetConfig } from '@/utils/widgetConfigUtils';

interface Props {
    widget: WidgetData;
    pendingConfig: WidgetConfig | null;
    onConfigUpdate: (updates: WidgetConfig) => void;
}

export const CityOrganizationsWidgetModal: React.FC<Props> = ({
    widget,
    pendingConfig,
    onConfigUpdate,
}) => {
    const config = (pendingConfig || widget.config || {}) as any;

    const handleChange = (key: string, value: any) => {
        onConfigUpdate({
            ...config,
            [key]: value,
        });
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Настройки виджета</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="title">Заголовок</Label>
                        <Input
                            id="title"
                            value={(config.title as string) || 'Школы города'}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="Школы города"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <Label htmlFor="city_id">ID города</Label>
                            <Input
                                id="city_id"
                                type="number"
                                value={(config.city_id as number) || ''}
                                onChange={(e) =>
                                    handleChange(
                                        'city_id',
                                        e.target.value ? parseInt(e.target.value) : undefined,
                                    )
                                }
                                placeholder="Например: 1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="limit">Количество школ</Label>
                            <Input
                                id="limit"
                                type="number"
                                min={1}
                                max={50}
                                value={(config.limit as number) || 9}
                                onChange={(e) =>
                                    handleChange(
                                        'limit',
                                        Math.max(1, Math.min(50, parseInt(e.target.value) || 9)),
                                    )
                                }
                            />
                        </div>

                        <div>
                            <Label htmlFor="slidesPerView">Слайдов на экране (desktop)</Label>
                            <Input
                                id="slidesPerView"
                                type="number"
                                min={1}
                                max={6}
                                value={(config.slidesPerView as number) || 3}
                                onChange={(e) =>
                                    handleChange(
                                        'slidesPerView',
                                        Math.max(1, Math.min(6, parseInt(e.target.value) || 3)),
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Switch
                            checked={config.showHeaderActions !== false}
                            onCheckedChange={(checked) =>
                                handleChange('showHeaderActions', !!checked)
                            }
                        />
                        <Label>Показать кнопку “Все школы”</Label>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CityOrganizationsWidgetModal;



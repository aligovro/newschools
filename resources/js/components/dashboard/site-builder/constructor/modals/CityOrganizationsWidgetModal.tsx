import { TitleField } from '@/components/dashboard/widgets/common/TitleField';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { WidgetConfig } from '@/utils/widgetConfigUtils';
import React from 'react';
import type { WidgetData } from '../../types';

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
                    <TitleField
                        title={(config.title as string) || 'Школы города'}
                        showTitle={(config.show_title as boolean) ?? true}
                        onTitleChange={(title) => handleChange('title', title)}
                        onShowTitleChange={(showTitle) =>
                            handleChange('show_title', showTitle)
                        }
                        placeholder="Школы города"
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <Label htmlFor="locality_id">ID города</Label>
                            <Input
                                id="locality_id"
                                type="number"
                                value={(config.locality_id as number) || ''}
                                onChange={(e) =>
                                    handleChange(
                                        'locality_id',
                                        e.target.value
                                            ? parseInt(e.target.value)
                                            : undefined,
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
                                        Math.max(
                                            1,
                                            Math.min(
                                                50,
                                                parseInt(e.target.value) || 9,
                                            ),
                                        ),
                                    )
                                }
                            />
                        </div>

                        <div>
                            <Label htmlFor="slidesPerView">
                                Слайдов на экране (desktop)
                            </Label>
                            <Input
                                id="slidesPerView"
                                type="number"
                                min={1}
                                max={6}
                                value={(config.slidesPerView as number) || 3}
                                onChange={(e) =>
                                    handleChange(
                                        'slidesPerView',
                                        Math.max(
                                            1,
                                            Math.min(
                                                6,
                                                parseInt(e.target.value) || 3,
                                            ),
                                        ),
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

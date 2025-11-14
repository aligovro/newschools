import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Heart, Settings } from 'lucide-react';
import React from 'react';
import type { DonationWidgetConfig } from './types';

interface DonationWidgetEditorProps {
    isSettingsExpanded: boolean;
    onToggleSettings: () => void;
    localConfig: DonationWidgetConfig;
    setLocalConfig: React.Dispatch<React.SetStateAction<DonationWidgetConfig>>;
}

export const DonationWidgetEditor: React.FC<DonationWidgetEditorProps> =
    React.memo(
        ({
            isSettingsExpanded,
            localConfig,
            onToggleSettings,
            setLocalConfig,
        }) => {
            const {
                title,
                description,
                button_text = 'Поддержать',
                default_amount = 100,
                min_amount = 1,
                max_amount = 0,
                allow_recurring = true,
                allow_anonymous = true,
                show_progress = true,
            } = localConfig;

            return (
                <div className="donation-widget-editor w-full">
                    <Card className="w-full">
                        <CardContent className="p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-lg font-semibold">
                                    <Heart className="h-5 w-5 text-red-500" />
                                    Виджет пожертвований
                                </h3>
                                <button
                                    onClick={onToggleSettings}
                                    className="flex items-center space-x-2 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                                    type="button"
                                >
                                    <Settings className="h-4 w-4" />
                                    <span>Настройки</span>
                                    {isSettingsExpanded ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                            {isSettingsExpanded && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold text-gray-700">
                                            Основное
                                        </h4>
                                        <div>
                                            <Label htmlFor="title">
                                                Заголовок
                                            </Label>
                                            <Input
                                                id="title"
                                                value={title || ''}
                                                onChange={(e) =>
                                                    setLocalConfig((prev) => ({
                                                        ...prev,
                                                        title: e.target.value,
                                                    }))
                                                }
                                                placeholder="Поддержать школу"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="description">
                                                Описание
                                            </Label>
                                            <Input
                                                id="description"
                                                value={description || ''}
                                                onChange={(e) =>
                                                    setLocalConfig((prev) => ({
                                                        ...prev,
                                                        description:
                                                            e.target.value,
                                                    }))
                                                }
                                                placeholder="Ваша поддержка поможет..."
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="button_text">
                                                Текст кнопки
                                            </Label>
                                            <Input
                                                id="button_text"
                                                value={button_text}
                                                onChange={(e) =>
                                                    setLocalConfig((prev) => ({
                                                        ...prev,
                                                        button_text:
                                                            e.target.value,
                                                    }))
                                                }
                                                placeholder="Поддержать"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold text-gray-700">
                                            Суммы пожертвований
                                        </h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="default_amount">
                                                    Сумма по умолчанию
                                                </Label>
                                                <Input
                                                    id="default_amount"
                                                    type="number"
                                                    value={default_amount}
                                                    onChange={(e) =>
                                                        setLocalConfig(
                                                            (prev) => ({
                                                                ...prev,
                                                                default_amount:
                                                                    Number.parseInt(
                                                                        e.target
                                                                            .value,
                                                                        10,
                                                                    ) || 100,
                                                            }),
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="min_amount">
                                                    Минимум
                                                </Label>
                                                <Input
                                                    id="min_amount"
                                                    type="number"
                                                    value={min_amount}
                                                    onChange={(e) =>
                                                        setLocalConfig(
                                                            (prev) => ({
                                                                ...prev,
                                                                min_amount:
                                                                    Number.parseInt(
                                                                        e.target
                                                                            .value,
                                                                        10,
                                                                    ) || 1,
                                                            }),
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="max_amount">
                                                    Максимум (0 = нет)
                                                </Label>
                                                <Input
                                                    id="max_amount"
                                                    type="number"
                                                    value={max_amount}
                                                    onChange={(e) =>
                                                        setLocalConfig(
                                                            (prev) => ({
                                                                ...prev,
                                                                max_amount:
                                                                    Number.parseInt(
                                                                        e.target
                                                                            .value,
                                                                        10,
                                                                    ) || 0,
                                                            }),
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-gray-700">
                                            Опции
                                        </h4>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="allow_recurring"
                                                checked={allow_recurring}
                                                onCheckedChange={(checked) =>
                                                    setLocalConfig((prev) => ({
                                                        ...prev,
                                                        allow_recurring:
                                                            checked as boolean,
                                                    }))
                                                }
                                            />
                                            <Label htmlFor="allow_recurring">
                                                Разрешить регулярные платежи
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="allow_anonymous"
                                                checked={allow_anonymous}
                                                onCheckedChange={(checked) =>
                                                    setLocalConfig((prev) => ({
                                                        ...prev,
                                                        allow_anonymous:
                                                            checked as boolean,
                                                    }))
                                                }
                                            />
                                            <Label htmlFor="allow_anonymous">
                                                Разрешить анонимные
                                                пожертвования
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="show_progress"
                                                checked={show_progress}
                                                onCheckedChange={(checked) =>
                                                    setLocalConfig((prev) => ({
                                                        ...prev,
                                                        show_progress:
                                                            checked as boolean,
                                                    }))
                                                }
                                            />
                                            <Label htmlFor="show_progress">
                                                Показывать прогресс сбора
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            );
        },
    );

DonationWidgetEditor.displayName = 'DonationWidgetEditor';

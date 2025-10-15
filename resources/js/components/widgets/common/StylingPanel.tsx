import { ColorPicker } from '@/components/ui/ColorPicker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';

export interface StylingConfig {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    margin?: string;
    borderRadius?: string;
    borderWidth?: string;
    borderColor?: string;
    boxShadow?: 'none' | 'sm' | 'md' | 'lg';
    customClass?: string;
}

interface StylingPanelProps {
    value?: StylingConfig;
    onChange: (styling: StylingConfig) => void;
}

export const StylingPanel: React.FC<StylingPanelProps> = ({
    value,
    onChange,
}) => {
    const styling = value || {};

    const handle = (key: keyof StylingConfig, val: string) => {
        onChange({ ...styling, [key]: val });
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <ColorPicker
                    label="Цвет фона"
                    value={styling.backgroundColor || ''}
                    onChange={(color) => handle('backgroundColor', color)}
                />
                <ColorPicker
                    label="Цвет текста"
                    value={styling.textColor || ''}
                    onChange={(color) => handle('textColor', color)}
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="padding">Внутренние отступы (px)</Label>
                    <Input
                        id="padding"
                        type="number"
                        value={styling.padding ? parseInt(styling.padding) : ''}
                        onChange={(e) =>
                            handle('padding', `${e.target.value || 0}px`)
                        }
                    />
                </div>
                <div>
                    <Label htmlFor="margin">Внешние отступы (px)</Label>
                    <Input
                        id="margin"
                        type="number"
                        value={styling.margin ? parseInt(styling.margin) : ''}
                        onChange={(e) =>
                            handle('margin', `${e.target.value || 0}px`)
                        }
                    />
                </div>
                <div>
                    <Label htmlFor="radius">Скругление (px)</Label>
                    <Input
                        id="radius"
                        type="number"
                        value={
                            styling.borderRadius
                                ? parseInt(styling.borderRadius)
                                : ''
                        }
                        onChange={(e) =>
                            handle('borderRadius', `${e.target.value || 0}px`)
                        }
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="bwidth">Толщина границы (px)</Label>
                    <Input
                        id="bwidth"
                        type="number"
                        value={
                            styling.borderWidth
                                ? parseInt(styling.borderWidth)
                                : ''
                        }
                        onChange={(e) =>
                            handle('borderWidth', `${e.target.value || 0}px`)
                        }
                    />
                </div>
                <div>
                    <ColorPicker
                        label="Цвет границы"
                        value={styling.borderColor || ''}
                        onChange={(color) => handle('borderColor', color)}
                    />
                </div>
                <div>
                    <Label htmlFor="shadow">Тень (none|sm|md|lg)</Label>
                    <Input
                        id="shadow"
                        placeholder="none | sm | md | lg"
                        value={styling.boxShadow || 'none'}
                        onChange={(e) =>
                            handle(
                                'boxShadow',
                                e.target.value as StylingConfig['boxShadow'],
                            )
                        }
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="class">Доп. CSS класс</Label>
                <Input
                    id="class"
                    placeholder="custom-class"
                    value={styling.customClass || ''}
                    onChange={(e) => handle('customClass', e.target.value)}
                />
            </div>
        </div>
    );
};

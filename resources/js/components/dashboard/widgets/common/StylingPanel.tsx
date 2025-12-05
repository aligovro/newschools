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
    
    // Локальное состояние для поля customClass чтобы избежать проблем с обновлением
    const [customClassValue, setCustomClassValue] = React.useState(
        styling.customClass || ''
    );
    
    // Используем ref для отслеживания предыдущего значения пропса
    const prevPropValueRef = React.useRef(styling.customClass);
    
    React.useEffect(() => {
        // Обновляем локальное состояние только если значение пропса действительно изменилось извне
        if (styling.customClass !== prevPropValueRef.current) {
            setCustomClassValue(styling.customClass || '');
            prevPropValueRef.current = styling.customClass;
        }
    }, [styling.customClass]);

    const handle = React.useCallback(
        (key: keyof StylingConfig, val: string) => {
            const currentStyling = value || {};
            const newStyling = { ...currentStyling, [key]: val };
            onChange(newStyling);
        },
        [value, onChange],
    );
    
    const handleCustomClassChange = React.useCallback(
        (newValue: string) => {
            setCustomClassValue(newValue);
            handle('customClass', newValue);
        },
        [handle],
    );

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
                <Label htmlFor="customClass">Доп. CSS класс</Label>
                <input
                    id="customClass"
                    type="text"
                    placeholder="custom-class"
                    autoComplete="off"
                    className="border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive"
                    value={customClassValue}
                    onChange={(e) => {
                        const newValue = e.target.value;
                        handleCustomClassChange(newValue);
                    }}
                />
            </div>
        </div>
    );
};

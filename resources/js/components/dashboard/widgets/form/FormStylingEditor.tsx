import React, { useCallback, useMemo } from 'react';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { FormWidget } from './types';

interface FormStylingEditorProps {
    widget: FormWidget;
    onStylingChange: (styling: Partial<FormWidget>) => void;
}

export const FormStylingEditor: React.FC<FormStylingEditorProps> = ({
    widget,
    onStylingChange,
}) => {
    const styling = useMemo(() => widget.styling || {}, [widget.styling]);

    const handleContainerChange = useCallback(
        (key: string, value: string) => {
            onStylingChange({
                styling: {
                    ...styling,
                    container: {
                        ...styling.container,
                        [key]: value,
                    },
                },
            });
        },
        [styling, onStylingChange],
    );

    const handleTitleChange = useCallback(
        (key: string, value: string) => {
            onStylingChange({
                styling: {
                    ...styling,
                    title: {
                        ...styling.title,
                        [key]: value,
                    },
                },
            });
        },
        [styling, onStylingChange],
    );

    const handleButtonChange = useCallback(
        (key: string, value: string) => {
            onStylingChange({
                styling: {
                    ...styling,
                    button: {
                        ...styling.button,
                        [key]: value,
                    },
                },
            });
        },
        [styling, onStylingChange],
    );

    return (
        <div className="form-styling-editor">
            <h3>Настройки стилизации формы</h3>

            {/* Контейнер формы */}
            <div className="form-styling-editor__section">
                <h4>Контейнер формы</h4>

                <div className="form-styling-editor__field">
                    <label>Максимальная ширина</label>
                    <input
                        type="text"
                        value={styling.container?.max_width || ''}
                        onChange={(e) =>
                            handleContainerChange('max_width', e.target.value)
                        }
                        placeholder="600px, 100%, auto"
                    />
                </div>

                <div className="form-styling-editor__field">
                    <label>Отступы (padding)</label>
                    <input
                        type="text"
                        value={styling.container?.padding || ''}
                        onChange={(e) =>
                            handleContainerChange('padding', e.target.value)
                        }
                        placeholder="24px"
                    />
                </div>

                <div className="form-styling-editor__field">
                    <ColorPicker
                        label="Цвет фона контейнера"
                        value={styling.container?.background_color || '#ffffff'}
                        onChange={(color) =>
                            handleContainerChange('background_color', color)
                        }
                    />
                </div>

                <div className="form-styling-editor__field">
                    <label>Скругление углов</label>
                    <input
                        type="text"
                        value={styling.container?.border_radius || ''}
                        onChange={(e) =>
                            handleContainerChange(
                                'border_radius',
                                e.target.value,
                            )
                        }
                        placeholder="8px"
                    />
                </div>

                <div className="form-styling-editor__field">
                    <label>Тень</label>
                    <input
                        type="text"
                        value={styling.container?.box_shadow || ''}
                        onChange={(e) =>
                            handleContainerChange('box_shadow', e.target.value)
                        }
                        placeholder="0 1px 3px rgba(0, 0, 0, 0.1)"
                    />
                </div>
            </div>

            {/* Заголовок */}
            <div className="form-styling-editor__section">
                <h4>Заголовок формы</h4>

                <div className="form-styling-editor__field">
                    <label>Размер шрифта</label>
                    <input
                        type="text"
                        value={styling.title?.font_size || ''}
                        onChange={(e) =>
                            handleTitleChange('font_size', e.target.value)
                        }
                        placeholder="24px"
                    />
                </div>

                <div className="form-styling-editor__field">
                    <label>Толщина шрифта</label>
                    <select
                        value={styling.title?.font_weight || '600'}
                        onChange={(e) =>
                            handleTitleChange('font_weight', e.target.value)
                        }
                    >
                        <option value="400">Normal</option>
                        <option value="500">Medium</option>
                        <option value="600">Semibold</option>
                        <option value="700">Bold</option>
                    </select>
                </div>

                <div className="form-styling-editor__field">
                    <ColorPicker
                        label="Цвет заголовка"
                        value={styling.title?.color || '#1f2937'}
                        onChange={(color) => handleTitleChange('color', color)}
                    />
                </div>

                <div className="form-styling-editor__field">
                    <label>Выравнивание текста</label>
                    <select
                        value={styling.title?.text_align || 'left'}
                        onChange={(e) =>
                            handleTitleChange('text_align', e.target.value)
                        }
                    >
                        <option value="left">Слева</option>
                        <option value="center">По центру</option>
                        <option value="right">Справа</option>
                    </select>
                </div>
            </div>

            {/* Кнопка отправки */}
            <div className="form-styling-editor__section">
                <h4>Кнопка отправки</h4>

                <div className="form-styling-editor__field">
                    <label>Ширина кнопки</label>
                    <input
                        type="text"
                        value={styling.button?.width || ''}
                        onChange={(e) =>
                            handleButtonChange('width', e.target.value)
                        }
                        placeholder="auto, 100%, 200px"
                    />
                </div>

                <div className="form-styling-editor__field">
                    <label>Отступы (padding)</label>
                    <input
                        type="text"
                        value={styling.button?.padding || ''}
                        onChange={(e) =>
                            handleButtonChange('padding', e.target.value)
                        }
                        placeholder="8px 24px"
                    />
                </div>

                <div className="form-styling-editor__field">
                    <ColorPicker
                        label="Цвет фона кнопки"
                        value={styling.button?.background_color || '#3b82f6'}
                        onChange={(color) =>
                            handleButtonChange('background_color', color)
                        }
                    />
                </div>

                <div className="form-styling-editor__field">
                    <ColorPicker
                        label="Цвет текста кнопки"
                        value={styling.button?.color || '#ffffff'}
                        onChange={(color) => handleButtonChange('color', color)}
                    />
                </div>

                <div className="form-styling-editor__field">
                    <label>Размер шрифта</label>
                    <input
                        type="text"
                        value={styling.button?.font_size || ''}
                        onChange={(e) =>
                            handleButtonChange('font_size', e.target.value)
                        }
                        placeholder="14px"
                    />
                </div>

                <div className="form-styling-editor__field">
                    <label>Толщина шрифта</label>
                    <select
                        value={styling.button?.font_weight || '500'}
                        onChange={(e) =>
                            handleButtonChange('font_weight', e.target.value)
                        }
                    >
                        <option value="400">Normal</option>
                        <option value="500">Medium</option>
                        <option value="600">Semibold</option>
                        <option value="700">Bold</option>
                    </select>
                </div>

                <div className="form-styling-editor__field">
                    <label>Скругление углов</label>
                    <input
                        type="text"
                        value={styling.button?.border_radius || ''}
                        onChange={(e) =>
                            handleButtonChange('border_radius', e.target.value)
                        }
                        placeholder="4px"
                    />
                </div>
            </div>

            {/* CSS класс */}
            <div className="form-styling-editor__section">
                <h4>Дополнительно</h4>

                <div className="form-styling-editor__field">
                    <label>CSS класс для обертки</label>
                    <input
                        type="text"
                        value={widget.css_class || ''}
                        onChange={(e) =>
                            onStylingChange({ css_class: e.target.value })
                        }
                        placeholder="my-custom-form-class"
                    />
                    <p className="form-styling-editor__help-text">
                        Добавьте CSS класс для кастомной стилизации формы. Вы
                        сможете использовать этот класс в своих CSS файлах.
                    </p>
                </div>
            </div>
        </div>
    );
};

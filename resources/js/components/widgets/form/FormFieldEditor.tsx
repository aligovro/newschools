import React, { useCallback, useEffect, useState } from 'react';
import { ColorPicker } from '../../ui/ColorPicker';
import { FormField, FormFieldOption } from './types';

interface FormFieldEditorProps {
    field: FormField;
    onUpdateField: (field: FormField) => void;
}

export const FormFieldEditor: React.FC<FormFieldEditorProps> = ({
    field,
    onUpdateField,
}) => {
    const [localField, setLocalField] = useState<FormField>(field);

    // Синхронизируем localField с prop field при его изменении
    useEffect(() => {
        setLocalField(field);
    }, [field]);

    const handleFieldChange = useCallback(
        (key: keyof FormField, value: unknown) => {
            const updatedField = { ...localField, [key]: value };
            setLocalField(updatedField);
            onUpdateField(updatedField);
        },
        [localField, onUpdateField],
    );

    const handleOptionChange = useCallback(
        (index: number, key: keyof FormFieldOption, value: unknown) => {
            const updatedOptions = [...(localField.options || [])];
            updatedOptions[index] = { ...updatedOptions[index], [key]: value };
            handleFieldChange('options', updatedOptions);
        },
        [localField.options, handleFieldChange],
    );

    const addOption = useCallback(() => {
        const newOption: FormFieldOption = {
            value: '',
            label: '',
            is_selected: false,
        };
        const updatedOptions = [...(localField.options || []), newOption];
        handleFieldChange('options', updatedOptions);
    }, [localField.options, handleFieldChange]);

    const removeOption = useCallback(
        (index: number) => {
            const updatedOptions = (localField.options || []).filter(
                (_, i) => i !== index,
            );
            handleFieldChange('options', updatedOptions);
        },
        [localField.options, handleFieldChange],
    );

    const moveOption = useCallback(
        (index: number, direction: 'up' | 'down') => {
            const options = [...(localField.options || [])];
            const newIndex = direction === 'up' ? index - 1 : index + 1;

            if (newIndex < 0 || newIndex >= options.length) return;

            [options[index], options[newIndex]] = [
                options[newIndex],
                options[index],
            ];
            handleFieldChange('options', options);
        },
        [localField.options, handleFieldChange],
    );

    const needsOptions = ['select', 'radio', 'checkbox'].includes(field.type);

    return (
        <div className="form-field-editor">
            <div className="form-field-editor__header">
                <h4>Редактирование поля</h4>
                <span className="form-field-editor__type">{field.type}</span>
            </div>

            <div className="form-field-editor__content">
                {/* Основные настройки */}
                <div className="form-field-editor__section">
                    <h5>Основные настройки</h5>

                    <div className="form-field-editor__field">
                        <label>Название поля</label>
                        <input
                            type="text"
                            value={localField.label}
                            onChange={(e) =>
                                handleFieldChange('label', e.target.value)
                            }
                            placeholder="Введите название поля"
                        />
                    </div>

                    <div className="form-field-editor__field">
                        <label>Имя поля (ID)</label>
                        <input
                            type="text"
                            value={localField.name}
                            onChange={(e) =>
                                handleFieldChange('name', e.target.value)
                            }
                            placeholder="field_name"
                        />
                    </div>

                    <div className="form-field-editor__field">
                        <label>Подсказка (placeholder)</label>
                        <input
                            type="text"
                            value={localField.placeholder || ''}
                            onChange={(e) =>
                                handleFieldChange('placeholder', e.target.value)
                            }
                            placeholder="Введите подсказку"
                        />
                    </div>

                    <div className="form-field-editor__field">
                        <label>Текст помощи</label>
                        <textarea
                            value={localField.help_text || ''}
                            onChange={(e) =>
                                handleFieldChange('help_text', e.target.value)
                            }
                            placeholder="Введите текст помощи"
                            rows={3}
                        />
                    </div>

                    <div className="form-field-editor__field">
                        <label>
                            <input
                                type="checkbox"
                                checked={localField.is_required}
                                onChange={(e) =>
                                    handleFieldChange(
                                        'is_required',
                                        e.target.checked,
                                    )
                                }
                            />
                            Обязательное поле
                        </label>
                    </div>

                    <div className="form-field-editor__field">
                        <label>
                            <input
                                type="checkbox"
                                checked={localField.is_active}
                                onChange={(e) =>
                                    handleFieldChange(
                                        'is_active',
                                        e.target.checked,
                                    )
                                }
                            />
                            Активное поле
                        </label>
                    </div>
                </div>

                {/* Настройки для полей с опциями */}
                {needsOptions && (
                    <div className="form-field-editor__section">
                        <h5>Опции выбора</h5>

                        <div className="form-field-editor__options">
                            {(localField.options || []).map((option, index) => (
                                <div
                                    key={index}
                                    className="form-field-editor__option"
                                >
                                    <div className="form-field-editor__option-content">
                                        <input
                                            type="text"
                                            value={option.value}
                                            onChange={(e) =>
                                                handleOptionChange(
                                                    index,
                                                    'value',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Значение"
                                        />
                                        <input
                                            type="text"
                                            value={option.label}
                                            onChange={(e) =>
                                                handleOptionChange(
                                                    index,
                                                    'label',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Отображаемый текст"
                                        />
                                        {field.type === 'select' && (
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        option.is_selected ||
                                                        false
                                                    }
                                                    onChange={(e) =>
                                                        handleOptionChange(
                                                            index,
                                                            'is_selected',
                                                            e.target.checked,
                                                        )
                                                    }
                                                />
                                                По умолчанию
                                            </label>
                                        )}
                                    </div>

                                    <div className="form-field-editor__option-actions">
                                        <button
                                            onClick={() =>
                                                moveOption(index, 'up')
                                            }
                                            disabled={index === 0}
                                            title="Переместить вверх"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            onClick={() =>
                                                moveOption(index, 'down')
                                            }
                                            disabled={
                                                index ===
                                                (localField.options?.length ||
                                                    0) -
                                                    1
                                            }
                                            title="Переместить вниз"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            onClick={() => removeOption(index)}
                                            title="Удалить опцию"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            className="form-field-editor__add-option-btn"
                            onClick={addOption}
                        >
                            + Добавить опцию
                        </button>
                    </div>
                )}

                {/* Настройки валидации */}
                <div className="form-field-editor__section">
                    <h5>Валидация</h5>

                    <div className="form-field-editor__field">
                        <label>Правила валидации (через запятую)</label>
                        <input
                            type="text"
                            value={(localField.validation || []).join(', ')}
                            onChange={(e) => {
                                const rules = e.target.value
                                    .split(',')
                                    .map((rule) => rule.trim())
                                    .filter((rule) => rule.length > 0);
                                handleFieldChange('validation', rules);
                            }}
                            placeholder="min:3, max:50, regex:^[a-zA-Z]+$"
                        />
                        <div className="form-field-editor__validation-hint">
                            <p>Доступные правила:</p>
                            <ul>
                                <li>
                                    <code>min:3</code> - минимум 3 символа
                                </li>
                                <li>
                                    <code>max:50</code> - максимум 50 символов
                                </li>
                                <li>
                                    <code>size:10</code> - ровно 10 символов
                                </li>
                                <li>
                                    <code>regex:^[a-zA-Z]+$</code> - регулярное
                                    выражение
                                </li>
                                <li>
                                    <code>min_value:1</code> - минимальное
                                    значение (для чисел)
                                </li>
                                <li>
                                    <code>max_value:100</code> - максимальное
                                    значение (для чисел)
                                </li>
                                <li>
                                    <code>file_size:1024</code> - размер файла в
                                    КБ
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Предустановленные правила для разных типов полей */}
                    {localField.type === 'text' && (
                        <div className="form-field-editor__field">
                            <label>Быстрые правила для текста</label>
                            <div className="form-field-editor__quick-rules">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const currentRules =
                                            localField.validation || [];
                                        const newRules = [
                                            ...currentRules,
                                            'min:2',
                                            'max:100',
                                        ];
                                        handleFieldChange(
                                            'validation',
                                            newRules,
                                        );
                                    }}
                                >
                                    Имя (2-100 символов)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const currentRules =
                                            localField.validation || [];
                                        const newRules = [
                                            ...currentRules,
                                            'min:10',
                                            'max:500',
                                        ];
                                        handleFieldChange(
                                            'validation',
                                            newRules,
                                        );
                                    }}
                                >
                                    Описание (10-500 символов)
                                </button>
                            </div>
                        </div>
                    )}

                    {localField.type === 'number' && (
                        <div className="form-field-editor__field">
                            <label>Быстрые правила для чисел</label>
                            <div className="form-field-editor__quick-rules">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const currentRules =
                                            localField.validation || [];
                                        const newRules = [
                                            ...currentRules,
                                            'min_value:0',
                                            'max_value:100',
                                        ];
                                        handleFieldChange(
                                            'validation',
                                            newRules,
                                        );
                                    }}
                                >
                                    Процент (0-100)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const currentRules =
                                            localField.validation || [];
                                        const newRules = [
                                            ...currentRules,
                                            'min_value:1',
                                            'max_value:1000',
                                        ];
                                        handleFieldChange(
                                            'validation',
                                            newRules,
                                        );
                                    }}
                                >
                                    Количество (1-1000)
                                </button>
                            </div>
                        </div>
                    )}

                    {(localField.type === 'file' ||
                        localField.type === 'image') && (
                        <div className="form-field-editor__field">
                            <label>Настройки файла</label>
                            <div className="form-field-editor__file-settings">
                                <div>
                                    <label>
                                        Максимальный размер файла (КБ)
                                    </label>
                                    <input
                                        type="number"
                                        value={
                                            localField.max_file_size || 10240
                                        }
                                        onChange={(e) => {
                                            const size = parseInt(
                                                e.target.value,
                                            );
                                            const currentRules =
                                                localField.validation || [];
                                            const filteredRules =
                                                currentRules.filter(
                                                    (rule) =>
                                                        !rule.startsWith(
                                                            'file_size:',
                                                        ),
                                                );
                                            const newRules = [
                                                ...filteredRules,
                                                `file_size:${size}`,
                                            ];
                                            handleFieldChange(
                                                'validation',
                                                newRules,
                                            );
                                        }}
                                    />
                                </div>
                                {localField.type === 'image' && (
                                    <div>
                                        <label>
                                            Разрешенные типы изображений
                                        </label>
                                        <select
                                            multiple
                                            value={
                                                localField.allowed_file_types || [
                                                    'image/jpeg',
                                                    'image/png',
                                                ]
                                            }
                                            onChange={(e) => {
                                                const types = Array.from(
                                                    e.target.selectedOptions,
                                                    (option) => option.value,
                                                );
                                                handleFieldChange(
                                                    'allowed_file_types',
                                                    types,
                                                );
                                            }}
                                        >
                                            <option value="image/jpeg">
                                                JPEG
                                            </option>
                                            <option value="image/png">
                                                PNG
                                            </option>
                                            <option value="image/gif">
                                                GIF
                                            </option>
                                            <option value="image/webp">
                                                WebP
                                            </option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Настройки стилизации */}
                <div className="form-field-editor__section">
                    <h5>Стилизация</h5>

                    <div className="form-field-editor__field">
                        <label>Ширина</label>
                        <input
                            type="text"
                            value={localField.styling?.width || ''}
                            onChange={(e) =>
                                handleFieldChange('styling', {
                                    ...localField.styling,
                                    width: e.target.value,
                                })
                            }
                            placeholder="100%, 300px, auto"
                        />
                    </div>

                    <div className="form-field-editor__field">
                        <label>Высота</label>
                        <input
                            type="text"
                            value={localField.styling?.height || ''}
                            onChange={(e) =>
                                handleFieldChange('styling', {
                                    ...localField.styling,
                                    height: e.target.value,
                                })
                            }
                            placeholder="40px, auto"
                        />
                    </div>

                    <div className="form-field-editor__field">
                        <ColorPicker
                            label="Цвет фона"
                            value={
                                localField.styling?.background_color ||
                                '#ffffff'
                            }
                            onChange={(color) =>
                                handleFieldChange('styling', {
                                    ...localField.styling,
                                    background_color: color,
                                })
                            }
                        />
                    </div>

                    <div className="form-field-editor__field">
                        <ColorPicker
                            label="Цвет текста"
                            value={localField.styling?.text_color || '#000000'}
                            onChange={(color) =>
                                handleFieldChange('styling', {
                                    ...localField.styling,
                                    text_color: color,
                                })
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

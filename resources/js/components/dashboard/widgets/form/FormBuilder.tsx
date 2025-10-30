import React, { useCallback, useState } from 'react';
import { FormFieldEditor } from './FormFieldEditor';
import { FormFieldList } from './FormFieldList';
import { FormField, FormWidget as FormWidgetType } from './types';

interface FormBuilderProps {
    widget: FormWidgetType;
    onConfigChange: (config: Partial<FormWidgetType>) => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
    widget,
    onConfigChange,
}) => {
    const [selectedField, setSelectedField] = useState<FormField | null>(null);
    const [isAddingField, setIsAddingField] = useState(false);

    const handleAddField = useCallback(
        (fieldType: string) => {
            const newField: FormField = {
                name: `field_${Date.now()}`,
                label: `Новое поле`,
                type: fieldType as any,
                placeholder: '',
                help_text: '',
                options: [],
                validation: [],
                styling: {},
                is_required: false,
                is_active: true,
                sort_order: (widget.fields?.length || 0) + 1,
            };

            const updatedFields = [...(widget.fields || []), newField];
            onConfigChange({ fields: updatedFields });
            setSelectedField(newField);
            setIsAddingField(false);
        },
        [widget.fields, onConfigChange],
    );

    const handleUpdateField = useCallback(
        (updatedField: FormField) => {
            const updatedFields = (widget.fields || []).map((field) =>
                field.name === updatedField.name ? updatedField : field,
            );
            onConfigChange({ fields: updatedFields });
            setSelectedField(updatedField);
        },
        [widget.fields, onConfigChange],
    );

    const handleDeleteField = useCallback(
        (fieldName: string) => {
            console.log('handleDeleteField called with:', fieldName);
            console.log('Current fields:', widget.fields);
            const updatedFields = (widget.fields || []).filter(
                (field) => field.name !== fieldName,
            );
            console.log('Updated fields after deletion:', updatedFields);
            onConfigChange({ fields: updatedFields });
            setSelectedField(null);
        },
        [widget.fields, onConfigChange],
    );

    const handleMoveField = useCallback(
        (fieldName: string, direction: 'up' | 'down') => {
            const fields = [...(widget.fields || [])];
            const fieldIndex = fields.findIndex(
                (field) => field.name === fieldName,
            );

            if (fieldIndex === -1) return;

            const newIndex =
                direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;

            if (newIndex < 0 || newIndex >= fields.length) return;

            // Меняем местами поля
            [fields[fieldIndex], fields[newIndex]] = [
                fields[newIndex],
                fields[fieldIndex],
            ];

            // Обновляем sort_order
            fields.forEach((field, index) => {
                field.sort_order = index + 1;
            });

            onConfigChange({ fields: fields });
        },
        [widget.fields, onConfigChange],
    );

    const fieldTypes = [
        { type: 'text', label: 'Текст', icon: '📝' },
        { type: 'email', label: 'Email', icon: '📧' },
        { type: 'phone', label: 'Телефон', icon: '📞' },
        { type: 'textarea', label: 'Текстовая область', icon: '📄' },
        { type: 'select', label: 'Выбор', icon: '📋' },
        { type: 'radio', label: 'Радио кнопки', icon: '🔘' },
        { type: 'checkbox', label: 'Чекбоксы', icon: '☑️' },
        { type: 'file', label: 'Файл', icon: '📎' },
        { type: 'image', label: 'Изображение', icon: '🖼️' },
        { type: 'number', label: 'Число', icon: '🔢' },
        { type: 'date', label: 'Дата', icon: '📅' },
        { type: 'url', label: 'URL', icon: '🔗' },
        { type: 'hidden', label: 'Скрытое поле', icon: '👁️‍🗨️' },
        { type: 'heading', label: 'Заголовок', icon: '📌' },
        { type: 'description', label: 'Описание', icon: '📝' },
    ];

    return (
        <div className="form-builder">
            <div className="form-builder__header">
                <h3>Конструктор формы</h3>
                <button
                    className="form-builder__add-field-btn"
                    onClick={() => setIsAddingField(true)}
                >
                    + Добавить поле
                </button>
            </div>

            <div className="form-builder__content">
                <div className="form-builder__fields-panel">
                    <FormFieldList
                        fields={widget.fields || []}
                        selectedField={selectedField}
                        onSelectField={setSelectedField}
                        onDeleteField={handleDeleteField}
                        onMoveField={handleMoveField}
                    />
                </div>

                <div className="form-builder__editor-panel">
                    {isAddingField && (
                        <div className="form-builder__field-type-selector">
                            <h4>Выберите тип поля</h4>
                            <div className="form-builder__field-types">
                                {fieldTypes.map((fieldType) => (
                                    <button
                                        key={fieldType.type}
                                        className="form-builder__field-type-btn"
                                        onClick={() =>
                                            handleAddField(fieldType.type)
                                        }
                                    >
                                        <span className="form-builder__field-type-icon">
                                            {fieldType.icon}
                                        </span>
                                        <span className="form-builder__field-type-label">
                                            {fieldType.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <button
                                className="form-builder__cancel-btn"
                                onClick={() => setIsAddingField(false)}
                            >
                                Отмена
                            </button>
                        </div>
                    )}

                    {selectedField && !isAddingField && (
                        <FormFieldEditor
                            field={selectedField}
                            onUpdateField={handleUpdateField}
                        />
                    )}

                    {!selectedField && !isAddingField && (
                        <div className="form-builder__placeholder">
                            <p>
                                Выберите поле для редактирования или добавьте
                                новое поле
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

import React from 'react';
import { FormField } from './types';

interface FormFieldListProps {
    fields: FormField[];
    selectedField: FormField | null;
    onSelectField: (field: FormField) => void;
    onDeleteField: (fieldName: string) => void;
    onMoveField: (fieldName: string, direction: 'up' | 'down') => void;
}

export const FormFieldList: React.FC<FormFieldListProps> = ({
    fields,
    selectedField,
    onSelectField,
    onDeleteField,
    onMoveField,
}) => {
    const getFieldIcon = (type: string) => {
        const icons: Record<string, string> = {
            text: '📝',
            email: '📧',
            phone: '📞',
            textarea: '📄',
            select: '📋',
            radio: '🔘',
            checkbox: '☑️',
            file: '📎',
            image: '🖼️',
            number: '🔢',
            date: '📅',
            url: '🔗',
            hidden: '👁️‍🗨️',
            heading: '📌',
            description: '📝',
        };
        return icons[type] || '📝';
    };

    const getFieldTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            text: 'Текст',
            email: 'Email',
            phone: 'Телефон',
            textarea: 'Текстовая область',
            select: 'Выбор',
            radio: 'Радио кнопки',
            checkbox: 'Чекбоксы',
            file: 'Файл',
            image: 'Изображение',
            number: 'Число',
            date: 'Дата',
            url: 'URL',
            hidden: 'Скрытое поле',
            heading: 'Заголовок',
            description: 'Описание',
        };
        return labels[type] || type;
    };

    return (
        <div className="form-field-list">
            <div className="form-field-list__header">
                <h4>Поля формы</h4>
                <span className="form-field-list__count">
                    {fields.length} полей
                </span>
            </div>

            <div className="form-field-list__content">
                {fields.length === 0 ? (
                    <div className="form-field-list__empty">
                        <p>Поля не добавлены</p>
                        <p className="form-field-list__empty-hint">
                            Нажмите "Добавить поле" чтобы создать первое поле
                        </p>
                    </div>
                ) : (
                    <div className="form-field-list__items">
                        {fields.map((field, index) => (
                            <div
                                key={field.name}
                                className={`form-field-list__item ${
                                    selectedField?.name === field.name
                                        ? 'selected'
                                        : ''
                                }`}
                                onClick={() => onSelectField(field)}
                            >
                                <div className="form-field-list__item-header">
                                    <div className="form-field-list__item-info">
                                        <span className="form-field-list__item-icon">
                                            {getFieldIcon(field.type)}
                                        </span>
                                        <div className="form-field-list__item-details">
                                            <div className="form-field-list__item-label">
                                                {field.label || 'Без названия'}
                                            </div>
                                            <div className="form-field-list__item-type">
                                                {getFieldTypeLabel(field.type)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-field-list__item-actions">
                                        <button
                                            className="form-field-list__action-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onMoveField(field.name, 'up');
                                            }}
                                            disabled={index === 0}
                                            title="Переместить вверх"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            className="form-field-list__action-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onMoveField(field.name, 'down');
                                            }}
                                            disabled={
                                                index === fields.length - 1
                                            }
                                            title="Переместить вниз"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            className="form-field-list__action-btn form-field-list__action-btn--delete"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteField(field.name);
                                            }}
                                            title="Удалить поле"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                <div className="form-field-list__item-footer">
                                    <div className="form-field-list__item-status">
                                        {field.is_required && (
                                            <span className="form-field-list__required-badge">
                                                Обязательное
                                            </span>
                                        )}
                                        {!field.is_active && (
                                            <span className="form-field-list__inactive-badge">
                                                Неактивно
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

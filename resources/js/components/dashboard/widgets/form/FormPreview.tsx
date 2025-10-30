import React, { useState } from 'react';
import { DatePickerField } from './DatePickerField';
import { FormWidget } from './types';

interface FormPreviewProps {
    widget: FormWidget;
}

export const FormPreview: React.FC<FormPreviewProps> = ({ widget }) => {
    const [previewData, setPreviewData] = useState<Record<string, string>>({});

    const renderField = (field: any) => {
        const fieldStyle = {
            width: field.styling?.width || '100%',
            height: field.styling?.height || 'auto',
            backgroundColor: field.styling?.background_color || '#ffffff',
            color: field.styling?.text_color || '#000000',
            border: `1px solid ${field.styling?.border_color || '#d1d5db'}`,
            borderRadius: field.styling?.border_radius || '4px',
            padding: field.styling?.padding || '8px 12px',
            fontSize: field.styling?.font_size || '14px',
            fontWeight: field.styling?.font_weight || '400',
            margin: field.styling?.margin || '0 0 16px 0',
        };

        const labelStyle = {
            display: 'block',
            marginBottom: '4px',
            fontWeight: '500',
            color: '#374151',
        };

        const helpTextStyle = {
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '4px',
        };

        const requiredMark = field.is_required ? (
            <span style={{ color: '#ef4444' }}> *</span>
        ) : null;

        switch (field.type) {
            case 'heading':
                return (
                    <div key={field.name} style={{ margin: '24px 0 16px 0' }}>
                        <h3
                            style={{
                                margin: 0,
                                fontSize: '18px',
                                fontWeight: '600',
                            }}
                        >
                            {field.label}
                        </h3>
                    </div>
                );

            case 'description':
                return (
                    <div key={field.name} style={{ margin: '0 0 16px 0' }}>
                        <p style={{ margin: 0, color: '#6b7280' }}>
                            {field.label}
                        </p>
                    </div>
                );

            case 'date':
                return (
                    <div key={field.name} style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>
                            {field.label}
                            {requiredMark}
                        </label>
                        <DatePickerField
                            name={field.name}
                            value={previewData[field.name] || ''}
                            onChange={(value) =>
                                setPreviewData((prev) => ({
                                    ...prev,
                                    [field.name]: value,
                                }))
                            }
                            placeholder={field.placeholder}
                            required={field.is_required}
                            style={fieldStyle}
                        />
                        {field.help_text && (
                            <div style={helpTextStyle}>{field.help_text}</div>
                        )}
                    </div>
                );

            case 'text':
            case 'email':
            case 'phone':
            case 'number':
            case 'url':
                return (
                    <div key={field.name} style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>
                            {field.label}
                            {requiredMark}
                        </label>
                        <input
                            type={field.type === 'phone' ? 'tel' : field.type}
                            placeholder={field.placeholder}
                            required={field.is_required}
                            style={fieldStyle}
                        />
                        {field.help_text && (
                            <div style={helpTextStyle}>{field.help_text}</div>
                        )}
                    </div>
                );

            case 'textarea':
                return (
                    <div key={field.name} style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>
                            {field.label}
                            {requiredMark}
                        </label>
                        <textarea
                            placeholder={field.placeholder}
                            required={field.is_required}
                            rows={4}
                            style={fieldStyle}
                        />
                        {field.help_text && (
                            <div style={helpTextStyle}>{field.help_text}</div>
                        )}
                    </div>
                );

            case 'select':
                return (
                    <div key={field.name} style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>
                            {field.label}
                            {requiredMark}
                        </label>
                        <select required={field.is_required} style={fieldStyle}>
                            <option value="">
                                {field.placeholder || 'Выберите опцию'}
                            </option>
                            {(field.options || []).map(
                                (option: any, index: number) => (
                                    <option
                                        key={index}
                                        value={option.value}
                                        selected={option.is_selected}
                                    >
                                        {option.label}
                                    </option>
                                ),
                            )}
                        </select>
                        {field.help_text && (
                            <div style={helpTextStyle}>{field.help_text}</div>
                        )}
                    </div>
                );

            case 'radio':
                return (
                    <div key={field.name} style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>
                            {field.label}
                            {requiredMark}
                        </label>
                        <div style={{ marginTop: '8px' }}>
                            {(field.options || []).map(
                                (option: any, index: number) => (
                                    <label
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '8px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name={field.name}
                                            value={option.value}
                                            required={field.is_required}
                                            style={{ marginRight: '8px' }}
                                        />
                                        {option.label}
                                    </label>
                                ),
                            )}
                        </div>
                        {field.help_text && (
                            <div style={helpTextStyle}>{field.help_text}</div>
                        )}
                    </div>
                );

            case 'checkbox':
                return (
                    <div key={field.name} style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>
                            {field.label}
                            {requiredMark}
                        </label>
                        <div style={{ marginTop: '8px' }}>
                            {(field.options || []).map(
                                (option: any, index: number) => (
                                    <label
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '8px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            name={`${field.name}[]`}
                                            value={option.value}
                                            style={{ marginRight: '8px' }}
                                        />
                                        {option.label}
                                    </label>
                                ),
                            )}
                        </div>
                        {field.help_text && (
                            <div style={helpTextStyle}>{field.help_text}</div>
                        )}
                    </div>
                );

            case 'file':
            case 'image':
                return (
                    <div key={field.name} style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>
                            {field.label}
                            {requiredMark}
                        </label>
                        <input
                            type="file"
                            accept={
                                field.type === 'image' ? 'image/*' : undefined
                            }
                            required={field.is_required}
                            style={fieldStyle}
                        />
                        {field.help_text && (
                            <div style={helpTextStyle}>{field.help_text}</div>
                        )}
                    </div>
                );

            case 'hidden':
                return (
                    <input
                        key={field.name}
                        type="hidden"
                        name={field.name}
                        value={field.placeholder || ''}
                    />
                );

            default:
                return null;
        }
    };

    const containerStyle = {
        maxWidth: widget.styling?.container_width || '600px',
        padding: widget.styling?.container_padding || '24px',
        margin: widget.styling?.container_margin || '0 auto',
        backgroundColor: widget.styling?.background_color || '#ffffff',
        borderRadius: widget.styling?.border_radius || '8px',
        boxShadow: widget.styling?.box_shadow || '0 1px 3px rgba(0, 0, 0, 0.1)',
    };

    const buttonStyle = {
        width: widget.styling?.button_style?.width || 'auto',
        height: widget.styling?.button_style?.height || '40px',
        padding: widget.styling?.button_style?.padding || '8px 24px',
        borderRadius: widget.styling?.button_style?.border_radius || '4px',
        backgroundColor:
            widget.styling?.button_style?.background_color || '#3b82f6',
        color: widget.styling?.button_style?.text_color || '#ffffff',
        fontSize: widget.styling?.button_style?.font_size || '14px',
        fontWeight: widget.styling?.button_style?.font_weight || '500',
        border: 'none',
        cursor: 'pointer',
    };

    return (
        <div className="form-preview">
            <div className="form-preview__header">
                <h3>Предварительный просмотр формы</h3>
                <p>Так будет выглядеть ваша форма для пользователей</p>
            </div>

            <div className="form-preview__content">
                <form style={containerStyle}>
                    {widget.settings?.title && (
                        <h2 style={{ marginBottom: '16px', fontSize: '24px' }}>
                            {widget.settings.title}
                        </h2>
                    )}

                    {widget.settings?.description && (
                        <p style={{ marginBottom: '24px', color: '#6b7280' }}>
                            {widget.settings.description}
                        </p>
                    )}

                    {(widget.fields || [])
                        .filter((field) => field.is_active)
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map(renderField)}

                    <button type="submit" style={buttonStyle}>
                        {widget.settings?.submit_button_text || 'Отправить'}
                    </button>
                </form>
            </div>
        </div>
    );
};

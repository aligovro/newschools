import { formsApi } from '@/lib/api/index';
import React, { useCallback, useState } from 'react';
import { FormValidationService } from '../../../services/FormValidationService';
import { DatePickerField } from './DatePickerField';
import { FormValidationErrors } from './FormValidationErrors';
import { FormField, FormWidget } from './types';

interface FormRendererProps {
    widget: FormWidget;
}

export const FormRenderer: React.FC<FormRendererProps> = ({ widget }) => {
    const [formData, setFormData] = useState<
        Record<string, string | string[] | File | null>
    >({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<
        'idle' | 'success' | 'error'
    >('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string[]>
    >({});

    const handleInputChange = useCallback(
        (fieldName: string, value: string | string[] | File | null) => {
            setFormData((prev) => ({ ...prev, [fieldName]: value }));

            // Очищаем ошибки валидации для этого поля при изменении
            if (validationErrors[fieldName]) {
                setValidationErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[fieldName];
                    return newErrors;
                });
            }
        },
        [validationErrors],
    );

    const getFieldValue = (fieldName: string): string => {
        const value = formData[fieldName];
        return typeof value === 'string' ? value : '';
    };

    const getFieldArrayValue = (fieldName: string): string[] => {
        const value = formData[fieldName];
        return Array.isArray(value) ? value : [];
    };

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setIsSubmitting(true);
            setSubmitStatus('idle');
            setErrorMessage('');
            setValidationErrors({});

            // Валидация на фронтенде
            const validationResult = FormValidationService.validateFormData(
                formData,
                widget.fields || [],
            );

            if (!validationResult.isValid) {
                setValidationErrors(validationResult.errors);
                setSubmitStatus('error');
                setIsSubmitting(false);
                return;
            }

            // Очистка данных
            const sanitizedData = FormValidationService.sanitizeFormData(
                formData,
                widget.fields || [],
            );

            try {
                const result = await formsApi.submitForm(
                    widget.site_id,
                    widget.id,
                    sanitizedData,
                );

                if (result.success) {
                    setSubmitStatus('success');
                    setFormData({});

                    // Редирект если настроен
                    if (widget.settings?.redirect_url) {
                        window.location.href = widget.settings.redirect_url;
                    }
                } else {
                    setSubmitStatus('error');
                    if (result.errors) {
                        setValidationErrors(result.errors);
                    }
                    setErrorMessage(
                        result.message || 'Произошла ошибка при отправке формы',
                    );
                }
            } catch {
                setSubmitStatus('error');
                setErrorMessage('Произошла ошибка при отправке формы');
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, widget],
    );

    const renderField = (field: FormField) => {
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
                            value={getFieldValue(field.name)}
                            onChange={(value) =>
                                handleInputChange(field.name, value)
                            }
                            placeholder={field.placeholder}
                            required={field.is_required}
                            style={fieldStyle}
                        />
                        {field.help_text && (
                            <div style={helpTextStyle}>{field.help_text}</div>
                        )}
                        <FormValidationErrors
                            errors={validationErrors}
                            fieldName={field.name}
                        />
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
                            name={field.name}
                            placeholder={field.placeholder}
                            required={field.is_required}
                            value={getFieldValue(field.name)}
                            onChange={(e) =>
                                handleInputChange(field.name, e.target.value)
                            }
                            style={fieldStyle}
                        />
                        {field.help_text && (
                            <div style={helpTextStyle}>{field.help_text}</div>
                        )}
                        <FormValidationErrors
                            errors={validationErrors}
                            fieldName={field.name}
                        />
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
                            name={field.name}
                            placeholder={field.placeholder}
                            required={field.is_required}
                            value={getFieldValue(field.name)}
                            onChange={(e) =>
                                handleInputChange(field.name, e.target.value)
                            }
                            rows={4}
                            style={fieldStyle}
                        />
                        {field.help_text && (
                            <div style={helpTextStyle}>{field.help_text}</div>
                        )}
                        <FormValidationErrors
                            errors={validationErrors}
                            fieldName={field.name}
                        />
                    </div>
                );

            case 'select':
                return (
                    <div key={field.name} style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>
                            {field.label}
                            {requiredMark}
                        </label>
                        <select
                            name={field.name}
                            required={field.is_required}
                            value={getFieldValue(field.name)}
                            onChange={(e) =>
                                handleInputChange(field.name, e.target.value)
                            }
                            style={fieldStyle}
                        >
                            <option value="">
                                {field.placeholder || 'Выберите опцию'}
                            </option>
                            {(field.options || []).map(
                                (option, index: number) => (
                                    <option key={index} value={option.value}>
                                        {option.label}
                                    </option>
                                ),
                            )}
                        </select>
                        {field.help_text && (
                            <div style={helpTextStyle}>{field.help_text}</div>
                        )}
                        <FormValidationErrors
                            errors={validationErrors}
                            fieldName={field.name}
                        />
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
                                (option, index: number) => (
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
                                            checked={
                                                getFieldValue(field.name) ===
                                                option.value
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    field.name,
                                                    e.target.value,
                                                )
                                            }
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
                        <FormValidationErrors
                            errors={validationErrors}
                            fieldName={field.name}
                        />
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
                                (option, index: number) => (
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
                                            checked={getFieldArrayValue(
                                                field.name,
                                            ).includes(option.value)}
                                            onChange={(e) => {
                                                const currentValues =
                                                    getFieldArrayValue(
                                                        field.name,
                                                    );
                                                if (e.target.checked) {
                                                    handleInputChange(
                                                        field.name,
                                                        [
                                                            ...currentValues,
                                                            option.value,
                                                        ],
                                                    );
                                                } else {
                                                    handleInputChange(
                                                        field.name,
                                                        currentValues.filter(
                                                            (v: string) =>
                                                                v !==
                                                                option.value,
                                                        ),
                                                    );
                                                }
                                            }}
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
                        <FormValidationErrors
                            errors={validationErrors}
                            fieldName={field.name}
                        />
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
                            name={field.name}
                            accept={
                                field.type === 'image' ? 'image/*' : undefined
                            }
                            required={field.is_required}
                            onChange={(e) =>
                                handleInputChange(
                                    field.name,
                                    e.target.files?.[0] || null,
                                )
                            }
                            style={fieldStyle}
                        />
                        {field.help_text && (
                            <div style={helpTextStyle}>{field.help_text}</div>
                        )}
                        <FormValidationErrors
                            errors={validationErrors}
                            fieldName={field.name}
                        />
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
        maxWidth: widget.styling?.container?.max_width || '600px',
        padding: widget.styling?.container?.padding || '24px',
        margin: widget.styling?.container?.margin || '0 auto',
        backgroundColor:
            widget.styling?.container?.background_color || '#ffffff',
        borderRadius: widget.styling?.container?.border_radius || '8px',
        boxShadow:
            widget.styling?.container?.box_shadow ||
            '0 1px 3px rgba(0, 0, 0, 0.1)',
    };

    const buttonStyle = {
        width: widget.styling?.button?.width || 'auto',
        height: widget.styling?.button?.height || '40px',
        padding: widget.styling?.button?.padding || '8px 24px',
        borderRadius: widget.styling?.button?.border_radius || '4px',
        backgroundColor: widget.styling?.button?.background_color || '#3b82f6',
        color: widget.styling?.button?.color || '#ffffff',
        fontSize: widget.styling?.button?.font_size || '14px',
        fontWeight: widget.styling?.button?.font_weight || '500',
        border: widget.styling?.button?.border || 'none',
        cursor: isSubmitting ? 'not-allowed' : 'pointer',
        opacity: isSubmitting ? 0.7 : 1,
    };

    if (submitStatus === 'success') {
        return (
            <div style={containerStyle}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <h3 style={{ color: '#10b981', marginBottom: '16px' }}>
                        ✅{' '}
                        {widget.settings?.success_message ||
                            'Форма успешно отправлена!'}
                    </h3>
                    <p>
                        Спасибо за ваше сообщение. Мы свяжемся с вами в
                        ближайшее время.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            style={containerStyle}
            className={widget.css_class || ''}
        >
            {widget.settings?.title && (
                <h2
                    style={{
                        marginBottom:
                            widget.styling?.title?.margin_bottom || '16px',
                        fontSize: widget.styling?.title?.font_size || '24px',
                        fontWeight: widget.styling?.title?.font_weight || '600',
                        color: widget.styling?.title?.color || '#1f2937',
                        textAlign: widget.styling?.title?.text_align || 'left',
                    }}
                >
                    {widget.settings.title}
                </h2>
            )}

            {widget.settings?.description && (
                <p
                    style={{
                        marginBottom:
                            widget.styling?.description?.margin_bottom ||
                            '24px',
                        color: widget.styling?.description?.color || '#6b7280',
                        fontSize:
                            widget.styling?.description?.font_size || '16px',
                        textAlign:
                            widget.styling?.description?.text_align || 'left',
                    }}
                >
                    {widget.settings.description}
                </p>
            )}

            {submitStatus === 'error' && (
                <div
                    style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        padding: '12px',
                        borderRadius: '4px',
                        marginBottom: '16px',
                    }}
                >
                    {errorMessage}
                </div>
            )}

            {(widget.fields || [])
                .filter((field) => field.is_active)
                .sort((a, b) => a.sort_order - b.sort_order)
                .map(renderField)}

            <button type="submit" disabled={isSubmitting} style={buttonStyle}>
                {isSubmitting
                    ? 'Отправка...'
                    : widget.settings?.submit_button_text || 'Отправить'}
            </button>
        </form>
    );
};

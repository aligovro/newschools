import React, { useState } from 'react';
import { FormField, FormOutputConfig, WidgetOutputProps } from './types';

export const FormOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = widget.config as FormOutputConfig;

    const {
        title = '',
        show_title = true, // По умолчанию true для обратной совместимости
        description = '',
        fields = [],
        submitText = 'Отправить',
        successMessage = 'Спасибо! Ваше сообщение отправлено.',
    } = config;

    const [formData, setFormData] = useState<Record<string, unknown>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    if (!fields || fields.length === 0) {
        return (
            <div
                className={`form-output form-output--empty ${className || ''}`}
                style={style}
            >
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <span className="text-gray-500">Форма не настроена</span>
                </div>
            </div>
        );
    }

    const handleInputChange = (fieldId: string, value: unknown) => {
        setFormData((prev) => ({
            ...prev,
            [fieldId]: value,
        }));

        // Clear error when user starts typing
        if (errors[fieldId]) {
            setErrors((prev) => ({
                ...prev,
                [fieldId]: '',
            }));
        }
    };

    const validateField = (field: FormField, value: unknown): string => {
        if (field.required && (!value || value.toString().trim() === '')) {
            return `${field.label} обязательно для заполнения`;
        }

        if (value && field.validation) {
            const { minLength, maxLength, pattern } = field.validation;

            if (minLength && value.toString().length < minLength) {
                return `${field.label} должно содержать минимум ${minLength} символов`;
            }

            if (maxLength && value.toString().length > maxLength) {
                return `${field.label} должно содержать максимум ${maxLength} символов`;
            }

            if (pattern && !new RegExp(pattern).test(value.toString())) {
                return `${field.label} имеет неверный формат`;
            }
        }

        return '';
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        fields.forEach((field) => {
            const error = validateField(field, formData[field.id]);
            if (error) {
                newErrors[field.id] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Here you would typically send the form data to your API
            console.log('Form data:', formData);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setIsSubmitted(true);
            setFormData({});
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = (field: FormField) => {
        const value = formData[field.id] || '';
        const error = errors[field.id];

        const baseClasses = `w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-300' : 'border-gray-300'
        }`;

        switch (field.type) {
            case 'textarea':
                return (
                    <textarea
                        key={field.id}
                        id={field.id}
                        value={value as string}
                        onChange={(e) =>
                            handleInputChange(field.id, e.target.value)
                        }
                        placeholder={field.placeholder}
                        required={field.required}
                        className={`${baseClasses} resize-vertical min-h-[100px]`}
                    />
                );

            case 'select':
                return (
                    <select
                        key={field.id}
                        id={field.id}
                        value={value as string}
                        onChange={(e) =>
                            handleInputChange(field.id, e.target.value)
                        }
                        required={field.required}
                        className={baseClasses}
                    >
                        <option value="">Выберите...</option>
                        {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'checkbox':
                return (
                    <div key={field.id} className="flex items-center">
                        <input
                            type="checkbox"
                            id={field.id}
                            checked={value as boolean}
                            onChange={(e) =>
                                handleInputChange(field.id, e.target.checked)
                            }
                            className="h-4 w-4 rounded border-gray-300 text-black checked:border-black checked:bg-black focus:ring-black"
                        />
                        <label
                            htmlFor={field.id}
                            className="ml-2 text-sm text-gray-700"
                        >
                            {field.label}
                        </label>
                    </div>
                );

            case 'radio':
                return (
                    <div key={field.id} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            {field.label}
                        </label>
                        {field.options?.map((option) => (
                            <div
                                key={option.value}
                                className="flex items-center"
                            >
                                <input
                                    type="radio"
                                    id={`${field.id}-${option.value}`}
                                    name={field.id}
                                    value={option.value}
                                    checked={value === option.value}
                                    onChange={(e) =>
                                        handleInputChange(
                                            field.id,
                                            e.target.value,
                                        )
                                    }
                                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label
                                    htmlFor={`${field.id}-${option.value}`}
                                    className="ml-2 text-sm text-gray-700"
                                >
                                    {option.label}
                                </label>
                            </div>
                        ))}
                    </div>
                );

            case 'file':
                return (
                    <input
                        key={field.id}
                        type="file"
                        id={field.id}
                        onChange={(e) =>
                            handleInputChange(field.id, e.target.files?.[0])
                        }
                        required={field.required}
                        className={`${baseClasses} file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100`}
                    />
                );

            default:
                return (
                    <input
                        key={field.id}
                        type={field.type}
                        id={field.id}
                        value={value as string}
                        onChange={(e) =>
                            handleInputChange(field.id, e.target.value)
                        }
                        placeholder={field.placeholder}
                        required={field.required}
                        className={baseClasses}
                    />
                );
        }
    };

    if (isSubmitted) {
        return (
            <div
                className={`form-output form-output--success ${className || ''}`}
                style={style}
            >
                <div className="rounded-md bg-green-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-green-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">
                                {successMessage}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`form-output ${className || ''}`} style={style}>
            {title && show_title && (
                <h2 className="block__title mb-4">{title}</h2>
            )}

            {description && <p className="mb-6 text-gray-600">{description}</p>}

            <form onSubmit={handleSubmit} className="space-y-6">
                {fields.map((field) => (
                    <div key={field.id}>
                        {field.type !== 'checkbox' &&
                            field.type !== 'radio' && (
                                <label
                                    htmlFor={field.id}
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    {field.label}
                                    {field.required && (
                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    )}
                                </label>
                            )}

                        {renderField(field)}

                        {errors[field.id] && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors[field.id]}
                            </p>
                        )}
                    </div>
                ))}

                <div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? 'Отправка...' : submitText}
                    </button>
                </div>
            </form>
        </div>
    );
};

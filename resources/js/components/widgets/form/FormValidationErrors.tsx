import React from 'react';

interface FormValidationErrorsProps {
    errors: Record<string, string[]>;
    fieldName?: string;
    className?: string;
}

export const FormValidationErrors: React.FC<FormValidationErrorsProps> = ({
    errors,
    fieldName,
    className = '',
}) => {
    if (!errors || Object.keys(errors).length === 0) {
        return null;
    }

    // Если указано конкретное поле, показываем только его ошибки
    if (fieldName) {
        const fieldErrors = errors[fieldName];
        if (!fieldErrors || fieldErrors.length === 0) {
            return null;
        }

        return (
            <div className={`form-validation-errors ${className}`}>
                {fieldErrors.map((error, index) => (
                    <div key={index} className="form-validation-errors__error">
                        {error}
                    </div>
                ))}
            </div>
        );
    }

    // Показываем все ошибки
    return (
        <div className={`form-validation-errors ${className}`}>
            {Object.entries(errors).map(([field, fieldErrors]) => (
                <div key={field} className="form-validation-errors__field">
                    <div className="form-validation-errors__field-name">
                        {field}
                    </div>
                    <div className="form-validation-errors__field-errors">
                        {fieldErrors.map((error, index) => (
                            <div
                                key={index}
                                className="form-validation-errors__error"
                            >
                                {error}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

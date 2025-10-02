// Удалены неиспользуемые интерфейсы

interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string[]>;
}

export class FormValidationService {
    /**
     * Валидирует данные формы
     */
    static validateFormData(
        data: Record<string, unknown>,
        fields: unknown[],
    ): ValidationResult {
        const errors: Record<string, string[]> = {};

        fields.forEach((field: any) => {
            const fieldErrors = this.validateField(
                data[field.name],
                field,
                data,
            );

            if (fieldErrors.length > 0) {
                errors[field.name] = fieldErrors;
            }
        });

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }

    /**
     * Валидирует отдельное поле
     */
    static validateField(
        value: unknown,
        field: any,
        _allData: Record<string, unknown>,
    ): string[] {
        const errors: string[] = [];
        const fieldLabel = field.label || field.name;

        // Проверка обязательности
        if (field.is_required && this.isEmpty(value)) {
            errors.push(`Поле "${fieldLabel}" обязательно для заполнения`);
            return errors; // Если поле пустое и обязательное, не проверяем остальные правила
        }

        // Если поле пустое и не обязательное, пропускаем валидацию
        if (this.isEmpty(value)) {
            return errors;
        }

        // Валидация по типу поля
        switch (field.type) {
            case 'email':
                if (!this.isValidEmail(value as string)) {
                    errors.push(
                        `Поле "${fieldLabel}" должно содержать корректный email адрес`,
                    );
                }
                break;

            case 'phone':
                if (!this.isValidPhone(value as string)) {
                    errors.push(
                        `Поле "${fieldLabel}" должно содержать корректный номер телефона`,
                    );
                }
                break;

            case 'url':
                if (!this.isValidUrl(value as string)) {
                    errors.push(
                        `Поле "${fieldLabel}" должно содержать корректный URL`,
                    );
                }
                break;

            case 'number':
                if (!this.isValidNumber(value)) {
                    errors.push(`Поле "${fieldLabel}" должно содержать число`);
                }
                break;

            case 'date':
                if (!this.isValidDate(value as string)) {
                    errors.push(
                        `Поле "${fieldLabel}" должно содержать корректную дату`,
                    );
                }
                break;

            case 'file':
            case 'image':
                if (!this.isValidFile(value as File, field)) {
                    errors.push(
                        `Поле "${fieldLabel}" должно содержать корректный файл`,
                    );
                }
                break;
        }

        // Дополнительные правила валидации
        if (field.validation && Array.isArray(field.validation)) {
            field.validation.forEach((rule: string) => {
                const error = this.validateRule(value, rule, fieldLabel);
                if (error) {
                    errors.push(error);
                }
            });
        }

        // Валидация полей с опциями
        if (['select', 'radio', 'checkbox'].includes(field.type)) {
            const options = field.options || [];
            const validValues = options.map((opt: any) => opt.value);

            if (field.type === 'checkbox') {
                if (Array.isArray(value)) {
                    const invalidValues = value.filter(
                        (v: string) => !validValues.includes(v),
                    );
                    if (invalidValues.length > 0) {
                        errors.push(
                            `Поле "${fieldLabel}" содержит недопустимые значения`,
                        );
                    }
                }
            } else {
                if (!validValues.includes(value as string)) {
                    errors.push(
                        `Поле "${fieldLabel}" содержит недопустимое значение`,
                    );
                }
            }
        }

        return errors;
    }

    /**
     * Проверяет, пустое ли значение
     */
    static isEmpty(value: unknown): boolean {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        return false;
    }

    /**
     * Валидирует email
     */
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Валидирует телефон
     */
    static isValidPhone(phone: string): boolean {
        const phoneRegex = /^[+]?[0-9\s\-()]{10,}$/;
        return phoneRegex.test(phone);
    }

    /**
     * Валидирует URL
     */
    static isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Валидирует число
     */
    static isValidNumber(value: unknown): boolean {
        return !isNaN(Number(value)) && isFinite(Number(value));
    }

    /**
     * Валидирует дату
     */
    static isValidDate(date: string): boolean {
        const dateObj = new Date(date);
        return !isNaN(dateObj.getTime());
    }

    /**
     * Валидирует файл
     */
    static isValidFile(file: File, field: any): boolean {
        if (!file) return false;

        // Проверка размера файла
        const maxSize = field.max_file_size || 10 * 1024 * 1024; // 10MB по умолчанию
        if (file.size > maxSize) {
            return false;
        }

        // Проверка типа файла
        const allowedTypes = field.allowed_file_types || [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'text/plain',
        ];

        if (!allowedTypes.includes(file.type)) {
            return false;
        }

        // Дополнительная проверка для изображений
        if (field.type === 'image') {
            const imageTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
            ];
            if (!imageTypes.includes(file.type)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Валидирует правило валидации
     */
    static validateRule(
        value: unknown,
        rule: string,
        fieldLabel: string,
    ): string | null {
        const ruleParts = rule.split(':');
        const ruleType = ruleParts[0];
        const ruleValue = ruleParts[1];

        switch (ruleType) {
            case 'min':
                if (
                    typeof value === 'string' &&
                    value.length < parseInt(ruleValue)
                ) {
                    return `Поле "${fieldLabel}" должно содержать минимум ${ruleValue} символов`;
                }
                if (typeof value === 'number' && value < parseInt(ruleValue)) {
                    return `Поле "${fieldLabel}" должно быть не менее ${ruleValue}`;
                }
                break;

            case 'max':
                if (
                    typeof value === 'string' &&
                    value.length > parseInt(ruleValue)
                ) {
                    return `Поле "${fieldLabel}" должно содержать максимум ${ruleValue} символов`;
                }
                if (typeof value === 'number' && value > parseInt(ruleValue)) {
                    return `Поле "${fieldLabel}" должно быть не более ${ruleValue}`;
                }
                break;

            case 'size':
                if (
                    typeof value === 'string' &&
                    value.length !== parseInt(ruleValue)
                ) {
                    return `Поле "${fieldLabel}" должно содержать ровно ${ruleValue} символов`;
                }
                break;

            case 'regex':
                try {
                    const regex = new RegExp(ruleValue);
                    if (!regex.test(value as string)) {
                        return `Поле "${fieldLabel}" имеет неверный формат`;
                    }
                } catch {
                    console.warn('Invalid regex pattern:', ruleValue);
                }
                break;

            case 'min_value':
                if (typeof value === 'number' && value < parseInt(ruleValue)) {
                    return `Поле "${fieldLabel}" должно быть не менее ${ruleValue}`;
                }
                break;

            case 'max_value':
                if (typeof value === 'number' && value > parseInt(ruleValue)) {
                    return `Поле "${fieldLabel}" должно быть не более ${ruleValue}`;
                }
                break;

            case 'file_size':
                if (
                    value instanceof File &&
                    value.size > parseInt(ruleValue) * 1024
                ) {
                    return `Файл "${fieldLabel}" должен быть не более ${ruleValue} КБ`;
                }
                break;
        }

        return null;
    }

    /**
     * Очищает и нормализует данные формы
     */
    static sanitizeFormData(
        data: Record<string, unknown>,
        fields: any[],
    ): Record<string, unknown> {
        const sanitized: Record<string, unknown> = {};

        fields.forEach((field: any) => {
            const value = data[field.name];
            if (value === null || value === undefined) {
                return;
            }

            switch (field.type) {
                case 'email':
                    sanitized[field.name] = (value as string)
                        .toLowerCase()
                        .trim();
                    break;

                case 'text':
                case 'textarea':
                    sanitized[field.name] = (value as string).trim();
                    break;

                case 'phone':
                    sanitized[field.name] = (value as string).replace(
                        /[^\d+\-()\s]/g,
                        '',
                    );
                    break;

                case 'number':
                    sanitized[field.name] = isNaN(Number(value))
                        ? value
                        : Number(value);
                    break;

                case 'url':
                    try {
                        sanitized[field.name] = new URL(
                            value as string,
                        ).toString();
                    } catch {
                        sanitized[field.name] = value;
                    }
                    break;

                case 'checkbox':
                    sanitized[field.name] = Array.isArray(value)
                        ? value
                        : [value];
                    break;

                default:
                    sanitized[field.name] = value;
            }
        });

        return sanitized;
    }

    /**
     * Получает сообщения об ошибках для поля
     */
    static getFieldErrors(
        fieldName: string,
        errors: Record<string, string[]>,
    ): string[] {
        return errors[fieldName] || [];
    }

    /**
     * Проверяет, есть ли ошибки для поля
     */
    static hasFieldErrors(
        fieldName: string,
        errors: Record<string, string[]>,
    ): boolean {
        return fieldName in errors && errors[fieldName].length > 0;
    }
}

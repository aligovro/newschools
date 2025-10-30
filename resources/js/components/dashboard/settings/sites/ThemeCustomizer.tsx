import { cn } from '@/lib/helpers';
import {
    themeSettingsSchema,
    type ThemeSettingsFormData,
} from '@/lib/validations';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { ChromePicker } from 'react-color';
import { useForm } from 'react-hook-form';

interface ThemeCustomizerProps {
    initialData?: Partial<ThemeSettingsFormData>;
    onSave: (data: ThemeSettingsFormData) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    className?: string;
}

const fontFamilies = [
    { value: 'Inter', label: 'Inter (современный)' },
    { value: 'Roboto', label: 'Roboto (классический)' },
    { value: 'Open Sans', label: 'Open Sans (читаемый)' },
    { value: 'Lato', label: 'Lato (элегантный)' },
    { value: 'Montserrat', label: 'Montserrat (стильный)' },
    { value: 'Source Sans Pro', label: 'Source Sans Pro (профессиональный)' },
    { value: 'Poppins', label: 'Poppins (дружелюбный)' },
    { value: 'Nunito', label: 'Nunito (округленный)' },
];

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
    initialData,
    onSave,
    onCancel,
    isLoading = false,
    className = '',
}) => {
    const [activeColorPicker, setActiveColorPicker] = useState<string | null>(
        null,
    );

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        watch,
        setValue,
    } = useForm<ThemeSettingsFormData>({
        resolver: yupResolver(themeSettingsSchema),
        defaultValues: {
            name: initialData?.name || 'Моя тема',
            primaryColor: initialData?.primaryColor || '#3b82f6',
            secondaryColor: initialData?.secondaryColor || '#10b981',
            backgroundColor: initialData?.backgroundColor || '#ffffff',
            textColor: initialData?.textColor || '#111827',
            fontFamily: initialData?.fontFamily || 'Inter',
            customCss: initialData?.customCss || '',
        },
        mode: 'onChange',
    });

    const watchedColors = watch([
        'primaryColor',
        'secondaryColor',
        'backgroundColor',
        'textColor',
    ]);

    const onSubmit = (data: ThemeSettingsFormData) => {
        onSave(data);
    };

    const handleColorChange = (colorField: string, color: any) => {
        setValue(colorField as keyof ThemeSettingsFormData, color.hex, {
            shouldValidate: true,
        });
    };

    const toggleColorPicker = (field: string) => {
        setActiveColorPicker(activeColorPicker === field ? null : field);
    };

    const previewStyle = {
        fontFamily: watch('fontFamily'),
        backgroundColor: watchedColors[2],
        color: watchedColors[3],
        '--primary-color': watchedColors[0],
        '--secondary-color': watchedColors[1],
    } as React.CSSProperties;

    return (
        <div className={cn('theme-customizer', className)}>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="theme-customizer__form"
            >
                <div className="theme-customizer__header">
                    <h2 className="theme-customizer__title">Настройка темы</h2>
                    <p className="theme-customizer__subtitle">
                        Создайте уникальный дизайн для вашего сайта
                    </p>
                </div>

                <div className="theme-customizer__content">
                    <div className="theme-customizer__main-settings">
                        <div className="theme-customizer__section">
                            <h3 className="theme-customizer__section-title">
                                Основные настройки
                            </h3>

                            <div className="theme-customizer__field">
                                <label className="theme-customizer__label">
                                    Название темы
                                </label>
                                <input
                                    {...register('name')}
                                    type="text"
                                    className={cn(
                                        'theme-customizer__input',
                                        errors.name &&
                                            'theme-customizer__input--error',
                                    )}
                                    placeholder="Введите название темы"
                                />
                                {errors.name && (
                                    <p className="theme-customizer__error">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="theme-customizer__field">
                                <label className="theme-customizer__label">
                                    Шрифт
                                </label>
                                <select
                                    {...register('fontFamily')}
                                    className="theme-customizer__select"
                                >
                                    {fontFamilies.map((font) => (
                                        <option
                                            key={font.value}
                                            value={font.value}
                                        >
                                            {font.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="theme-customizer__section">
                            <h3 className="theme-customizer__section-title">
                                Цветовая схема
                            </h3>

                            <div className="theme-customizer__color-grid">
                                <div className="theme-customizer__color-field">
                                    <label className="theme-customizer__label">
                                        Основной цвет
                                    </label>
                                    <div className="theme-customizer__color-input-wrapper">
                                        <input
                                            {...register('primaryColor')}
                                            type="text"
                                            className="theme-customizer__color-input"
                                            placeholder="#3b82f6"
                                        />
                                        <button
                                            type="button"
                                            className="theme-customizer__color-picker-trigger"
                                            style={{
                                                backgroundColor:
                                                    watchedColors[0],
                                            }}
                                            onClick={() =>
                                                toggleColorPicker(
                                                    'primaryColor',
                                                )
                                            }
                                        />
                                    </div>
                                    {errors.primaryColor && (
                                        <p className="theme-customizer__error">
                                            {errors.primaryColor.message}
                                        </p>
                                    )}
                                </div>

                                <div className="theme-customizer__color-field">
                                    <label className="theme-customizer__label">
                                        Дополнительный цвет
                                    </label>
                                    <div className="theme-customizer__color-input-wrapper">
                                        <input
                                            {...register('secondaryColor')}
                                            type="text"
                                            className="theme-customizer__color-input"
                                            placeholder="#10b981"
                                        />
                                        <button
                                            type="button"
                                            className="theme-customizer__color-picker-trigger"
                                            style={{
                                                backgroundColor:
                                                    watchedColors[1],
                                            }}
                                            onClick={() =>
                                                toggleColorPicker(
                                                    'secondaryColor',
                                                )
                                            }
                                        />
                                    </div>
                                    {errors.secondaryColor && (
                                        <p className="theme-customizer__error">
                                            {errors.secondaryColor.message}
                                        </p>
                                    )}
                                </div>

                                <div className="theme-customizer__color-field">
                                    <label className="theme-customizer__label">
                                        Цвет фона
                                    </label>
                                    <div className="theme-customizer__color-input-wrapper">
                                        <input
                                            {...register('backgroundColor')}
                                            type="text"
                                            className="theme-customizer__color-input"
                                            placeholder="#ffffff"
                                        />
                                        <button
                                            type="button"
                                            className="theme-customizer__color-picker-trigger"
                                            style={{
                                                backgroundColor:
                                                    watchedColors[2],
                                            }}
                                            onClick={() =>
                                                toggleColorPicker(
                                                    'backgroundColor',
                                                )
                                            }
                                        />
                                    </div>
                                    {errors.backgroundColor && (
                                        <p className="theme-customizer__error">
                                            {errors.backgroundColor.message}
                                        </p>
                                    )}
                                </div>

                                <div className="theme-customizer__color-field">
                                    <label className="theme-customizer__label">
                                        Цвет текста
                                    </label>
                                    <div className="theme-customizer__color-input-wrapper">
                                        <input
                                            {...register('textColor')}
                                            type="text"
                                            className="theme-customizer__color-input"
                                            placeholder="#111827"
                                        />
                                        <button
                                            type="button"
                                            className="theme-customizer__color-picker-trigger"
                                            style={{
                                                backgroundColor:
                                                    watchedColors[3],
                                            }}
                                            onClick={() =>
                                                toggleColorPicker('textColor')
                                            }
                                        />
                                    </div>
                                    {errors.textColor && (
                                        <p className="theme-customizer__error">
                                            {errors.textColor.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Color Picker Modal */}
                            {activeColorPicker && (
                                <div className="theme-customizer__color-picker-modal">
                                    <div className="theme-customizer__color-picker-content">
                                        <div className="theme-customizer__color-picker-header">
                                            <h4 className="theme-customizer__color-picker-title">
                                                Выберите цвет для{' '}
                                                {activeColorPicker ===
                                                'primaryColor'
                                                    ? 'основного цвета'
                                                    : activeColorPicker ===
                                                        'secondaryColor'
                                                      ? 'дополнительного цвета'
                                                      : activeColorPicker ===
                                                          'backgroundColor'
                                                        ? 'фона'
                                                        : 'текста'}
                                            </h4>
                                            <button
                                                type="button"
                                                className="theme-customizer__color-picker-close"
                                                onClick={() =>
                                                    setActiveColorPicker(null)
                                                }
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <ChromePicker
                                            color={
                                                watchedColors[
                                                    activeColorPicker ===
                                                    'primaryColor'
                                                        ? 0
                                                        : activeColorPicker ===
                                                            'secondaryColor'
                                                          ? 1
                                                          : activeColorPicker ===
                                                              'backgroundColor'
                                                            ? 2
                                                            : 3
                                                ]
                                            }
                                            onChange={(color) =>
                                                handleColorChange(
                                                    activeColorPicker,
                                                    color,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="theme-customizer__section">
                            <h3 className="theme-customizer__section-title">
                                Пользовательский CSS
                            </h3>
                            <div className="theme-customizer__field">
                                <label className="theme-customizer__label">
                                    Дополнительные стили
                                </label>
                                <textarea
                                    {...register('customCss')}
                                    rows={8}
                                    className={cn(
                                        'theme-customizer__textarea',
                                        errors.customCss &&
                                            'theme-customizer__textarea--error',
                                    )}
                                    placeholder="/* Ваши пользовательские стили */"
                                />
                                {errors.customCss && (
                                    <p className="theme-customizer__error">
                                        {errors.customCss.message}
                                    </p>
                                )}
                                <p className="theme-customizer__hint">
                                    Добавьте собственные CSS стили для
                                    дальнейшей кастомизации
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="theme-customizer__preview">
                        <h3 className="theme-customizer__preview-title">
                            Предварительный просмотр
                        </h3>
                        <div
                            className="theme-customizer__preview-container"
                            style={previewStyle}
                        >
                            <div className="theme-customizer__preview-content">
                                <h4 className="theme-customizer__preview-heading">
                                    Заголовок сайта
                                </h4>
                                <p className="theme-customizer__preview-text">
                                    Это пример текста, который покажет, как
                                    будет выглядеть ваш сайт с выбранными
                                    настройками.
                                </p>
                                <button className="theme-customizer__preview-button">
                                    Пример кнопки
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="theme-customizer__actions">
                    {onCancel && (
                        <button
                            type="button"
                            className="theme-customizer__button theme-customizer__button--secondary"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Отмена
                        </button>
                    )}
                    <button
                        type="submit"
                        className="theme-customizer__button theme-customizer__button--primary"
                        disabled={!isValid || isLoading}
                    >
                        {isLoading ? 'Сохранение...' : 'Сохранить тему'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ThemeCustomizer;

import { cn } from '@/lib/helpers';
import { seoSettingsSchema, type SeoSettingsFormData } from '@/lib/validations';
import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';

interface SeoSettingsProps {
    initialData?: Partial<SeoSettingsFormData>;
    onSave: (data: SeoSettingsFormData) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    className?: string;
}

const SeoSettings: React.FC<SeoSettingsProps> = ({
    initialData,
    onSave,
    onCancel,
    isLoading = false,
    className = '',
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        watch,
    } = useForm<SeoSettingsFormData>({
        resolver: yupResolver(seoSettingsSchema) as any,
        defaultValues: {
            title: initialData?.title || '',
            description: initialData?.description || '',
            keywords: initialData?.keywords || '',
            ogTitle: initialData?.ogTitle || '',
            ogDescription: initialData?.ogDescription || '',
            canonicalUrl: initialData?.canonicalUrl || '',
            robots: initialData?.robots || 'index, follow',
        },
        mode: 'onChange',
    });

    const watchedTitle = watch('title');
    const watchedDescription = watch('description');

    const onSubmit = (data: SeoSettingsFormData) => {
        onSave(data);
    };

    return (
        <div className={cn('seo-settings', className)}>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="seo-settings__form"
            >
                <div className="seo-settings__header">
                    <h2 className="seo-settings__title">SEO Настройки</h2>
                    <p className="seo-settings__subtitle">
                        Настройте мета-теги и SEO параметры для лучшей видимости
                        в поисковых системах
                    </p>
                </div>

                <div className="seo-settings__content">
                    {/* Основные SEO поля */}
                    <div className="seo-settings__section">
                        <h3 className="seo-settings__section-title">
                            Основные мета-теги
                        </h3>

                        <div className="seo-settings__field">
                            <label className="seo-settings__label">
                                SEO заголовок
                                <span className="seo-settings__char-count">
                                    {watchedTitle?.length || 0}/60
                                </span>
                            </label>
                            <input
                                {...register('title')}
                                type="text"
                                className={cn(
                                    'seo-settings__input',
                                    errors.title &&
                                        'seo-settings__input--error',
                                )}
                                placeholder="Введите SEO заголовок (до 60 символов)"
                            />
                            {errors.title && (
                                <p className="seo-settings__error">
                                    {errors.title.message}
                                </p>
                            )}
                            <p className="seo-settings__hint">
                                Этот заголовок будет отображаться в результатах
                                поиска
                            </p>
                        </div>

                        <div className="seo-settings__field">
                            <label className="seo-settings__label">
                                SEO описание
                                <span className="seo-settings__char-count">
                                    {watchedDescription?.length || 0}/160
                                </span>
                            </label>
                            <textarea
                                {...register('description')}
                                rows={3}
                                className={cn(
                                    'seo-settings__textarea',
                                    errors.description &&
                                        'seo-settings__textarea--error',
                                )}
                                placeholder="Введите SEO описание (до 160 символов)"
                            />
                            {errors.description && (
                                <p className="seo-settings__error">
                                    {errors.description.message}
                                </p>
                            )}
                            <p className="seo-settings__hint">
                                Краткое описание сайта для поисковых систем
                            </p>
                        </div>

                        <div className="seo-settings__field">
                            <label className="seo-settings__label">
                                Ключевые слова
                            </label>
                            <input
                                {...register('keywords')}
                                type="text"
                                className="seo-settings__input"
                                placeholder="Ключевые слова через запятую"
                            />
                            <p className="seo-settings__hint">
                                Ключевые слова, связанные с вашим сайтом
                            </p>
                        </div>

                        <div className="seo-settings__field">
                            <label className="seo-settings__label">
                                Robots
                            </label>
                            <select
                                {...register('robots')}
                                className="seo-settings__select"
                            >
                                <option value="index, follow">
                                    Индексировать и следовать ссылкам
                                </option>
                                <option value="index, nofollow">
                                    Индексировать, не следовать ссылкам
                                </option>
                                <option value="noindex, follow">
                                    Не индексировать, следовать ссылкам
                                </option>
                                <option value="noindex, nofollow">
                                    Не индексировать и не следовать
                                </option>
                            </select>
                            <p className="seo-settings__hint">
                                Инструкции для поисковых роботов
                            </p>
                        </div>
                    </div>

                    {/* Open Graph */}
                    <div className="seo-settings__section">
                        <h3 className="seo-settings__section-title">
                            Open Graph (социальные сети)
                        </h3>

                        <div className="seo-settings__field">
                            <label className="seo-settings__label">
                                OG заголовок
                            </label>
                            <input
                                {...register('ogTitle')}
                                type="text"
                                className="seo-settings__input"
                                placeholder="Заголовок для социальных сетей"
                            />
                            <p className="seo-settings__hint">
                                Заголовок при публикации ссылки в социальных
                                сетях
                            </p>
                        </div>

                        <div className="seo-settings__field">
                            <label className="seo-settings__label">
                                OG описание
                            </label>
                            <textarea
                                {...register('ogDescription')}
                                rows={2}
                                className="seo-settings__textarea"
                                placeholder="Описание для социальных сетей"
                            />
                            <p className="seo-settings__hint">
                                Описание при публикации ссылки в социальных
                                сетях
                            </p>
                        </div>
                    </div>

                    {/* Дополнительные настройки */}
                    <div className="seo-settings__section">
                        <h3 className="seo-settings__section-title">
                            Дополнительные настройки
                        </h3>

                        <div className="seo-settings__field">
                            <label className="seo-settings__label">
                                Канонический URL
                            </label>
                            <input
                                {...register('canonicalUrl')}
                                type="url"
                                className="seo-settings__input"
                                placeholder="https://example.com"
                            />
                            <p className="seo-settings__hint">
                                Предпочитаемый URL для этой страницы
                            </p>
                        </div>
                    </div>
                </div>

                <div className="seo-settings__actions">
                    {onCancel && (
                        <button
                            type="button"
                            className="seo-settings__button seo-settings__button--secondary"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Отмена
                        </button>
                    )}
                    <button
                        type="submit"
                        className="seo-settings__button seo-settings__button--primary"
                        disabled={!isValid || isLoading}
                    >
                        {isLoading ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SeoSettings;

import ImageUploader from '@/components/admin/settings/sites/ImageUploader';
import SeoSettings from '@/components/admin/settings/sites/SeoSettings';
import ThemeCustomizer from '@/components/admin/settings/sites/ThemeCustomizer';
import { useApp } from '@/hooks/useApp';
import { useSites } from '@/hooks/useSites';
import { cn } from '@/lib/helpers';
import {
    siteCreationSchema,
    type SeoSettingsFormData,
    type SiteCreationFormData,
    type ThemeSettingsFormData,
} from '@/lib/validations';
import { yupResolver } from '@hookform/resolvers/yup';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface CreateSiteProps {
    organizationId: number;
    onSuccess?: (siteId: number) => void;
    onCancel?: () => void;
}

const CreateSite: React.FC<CreateSiteProps> = ({
    organizationId,
    onSuccess,
    onCancel,
}) => {
    const { createNewSite, isLoading } = useSites();
    const { showNotification } = useApp();

    const [currentStep, setCurrentStep] = useState(1);
    const [uploadedLogo, setUploadedLogo] = useState<string>('');
    const [uploadedFavicon, setUploadedFavicon] = useState<string>('');
    const [seoData, setSeoData] = useState<
        Partial<SeoSettingsFormData> | undefined
    >(undefined);
    const [themeData, setThemeData] = useState<
        Partial<ThemeSettingsFormData> | undefined
    >(undefined);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        watch,
    } = useForm<SiteCreationFormData>({
        resolver: yupResolver(siteCreationSchema) as any,
        defaultValues: {
            organizationId,
        },
        mode: 'onChange',
    });

    const steps = [
        {
            id: 1,
            title: 'Основная информация',
            description: 'Название и домен сайта',
        },
        { id: 2, title: 'Медиа', description: 'Логотип и иконка сайта' },
        {
            id: 3,
            title: 'SEO настройки',
            description: 'Мета-теги и поисковая оптимизация',
        },
        { id: 4, title: 'Тема', description: 'Дизайн и стили сайта' },
        {
            id: 5,
            title: 'Завершение',
            description: 'Проверка и создание сайта',
        },
    ];

    const onSubmit = async (data: SiteCreationFormData) => {
        try {
            const siteData = {
                ...data,
                logo: uploadedLogo,
                favicon: uploadedFavicon,
                theme: {
                    id: 'default',
                    name: themeData?.name || 'Моя тема',
                    primaryColor: themeData?.primaryColor || '#3b82f6',
                    secondaryColor: themeData?.secondaryColor || '#10b981',
                    backgroundColor: themeData?.backgroundColor || '#ffffff',
                    textColor: themeData?.textColor || '#111827',
                    fontFamily: themeData?.fontFamily || 'Inter',
                    customCss: themeData?.customCss,
                },
                seo: {
                    title: seoData?.title || data.name,
                    description: seoData?.description || 'Описание сайта',
                    keywords: seoData?.keywords || '',
                    ogTitle: seoData?.ogTitle,
                    ogDescription: seoData?.ogDescription,
                    canonicalUrl: seoData?.canonicalUrl,
                    robots: seoData?.robots || 'index, follow',
                },
                media: [],
                settings: {
                    allowRegistration: false,
                    allowComments: true,
                    maintenanceMode: false,
                },
                status: 'active' as const,
                organizationId,
            };

            const result = await createNewSite(siteData);

            if (
                result.type.endsWith('/fulfilled') &&
                'payload' in result &&
                result.payload &&
                typeof result.payload === 'object' &&
                'id' in result.payload
            ) {
                showNotification({
                    type: 'success',
                    title: 'Сайт создан!',
                    message: `Сайт "${data.name}" успешно создан`,
                });

                if (onSuccess && typeof result.payload.id === 'number') {
                    onSuccess(result.payload.id);
                }
            } else {
                throw new Error('Произошла ошибка при создании сайта');
            }
        } catch (error: unknown) {
            showNotification({
                type: 'error',
                title: 'Ошибка создания сайта',
                message:
                    error instanceof Error
                        ? error.message
                        : 'Произошла ошибка при создании сайта',
            });
        }
    };

    const nextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSeoSave = (data: SeoSettingsFormData) => {
        setSeoData(data);
        nextStep();
    };

    const handleThemeSave = (data: ThemeSettingsFormData) => {
        setThemeData(data);
        nextStep();
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="create-site__step-content">
                        <div className="create-site__step-header">
                            <h3 className="create-site__step-title">
                                Основная информация
                            </h3>
                            <p className="create-site__step-description">
                                Заполните основную информацию о вашем сайте
                            </p>
                        </div>

                        <div className="create-site__form-grid">
                            <div className="create-site__field">
                                <label className="create-site__label">
                                    Название сайта *
                                </label>
                                <input
                                    {...register('name')}
                                    type="text"
                                    className={cn(
                                        'create-site__input',
                                        errors.name &&
                                            'create-site__input--error',
                                    )}
                                    placeholder="Введите название сайта"
                                />
                                {errors.name && (
                                    <p className="create-site__error">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="create-site__field">
                                <label className="create-site__label">
                                    Домен *
                                </label>
                                <input
                                    {...register('domain')}
                                    type="text"
                                    className={cn(
                                        'create-site__input',
                                        errors.domain &&
                                            'create-site__input--error',
                                    )}
                                    placeholder="example.com"
                                />
                                {errors.domain && (
                                    <p className="create-site__error">
                                        {errors.domain.message}
                                    </p>
                                )}
                            </div>

                            <div className="create-site__field">
                                <label className="create-site__label">
                                    Поддомен
                                </label>
                                <input
                                    {...register('subdomain')}
                                    type="text"
                                    className="create-site__input"
                                    placeholder="blog"
                                />
                                <p className="create-site__hint">
                                    Опционально. Если не указан, будет
                                    использован основной домен
                                </p>
                            </div>

                            <div className="create-site__field create-site__field--full">
                                <label className="create-site__label">
                                    Описание
                                </label>
                                <textarea
                                    {...register('description')}
                                    rows={4}
                                    className="create-site__textarea"
                                    placeholder="Краткое описание вашего сайта"
                                />
                                {errors.description && (
                                    <p className="create-site__error">
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="create-site__step-content">
                        <div className="create-site__step-header">
                            <h3 className="create-site__step-title">
                                Медиа файлы
                            </h3>
                            <p className="create-site__step-description">
                                Загрузите логотип и иконку для вашего сайта
                            </p>
                        </div>

                        <div className="create-site__media-grid">
                            <div className="create-site__media-section">
                                <h4 className="create-site__media-title">
                                    Логотип сайта
                                </h4>
                                <ImageUploader
                                    onImageUpload={(file) => {
                                        const url = URL.createObjectURL(file);
                                        setUploadedLogo(url);
                                    }}
                                    onImageCrop={setUploadedLogo}
                                    aspectRatio={16 / 9}
                                    className="create-site__uploader"
                                />
                                {uploadedLogo && (
                                    <div className="create-site__preview">
                                        <img
                                            src={uploadedLogo}
                                            alt="Логотип"
                                            className="create-site__preview-image"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="create-site__media-section">
                                <h4 className="create-site__media-title">
                                    Иконка сайта (Favicon)
                                </h4>
                                <ImageUploader
                                    onImageUpload={(file) => {
                                        const url = URL.createObjectURL(file);
                                        setUploadedFavicon(url);
                                    }}
                                    onImageCrop={setUploadedFavicon}
                                    aspectRatio={1}
                                    className="create-site__uploader"
                                />
                                {uploadedFavicon && (
                                    <div className="create-site__preview">
                                        <img
                                            src={uploadedFavicon}
                                            alt="Favicon"
                                            className="create-site__preview-image create-site__preview-image--small"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <SeoSettings
                        initialData={seoData}
                        onSave={handleSeoSave}
                        onCancel={prevStep}
                        isLoading={isLoading}
                    />
                );

            case 4:
                return (
                    <ThemeCustomizer
                        initialData={themeData}
                        onSave={handleThemeSave}
                        onCancel={prevStep}
                        isLoading={isLoading}
                    />
                );

            case 5:
                return (
                    <div className="create-site__step-content">
                        <div className="create-site__step-header">
                            <h3 className="create-site__step-title">
                                Готово к созданию
                            </h3>
                            <p className="create-site__step-description">
                                Проверьте информацию и создайте сайт
                            </p>
                        </div>

                        <div className="create-site__summary">
                            <div className="create-site__summary-section">
                                <h4 className="create-site__summary-title">
                                    Основная информация
                                </h4>
                                <div className="create-site__summary-item">
                                    <span className="create-site__summary-label">
                                        Название:
                                    </span>
                                    <span className="create-site__summary-value">
                                        {watch('name')}
                                    </span>
                                </div>
                                <div className="create-site__summary-item">
                                    <span className="create-site__summary-label">
                                        Домен:
                                    </span>
                                    <span className="create-site__summary-value">
                                        {watch('domain')}
                                    </span>
                                </div>
                                {watch('subdomain') && (
                                    <div className="create-site__summary-item">
                                        <span className="create-site__summary-label">
                                            Поддомен:
                                        </span>
                                        <span className="create-site__summary-value">
                                            {watch('subdomain')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {(uploadedLogo || uploadedFavicon) && (
                                <div className="create-site__summary-section">
                                    <h4 className="create-site__summary-title">
                                        Медиа
                                    </h4>
                                    {uploadedLogo && (
                                        <div className="create-site__summary-item">
                                            <span className="create-site__summary-label">
                                                Логотип:
                                            </span>
                                            <span className="create-site__summary-value">
                                                Загружен
                                            </span>
                                        </div>
                                    )}
                                    {uploadedFavicon && (
                                        <div className="create-site__summary-item">
                                            <span className="create-site__summary-label">
                                                Favicon:
                                            </span>
                                            <span className="create-site__summary-value">
                                                Загружен
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {seoData && (
                                <div className="create-site__summary-section">
                                    <h4 className="create-site__summary-title">
                                        SEO
                                    </h4>
                                    <div className="create-site__summary-item">
                                        <span className="create-site__summary-label">
                                            Заголовок:
                                        </span>
                                        <span className="create-site__summary-value">
                                            {seoData.title}
                                        </span>
                                    </div>
                                    <div className="create-site__summary-item">
                                        <span className="create-site__summary-label">
                                            Описание:
                                        </span>
                                        <span className="create-site__summary-value">
                                            {seoData.description}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {themeData && (
                                <div className="create-site__summary-section">
                                    <h4 className="create-site__summary-title">
                                        Тема
                                    </h4>
                                    <div className="create-site__summary-item">
                                        <span className="create-site__summary-label">
                                            Название:
                                        </span>
                                        <span className="create-site__summary-value">
                                            {themeData.name}
                                        </span>
                                    </div>
                                    <div className="create-site__summary-item">
                                        <span className="create-site__summary-label">
                                            Шрифт:
                                        </span>
                                        <span className="create-site__summary-value">
                                            {themeData.fontFamily}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="create-site">
            <div className="create-site__header">
                <h1 className="create-site__title">Создание нового сайта</h1>
                <p className="create-site__subtitle">
                    Создайте новый сайт для вашей организации
                </p>
            </div>

            <div className="create-site__progress">
                {steps.map((step) => (
                    <div key={step.id} className="create-site__progress-step">
                        <div
                            className={cn(
                                'create-site__progress-number',
                                currentStep >= step.id &&
                                    'create-site__progress-number--active',
                                currentStep > step.id &&
                                    'create-site__progress-number--completed',
                            )}
                        >
                            {currentStep > step.id ? '✓' : step.id}
                        </div>
                        <div className="create-site__progress-info">
                            <h4 className="create-site__progress-title">
                                {step.title}
                            </h4>
                            <p className="create-site__progress-description">
                                {step.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="create-site__form"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderStepContent()}
                    </motion.div>
                </AnimatePresence>

                <div className="create-site__actions">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            className="create-site__button create-site__button--secondary"
                            onClick={prevStep}
                            disabled={isLoading}
                        >
                            Назад
                        </button>
                    )}

                    {currentStep < steps.length ? (
                        <button
                            type="button"
                            className="create-site__button create-site__button--primary"
                            onClick={nextStep}
                            disabled={currentStep === 1 && !isValid}
                        >
                            Далее
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="create-site__button create-site__button--primary"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Создание...' : 'Создать сайт'}
                        </button>
                    )}

                    {onCancel && (
                        <button
                            type="button"
                            className="create-site__button create-site__button--danger"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Отмена
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default CreateSite;

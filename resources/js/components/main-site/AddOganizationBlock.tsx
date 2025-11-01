import '@css/components/main-site/AddOrganizationBlock.scss';
import { MapPin } from 'lucide-react';
import { useState } from 'react';
import CitySelector from './CitySelector';

interface City {
    id: number;
    name: string;
}

interface AddOrganizationBlockProps {
    config?: {
        title?: string;
        subtitle?: string;
        description?: string;
        submitButtonText?: string;
        successMessage?: string;
        errorMessage?: string;
    };
}

export default function AddoOganizationBlock({
    config = {},
}: AddOrganizationBlockProps) {
    const [formData, setFormData] = useState({
        organizationName: '',
        city: null as City | null,
        address: '',
        mapCoordinates: null as { lat: number; lng: number } | null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<
        'idle' | 'success' | 'error'
    >('idle');
    const [_showMapSelector, setShowMapSelector] = useState(false);

    // Настройки из конфига с дефолтными значениями
    const title = config.title || 'Не нашли свою школу?';
    const subtitle = config.subtitle || 'Добавляйте школу!';
    const description =
        config.description ||
        'Не оставляете школу без поддержки, вместе мы сможем обеспечить нужды школы и развить будущее поколение';
    const submitButtonText = config.submitButtonText || 'Добавить новую школу';
    const successMessage =
        config.successMessage ||
        'Школа успешно предложена! Мы рассмотрим вашу заявку в ближайшее время.';
    const errorMessage =
        config.errorMessage ||
        'Произошла ошибка при отправке формы. Попробуйте еще раз.';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const response = await fetch('/api/public/suggest-organization', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    name: formData.organizationName,
                    city_id: formData.city?.id,
                    city_name: formData.city?.name,
                    address: formData.address,
                    latitude: formData.mapCoordinates?.lat,
                    longitude: formData.mapCoordinates?.lng,
                }),
            });

            if (!response.ok) {
                throw new Error('Ошибка отправки формы');
            }

            setSubmitStatus('success');
            // Сброс формы
            setFormData({
                organizationName: '',
                city: null,
                address: '',
                mapCoordinates: null,
            });
        } catch (error) {
            console.error('Ошибка отправки формы:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSelectOnMap = () => {
        // TODO: Реализовать открытие карты для выбора координат
        setShowMapSelector(true);
        console.log('Открыть карту для выбора координат');
    };

    return (
        <section className="add-organization-block w-full rounded-[20px] bg-white p-8 shadow-[0_4px_84px_0_rgba(26,26,26,0.08)]">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Левая часть - текст */}
                <div className="flex flex-col justify-center">
                    <h2 className="add-organization-block__title mb-4 font-bold leading-[120%]">
                        {title}
                    </h2>
                    <h3 className="add-organization-block__subtitle mb-6 font-bold leading-[120%]">
                        {subtitle}
                    </h3>
                    <p className="add-organization-block__description leading-[140%] tracking-[-0.02em] text-[#1a1a1a]">
                        {description}
                    </p>
                </div>

                {/* Правая часть - форма */}
                <div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Два поля в одной строке */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Название школы */}
                            <div>
                                <label
                                    htmlFor="organizationName"
                                    className="add-organization-block__label mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Название школы
                                </label>
                                <input
                                    type="text"
                                    id="organizationName"
                                    value={formData.organizationName}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            organizationName: e.target.value,
                                        })
                                    }
                                    placeholder="Школа №32..."
                                    required
                                    className="add-organization-block__input w-full rounded-[10px] border border-[#e8ecf3] px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>

                            {/* Город */}
                            <div>
                                <label
                                    htmlFor="city"
                                    className="add-organization-block__label mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Город
                                </label>
                                <div className="add-organization-block__city-selector-wrapper">
                                    <CitySelector
                                        value={formData.city}
                                        onChange={(city) =>
                                            setFormData({ ...formData, city })
                                        }
                                        detectOnMount={false}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Адрес школы с кнопкой */}
                        <div className="relative">
                            <label
                                htmlFor="address"
                                className="add-organization-block__label mb-2 block text-sm font-medium text-gray-700"
                            >
                                Адрес школы
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            address: e.target.value,
                                        })
                                    }
                                    placeholder="Город, улица..."
                                    required
                                    className="add-organization-block__input w-full rounded-[10px] border border-[#e8ecf3] px-4 py-3 pr-[180px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                                <button
                                    type="button"
                                    onClick={handleSelectOnMap}
                                    className="add-organization-block__map-button absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-2 rounded-[10px] bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
                                >
                                    Указать на карте
                                    <MapPin className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Кнопка отправки */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="add-organization-block__submit-button w-full rounded-[10px] bg-gradient-to-r from-[#96bdff] to-[#3259ff] px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting ? 'Отправка...' : submitButtonText}
                        </button>

                        {/* Сообщения об успехе/ошибке */}
                        {submitStatus === 'success' && (
                            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
                                {successMessage}
                            </div>
                        )}
                        {submitStatus === 'error' && (
                            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                                {errorMessage}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
}

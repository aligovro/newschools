import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getConfigValue } from '@/utils/getConfigValue';
import { Plus } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { HeroRenderer } from './hero/HeroRenderer';
import { HeroSettings } from './hero/HeroSettings';
import { HeroSlideEditor } from './hero/HeroSlideEditor';
import { HeroSlider } from './hero/HeroSlider';
import { HeroConfig, HeroSlide, HeroWidgetProps } from './hero/types';

export const HeroWidget: React.FC<HeroWidgetProps> = ({
    config = {},
    isEditable = false,
    autoExpandSettings = false,
    onConfigChange,
    configs,
    styling,
    hero_slides = [],
}) => {
    const [isSettingsExpanded, setIsSettingsExpanded] =
        useState(autoExpandSettings);
    const [activeTab, setActiveTab] = useState<'settings' | 'slides'>(
        'settings',
    );

    // Извлекаем значения из configs если они переданы
    const configValues = useMemo(() => {
        if (!configs) return config;

        return {
            type: getConfigValue(configs, 'type', config.type || 'single'),
            height: getConfigValue(configs, 'height', config.height || '400px'),
            animation: getConfigValue(
                configs,
                'animation',
                config.animation || 'fade',
            ),
            autoplay: getConfigValue(
                configs,
                'autoplay',
                config.autoplay || false,
            ),
            autoplayDelay: getConfigValue(
                configs,
                'autoplayDelay',
                config.autoplayDelay || 5000,
            ),
            showDots: getConfigValue(
                configs,
                'showDots',
                config.showDots || true,
            ),
            showArrows: getConfigValue(
                configs,
                'showArrows',
                config.showArrows || true,
            ),
            slides:
                hero_slides.length > 0
                    ? hero_slides
                    : getConfigValue(configs, 'slides', config.slides || []),
            singleSlide: getConfigValue(
                configs,
                'singleSlide',
                config.singleSlide,
            ),
            css_class: getConfigValue(
                configs,
                'css_class',
                config.css_class || '',
            ),
        };
    }, [configs, config, hero_slides]);

    // Лог для отладки hero_slides
    console.log('HeroWidget: hero_slides debug', {
        hero_slides: hero_slides,
        hero_slides_length: hero_slides?.length || 0,
        slides_in_config: getConfigValue(
            configs,
            'slides',
            config.slides || [],
        ),
        final_slides: configValues.slides,
        first_slide_background:
            hero_slides?.[0]?.backgroundImage || 'not_found',
        first_slide_background_image:
            hero_slides?.[0]?.background_image || 'not_found',
    });

    const [localConfig, setLocalConfig] = useState<HeroConfig>(configValues);

    // Синхронизируем локальное состояние с внешним config
    useEffect(() => {
        setLocalConfig(configValues);
    }, [configValues]);

    // Сообщаем об изменениях конфигурации наружу
    const handleConfigChange = useCallback(
        (newConfig: Record<string, unknown>) => {
            if (onConfigChange) {
                onConfigChange(newConfig);
            }
        },
        [onConfigChange],
    );

    useEffect(() => {
        handleConfigChange(localConfig as unknown as Record<string, unknown>);
    }, [localConfig, handleConfigChange]);

    // Обновляем состояние при изменении autoExpandSettings
    useEffect(() => {
        if (autoExpandSettings) {
            setIsSettingsExpanded(true);
        }
    }, [autoExpandSettings]);

    // Функция для создания градиентного стиля наложения
    const getGradientStyle = (
        color: string,
        opacity: number,
        gradient: string,
        intensity: number,
    ): string => {
        const alpha = opacity / 100;
        const transparentColor = `${color}00`;
        const solidColor = `${color}${Math.round(alpha * 255)
            .toString(16)
            .padStart(2, '0')}`;

        switch (gradient) {
            case 'left':
                return `linear-gradient(to right, ${solidColor} ${intensity}%, ${transparentColor})`;
            case 'right':
                return `linear-gradient(to left, ${solidColor} ${intensity}%, ${transparentColor})`;
            case 'top':
                return `linear-gradient(to bottom, ${solidColor} ${intensity}%, ${transparentColor})`;
            case 'bottom':
                return `linear-gradient(to top, ${solidColor} ${intensity}%, ${transparentColor})`;
            case 'center':
                return `radial-gradient(circle, ${transparentColor} 0%, ${solidColor} ${intensity}%, ${solidColor} 100%)`;
            default:
                return solidColor;
        }
    };

    const {
        type = 'single',
        height = '600px',
        animation = 'fade',
        autoplay = true,
        autoplayDelay = 5000,
        showDots = true,
        showArrows = true,
        slides = [],
        singleSlide = {
            id: '1',
            title: 'Добро пожаловать',
            subtitle: 'Наш сайт',
            description: 'Описание вашего сайта',
            buttonText: 'Узнать больше',
            buttonLink: '#',
            buttonOpenInNewTab: false,
            buttonLinkType: 'internal',
            backgroundImage: '',
            overlayOpacity: 50,
            overlayColor: '#000000',
            overlayGradient: 'none',
            overlayGradientIntensity: 50,
        },
    } = localConfig;

    const currentSlides =
        type === 'slider' ? slides : singleSlide ? [singleSlide] : [];

    // Обработчики для настроек
    const handleTypeChange = (newType: 'single' | 'slider') => {
        setLocalConfig((prev) => {
            const newConfig = {
                ...prev,
                type: newType,
            };

            // Если переключаемся на слайдер и нет слайдов, создаем первый слайд
            if (
                newType === 'slider' &&
                (!prev.slides || prev.slides.length === 0)
            ) {
                const firstSlide: HeroSlide = {
                    id: '1',
                    title: 'Первый слайд',
                    subtitle: 'Подзаголовок',
                    description: 'Описание слайда',
                    buttonText: 'Кнопка',
                    buttonLink: '#',
                    buttonOpenInNewTab: false,
                    buttonLinkType: 'internal',
                    backgroundImage: '',
                    overlayOpacity: 50,
                    overlayColor: '#000000',
                    overlayGradient: 'none',
                    overlayGradientIntensity: 50,
                };
                newConfig.slides = [firstSlide];
            }

            return newConfig;
        });
    };

    const handleHeightChange = (newHeight: string) => {
        setLocalConfig((prev) => ({ ...prev, height: newHeight }));
    };

    const handleAnimationChange = (newAnimation: 'fade' | 'slide' | 'zoom') => {
        setLocalConfig((prev) => ({ ...prev, animation: newAnimation }));
    };

    const handleAutoplayChange = (newAutoplay: boolean) => {
        setLocalConfig((prev) => ({ ...prev, autoplay: newAutoplay }));
    };

    const handleAutoplayDelayChange = (newDelay: number) => {
        setLocalConfig((prev) => ({ ...prev, autoplayDelay: newDelay }));
    };

    const handleShowDotsChange = (newShow: boolean) => {
        setLocalConfig((prev) => ({ ...prev, showDots: newShow }));
    };

    const handleShowArrowsChange = (newShow: boolean) => {
        setLocalConfig((prev) => ({ ...prev, showArrows: newShow }));
    };

    // Обработчики для слайдов
    const handleSlideUpdate = (updatedSlide: HeroSlide) => {
        if (type === 'slider') {
            setLocalConfig((prev) => ({
                ...prev,
                slides:
                    prev.slides?.map((s) =>
                        s.id === updatedSlide.id ? updatedSlide : s,
                    ) || [],
            }));
        } else {
            setLocalConfig((prev) => ({
                ...prev,
                singleSlide: updatedSlide,
            }));
        }
    };

    const handleAddSlide = () => {
        const newSlide: HeroSlide = {
            id: Date.now().toString(),
            title: `Слайд ${currentSlides.length + 1}`,
            subtitle: '',
            description: '',
            buttonText: '',
            buttonLink: '#',
            buttonOpenInNewTab: false,
            buttonLinkType: 'internal',
            backgroundImage: '',
            overlayOpacity: 50,
            overlayColor: '#000000',
            overlayGradient: 'none',
            overlayGradientIntensity: 50,
        };
        setLocalConfig((prev) => ({
            ...prev,
            slides: [...(prev.slides || []), newSlide],
        }));
    };

    const handleDeleteSlide = (slideId: string) => {
        setLocalConfig((prev) => ({
            ...prev,
            slides: prev.slides?.filter((s) => s.id !== slideId) || [],
        }));
    };

    // Обработчики для изображений
    const handleImageUpload = (
        slideId: string,
        file: File,
        serverUrl?: string,
    ) => {
        if (serverUrl && !serverUrl.startsWith('blob:')) {
            const updatedSlide = currentSlides.find((s) => s.id === slideId);
            if (updatedSlide) {
                const newSlide = {
                    ...updatedSlide,
                    backgroundImage: serverUrl,
                };
                handleSlideUpdate(newSlide);
            }
        }
    };

    const handleImageCrop = (slideId: string, url: string) => {
        if (!url.startsWith('blob:')) {
            const updatedSlide = currentSlides.find((s) => s.id === slideId);
            if (updatedSlide) {
                const newSlide = { ...updatedSlide, backgroundImage: url };
                handleSlideUpdate(newSlide);
            }
        }
    };

    const handleImageDelete = (slideId: string) => {
        const updatedSlide = currentSlides.find((s) => s.id === slideId);
        if (updatedSlide) {
            const newSlide = { ...updatedSlide, backgroundImage: '' };
            handleSlideUpdate(newSlide);
        }
    };

    if (isEditable) {
        return (
            <div className="hero-widget-editor">
                <Card>
                    <CardContent className="p-6">
                        {/* Настройки (развернутые/свернутые) */}
                        {isSettingsExpanded && (
                            <div className="hero-widget-editor">
                                <div className="hero-widget-editor__tabs">
                                    <button
                                        className={`hero-widget-editor__tab ${activeTab === 'settings' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('settings')}
                                    >
                                        Настройки
                                    </button>
                                    <button
                                        className={`hero-widget-editor__tab ${activeTab === 'slides' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('slides')}
                                    >
                                        Слайды
                                    </button>
                                </div>

                                <div className="hero-widget-editor__content">
                                    {activeTab === 'settings' && (
                                        <div className="space-y-4">
                                            <HeroSettings
                                                type={type}
                                                height={height}
                                                animation={animation}
                                                autoplay={autoplay}
                                                autoplayDelay={autoplayDelay}
                                                showDots={showDots}
                                                showArrows={showArrows}
                                                css_class={
                                                    localConfig.css_class
                                                }
                                                onTypeChange={handleTypeChange}
                                                onHeightChange={
                                                    handleHeightChange
                                                }
                                                onAnimationChange={
                                                    handleAnimationChange
                                                }
                                                onAutoplayChange={
                                                    handleAutoplayChange
                                                }
                                                onAutoplayDelayChange={
                                                    handleAutoplayDelayChange
                                                }
                                                onShowDotsChange={
                                                    handleShowDotsChange
                                                }
                                                onShowArrowsChange={
                                                    handleShowArrowsChange
                                                }
                                                onCssClassChange={(css_class) =>
                                                    setLocalConfig((prev) => ({
                                                        ...prev,
                                                        css_class,
                                                    }))
                                                }
                                            />
                                        </div>
                                    )}

                                    {activeTab === 'slides' && (
                                        <div className="space-y-4">
                                            {type === 'slider' ? (
                                                <div className="mb-4 flex items-center justify-between">
                                                    <h3 className="text-lg font-semibold">
                                                        Слайды (
                                                        {currentSlides.length})
                                                    </h3>
                                                    <Button
                                                        onClick={handleAddSlide}
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Добавить слайд
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                                    <p className="text-sm text-blue-700">
                                                        💡 Чтобы добавить
                                                        несколько слайдов,
                                                        сначала переключите тип
                                                        на "Слайдер" в
                                                        настройках.
                                                    </p>
                                                </div>
                                            )}

                                            <div className="max-h-[400px] space-y-4 overflow-y-auto">
                                                {currentSlides.map(
                                                    (slide, index) => (
                                                        <HeroSlideEditor
                                                            key={slide.id}
                                                            slide={slide}
                                                            index={index}
                                                            type={type}
                                                            totalSlides={
                                                                currentSlides.length
                                                            }
                                                            onSlideUpdate={
                                                                handleSlideUpdate
                                                            }
                                                            onSlideDelete={() =>
                                                                handleDeleteSlide(
                                                                    slide.id,
                                                                )
                                                            }
                                                            onImageUpload={(
                                                                file,
                                                                serverUrl,
                                                            ) =>
                                                                handleImageUpload(
                                                                    slide.id,
                                                                    file,
                                                                    serverUrl,
                                                                )
                                                            }
                                                            onImageCrop={(
                                                                url,
                                                            ) =>
                                                                handleImageCrop(
                                                                    slide.id,
                                                                    url,
                                                                )
                                                            }
                                                            onImageDelete={() =>
                                                                handleImageDelete(
                                                                    slide.id,
                                                                )
                                                            }
                                                            getGradientStyle={
                                                                getGradientStyle
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="hero-widget" style={styling || {}}>
            {type === 'slider' ? (
                <HeroSlider
                    slides={slides}
                    height={height}
                    animation={animation}
                    autoplay={autoplay}
                    autoplayDelay={autoplayDelay}
                    showDots={showDots}
                    showArrows={showArrows}
                    getGradientStyle={getGradientStyle}
                    css_class={localConfig.css_class}
                />
            ) : (
                <HeroRenderer
                    slide={singleSlide || null}
                    height={height}
                    getGradientStyle={getGradientStyle}
                    css_class={localConfig.css_class}
                />
            )}
        </div>
    );
};

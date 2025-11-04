import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getConfigValue } from '@/utils/getConfigValue';
import { Plus } from 'lucide-react';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
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
    css_class = '',
}) => {
    const [isSettingsExpanded, setIsSettingsExpanded] =
        useState(autoExpandSettings);
    const [activeTab, setActiveTab] = useState<'settings' | 'slides'>(
        'settings',
    );

    // Стабилизируем hero_slides чтобы избежать лишних перерендеров
    const stableHeroSlides = useMemo(() => {
        return hero_slides;
    }, [hero_slides]);

    // Извлекаем значения из configs если они переданы
    const configValues = useMemo(() => {
        if (!configs) return config;

        return {
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
            loop: getConfigValue(configs, 'loop', config.loop || false),
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
                stableHeroSlides.length > 0
                    ? stableHeroSlides
                    : getConfigValue(configs, 'slides', config.slides || []),
        };
    }, [configs, config, stableHeroSlides]);

    const [localConfig, setLocalConfig] = useState<HeroConfig>(configValues);

    // Синхронизируем локальное состояние с внешним config только при инициализации
    const isInitialized = useRef(false);
    useEffect(() => {
        if (!isInitialized.current) {
            setLocalConfig(configValues);
            isInitialized.current = true;
        }
    }, [configValues]);

    // Сообщаем об изменениях конфигурации наружу
    const handleConfigChange = useCallback(
        (newConfig: Record<string, unknown>) => {
            if (onConfigChange) {
                // Используем слайды из локального состояния, как в универсальном слайдере
                const slidesToSend = (newConfig as HeroConfig).slides || [];

                const configWithSlides = {
                    ...newConfig,
                    slides: slidesToSend,
                };

                onConfigChange(configWithSlides);
            }
        },
        [onConfigChange],
    );

    // Отслеживаем изменения localConfig и уведомляем родительский компонент
    const prevLocalConfigRef = useRef<HeroConfig | undefined>(undefined);
    const isInitialMount = useRef(true);

    useEffect(() => {
        // Пропускаем первый рендер
        if (isInitialMount.current) {
            isInitialMount.current = false;
            prevLocalConfigRef.current = localConfig;
            return;
        }

        // Проверяем, действительно ли конфигурация изменилась
        if (
            prevLocalConfigRef.current &&
            JSON.stringify(prevLocalConfigRef.current) ===
                JSON.stringify(localConfig)
        ) {
            return;
        }

        prevLocalConfigRef.current = localConfig;
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
        height = '600px',
        animation = 'fade',
        autoplay = true,
        autoplayDelay = 5000,
        loop = false,
        showDots = true,
        showArrows = true,
        slides = [],
    } = localConfig;

    const currentSlides = slides || [];

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

    const handleLoopChange = (newLoop: boolean) => {
        setLocalConfig((prev) => ({ ...prev, loop: newLoop }));
    };

    const handleShowDotsChange = (newShow: boolean) => {
        setLocalConfig((prev) => ({ ...prev, showDots: newShow }));
    };

    const handleShowArrowsChange = (newShow: boolean) => {
        setLocalConfig((prev) => ({ ...prev, showArrows: newShow }));
    };

    // Обработчики для слайдов
    const handleSlideUpdate = (updatedSlide: HeroSlide) => {
        setLocalConfig((prev) => {
            const newConfig = {
                ...prev,
                slides:
                    prev.slides?.map((s) =>
                        s.id === updatedSlide.id ? updatedSlide : s,
                    ) || [],
            };

            return newConfig;
        });
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
            overlayOpacity: 0,
            overlayColor: '#000000',
            overlayGradient: 'none',
            overlayGradientIntensity: 50,
        };
        setLocalConfig((prev) => {
            const newConfig = {
                ...prev,
                slides: [...(prev.slides || []), newSlide],
            };

            return newConfig;
        });
    };

    const handleDeleteSlide = (slideId: string) => {
        setLocalConfig((prev) => {
            const newConfig = {
                ...prev,
                slides: prev.slides?.filter((s) => s.id !== slideId) || [],
            };

            return newConfig;
        });
    };

    // Обработчики для изображений
    const handleImageUpload = useCallback(
        (slideId: string, file: File, serverUrl?: string) => {
            if (serverUrl && !serverUrl.startsWith('blob:')) {
                setLocalConfig((prev) => {
                    const updatedSlides =
                        prev.slides?.map((s) =>
                            s.id === slideId
                                ? { ...s, backgroundImage: serverUrl }
                                : s,
                        ) || [];
                    return { ...prev, slides: updatedSlides };
                });
            }
        },
        [],
    );

    const handleImageCrop = useCallback((slideId: string, url: string) => {
        if (!url.startsWith('blob:')) {
            setLocalConfig((prev) => {
                const updatedSlides =
                    prev.slides?.map((s) =>
                        s.id === slideId ? { ...s, backgroundImage: url } : s,
                    ) || [];
                return { ...prev, slides: updatedSlides };
            });
        }
    }, []);

    const handleImageDelete = useCallback((slideId: string) => {
        setLocalConfig((prev) => {
            const updatedSlides =
                prev.slides?.map((s) =>
                    s.id === slideId ? { ...s, backgroundImage: '' } : s,
                ) || [];
            return { ...prev, slides: updatedSlides };
        });
    }, []);

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
                                                height={height}
                                                animation={animation}
                                                autoplay={autoplay}
                                                autoplayDelay={autoplayDelay}
                                                loop={loop}
                                                showDots={showDots}
                                                showArrows={showArrows}
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
                                                onLoopChange={handleLoopChange}
                                                onShowDotsChange={
                                                    handleShowDotsChange
                                                }
                                                onShowArrowsChange={
                                                    handleShowArrowsChange
                                                }
                                            />
                                        </div>
                                    )}

                                    {activeTab === 'slides' && (
                                        <div className="space-y-4">
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

                                            <div className="max-h-[400px] space-y-4 overflow-y-auto">
                                                {currentSlides
                                                    .sort(
                                                        (a, b) =>
                                                            parseInt(b.id) -
                                                            parseInt(a.id),
                                                    )
                                                    .map((slide, index) => (
                                                        <HeroSlideEditor
                                                            key={slide.id}
                                                            slide={slide}
                                                            index={index}
                                                            type={
                                                                currentSlides.length >
                                                                1
                                                                    ? 'slider'
                                                                    : 'single'
                                                            }
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
                                                    ))}
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
        <div className={`hero-widget ${css_class || ''}`} style={styling || {}}>
            {currentSlides.length > 1 ? (
                <HeroSlider
                    slides={currentSlides}
                    height={height}
                    animation={animation}
                    autoplay={autoplay}
                    autoplayDelay={autoplayDelay}
                    showDots={showDots}
                    showArrows={showArrows}
                    getGradientStyle={getGradientStyle}
                    css_class={css_class}
                />
            ) : (
                <HeroRenderer
                    slide={currentSlides[0] || null}
                    height={height}
                    getGradientStyle={getGradientStyle}
                    css_class={css_class}
                />
            )}
        </div>
    );
};

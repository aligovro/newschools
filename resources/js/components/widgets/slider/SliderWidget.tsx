import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { SliderSettings } from './SliderSettings';
import { SliderSlideEditor } from './SliderSlideEditor';
import {
    SliderConfig,
    SliderSlide,
    SliderWidgetProps,
    WidgetConfig,
} from './types';

// Функция для получения значения из configs
const getConfigValue = (
    configs: WidgetConfig[] | undefined,
    key: string,
    defaultValue: unknown,
): unknown => {
    if (!configs) return defaultValue;
    const config = configs.find((c) => c.config_key === key);
    if (!config) return defaultValue;

    try {
        return JSON.parse(config.config_value);
    } catch {
        return config.config_value;
    }
};

export const SliderWidget: React.FC<SliderWidgetProps> = ({
    config = {},
    isEditable = false,
    autoExpandSettings = false,
    onSave,
    onConfigChange,
    css_class = '',
    configs,
    styling = {},
    slider_slides = [],
}) => {
    const [isExpanded, setIsExpanded] = useState(autoExpandSettings);
    const [activeTab, setActiveTab] = useState<'settings' | 'slides'>(
        'settings',
    );

    // Извлекаем значения из configs если они переданы
    const configValues = useMemo((): SliderConfig => {
        if (!configs) return config as SliderConfig;

        return {
            type:
                (getConfigValue(
                    configs,
                    'type',
                    config.type || 'hero',
                ) as SliderConfig['type']) || 'hero',
            layout:
                (getConfigValue(
                    configs,
                    'layout',
                    config.layout || 'fullwidth',
                ) as SliderConfig['layout']) || 'fullwidth',
            slidesPerView:
                (getConfigValue(
                    configs,
                    'slidesPerView',
                    config.slidesPerView || 1,
                ) as number) || 1,
            height:
                (getConfigValue(
                    configs,
                    'height',
                    config.height || '400px',
                ) as string) || '400px',
            animation:
                (getConfigValue(
                    configs,
                    'animation',
                    config.animation || 'fade',
                ) as SliderConfig['animation']) || 'fade',
            autoplay:
                (getConfigValue(
                    configs,
                    'autoplay',
                    config.autoplay || false,
                ) as boolean) || false,
            autoplayDelay:
                (getConfigValue(
                    configs,
                    'autoplayDelay',
                    config.autoplayDelay || 5000,
                ) as number) || 5000,
            loop:
                (getConfigValue(
                    configs,
                    'loop',
                    config.loop || false,
                ) as boolean) || false,
            showDots:
                (getConfigValue(
                    configs,
                    'showDots',
                    config.showDots || true,
                ) as boolean) || true,
            showArrows:
                (getConfigValue(
                    configs,
                    'showArrows',
                    config.showArrows || true,
                ) as boolean) || true,
            showProgress:
                (getConfigValue(
                    configs,
                    'showProgress',
                    config.showProgress || false,
                ) as boolean) || false,
            spaceBetween:
                (getConfigValue(
                    configs,
                    'spaceBetween',
                    config.spaceBetween || 0,
                ) as number) || 0,
            breakpoints:
                (getConfigValue(
                    configs,
                    'breakpoints',
                    config.breakpoints || {},
                ) as SliderConfig['breakpoints']) || {},
            slides:
                slider_slides.length > 0
                    ? slider_slides
                    : (getConfigValue(
                          configs,
                          'slides',
                          config.slides || [],
                      ) as SliderSlide[]) || [],
            singleSlide:
                (getConfigValue(
                    configs,
                    'singleSlide',
                    config.singleSlide,
                ) as SliderSlide) || undefined,
            css_class:
                (getConfigValue(
                    configs,
                    'css_class',
                    config.css_class || '',
                ) as string) || '',
        };
    }, [configs, config, slider_slides]);

    const [localConfig, setLocalConfig] = useState<SliderConfig>(configValues);

    // Синхронизируем локальное состояние с внешним config
    const prevConfigValuesRef = useRef<SliderConfig | undefined>(undefined);
    useEffect(() => {
        // Проверяем, действительно ли configValues изменились
        if (
            prevConfigValuesRef.current &&
            JSON.stringify(prevConfigValuesRef.current) ===
                JSON.stringify(configValues)
        ) {
            return;
        }

        prevConfigValuesRef.current = configValues;
        setLocalConfig(configValues);
    }, [configValues]);

    // Сообщаем об изменениях конфигурации наружу
    const handleConfigChange = useCallback(
        (newConfig: Record<string, unknown>) => {
            if (onConfigChange) {
                const slidesToSend = (newConfig as SliderConfig).slides || [];

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
    const prevLocalConfigRef = useRef<SliderConfig | undefined>(undefined);
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
            setIsExpanded(true);
        }
    }, [autoExpandSettings]);

    const currentSlides = useMemo(() => {
        // Приоритет: localConfig.slides > slider_slides из пропсов
        if (localConfig.slides && localConfig.slides.length > 0) {
            return localConfig.slides;
        }
        if (slider_slides && slider_slides.length > 0) {
            return slider_slides;
        }
        return [];
    }, [localConfig.slides, slider_slides]);

    // Обработчики для слайдов
    const handleSlideUpdate = useCallback((updatedSlide: SliderSlide) => {
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
    }, []);

    const handleAddSlide = useCallback(() => {
        setLocalConfig((prev) => {
            const currentSlidesCount = prev.slides?.length || 0;
            const newSlide: SliderSlide = {
                id: Date.now().toString(),
                title: `Слайд ${currentSlidesCount + 1}`,
                subtitle: '',
                description: '',
                buttonText: '',
                buttonLink: '#',
                buttonLinkType: 'internal',
                buttonOpenInNewTab: false,
                backgroundImage: '',
                overlayOpacity: 50,
                overlayColor: '#000000',
                overlayGradient: 'none',
                overlayGradientIntensity: 50,
                order: currentSlidesCount + 1,
            };
            const newConfig = {
                ...prev,
                slides: [...(prev.slides || []), newSlide],
            };
            return newConfig;
        });
    }, []);

    const handleDeleteSlide = useCallback((slideId: string) => {
        setLocalConfig((prev) => {
            const newConfig = {
                ...prev,
                slides: prev.slides?.filter((s) => s.id !== slideId) || [],
            };
            return newConfig;
        });
    }, []);

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
            <div className={`slider-widget ${css_class}`} style={styling}>
                <div className="rounded-lg border border-gray-200 bg-white">
                    {/* Заголовок с кнопками */}
                    <div className="flex items-center justify-between border-b border-gray-200 p-4">
                        <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Слайдер
                            </h3>
                            <span className="text-sm text-gray-500">
                                ({currentSlides.length} слайдов)
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                {isExpanded ? 'Свернуть' : 'Настройки'}
                            </button>
                            {onSave && (
                                <button
                                    onClick={() =>
                                        onSave(
                                            localConfig as Record<
                                                string,
                                                unknown
                                            >,
                                        )
                                    }
                                    className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                                >
                                    Сохранить
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Настройки */}
                    {isExpanded && (
                        <div className="p-4">
                            <div className="mb-4 flex space-x-1">
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`rounded-md px-4 py-2 text-sm font-medium ${
                                        activeTab === 'settings'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Настройки
                                </button>
                                <button
                                    onClick={() => setActiveTab('slides')}
                                    className={`rounded-md px-4 py-2 text-sm font-medium ${
                                        activeTab === 'slides'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Слайды ({currentSlides.length})
                                </button>
                            </div>

                            {activeTab === 'settings' && (
                                <SliderSettings
                                    config={localConfig}
                                    onConfigChange={setLocalConfig}
                                />
                            )}

                            {activeTab === 'slides' && (
                                <SliderSlideEditor
                                    slides={currentSlides}
                                    onSlideUpdate={handleSlideUpdate}
                                    onAddSlide={handleAddSlide}
                                    onDeleteSlide={handleDeleteSlide}
                                    onImageUpload={handleImageUpload}
                                    onImageCrop={handleImageCrop}
                                    onImageDelete={handleImageDelete}
                                />
                            )}
                        </div>
                    )}

                    {/* Превью */}
                    <div className="p-4">
                        <div className="mb-2 text-sm text-gray-500">
                            Превью:
                        </div>
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            {currentSlides.length > 0 ? (
                                <div className="h-64">
                                    {localConfig.layout === 'grid' &&
                                    localConfig.slidesPerView &&
                                    localConfig.slidesPerView > 1 ? (
                                        // Сеточное отображение - показываем последнюю строку
                                        (() => {
                                            const totalSlides =
                                                currentSlides.length;
                                            const slidesPerView =
                                                localConfig.slidesPerView;
                                            const slidesInLastRow =
                                                totalSlides % slidesPerView ||
                                                slidesPerView;
                                            const startIndex =
                                                totalSlides - slidesInLastRow;
                                            const slidesToShow =
                                                currentSlides.slice(startIndex);

                                            return (
                                                <div className="flex h-full gap-2 p-2">
                                                    {slidesToShow.map(
                                                        (slide) => (
                                                            <div
                                                                key={slide.id}
                                                                className="relative flex-1 overflow-hidden rounded"
                                                                style={{
                                                                    backgroundImage:
                                                                        slide.backgroundImage
                                                                            ? `url(${slide.backgroundImage})`
                                                                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                    backgroundSize:
                                                                        'cover',
                                                                    backgroundPosition:
                                                                        'center',
                                                                }}
                                                            >
                                                                {slide.overlayOpacity &&
                                                                    slide.overlayOpacity >
                                                                        0 && (
                                                                        <div
                                                                            className="absolute inset-0"
                                                                            style={{
                                                                                backgroundColor: `${slide.overlayColor || '#000000'}${Math.round(
                                                                                    (slide.overlayOpacity /
                                                                                        100) *
                                                                                        255,
                                                                                )
                                                                                    .toString(
                                                                                        16,
                                                                                    )
                                                                                    .padStart(
                                                                                        2,
                                                                                        '0',
                                                                                    )}`,
                                                                            }}
                                                                        />
                                                                    )}
                                                                <div className="absolute bottom-2 left-2 text-white">
                                                                    <div className="max-w-20 truncate text-xs font-medium">
                                                                        {
                                                                            slide.title
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        // Полноширинное отображение - показываем последний слайд
                                        <div className="relative h-full">
                                            {(() => {
                                                const lastSlide =
                                                    currentSlides[
                                                        currentSlides.length - 1
                                                    ];
                                                return (
                                                    <div
                                                        className="relative h-full w-full"
                                                        style={{
                                                            backgroundImage:
                                                                lastSlide.backgroundImage
                                                                    ? `url(${lastSlide.backgroundImage})`
                                                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            backgroundSize:
                                                                'cover',
                                                            backgroundPosition:
                                                                'center',
                                                        }}
                                                    >
                                                        {lastSlide.overlayOpacity &&
                                                            lastSlide.overlayOpacity >
                                                                0 && (
                                                                <div
                                                                    className="absolute inset-0"
                                                                    style={{
                                                                        backgroundColor: `${lastSlide.overlayColor || '#000000'}${Math.round(
                                                                            (lastSlide.overlayOpacity /
                                                                                100) *
                                                                                255,
                                                                        )
                                                                            .toString(
                                                                                16,
                                                                            )
                                                                            .padStart(
                                                                                2,
                                                                                '0',
                                                                            )}`,
                                                                    }}
                                                                />
                                                            )}
                                                        <div className="absolute bottom-4 left-4 text-white">
                                                            <div className="max-w-32 truncate text-sm font-medium">
                                                                {
                                                                    lastSlide.title
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex h-64 items-center justify-center text-gray-400">
                                    Добавьте слайды для предпросмотра
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Режим просмотра
    if (currentSlides.length === 0) {
        return (
            <div className={`widget-renderer ${css_class}`} style={styling}>
                <div className="rounded-lg border border-gray-200 bg-white">
                    <div className="relative h-48 overflow-hidden rounded-t-lg bg-cover bg-center">
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage:
                                    'linear-gradient(135deg, rgb(102, 126, 234) 0%, rgb(118, 75, 162) 100%)',
                            }}
                        />
                    </div>
                    <div className="p-3">
                        <div className="text-sm font-medium text-gray-900">
                            Слайдер
                        </div>
                        <div className="text-xs text-gray-500">
                            Slider (предпросмотр)
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`widget-renderer ${css_class}`} style={styling}>
            <div className="rounded-lg border border-gray-200 bg-white">
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                    {currentSlides.length > 0 ? (
                        <div className="h-full">
                            {localConfig.layout === 'grid' &&
                            localConfig.slidesPerView &&
                            localConfig.slidesPerView > 1 ? (
                                // Сеточное отображение - показываем последнюю строку
                                (() => {
                                    const totalSlides = currentSlides.length;
                                    const slidesPerView =
                                        localConfig.slidesPerView;
                                    const slidesInLastRow =
                                        totalSlides % slidesPerView ||
                                        slidesPerView;
                                    const startIndex =
                                        totalSlides - slidesInLastRow;
                                    const slidesToShow =
                                        currentSlides.slice(startIndex);

                                    return (
                                        <div className="flex h-full gap-2 p-2">
                                            {slidesToShow.map((slide) => (
                                                <div
                                                    key={slide.id}
                                                    className="relative flex-1 overflow-hidden rounded"
                                                    style={{
                                                        backgroundImage:
                                                            slide.backgroundImage
                                                                ? `url(${slide.backgroundImage})`
                                                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        backgroundSize: 'cover',
                                                        backgroundPosition:
                                                            'center',
                                                    }}
                                                >
                                                    {slide.overlayOpacity &&
                                                        slide.overlayOpacity >
                                                            0 && (
                                                            <div
                                                                className="absolute inset-0"
                                                                style={{
                                                                    backgroundColor: `${slide.overlayColor || '#000000'}${Math.round(
                                                                        (slide.overlayOpacity /
                                                                            100) *
                                                                            255,
                                                                    )
                                                                        .toString(
                                                                            16,
                                                                        )
                                                                        .padStart(
                                                                            2,
                                                                            '0',
                                                                        )}`,
                                                                }}
                                                            />
                                                        )}
                                                    <div className="absolute bottom-2 left-2 text-white">
                                                        <div className="max-w-20 truncate text-xs font-medium">
                                                            {slide.title}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()
                            ) : (
                                // Полноширинное отображение - показываем последний слайд
                                <div className="relative h-full">
                                    {(() => {
                                        const lastSlide =
                                            currentSlides[
                                                currentSlides.length - 1
                                            ];
                                        return (
                                            <div
                                                className="relative h-full w-full"
                                                style={{
                                                    backgroundImage:
                                                        lastSlide.backgroundImage
                                                            ? `url(${lastSlide.backgroundImage})`
                                                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    backgroundSize: 'cover',
                                                    backgroundPosition:
                                                        'center',
                                                }}
                                            >
                                                {lastSlide.overlayOpacity &&
                                                    lastSlide.overlayOpacity >
                                                        0 && (
                                                        <div
                                                            className="absolute inset-0"
                                                            style={{
                                                                backgroundColor: `${lastSlide.overlayColor || '#000000'}${Math.round(
                                                                    (lastSlide.overlayOpacity /
                                                                        100) *
                                                                        255,
                                                                )
                                                                    .toString(
                                                                        16,
                                                                    )
                                                                    .padStart(
                                                                        2,
                                                                        '0',
                                                                    )}`,
                                                            }}
                                                        />
                                                    )}
                                                <div className="absolute bottom-4 left-4 text-white">
                                                    <div className="max-w-32 truncate text-sm font-medium">
                                                        {lastSlide.title}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage:
                                    'linear-gradient(135deg, rgb(102, 126, 234) 0%, rgb(118, 75, 162) 100%)',
                            }}
                        />
                    )}
                </div>
                <div className="p-3">
                    <div className="text-sm font-medium text-gray-900">
                        Слайдер
                    </div>
                    <div className="text-xs text-gray-500">
                        {currentSlides.length > 0
                            ? `${currentSlides.length} слайдов`
                            : 'Slider (предпросмотр)'}
                    </div>
                </div>
            </div>
        </div>
    );
};

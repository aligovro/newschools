import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SaveButton } from '@/components/ui/SaveButton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp, Plus, Settings, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import ImageUploader from '../admin/settings/sites/ImageUploader';

interface HeroSlide {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    backgroundImage?: string;
    overlayOpacity?: number;
    overlayColor?: string;
}

interface HeroWidgetProps {
    config?: {
        type?: 'single' | 'slider';
        height?: string;
        animation?: 'fade' | 'slide' | 'zoom';
        autoplay?: boolean;
        autoplayDelay?: number;
        showDots?: boolean;
        showArrows?: boolean;
        slides?: HeroSlide[];
        singleSlide?: HeroSlide;
    };
    isEditable?: boolean;
    autoExpandSettings?: boolean;
    onSave?: (config: Record<string, unknown>) => Promise<void>;
    widgetId?: string;
}

export const HeroWidget: React.FC<HeroWidgetProps> = ({
    config = {},
    isEditable = false,
    autoExpandSettings = false,
    onSave,
    widgetId,
}) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isSettingsExpanded, setIsSettingsExpanded] =
        useState(autoExpandSettings);

    // Локальное состояние для настроек
    const [localConfig, setLocalConfig] = useState(config);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<
        'idle' | 'saving' | 'saved' | 'error'
    >('idle');

    // Синхронизируем локальное состояние с внешним config
    useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    // Автоматическое сохранение при изменении изображений
    const handleImageChange = useCallback(
        (newConfig: Record<string, unknown>) => {
            setLocalConfig(newConfig);
            // Автоматически сохраняем при изменении изображений
            if (onSave && widgetId) {
                onSave(newConfig);
            }
        },
        [onSave, widgetId],
    );

    // Обновляем состояние при изменении autoExpandSettings
    useEffect(() => {
        if (autoExpandSettings) {
            setIsSettingsExpanded(true);
        }
    }, [autoExpandSettings, isSettingsExpanded]);

    // Функция сохранения конфигурации
    const handleSave = async () => {
        if (isSaving || !onSave || !widgetId) return;

        setIsSaving(true);
        setSaveStatus('saving');

        try {
            // Вызываем переданную функцию сохранения
            await onSave(localConfig);

            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            console.error('Error saving widget config:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } finally {
            setIsSaving(false);
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
            backgroundImage: '',
            overlayOpacity: 50,
            overlayColor: '#000000',
        },
    } = localConfig;

    const currentSlides = type === 'slider' ? slides : [singleSlide];

    const renderSlide = (slide: HeroSlide) => {
        const slideStyle = {
            backgroundImage: slide.backgroundImage
                ? `url(${slide.backgroundImage})`
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height,
            position: 'relative' as const,
        };

        const overlayStyle = {
            position: 'absolute' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: slide.overlayColor || '#000000',
            opacity: (slide.overlayOpacity || 50) / 100,
        };

        return (
            <div key={slide.id} className="hero-slide" style={slideStyle}>
                <div style={overlayStyle} />
                <div className="relative z-10 flex h-full items-center justify-center">
                    <div className="max-w-4xl px-6 text-center text-white">
                        <h1 className="mb-4 text-5xl font-bold md:text-6xl">
                            {slide.title}
                        </h1>
                        {slide.subtitle && (
                            <h2 className="mb-6 text-2xl font-light md:text-3xl">
                                {slide.subtitle}
                            </h2>
                        )}
                        {slide.description && (
                            <p className="mb-8 text-lg leading-relaxed md:text-xl">
                                {slide.description}
                            </p>
                        )}
                        {slide.buttonText && (
                            <Button
                                size="lg"
                                className="bg-white text-gray-900 hover:bg-gray-100"
                                onClick={() => {
                                    if (slide.buttonLink) {
                                        window.open(slide.buttonLink, '_blank');
                                    }
                                }}
                            >
                                {slide.buttonText}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (isEditable) {
        return (
            <div className="hero-widget-editor">
                <Card>
                    <CardContent className="p-6">
                        {/* Кнопка для переключения настроек */}
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">
                                Hero секция
                            </h3>
                            <div className="flex items-center space-x-2">
                                {isSettingsExpanded && (
                                    <SaveButton
                                        onSave={handleSave}
                                        isSaving={isSaving}
                                        saveStatus={saveStatus}
                                        size="sm"
                                        label="Сохранить"
                                        savedLabel="✓ Сохранено"
                                        errorLabel="✗ Ошибка"
                                        savingLabel="Сохранение..."
                                    />
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setIsSettingsExpanded(
                                            !isSettingsExpanded,
                                        )
                                    }
                                    className="flex items-center space-x-2"
                                >
                                    <Settings className="h-4 w-4" />
                                    <span>Настройки</span>
                                    {isSettingsExpanded ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Настройки (развернутые/свернутые) */}
                        {isSettingsExpanded && (
                            <Tabs defaultValue="settings" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="settings">
                                        Настройки
                                    </TabsTrigger>
                                    <TabsTrigger value="content">
                                        Контент
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent
                                    value="settings"
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="type">
                                                Тип Hero секции
                                            </Label>
                                            <Select
                                                value={type}
                                                onValueChange={(value) => {
                                                    const newType = value as
                                                        | 'single'
                                                        | 'slider';
                                                    setLocalConfig((prev) => {
                                                        const newConfig = {
                                                            ...prev,
                                                            type: newType,
                                                        };

                                                        // Если переключаемся на слайдер и нет слайдов, создаем первый слайд
                                                        if (
                                                            newType ===
                                                                'slider' &&
                                                            (!prev.slides ||
                                                                prev.slides
                                                                    .length ===
                                                                    0)
                                                        ) {
                                                            const firstSlide: HeroSlide =
                                                                {
                                                                    id: '1',
                                                                    title: 'Первый слайд',
                                                                    subtitle:
                                                                        'Подзаголовок',
                                                                    description:
                                                                        'Описание слайда',
                                                                    buttonText:
                                                                        'Кнопка',
                                                                    buttonLink:
                                                                        '#',
                                                                    backgroundImage:
                                                                        '',
                                                                    overlayOpacity: 50,
                                                                    overlayColor:
                                                                        '#000000',
                                                                };
                                                            newConfig.slides = [
                                                                firstSlide,
                                                            ];
                                                        }

                                                        return newConfig;
                                                    });
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="single">
                                                        Одна картинка
                                                    </SelectItem>
                                                    <SelectItem value="slider">
                                                        Слайдер
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="height">
                                                Высота (px)
                                            </Label>
                                            <Input
                                                id="height"
                                                type="number"
                                                value={parseInt(height)}
                                                onChange={(e) =>
                                                    setLocalConfig((prev) => ({
                                                        ...prev,
                                                        height: `${e.target.value}px`,
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>

                                    {type === 'slider' && (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="animation">
                                                        Анимация
                                                    </Label>
                                                    <Select
                                                        value={animation}
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            setLocalConfig(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    animation:
                                                                        value as
                                                                            | 'fade'
                                                                            | 'slide'
                                                                            | 'zoom',
                                                                }),
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="fade">
                                                                Плавное
                                                                появление
                                                            </SelectItem>
                                                            <SelectItem value="slide">
                                                                Скольжение
                                                            </SelectItem>
                                                            <SelectItem value="zoom">
                                                                Масштабирование
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label htmlFor="autoplayDelay">
                                                        Задержка автопрокрутки
                                                        (мс)
                                                    </Label>
                                                    <Input
                                                        id="autoplayDelay"
                                                        type="number"
                                                        value={autoplayDelay}
                                                        onChange={(e) =>
                                                            setLocalConfig(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    autoplayDelay:
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                }),
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        id="autoplay"
                                                        checked={autoplay}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            setLocalConfig(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    autoplay:
                                                                        checked,
                                                                }),
                                                            )
                                                        }
                                                    />
                                                    <Label htmlFor="autoplay">
                                                        Автопрокрутка
                                                    </Label>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        id="showDots"
                                                        checked={showDots}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            setLocalConfig(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    showDots:
                                                                        checked,
                                                                }),
                                                            )
                                                        }
                                                    />
                                                    <Label htmlFor="showDots">
                                                        Показать точки
                                                    </Label>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        id="showArrows"
                                                        checked={showArrows}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            setLocalConfig(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    showArrows:
                                                                        checked,
                                                                }),
                                                            )
                                                        }
                                                    />
                                                    <Label htmlFor="showArrows">
                                                        Показать стрелки
                                                    </Label>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Кнопка сохранения для настроек */}
                                    <div className="mt-6 flex justify-end">
                                        <SaveButton
                                            onSave={handleSave}
                                            isSaving={isSaving}
                                            saveStatus={saveStatus}
                                            label="Сохранить настройки"
                                            savedLabel="✓ Настройки сохранены"
                                            errorLabel="✗ Ошибка сохранения"
                                            savingLabel="Сохранение..."
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent
                                    value="content"
                                    className="space-y-4"
                                >
                                    {type === 'slider' && (
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">
                                                Слайды ({currentSlides.length})
                                            </h3>
                                            <Button
                                                onClick={() => {
                                                    const newSlide: HeroSlide =
                                                        {
                                                            id: Date.now().toString(),
                                                            title: `Слайд ${currentSlides.length + 1}`,
                                                            subtitle: '',
                                                            description: '',
                                                            buttonText: '',
                                                            buttonLink: '#',
                                                            backgroundImage: '',
                                                            overlayOpacity: 50,
                                                            overlayColor:
                                                                '#000000',
                                                        };
                                                    setLocalConfig({
                                                        ...config,
                                                        slides: [
                                                            ...slides,
                                                            newSlide,
                                                        ],
                                                    });
                                                }}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Добавить слайд
                                            </Button>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {currentSlides.map((slide, index) => (
                                            <Card key={slide.id}>
                                                <CardContent className="p-4">
                                                    <div className="mb-4 flex items-center justify-between">
                                                        <h4 className="font-medium">
                                                            {type === 'slider'
                                                                ? `Слайд ${index + 1}`
                                                                : 'Основной контент'}
                                                        </h4>
                                                        {type === 'slider' &&
                                                            currentSlides.length >
                                                                1 && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => {
                                                                        const updatedSlides =
                                                                            slides.filter(
                                                                                (
                                                                                    s,
                                                                                ) =>
                                                                                    s.id !==
                                                                                    slide.id,
                                                                            );
                                                                        handleImageChange(
                                                                            {
                                                                                ...localConfig,
                                                                                slides: updatedSlides,
                                                                            },
                                                                        );
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div>
                                                            <Label>
                                                                Заголовок
                                                            </Label>
                                                            <Input
                                                                value={
                                                                    slide.title
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const updatedSlide =
                                                                        {
                                                                            ...slide,
                                                                            title: e
                                                                                .target
                                                                                .value,
                                                                        };
                                                                    if (
                                                                        type ===
                                                                        'slider'
                                                                    ) {
                                                                        setLocalConfig(
                                                                            {
                                                                                ...config,
                                                                                slides: slides.map(
                                                                                    (
                                                                                        s,
                                                                                    ) =>
                                                                                        s.id ===
                                                                                        slide.id
                                                                                            ? updatedSlide
                                                                                            : s,
                                                                                ),
                                                                            },
                                                                        );
                                                                    } else {
                                                                        setLocalConfig(
                                                                            {
                                                                                ...config,
                                                                                singleSlide:
                                                                                    updatedSlide,
                                                                            },
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                        </div>

                                                        <div>
                                                            <Label>
                                                                Подзаголовок
                                                            </Label>
                                                            <Input
                                                                value={
                                                                    slide.subtitle ||
                                                                    ''
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const updatedSlide =
                                                                        {
                                                                            ...slide,
                                                                            subtitle:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        };
                                                                    if (
                                                                        type ===
                                                                        'slider'
                                                                    ) {
                                                                        setLocalConfig(
                                                                            {
                                                                                ...config,
                                                                                slides: slides.map(
                                                                                    (
                                                                                        s,
                                                                                    ) =>
                                                                                        s.id ===
                                                                                        slide.id
                                                                                            ? updatedSlide
                                                                                            : s,
                                                                                ),
                                                                            },
                                                                        );
                                                                    } else {
                                                                        setLocalConfig(
                                                                            {
                                                                                ...config,
                                                                                singleSlide:
                                                                                    updatedSlide,
                                                                            },
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                        </div>

                                                        <div>
                                                            <Label>
                                                                Описание
                                                            </Label>
                                                            <Textarea
                                                                value={
                                                                    slide.description ||
                                                                    ''
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const updatedSlide =
                                                                        {
                                                                            ...slide,
                                                                            description:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        };
                                                                    if (
                                                                        type ===
                                                                        'slider'
                                                                    ) {
                                                                        setLocalConfig(
                                                                            {
                                                                                ...config,
                                                                                slides: slides.map(
                                                                                    (
                                                                                        s,
                                                                                    ) =>
                                                                                        s.id ===
                                                                                        slide.id
                                                                                            ? updatedSlide
                                                                                            : s,
                                                                                ),
                                                                            },
                                                                        );
                                                                    } else {
                                                                        setLocalConfig(
                                                                            {
                                                                                ...config,
                                                                                singleSlide:
                                                                                    updatedSlide,
                                                                            },
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <Label>
                                                                    Текст кнопки
                                                                </Label>
                                                                <Input
                                                                    value={
                                                                        slide.buttonText ||
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const updatedSlide =
                                                                            {
                                                                                ...slide,
                                                                                buttonText:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            };
                                                                        if (
                                                                            type ===
                                                                            'slider'
                                                                        ) {
                                                                            setLocalConfig(
                                                                                {
                                                                                    ...config,
                                                                                    slides: slides.map(
                                                                                        (
                                                                                            s,
                                                                                        ) =>
                                                                                            s.id ===
                                                                                            slide.id
                                                                                                ? updatedSlide
                                                                                                : s,
                                                                                    ),
                                                                                },
                                                                            );
                                                                        } else {
                                                                            setLocalConfig(
                                                                                {
                                                                                    ...config,
                                                                                    singleSlide:
                                                                                        updatedSlide,
                                                                                },
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                            </div>

                                                            <div>
                                                                <Label>
                                                                    Ссылка
                                                                    кнопки
                                                                </Label>
                                                                <Input
                                                                    value={
                                                                        slide.buttonLink ||
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const updatedSlide =
                                                                            {
                                                                                ...slide,
                                                                                buttonLink:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            };
                                                                        if (
                                                                            type ===
                                                                            'slider'
                                                                        ) {
                                                                            setLocalConfig(
                                                                                {
                                                                                    ...config,
                                                                                    slides: slides.map(
                                                                                        (
                                                                                            s,
                                                                                        ) =>
                                                                                            s.id ===
                                                                                            slide.id
                                                                                                ? updatedSlide
                                                                                                : s,
                                                                                    ),
                                                                                },
                                                                            );
                                                                        } else {
                                                                            setLocalConfig(
                                                                                {
                                                                                    ...config,
                                                                                    singleSlide:
                                                                                        updatedSlide,
                                                                                },
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <Label>
                                                                Фоновое
                                                                изображение
                                                            </Label>
                                                            <ImageUploader
                                                                onImageUpload={(
                                                                    file,
                                                                    serverUrl,
                                                                ) => {
                                                                    // Используем только серверный URL
                                                                    if (
                                                                        serverUrl &&
                                                                        !serverUrl.startsWith(
                                                                            'blob:',
                                                                        )
                                                                    ) {
                                                                        const url =
                                                                            serverUrl;
                                                                        if (
                                                                            type ===
                                                                            'slider'
                                                                        ) {
                                                                            const updatedSlides =
                                                                                slides.map(
                                                                                    (
                                                                                        s,
                                                                                    ) =>
                                                                                        s.id ===
                                                                                        slide.id
                                                                                            ? {
                                                                                                  ...s,
                                                                                                  backgroundImage:
                                                                                                      url,
                                                                                              }
                                                                                            : s,
                                                                                );
                                                                            handleImageChange(
                                                                                {
                                                                                    ...localConfig,
                                                                                    slides: updatedSlides,
                                                                                },
                                                                            );
                                                                        } else {
                                                                            handleImageChange(
                                                                                {
                                                                                    ...localConfig,
                                                                                    singleSlide:
                                                                                        {
                                                                                            ...slide,
                                                                                            backgroundImage:
                                                                                                url,
                                                                                        },
                                                                                },
                                                                            );
                                                                        }
                                                                    }
                                                                }}
                                                                onImageCrop={(
                                                                    url,
                                                                ) => {
                                                                    // Проверяем, что это не blob URL
                                                                    if (
                                                                        url.startsWith(
                                                                            'blob:',
                                                                        )
                                                                    ) {
                                                                        console.warn(
                                                                            'Blob URL detected, skipping update',
                                                                        );
                                                                        return;
                                                                    }

                                                                    if (
                                                                        type ===
                                                                        'slider'
                                                                    ) {
                                                                        const updatedSlides =
                                                                            slides.map(
                                                                                (
                                                                                    s,
                                                                                ) =>
                                                                                    s.id ===
                                                                                    slide.id
                                                                                        ? {
                                                                                              ...s,
                                                                                              backgroundImage:
                                                                                                  url,
                                                                                          }
                                                                                        : s,
                                                                            );
                                                                        handleImageChange(
                                                                            {
                                                                                ...localConfig,
                                                                                slides: updatedSlides,
                                                                            },
                                                                        );
                                                                    } else {
                                                                        handleImageChange(
                                                                            {
                                                                                ...localConfig,
                                                                                singleSlide:
                                                                                    {
                                                                                        ...slide,
                                                                                        backgroundImage:
                                                                                            url,
                                                                                    },
                                                                            },
                                                                        );
                                                                    }
                                                                }}
                                                                aspectRatio={
                                                                    16 / 9
                                                                }
                                                                className="mt-2"
                                                                widgetSlug="hero-slider"
                                                                imageType="background"
                                                                slideId={
                                                                    slide.id
                                                                }
                                                                enableServerUpload={
                                                                    true
                                                                }
                                                            />
                                                            {slide.backgroundImage && (
                                                                <div className="mt-2">
                                                                    <img
                                                                        src={
                                                                            slide.backgroundImage
                                                                        }
                                                                        alt="Preview"
                                                                        className="h-32 w-full rounded object-cover"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <Label>
                                                                    Прозрачность
                                                                    наложения
                                                                    (%)
                                                                </Label>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    value={
                                                                        slide.overlayOpacity ||
                                                                        50
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const updatedSlide =
                                                                            {
                                                                                ...slide,
                                                                                overlayOpacity:
                                                                                    parseInt(
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                    ),
                                                                            };
                                                                        if (
                                                                            type ===
                                                                            'slider'
                                                                        ) {
                                                                            setLocalConfig(
                                                                                {
                                                                                    ...config,
                                                                                    slides: slides.map(
                                                                                        (
                                                                                            s,
                                                                                        ) =>
                                                                                            s.id ===
                                                                                            slide.id
                                                                                                ? updatedSlide
                                                                                                : s,
                                                                                    ),
                                                                                },
                                                                            );
                                                                        } else {
                                                                            setLocalConfig(
                                                                                {
                                                                                    ...config,
                                                                                    singleSlide:
                                                                                        updatedSlide,
                                                                                },
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                            </div>

                                                            <div>
                                                                <Label>
                                                                    Цвет
                                                                    наложения
                                                                </Label>
                                                                <Input
                                                                    type="color"
                                                                    value={
                                                                        slide.overlayColor ||
                                                                        '#000000'
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const updatedSlide =
                                                                            {
                                                                                ...slide,
                                                                                overlayColor:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            };
                                                                        if (
                                                                            type ===
                                                                            'slider'
                                                                        ) {
                                                                            setLocalConfig(
                                                                                {
                                                                                    ...config,
                                                                                    slides: slides.map(
                                                                                        (
                                                                                            s,
                                                                                        ) =>
                                                                                            s.id ===
                                                                                            slide.id
                                                                                                ? updatedSlide
                                                                                                : s,
                                                                                    ),
                                                                                },
                                                                            );
                                                                        } else {
                                                                            setLocalConfig(
                                                                                {
                                                                                    ...config,
                                                                                    singleSlide:
                                                                                        updatedSlide,
                                                                                },
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    {/* Кнопка сохранения для контента */}
                                    <div className="mt-6 flex justify-end">
                                        <SaveButton
                                            onSave={handleSave}
                                            isSaving={isSaving}
                                            saveStatus={saveStatus}
                                            label="Сохранить контент"
                                            savedLabel="✓ Контент сохранен"
                                            errorLabel="✗ Ошибка сохранения"
                                            savingLabel="Сохранение..."
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="hero-widget">
            {type === 'slider' ? (
                <div className="hero-slider relative">
                    {currentSlides.map((slide) => renderSlide(slide))}

                    {showDots && currentSlides.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform space-x-2">
                            {currentSlides.map((_, index) => (
                                <button
                                    key={index}
                                    className={`h-3 w-3 rounded-full ${
                                        index === currentSlide
                                            ? 'bg-white'
                                            : 'bg-white/50'
                                    }`}
                                    onClick={() => setCurrentSlide(index)}
                                />
                            ))}
                        </div>
                    )}

                    {showArrows && currentSlides.length > 1 && (
                        <>
                            <button
                                className="absolute left-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
                                onClick={() =>
                                    setCurrentSlide(
                                        currentSlide === 0
                                            ? currentSlides.length - 1
                                            : currentSlide - 1,
                                    )
                                }
                            >
                                ←
                            </button>
                            <button
                                className="absolute right-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
                                onClick={() =>
                                    setCurrentSlide(
                                        currentSlide ===
                                            currentSlides.length - 1
                                            ? 0
                                            : currentSlide + 1,
                                    )
                                }
                            >
                                →
                            </button>
                        </>
                    )}
                </div>
            ) : (
                renderSlide(singleSlide)
            )}
        </div>
    );
};

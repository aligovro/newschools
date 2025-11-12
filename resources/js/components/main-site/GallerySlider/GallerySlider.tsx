import { ArrowLeft, ArrowRight } from 'lucide-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { NavigationOptions } from 'swiper/types';
import './GallerySlider.css';

interface GallerySliderProps {
    images: string[];
    onImageClick?: (index: number) => void;
    className?: string;
}

type GroupedImages = {
    images: string[];
    startIndex: number;
};

export const GallerySlider: React.FC<GallerySliderProps> = ({
    images,
    onImageClick,
    className = '',
}) => {
    // Храним Map: ключ - индекс группы, значение - индекс узкой картинки в группе
    // По умолчанию в каждой группе узкая - третья (index 2)
    const [smallImageIndices, setSmallImageIndices] = useState<
        Map<number, number>
    >(new Map());

    // Храним Map: ключ - индекс группы, значение - индекс наведенной картинки в группе
    // null означает, что мышь не наведена
    const [hoveredImageIndices, setHoveredImageIndices] = useState<
        Map<number, number | null>
    >(new Map());

    // Храним Set индексов групп, где средняя картинка расширена
    const [expandedMiddleImages, setExpandedMiddleImages] = useState<
        Set<number>
    >(new Set());
    const swiperRef = useRef<SwiperType | null>(null);
    const navigationPrevRef = useRef<HTMLButtonElement>(null);
    const navigationNextRef = useRef<HTMLButtonElement>(null);

    // Группируем изображения по 3 - мемоизируем, чтобы не пересчитывать при каждом рендере
    const groupedImages = useMemo<GroupedImages[]>(() => {
        if (!images || images.length === 0) {
            return [];
        }

        const total = images.length;

        if (total <= 3) {
            return [
                {
                    images: images.slice(0, 3),
                    startIndex: 0,
                },
            ];
        }

        const grouped: GroupedImages[] = [];
        for (let start = 0; start <= total - 3; start += 1) {
            grouped.push({
                images: images.slice(start, start + 3),
                startIndex: start,
            });
        }

        return grouped;
    }, [images]);

    const handleImageClick = useCallback(
        (startIndex: number, imageIndex: number) => {
            const globalIndex = startIndex + imageIndex;
            if (onImageClick) {
                onImageClick(globalIndex);
            }
        },
        [onImageClick],
    );

    const getImageWidth = (
        index: number,
        groupIndex: number,
        groupLength: number,
    ) => {
        if (groupLength === 1) {
            return '100%';
        }

        if (groupLength === 2) {
            return '50%';
        }

        // По умолчанию узкая - последняя картинка в группе (третья если есть, иначе последняя)
        const defaultSmallIndex = Math.min(2, groupLength - 1);

        // Получаем текущую узкую картинку для этой группы (или дефолт)
        const currentSmallIndex =
            smallImageIndices.get(groupIndex) ?? defaultSmallIndex;

        // Получаем индекс наведенной картинки для этой группы
        const hoveredIndex = hoveredImageIndices.get(groupIndex);

        // Если навели на текущую узкую картинку
        if (hoveredIndex === currentSmallIndex) {
            // Если это средняя картинка (index 1) в группе из 3 картинок И она узкая
            // Средняя всегда расширяется вправо до 58%, оставляя третьей 16%
            if (hoveredIndex === 1 && groupLength === 3) {
                if (index === 1) {
                    // Средняя картинка расширяется вправо до 58%
                    return '58%';
                }
                if (index === 2) {
                    // Третья картинка остается видимой с шириной 16%
                    return '16%';
                }
                // Левая картинка остается широкой (42%)
                return '42%';
            }

            // Обычная логика для других узких картинок: наведенная узкая становится широкой
            if (index === hoveredIndex) {
                return '42%';
            }

            // Находим ближайшую картинку к наведенной узкой
            const distances = Array.from({ length: groupLength }, (_, i) => ({
                index: i,
                distance: Math.abs(i - hoveredIndex),
            }));

            // Сортируем по расстоянию, при равном расстоянии выбираем левую
            distances.sort((a, b) => {
                if (a.distance !== b.distance) {
                    return a.distance - b.distance;
                }
                return a.index - b.index;
            });

            // Ближайшая к наведенной узкой (но не сама наведенная) становится узкой
            const closestIndex =
                distances.find((d) => d.index !== hoveredIndex)?.index ??
                defaultSmallIndex;

            if (index === closestIndex) {
                return '16%';
            }

            // Остальные широкие
            return '42%';
        }

        // Если навели на третью картинку (index 2), она должна увеличиваться до 42%, а средняя уменьшаться до 16%
        if (hoveredIndex === 2 && groupLength === 3) {
            if (index === 2) {
                // Третья картинка увеличивается до 42%
                return '42%';
            }
            if (index === 1) {
                // Средняя картинка уменьшается до 16%
                return '16%';
            }
            // Левая картинка остается широкой (42%)
            return '42%';
        }

        // Если мышь не наведена или наведена на широкую картинку - используем текущее состояние
        // Проверяем, расширена ли средняя картинка
        if (
            expandedMiddleImages.has(groupIndex) &&
            groupLength === 3 &&
            hoveredIndex !== 2
        ) {
            if (index === 1) {
                // Средняя картинка расширена до 58%
                return '58%';
            }
            if (index === 2) {
                // Третья картинка остается видимой с шириной 16%
                return '16%';
            }
            // Левая картинка широкая (42%)
            return '42%';
        }

        return index === currentSmallIndex ? '16%' : '42%';
    };

    const handleMouseEnter = useCallback(
        (groupIndex: number, imageIndex: number, groupLength: number) => {
            if (groupLength < 3) {
                setHoveredImageIndices((prev) => {
                    const newMap = new Map(prev);
                    newMap.set(groupIndex, imageIndex);
                    return newMap;
                });
                return;
            }

            const defaultSmallIndex = Math.min(2, groupLength - 1);

            // Если навели на третью картинку (index 2) в группе из 3 картинок
            // Третья должна увеличиваться до 42%, а средняя уменьшаться до 16%
            if (imageIndex === 2 && groupLength === 3) {
                // Сбрасываем состояние расширения средней картинки
                setExpandedMiddleImages((prev) => {
                    if (prev.has(groupIndex)) {
                        const newSet = new Set(prev);
                        newSet.delete(groupIndex);
                        return newSet;
                    }
                    return prev;
                });
                // Обновляем состояние узкой картинки - средняя становится узкой (1)
                setSmallImageIndices((prev) => {
                    const newMap = new Map(prev);
                    newMap.set(groupIndex, 1); // Средняя картинка становится узкой
                    return newMap;
                });
            } else {
                // Получаем текущую узкую картинку из состояния
                setSmallImageIndices((prev) => {
                    const currentSmallIndex =
                        prev.get(groupIndex) ?? defaultSmallIndex;

                    // Если навели на текущую узкую картинку
                    if (imageIndex === currentSmallIndex) {
                        // Если это средняя картинка (index 1) в группе из 3 картинок И она узкая
                        // Средняя всегда расширяется вправо до 58%, оставляя третьей 16%
                        if (
                            imageIndex === 1 &&
                            groupLength === 3 &&
                            currentSmallIndex === 1
                        ) {
                            // Устанавливаем состояние расширения средней картинки
                            setExpandedMiddleImages((prevExpanded) => {
                                const newSet = new Set(prevExpanded);
                                newSet.add(groupIndex);
                                return newSet;
                            });
                            // Не обновляем smallImageIndices - третья картинка должна остаться узкой (16%)
                            return prev;
                        } else {
                            // Для всех других узких картинок сбрасываем состояние расширения средней
                            setExpandedMiddleImages((prevExpanded) => {
                                if (prevExpanded.has(groupIndex)) {
                                    const newSet = new Set(prevExpanded);
                                    newSet.delete(groupIndex);
                                    return newSet;
                                }
                                return prevExpanded;
                            });

                            // Находим ближайшую картинку к наведенной узкой
                            const distances = Array.from(
                                { length: groupLength },
                                (_, i) => ({
                                    index: i,
                                    distance: Math.abs(i - imageIndex),
                                }),
                            );

                            // Сортируем по расстоянию, при равном расстоянии выбираем левую
                            distances.sort((a, b) => {
                                if (a.distance !== b.distance) {
                                    return a.distance - b.distance;
                                }
                                return a.index - b.index;
                            });

                            // Ближайшая к наведенной узкой (но не сама наведенная) становится узкой
                            const closestIndex =
                                distances.find((d) => d.index !== imageIndex)
                                    ?.index ?? defaultSmallIndex;

                            // Обновляем состояние узкой картинки
                            const newMap = new Map(prev);
                            newMap.set(groupIndex, closestIndex);
                            return newMap;
                        }
                    }
                    return prev;
                });
            }

            // Обновляем индекс наведенной картинки
            setHoveredImageIndices((prev) => {
                const newMap = new Map(prev);
                newMap.set(groupIndex, imageIndex);
                return newMap;
            });
        },
        [], // Пустой массив зависимостей, так как используем функциональные обновления setState
    );

    const handleMouseLeave = useCallback(
        (groupIndex: number) => {
            // При отводе мыши просто убираем информацию о наведении
            // Состояние узкой картинки сохраняется
            setHoveredImageIndices((prev) => {
                const newMap = new Map(prev);
                newMap.set(groupIndex, null);
                return newMap;
            });
        },
        [], // Пустой массив зависимостей, так как используем функциональные обновления setState
    );

    // Мемоизируем обработчики Swiper
    const handleSwiper = useCallback((swiper: SwiperType) => {
        swiperRef.current = swiper;
    }, []);

    const handleBeforeInit = useCallback((swiper: SwiperType) => {
        if (swiper.params.navigation) {
            const navigationParams = swiper.params
                .navigation as NavigationOptions;
            if (navigationParams) {
                navigationParams.prevEl = navigationPrevRef.current;
                navigationParams.nextEl = navigationNextRef.current;
            }
        }
    }, []);

    // Проверка на пустые изображения после всех хуков
    if (!images || images.length === 0) {
        return null;
    }

    return (
        <div className={`gallery-slider-container relative ${className}`}>
            <div className="gallery-slider-wrapper">
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={0}
                    slidesPerView={1}
                    onSwiper={handleSwiper}
                    navigation={{
                        prevEl: navigationPrevRef.current,
                        nextEl: navigationNextRef.current,
                    }}
                    onBeforeInit={handleBeforeInit}
                >
                    {groupedImages.map(
                        ({ images: group, startIndex }, groupIndex) => (
                            <SwiperSlide key={`${groupIndex}-${startIndex}`}>
                                <div
                                    className="gallery-slider-group"
                                    onMouseLeave={() =>
                                        handleMouseLeave(groupIndex)
                                    }
                                >
                                    {group.map((image, imageIndex) => {
                                        const globalIndex =
                                            startIndex + imageIndex;
                                        const imageWidth = getImageWidth(
                                            imageIndex,
                                            groupIndex,
                                            group.length,
                                        );
                                        return (
                                            <img
                                                key={imageIndex}
                                                src={image}
                                                alt={`Gallery image ${globalIndex + 1}`}
                                                className="gallery-slider-image"
                                                style={{
                                                    width: imageWidth,
                                                }}
                                                onMouseEnter={() =>
                                                    handleMouseEnter(
                                                        groupIndex,
                                                        imageIndex,
                                                        group.length,
                                                    )
                                                }
                                                onClick={() =>
                                                    handleImageClick(
                                                        startIndex,
                                                        imageIndex,
                                                    )
                                                }
                                                loading="lazy"
                                            />
                                        );
                                    })}
                                </div>
                            </SwiperSlide>
                        ),
                    )}
                </Swiper>
            </div>

            {groupedImages.length > 1 && (
                <>
                    <button
                        ref={navigationPrevRef}
                        className="gallery-slider-nav-btn gallery-slider-nav-btn-prev"
                        aria-label="Previous slide"
                    >
                        <ArrowLeft />
                    </button>
                    <button
                        ref={navigationNextRef}
                        className="gallery-slider-nav-btn gallery-slider-nav-btn-next"
                        aria-label="Next slide"
                    >
                        <ArrowRight />
                    </button>
                </>
            )}
        </div>
    );
};

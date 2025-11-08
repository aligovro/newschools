import { useYandexMap } from '@/hooks/useYandexMap';
import React, { useEffect, useMemo, useRef } from 'react';

export interface MapMarker {
    id: string | number;
    position: [number, number];
    hint?: string;
    balloon?: string;
    data?: unknown; // Дополнительные данные для маркера (например, организация)
}

interface YandexMapProps {
    center: [number, number];
    zoom?: number;
    markers?: MapMarker[];
    height?: number | string;
    onBoundsChange?: (bbox: [number, number, number, number]) => void; // south, west, north, east
    onClick?: (coordinates: [number, number]) => void; // Callback при клике на карту
    onMarkerClick?: (marker: MapMarker) => void; // Callback при клике на маркер
    allowMarkerClick?: boolean; // Разрешить установку метки по клику
    draggableMarker?: boolean; // Перетаскиваемая метка (только для одиночной метки)
    autoFitBounds?: boolean; // Автоматически подстраивать зум под все маркеры
    customIconUrl?: string; // URL кастомной иконки для обычных маркеров
    selectedIconUrl?: string; // URL кастомной иконки для выбранного маркера
    selectedMarkerId?: string | number | null; // ID выбранного маркера
    grayscale?: boolean; // Черно-белая карта
    onZoomChange?: (zoom: number) => void;
}

export const YandexMap: React.FC<YandexMapProps> = ({
    center,
    zoom = 10,
    markers = [],
    height = 420,
    onBoundsChange,
    onClick,
    onMarkerClick,
    allowMarkerClick = false,
    draggableMarker = false,
    autoFitBounds = false,
    customIconUrl,
    selectedIconUrl,
    selectedMarkerId = null,
    grayscale = false,
    onZoomChange,
}) => {
    const { ymaps, isReady } = useYandexMap();
    const mapRef = useRef<HTMLDivElement | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapInstanceRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const objectManagerRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const singlePlacemarkRef = useRef<any>(null);
    const grayscaleStyleRef = useRef<HTMLStyleElement | null>(null);
    const grayscaleStyleIdRef = useRef<string | null>(null);

    // Создаем стабильную строку для отслеживания изменений маркеров
    const markersKey = useMemo(
        () =>
            markers
                .map((m) => `${m.id}:${m.position[0]}:${m.position[1]}`)
                .join('|'),
        [markers],
    );

    useEffect(() => {
        if (!isReady || !ymaps || !mapRef.current) return;

        if (!mapInstanceRef.current) {
            // Настройки карты
            const mapOptions: {
                center: [number, number];
                zoom: number;
                controls: string[];
                type?: string;
            } = {
                center,
                zoom,
                controls: [
                    'zoomControl',
                    'geolocationControl',
                    'fullscreenControl',
                ],
            };

            mapInstanceRef.current = new ymaps.Map(mapRef.current, mapOptions);

            if (onBoundsChange) {
                mapInstanceRef.current.events.add('boundschange', () => {
                    const bounds = mapInstanceRef.current.getBounds();
                    if (bounds && bounds[0] && bounds[1]) {
                        const south = bounds[0][0];
                        const west = bounds[0][1];
                        const north = bounds[1][0];
                        const east = bounds[1][1];
                        onBoundsChange([south, west, north, east]);
                    }
                });
            }

            // Обработчик клика на карту
            if (onClick || allowMarkerClick) {
                mapInstanceRef.current.events.add(
                    'click',
                    (e: { get: (key: string) => [number, number] }) => {
                        const coords = e.get('coords') as [number, number];
                        if (onClick) {
                            onClick(coords);
                        }
                    },
                );
            }

            // ObjectManager будет создан в useEffect для маркеров при необходимости
        } else {
            mapInstanceRef.current.setCenter(center, zoom);
        }
    }, [
        isReady,
        ymaps,
        center,
        zoom,
        onClick,
        allowMarkerClick,
        onBoundsChange,
    ]);

    useEffect(() => {
        if (!grayscale || !mapRef.current) {
            if (mapRef.current) {
                mapRef.current.removeAttribute('data-map-container');
            }
            if (
                grayscaleStyleRef.current &&
                document.head.contains(grayscaleStyleRef.current)
            ) {
                document.head.removeChild(grayscaleStyleRef.current);
            }
            grayscaleStyleRef.current = null;
            grayscaleStyleIdRef.current = null;
            return;
        }

        const mapContainer = mapRef.current;
        if (!grayscaleStyleIdRef.current) {
            grayscaleStyleIdRef.current = `yandex-map-grayscale-${Math.random()
                .toString(36)
                .slice(2)}`;
        }
        const styleId = grayscaleStyleIdRef.current;

        if (!grayscaleStyleRef.current) {
            const style = document.createElement('style');
            style.id = `${styleId}-style`;
            style.textContent = `
                [data-map-container="${styleId}"] .ymaps-2-1-79-ground-pane,
                [data-map-container="${styleId}"] .ymaps-2-1-78-ground-pane,
                [data-map-container="${styleId}"] .ymaps-2-1-80-ground-pane {
                    filter: grayscale(100%) !important;
                }
            `;
            document.head.appendChild(style);
            grayscaleStyleRef.current = style;
        }

        mapContainer.setAttribute('data-map-container', styleId);
    }, [grayscale, isReady]);

    useEffect(() => {
        return () => {
            if (
                grayscaleStyleRef.current &&
                document.head.contains(grayscaleStyleRef.current)
            ) {
                document.head.removeChild(grayscaleStyleRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!mapInstanceRef.current || !onZoomChange) return;
        const map = mapInstanceRef.current;
        const zoomHandler = (e: { get: (key: string) => unknown }) => {
            const newZoom = e.get('newZoom');
            const oldZoom = e.get('oldZoom');
            if (
                typeof newZoom === 'number' &&
                typeof oldZoom === 'number' &&
                newZoom !== oldZoom
            ) {
                onZoomChange(newZoom);
            }
        };
        map.events.add('boundschange', zoomHandler);
        return () => {
            map.events.remove('boundschange', zoomHandler);
        };
    }, [onZoomChange, isReady, ymaps]);

    // Обработка маркеров: либо одиночная перетаскиваемая метка, либо ObjectManager
    useEffect(() => {
        if (!isReady || !ymaps || !mapInstanceRef.current) return;

        // Если разрешен клик для установки метки и есть одиночная метка
        if (allowMarkerClick && markers.length === 1) {
            const marker = markers[0];

            // Удаляем ObjectManager, если он был создан
            if (objectManagerRef.current) {
                mapInstanceRef.current.geoObjects.remove(
                    objectManagerRef.current,
                );
                objectManagerRef.current = null;
            }

            // Удаляем старую метку
            if (singlePlacemarkRef.current) {
                mapInstanceRef.current.geoObjects.remove(
                    singlePlacemarkRef.current,
                );
            }

            const placemarkOptions: Record<string, unknown> = {
                draggable: draggableMarker,
            };

            if (customIconUrl) {
                Object.assign(placemarkOptions, {
                    iconLayout: 'default#image',
                    iconImageHref: customIconUrl,
                    iconImageSize: [31, 33],
                    iconImageOffset: [-15.5, -33],
                });
            } else {
                Object.assign(placemarkOptions, {
                    preset: 'islands#blueDotIcon',
                });
            }

            // Создаем новую перетаскиваемую метку
            singlePlacemarkRef.current = new ymaps.Placemark(
                marker.position,
                {
                    hintContent: marker.hint || '',
                    balloonContent: marker.balloon || '',
                },
                placemarkOptions,
            );

            // Обработчик перетаскивания
            if (draggableMarker && onClick) {
                singlePlacemarkRef.current.events.add('dragend', () => {
                    const coords =
                        singlePlacemarkRef.current.geometry.getCoordinates() as [
                            number,
                            number,
                        ];
                    onClick(coords);
                });
            }

            mapInstanceRef.current.geoObjects.add(singlePlacemarkRef.current);
        }
        // Если множественные маркеры или режим просмотра
        else if (markers.length > 0) {
            // Удаляем одиночную метку
            if (singlePlacemarkRef.current) {
                mapInstanceRef.current.geoObjects.remove(
                    singlePlacemarkRef.current,
                );
                singlePlacemarkRef.current = null;
            }

            // Создаем ObjectManager, если его нет
            if (!objectManagerRef.current) {
                objectManagerRef.current = new ymaps.ObjectManager({
                    clusterize: markers.length > 10,
                    gridSize: 64,
                    clusterDisableClickZoom: false,
                    geoObjectOpenBalloonOnClick: false, // Отключаем автоматическое открытие балуна
                });

                mapInstanceRef.current.geoObjects.add(objectManagerRef.current);
            }

            // Обновляем обработчик клика на маркер при изменении маркеров
            if (onMarkerClick) {
                // Удаляем старый обработчик, если был
                if (objectManagerRef.current._markerClickHandler) {
                    objectManagerRef.current.objects.events.remove(
                        'click',
                        objectManagerRef.current._markerClickHandler,
                    );
                }
                // Создаем новый обработчик с актуальными маркерами
                const clickHandler = (e: { get: (key: string) => string }) => {
                    const objectId = e.get('objectId');
                    const marker = markers.find(
                        (m) => String(m.id) === objectId,
                    );
                    if (marker) {
                        // Закрываем все открытые балуны перед вызовом callback
                        if (
                            objectManagerRef.current &&
                            mapInstanceRef.current
                        ) {
                            try {
                                // Закрываем балуны через ObjectManager
                                objectManagerRef.current.objects.each(
                                    (obj: {
                                        balloon?: { close: () => void };
                                    }) => {
                                        if (
                                            obj &&
                                            obj.balloon &&
                                            typeof obj.balloon.close ===
                                                'function'
                                        ) {
                                            obj.balloon.close();
                                        }
                                    },
                                );
                            } catch (error) {
                                // Игнорируем ошибки при закрытии балунов
                                console.debug('Error closing balloons:', error);
                            }
                        }
                        onMarkerClick(marker);
                    }
                };
                objectManagerRef.current.objects.events.add(
                    'click',
                    clickHandler,
                );
                objectManagerRef.current._markerClickHandler = clickHandler;
            }

            const features = markers.map((m) => {
                const properties: Record<string, unknown> = {
                    hintContent: m.hint || '',
                    // Не добавляем balloonContent, так как используем карточку вместо балуна
                };

                return {
                    type: 'Feature',
                    id: String(m.id),
                    geometry: { type: 'Point', coordinates: m.position },
                    properties,
                };
            });

            // Обновляем маркеры
            objectManagerRef.current.removeAll();
            if (features.length > 0) {
                objectManagerRef.current.add({
                    type: 'FeatureCollection',
                    features,
                });

                // Настраиваем кастомные иконки для каждого маркера
                // Используем небольшую задержку, чтобы ObjectManager успел обработать объекты
                if (customIconUrl || selectedIconUrl) {
                    setTimeout(() => {
                        if (!objectManagerRef.current) return;

                        markers.forEach((m) => {
                            const isSelected =
                                selectedMarkerId !== null &&
                                m.id === selectedMarkerId;
                            const iconUrl =
                                isSelected && selectedIconUrl
                                    ? selectedIconUrl
                                    : customIconUrl;

                            if (iconUrl) {
                                try {
                                    objectManagerRef.current.objects.setObjectOptions(
                                        String(m.id),
                                        {
                                            iconLayout: 'default#image',
                                            iconImageHref: iconUrl,
                                            iconImageSize: isSelected
                                                ? [39, 42]
                                                : [31, 33],
                                            iconImageOffset: isSelected
                                                ? [-19.5, -42]
                                                : [-15.5, -33],
                                        },
                                    );
                                } catch (error) {
                                    console.debug(
                                        'Error setting marker icon:',
                                        error,
                                    );
                                }
                            }
                        });
                    }, 100);
                }

                // Автоматически подстраиваем зум под все маркеры
                if (autoFitBounds && mapInstanceRef.current) {
                    // Небольшая задержка для корректного получения границ после добавления объектов
                    setTimeout(() => {
                        if (
                            objectManagerRef.current &&
                            mapInstanceRef.current
                        ) {
                            // Используем getBounds для получения границ всех объектов
                            const bounds = objectManagerRef.current.getBounds();
                            if (
                                bounds &&
                                Array.isArray(bounds) &&
                                bounds.length === 2
                            ) {
                                // Устанавливаем границы карты с небольшим отступом
                                mapInstanceRef.current.setBounds(bounds, {
                                    checkZoomRange: true,
                                    duration: 300,
                                    padding: [50, 50, 50, 50], // Отступы в пикселях
                                });
                            }
                        }
                    }, 100);
                }
            }
        }
        // Если маркеров нет, удаляем все
        else {
            if (singlePlacemarkRef.current) {
                mapInstanceRef.current.geoObjects.remove(
                    singlePlacemarkRef.current,
                );
                singlePlacemarkRef.current = null;
            }
            if (objectManagerRef.current) {
                objectManagerRef.current.removeAll();
            }
        }
    }, [
        isReady,
        ymaps,
        markers,
        markersKey,
        allowMarkerClick,
        draggableMarker,
        onClick,
        onMarkerClick,
        autoFitBounds,
        customIconUrl,
        selectedIconUrl,
        selectedMarkerId,
    ]);

    return (
        <div
            ref={mapRef}
            style={{
                width: '100%',
                height: typeof height === 'number' ? `${height}px` : height,
            }}
        />
    );
};

export default YandexMap;

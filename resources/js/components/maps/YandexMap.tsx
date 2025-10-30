import { useYandexMap } from '@/hooks/useYandexMap';
import React, { useEffect, useRef } from 'react';

export interface MapMarker {
    id: string | number;
    position: [number, number];
    hint?: string;
    balloon?: string;
}

interface YandexMapProps {
    center: [number, number];
    zoom?: number;
    markers?: MapMarker[];
    height?: number | string;
    onBoundsChange?: (bbox: [number, number, number, number]) => void; // south, west, north, east
    onClick?: (coordinates: [number, number]) => void; // Callback при клике на карту
    allowMarkerClick?: boolean; // Разрешить установку метки по клику
    draggableMarker?: boolean; // Перетаскиваемая метка (только для одиночной метки)
}

export const YandexMap: React.FC<YandexMapProps> = ({
    center,
    zoom = 10,
    markers = [],
    height = 420,
    onBoundsChange,
    onClick,
    allowMarkerClick = false,
    draggableMarker = false,
}) => {
    const { ymaps, isReady } = useYandexMap();
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<any>(null);
    const objectManagerRef = useRef<any>(null);
    const singlePlacemarkRef = useRef<any>(null);

    useEffect(() => {
        if (!isReady || !ymaps || !mapRef.current) return;

        if (!mapInstanceRef.current) {
            mapInstanceRef.current = new ymaps.Map(mapRef.current, {
                center,
                zoom,
                controls: [
                    'zoomControl',
                    'geolocationControl',
                    'fullscreenControl',
                ],
            });

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
                mapInstanceRef.current.events.add('click', (e: any) => {
                    const coords = e.get('coords') as [number, number];
                    if (onClick) {
                        onClick(coords);
                    }
                });
            }

            // ObjectManager для множественных маркеров
            if (markers.length > 1 || !allowMarkerClick) {
                objectManagerRef.current = new ymaps.ObjectManager({
                    clusterize: true,
                    gridSize: 64,
                    clusterDisableClickZoom: false,
                });
                mapInstanceRef.current.geoObjects.add(objectManagerRef.current);
            }
        } else {
            mapInstanceRef.current.setCenter(center, zoom);
        }

        return () => {};
    }, [isReady, ymaps, center[0], center[1], zoom, onClick, allowMarkerClick]);

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

            // Создаем новую перетаскиваемую метку
            singlePlacemarkRef.current = new ymaps.Placemark(
                marker.position,
                {
                    hintContent: marker.hint || '',
                    balloonContent: marker.balloon || '',
                },
                {
                    draggable: draggableMarker,
                    preset: 'islands#blueDotIcon',
                },
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
                });
                mapInstanceRef.current.geoObjects.add(objectManagerRef.current);
            }

            const features = markers.map((m) => ({
                type: 'Feature',
                id: m.id,
                geometry: { type: 'Point', coordinates: m.position },
                properties: { hintContent: m.hint, balloonContent: m.balloon },
            }));

            objectManagerRef.current.removeAll();
            objectManagerRef.current.add({
                type: 'FeatureCollection',
                features,
            });
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
        JSON.stringify(markers),
        allowMarkerClick,
        draggableMarker,
        onClick,
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

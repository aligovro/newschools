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
}

export const YandexMap: React.FC<YandexMapProps> = ({
    center,
    zoom = 10,
    markers = [],
    height = 420,
    onBoundsChange,
}) => {
    const { ymaps, isReady } = useYandexMap();
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<any>(null);
    const objectManagerRef = useRef<any>(null);

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

            objectManagerRef.current = new ymaps.ObjectManager({
                clusterize: true,
                gridSize: 64,
                clusterDisableClickZoom: false,
            });
            mapInstanceRef.current.geoObjects.add(objectManagerRef.current);
        } else {
            mapInstanceRef.current.setCenter(center, zoom);
        }

        return () => {};
    }, [isReady, ymaps, center[0], center[1], zoom]);

    useEffect(() => {
        if (!isReady || !ymaps || !objectManagerRef.current) return;

        const features = markers.map((m) => ({
            type: 'Feature',
            id: m.id,
            geometry: { type: 'Point', coordinates: m.position },
            properties: { hintContent: m.hint, balloonContent: m.balloon },
        }));

        objectManagerRef.current.removeAll();
        objectManagerRef.current.add({ type: 'FeatureCollection', features });
    }, [isReady, ymaps, JSON.stringify(markers)]);

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

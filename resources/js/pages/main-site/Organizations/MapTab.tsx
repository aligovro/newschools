import YandexMap, { MapMarker } from '@/components/maps/YandexMap';

interface MapTabProps {
    mapMarkers: MapMarker[];
    mapCenter: [number, number];
}

export default function MapTab({ mapMarkers, mapCenter }: MapTabProps) {
    return (
        <div className="rounded-lg border bg-white shadow-sm">
            <div style={{ height: '600px', width: '100%' }}>
                <YandexMap
                    center={mapCenter}
                    zoom={mapMarkers.length > 0 ? 10 : 6}
                    markers={mapMarkers}
                    height="600px"
                />
            </div>
            {mapMarkers.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                    <p>
                        У организаций нет координат для отображения
                        на карте
                    </p>
                </div>
            )}
        </div>
    );
}

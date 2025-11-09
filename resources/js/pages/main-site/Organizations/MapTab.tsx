import YandexMap, { MapMarker } from '@/components/maps/YandexMap';
import OrganizationCard from '@/components/organizations/OrganizationCard';
import { useMemo, useState, useCallback } from 'react';
import { X } from 'lucide-react';

interface OrganizationData {
    id: number;
    name: string;
    slug: string;
    description?: string;
    address?: string;
    logo?: string;
    image?: string;
    region?: { name: string };
    city?: { id: number; name: string };
    type: string;
    projects_count: number;
    members_count?: number;
    sponsors_count?: number;
    donations_total: number;
    donations_collected: number;
    director_name?: string;
    needs_target_amount?: number | null;
    needs_collected_amount?: number | null;
    latitude?: number | null;
    longitude?: number | null;
}

interface MapTabProps {
    mapMarkers: MapMarker[];
    mapCenter: [number, number];
}

export default function MapTab({ mapMarkers, mapCenter }: MapTabProps) {
    const [selectedOrganization, setSelectedOrganization] = useState<OrganizationData | null>(null);

    // Для множественных маркеров используем autoFitBounds для автоматической подстройки
    const shouldAutoFit = mapMarkers.length > 1;
    
    // Для одиночного маркера используем зум для города (не для конкретного адреса)
    const mapZoom = useMemo(() => {
        if (mapMarkers.length === 0) return 12; // Зум для города по умолчанию
        if (mapMarkers.length === 1) return 13; // Зум для города с одной организацией
        // Для множественных маркеров autoFitBounds подстроит автоматически
        return 12; // Начальный зум, затем autoFitBounds подстроит
    }, [mapMarkers.length]);

    // Обработчик клика на маркер
    const handleMarkerClick = useCallback((marker: MapMarker) => {
        if (marker.data) {
            setSelectedOrganization(marker.data as OrganizationData);
        }
    }, []);

    // Обработчик клика на карту (закрываем карточку)
    const handleMapClick = useCallback(() => {
        setSelectedOrganization(null);
    }, []);

    const selectedMarkerId = selectedOrganization?.id ?? null;

    return (
        <div className="relative rounded-lg border bg-white shadow-sm">
            <div style={{ height: '600px', width: '100%' }}>
                <YandexMap
                    center={mapCenter}
                    zoom={mapZoom}
                    markers={mapMarkers}
                    height="600px"
                    autoFitBounds={shouldAutoFit}
                    grayscale={true}
                    customIconUrl="/icons/map-blue-marker.svg"
                    selectedIconUrl="/icons/map-black-marker.svg"
                    selectedMarkerId={selectedMarkerId}
                    onMarkerClick={handleMarkerClick}
                    onClick={handleMapClick}
                />
            </div>
            
            {/* Карточка организации поверх карты */}
            {selectedOrganization && (
                <div className="absolute left-2 top-2 z-10 w-full max-w-sm md:left-4 md:top-4 md:w-80">
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrganization(null);
                            }}
                            className="absolute -right-2 -top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg transition-colors hover:bg-gray-100"
                            aria-label="Закрыть карточку"
                            type="button"
                        >
                            <X className="h-4 w-4 text-gray-600" />
                        </button>
                        <div onClick={(e) => e.stopPropagation()}>
                            <OrganizationCard organization={selectedOrganization} />
                        </div>
                    </div>
                </div>
            )}

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

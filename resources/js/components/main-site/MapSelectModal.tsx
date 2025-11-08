import { YandexMap, type MapMarker } from '@/components/maps/YandexMap';
import { X } from 'lucide-react';
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type MouseEvent,
} from 'react';
import CitySelector, { type City } from './CitySelector';

interface MapSelectModalProps {
    isOpen: boolean;
    initialCoordinates?: { lat: number; lng: number } | null;
    onSelect: (coordinates: { lat: number; lng: number }) => void;
    onClose: () => void;
    citySelectorEnabled?: boolean;
    city?: City | null;
    onCityChange?: (city: City | null) => void;
}

const DEFAULT_CENTER: [number, number] = [55.751244, 37.618423];
const DEFAULT_ZOOM = 11;
const CITY_ZOOM = 13;
const POINT_ZOOM = 15;

export function MapSelectModal({
    isOpen,
    initialCoordinates = null,
    onSelect,
    onClose,
    citySelectorEnabled = false,
    city = null,
    onCityChange,
}: MapSelectModalProps) {
    const [markerCoords, setMarkerCoords] = useState<{
        lat: number;
        lng: number;
    } | null>(initialCoordinates);
    const [currentZoom, setCurrentZoom] = useState<number>(DEFAULT_ZOOM);
    const [hasUserZoomed, setHasUserZoomed] = useState(false);

    const computeInitialZoom = useCallback(
        (
            coords: { lat: number; lng: number } | null,
            targetCity: City | null,
        ) => {
            if (coords) return POINT_ZOOM;
            if (targetCity?.latitude != null && targetCity.longitude != null)
                return CITY_ZOOM;
            return DEFAULT_ZOOM;
        },
        [],
    );

    useEffect(() => {
        if (isOpen) {
            setMarkerCoords(initialCoordinates);
            setHasUserZoomed(false);
            setCurrentZoom(computeInitialZoom(initialCoordinates, city));
        }
    }, [isOpen, initialCoordinates, city, computeInitialZoom]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen, onClose]);

    const mapCenter = useMemo<[number, number]>(() => {
        if (markerCoords) {
            return [markerCoords.lat, markerCoords.lng];
        }
        if (city?.latitude != null && city?.longitude != null) {
            return [city.latitude, city.longitude];
        }
        if (initialCoordinates) {
            return [initialCoordinates.lat, initialCoordinates.lng];
        }
        return DEFAULT_CENTER;
    }, [markerCoords, city?.latitude, city?.longitude, initialCoordinates]);

    const markers = useMemo<MapMarker[]>(() => {
        if (!markerCoords) {
            return [];
        }

        return [
            {
                id: 'selected-point',
                position: [markerCoords.lat, markerCoords.lng],
            },
        ];
    }, [markerCoords]);

    const handleMapClick = useCallback((coords: [number, number]) => {
        setMarkerCoords({ lat: coords[0], lng: coords[1] });
    }, []);

    const handleOverlayClick = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
            if (event.target === event.currentTarget) {
                onClose();
            }
        },
        [onClose],
    );

    const handleConfirm = useCallback(() => {
        if (!markerCoords) {
            return;
        }

        onSelect(markerCoords);
    }, [markerCoords, onSelect]);

    const handleCityChange = useCallback(
        (nextCity: City | null) => {
            if (onCityChange) {
                onCityChange(nextCity);
            }
            if (nextCity) {
                setMarkerCoords(null);
                setHasUserZoomed(false);
                setCurrentZoom(computeInitialZoom(null, nextCity));
            }
        },
        [onCityChange, computeInitialZoom],
    );

    const showCitySelector = citySelectorEnabled && Boolean(onCityChange);

    const handleZoomChange = useCallback((zoom: number) => {
        setHasUserZoomed(true);
        setCurrentZoom(zoom);
    }, []);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
            onClick={handleOverlayClick}
        >
            <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <button
                    type="button"
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-500 transition hover:bg-white hover:text-gray-900"
                    onClick={onClose}
                    aria-label="Закрыть"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="space-y-6 p-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-[#1a1a1a]">
                            Укажите школу на карте
                        </h2>
                        <p className="text-sm text-gray-500">
                            Кликните по карте или перетащите маркер, чтобы
                            выбрать точку.
                        </p>
                    </div>

                    {showCitySelector && (
                        <div className="rounded-xl border border-[#e8ecf3] bg-[#f6f8fc] p-4">
                            <p className="mb-3 text-sm font-semibold text-[#1a1a1a]">
                                Выберите город, чтобы переместить карту
                            </p>
                            <CitySelector
                                value={city ?? null}
                                onChange={handleCityChange}
                                detectOnMount={false}
                                variant="light"
                            />
                        </div>
                    )}

                    <div className="h-[420px] w-full overflow-hidden rounded-xl">
                        <YandexMap
                            center={mapCenter}
                            zoom={currentZoom}
                            markers={markers}
                            allowMarkerClick
                            draggableMarker
                            customIconUrl="/icons/map-blue-marker.svg"
                            onClick={handleMapClick}
                            onZoomChange={handleZoomChange}
                            grayscale
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <button
                            type="button"
                            className="flex-1 rounded-xl border border-[#e8ecf3] px-4 py-3 font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-800"
                            onClick={onClose}
                        >
                            Отмена
                        </button>
                        <button
                            type="button"
                            className="flex-1 rounded-xl bg-gradient-to-r from-[#96bdff] to-[#3259ff] px-4 py-3 font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={handleConfirm}
                            disabled={!markerCoords}
                        >
                            Сохранить точку
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

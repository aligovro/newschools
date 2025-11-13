import { YandexMap, type MapMarker } from '@/components/maps/YandexMap';
import { useYandexMap } from '@/hooks/useYandexMap';
import { X } from 'lucide-react';
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type MouseEvent,
} from 'react';

interface MapSelectModalProps {
    isOpen: boolean;
    initialCoordinates?: { lat: number; lng: number } | null;
    onSelect: (coordinates: { lat: number; lng: number }) => void;
    onClose: () => void;
    cityName?: string;
    onCityNameChange?: (value: string) => void;
}

const DEFAULT_CENTER: [number, number] = [55.751244, 37.618423];
const DEFAULT_ZOOM = 11;
const CITY_ZOOM = 15;
const POINT_ZOOM = 16;

export function MapSelectModal({
    isOpen,
    initialCoordinates = null,
    onSelect,
    onClose,
    cityName,
    onCityNameChange,
}: MapSelectModalProps) {
    const { ymaps, isReady: isYandexReady } = useYandexMap();
    const isCityEditable = typeof onCityNameChange === 'function';
    const [cityInput, setCityInput] = useState(cityName ?? '');
    const [markerCoords, setMarkerCoords] = useState<{
        lat: number;
        lng: number;
    } | null>(initialCoordinates);
    const [currentZoom, setCurrentZoom] = useState<number>(DEFAULT_ZOOM);
    const [hasUserZoomed, setHasUserZoomed] = useState(false);
    const [resolvedCityCoords, setResolvedCityCoords] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [isResolvingCity, setIsResolvingCity] = useState(false);
    const [resolveError, setResolveError] = useState<string | null>(null);
    const cityInputRef = useRef<HTMLInputElement | null>(null);
    const geocodeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const lastGeocodeQueryRef = useRef<string | null>(null);
    const pendingGeocodeRequestRef = useRef(0);
    const wasOpenRef = useRef(false);
    const userPlacedMarkerRef = useRef(false);

    const computeInitialZoom = useCallback(
        (
            coords: { lat: number; lng: number } | null,
            hasCityCenter: boolean,
        ) => {
            if (coords) return POINT_ZOOM;
            if (hasCityCenter) return CITY_ZOOM;
            return DEFAULT_ZOOM;
        },
        [],
    );

    useEffect(() => {
        if (!isOpen) {
            wasOpenRef.current = false;
            userPlacedMarkerRef.current = false;
            if (geocodeTimeoutRef.current) {
                clearTimeout(geocodeTimeoutRef.current);
                geocodeTimeoutRef.current = null;
            }
            pendingGeocodeRequestRef.current = 0;
            lastGeocodeQueryRef.current = null;
            setResolvedCityCoords(null);
            setResolveError(null);
            setIsResolvingCity(false);
            return;
        }

        if (wasOpenRef.current) {
            return;
        }
        wasOpenRef.current = true;

        userPlacedMarkerRef.current = Boolean(initialCoordinates);
        setMarkerCoords(initialCoordinates);
        setHasUserZoomed(false);
        setResolvedCityCoords(null);
        setResolveError(null);
        lastGeocodeQueryRef.current = null;
        pendingGeocodeRequestRef.current = 0;
        setCityInput(cityName ?? '');
        setCurrentZoom(
            computeInitialZoom(initialCoordinates, Boolean(initialCoordinates)),
        );
    }, [cityName, computeInitialZoom, initialCoordinates, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const nextValue = cityName ?? '';
        if (nextValue === cityInput) return;
        if (
            cityInputRef.current &&
            cityInputRef.current === document.activeElement
        ) {
            return;
        }
        setCityInput(nextValue);
        userPlacedMarkerRef.current = Boolean(initialCoordinates);
        setMarkerCoords(initialCoordinates);
        setHasUserZoomed(false);
        lastGeocodeQueryRef.current = null;
    }, [cityInput, cityName, initialCoordinates, isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const trimmedCity = cityInput.trim();
        if (trimmedCity === '') {
            if (geocodeTimeoutRef.current) {
                clearTimeout(geocodeTimeoutRef.current);
                geocodeTimeoutRef.current = null;
            }
            pendingGeocodeRequestRef.current = 0;
            lastGeocodeQueryRef.current = null;
            setResolvedCityCoords(null);
            setResolveError(null);
            setIsResolvingCity(false);
            return;
        }

        if (!ymaps || !isYandexReady) {
            return;
        }

        if (trimmedCity === lastGeocodeQueryRef.current) {
            return;
        }

        if (geocodeTimeoutRef.current) {
            clearTimeout(geocodeTimeoutRef.current);
        }

        geocodeTimeoutRef.current = setTimeout(() => {
            geocodeTimeoutRef.current = null;
            const requestId = ++pendingGeocodeRequestRef.current;
            setIsResolvingCity(true);
            setResolveError(null);

            ymaps
                .geocode(trimmedCity, { results: 1 })
                .then((result: unknown) => {
                    if (pendingGeocodeRequestRef.current !== requestId) {
                        return;
                    }

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const firstGeoObject = (result as any)?.geoObjects?.get?.(
                        0,
                    );
                    const coords =
                        firstGeoObject?.geometry?.getCoordinates?.() as
                            | [number, number]
                            | undefined;

                    if (
                        Array.isArray(coords) &&
                        coords.length === 2 &&
                        coords.every((value) => typeof value === 'number')
                    ) {
                        lastGeocodeQueryRef.current = trimmedCity;
                        setResolvedCityCoords({
                            lat: coords[0],
                            lng: coords[1],
                        });
                        setResolveError(null);
                    } else {
                        lastGeocodeQueryRef.current = trimmedCity;
                        setResolvedCityCoords(null);
                        setResolveError(
                            'Не удалось найти населённый пункт в Яндекс.Картах',
                        );
                    }
                })
                .catch((error: unknown) => {
                    if (pendingGeocodeRequestRef.current !== requestId) {
                        return;
                    }
                    console.debug(
                        'Failed to geocode city via Yandex Maps',
                        error,
                    );
                    lastGeocodeQueryRef.current = null;
                    setResolvedCityCoords(null);
                    setResolveError(
                        'Не удалось определить координаты в Яндекс.Картах',
                    );
                })
                .finally(() => {
                    if (pendingGeocodeRequestRef.current === requestId) {
                        setIsResolvingCity(false);
                    }
                });
        }, 400);

        return () => {
            if (geocodeTimeoutRef.current) {
                clearTimeout(geocodeTimeoutRef.current);
                geocodeTimeoutRef.current = null;
                setIsResolvingCity(false);
            }
        };
    }, [cityInput, isOpen, isYandexReady, ymaps]);

    useEffect(() => {
        if (!isOpen) return;
        if (!resolvedCityCoords) return;
        if (userPlacedMarkerRef.current) return;

        setMarkerCoords((prev) => {
            if (
                prev &&
                Math.abs(prev.lat - resolvedCityCoords.lat) < 1e-6 &&
                Math.abs(prev.lng - resolvedCityCoords.lng) < 1e-6
            ) {
                return prev;
            }
            return {
                lat: resolvedCityCoords.lat,
                lng: resolvedCityCoords.lng,
            };
        });
        setHasUserZoomed(false);
        setCurrentZoom(CITY_ZOOM);
    }, [isOpen, resolvedCityCoords]);

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
        if (resolvedCityCoords) {
            return [resolvedCityCoords.lat, resolvedCityCoords.lng];
        }
        if (initialCoordinates) {
            return [initialCoordinates.lat, initialCoordinates.lng];
        }
        return DEFAULT_CENTER;
    }, [markerCoords, initialCoordinates, resolvedCityCoords]);

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

    const handleCityInputChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;

            if (geocodeTimeoutRef.current) {
                clearTimeout(geocodeTimeoutRef.current);
                geocodeTimeoutRef.current = null;
            }

            pendingGeocodeRequestRef.current = 0;
            userPlacedMarkerRef.current = false;
            setCityInput(value);
            setMarkerCoords(null);
            setHasUserZoomed(false);
            lastGeocodeQueryRef.current = null;
            setResolvedCityCoords(null);
            setResolveError(null);
            setIsResolvingCity(false);

            if (onCityNameChange) {
                onCityNameChange(value);
            }
        },
        [onCityNameChange],
    );

    const handleMapClick = useCallback((coords: [number, number]) => {
        userPlacedMarkerRef.current = true;
        setResolveError(null);
        setIsResolvingCity(false);
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

                    <div className="space-y-2 rounded-xl border border-[#e8ecf3] bg-[#f6f8fc] p-4">
                        <label
                            htmlFor="map-select-city"
                            className="text-sm font-semibold text-[#1a1a1a]"
                        >
                            Город
                        </label>
                        <input
                            id="map-select-city"
                            type="text"
                            ref={cityInputRef}
                            value={cityInput}
                            onChange={
                                isCityEditable
                                    ? handleCityInputChange
                                    : undefined
                            }
                            readOnly={!isCityEditable}
                            placeholder="Город не указан"
                            autoComplete="off"
                            className="w-full rounded-lg border border-[#d5dbe5] bg-white px-4 py-2 text-sm text-[#1a1a1a] placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                        {isResolvingCity && (
                            <p className="text-xs text-gray-500">
                                Определяем координаты…
                            </p>
                        )}
                        {!isResolvingCity && resolveError && (
                            <p className="text-xs text-red-500">
                                {resolveError}
                            </p>
                        )}
                    </div>

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

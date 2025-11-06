import { useCallback, useEffect, useRef, useState } from 'react';
import type { OrganizationLite } from '../../types';

interface UseLocationProps {
    organization?: OrganizationLite;
    initialRegionId?: number | null;
    initialCityId?: number | null;
}

interface UseLocationReturn {
    regionId: number | null;
    cityId: number | null;
    cityName: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    mapCenter: [number, number];
    mapZoom: number;
    isGeocodingReady: boolean;
    setRegionId: (id: number | null) => void;
    setCityId: (id: number | null) => void;
    setCityName: (name: string) => void;
    setAddress: (address: string) => void;
    setLatitude: (lat: number | null) => void;
    setLongitude: (lng: number | null) => void;
    geocodeAddress: (addressText: string) => Promise<void>;
}

const DEFAULT_CENTER: [number, number] = [55.751244, 37.618423];
const DEFAULT_ZOOM = 12;
const ZOOM_WITH_COORDS = 16;

export function useLocation({
    organization,
    initialRegionId,
    initialCityId,
}: UseLocationProps): UseLocationReturn {
    const [regionId, setRegionId] = useState<number | null>(
        initialRegionId ?? organization?.region?.id ?? null,
    );
    const [cityId, setCityId] = useState<number | null>(
        initialCityId ?? organization?.city?.id ?? null,
    );
    const [cityName, setCityName] = useState<string>('');
    const [address, setAddress] = useState<string>(organization?.address ?? '');
    const [latitude, setLatitude] = useState<number | null>(
        organization?.latitude ?? null,
    );
    const [longitude, setLongitude] = useState<number | null>(
        organization?.longitude ?? null,
    );
    const [isGeocodingReady, setIsGeocodingReady] = useState(false);
    const [cityCoordinates, setCityCoordinates] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    const geocodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Инициализация центра карты и зума
    const [mapCenter, setMapCenter] = useState<[number, number]>(() => {
        if (organization?.latitude && organization?.longitude) {
            return [organization.latitude, organization.longitude];
        }
        return DEFAULT_CENTER;
    });

    const [mapZoom, setMapZoom] = useState<number>(() => {
        return organization?.latitude && organization?.longitude
            ? ZOOM_WITH_COORDS
            : DEFAULT_ZOOM;
    });

    // Загрузка координат города при инициализации, если город уже выбран
    useEffect(() => {
        if (cityId && !cityCoordinates) {
            fetchCityCenter(cityId, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cityId]);

    // Проверка готовности Yandex Maps
    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (window.ymaps) {
            window.ymaps.ready(() => {
                setIsGeocodingReady(true);
            });
        } else {
            const checkYmaps = setInterval(() => {
                if (window.ymaps) {
                    window.ymaps.ready(() => {
                        setIsGeocodingReady(true);
                    });
                    clearInterval(checkYmaps);
                }
            }, 100);

            return () => clearInterval(checkYmaps);
        }
    }, []);

    // Очистка таймаута при размонтировании
    useEffect(() => {
        return () => {
            if (geocodeTimeoutRef.current) {
                clearTimeout(geocodeTimeoutRef.current);
            }
        };
    }, []);

    // Загрузка координат региона
    const fetchRegionCenter = useCallback(
        async (id: number, updateCoordinates: boolean = false) => {
            try {
                const res = await fetch(`/dashboard/api/regions/${id}`);
                if (!res.ok) return;
                const data = await res.json();
                if (data?.latitude && data?.longitude) {
                    const coords: [number, number] = [
                        Number(data.latitude),
                        Number(data.longitude),
                    ];
                    // Всегда обновляем центр карты
                    setMapCenter(coords);
                    setMapZoom(10);
                    // Обновляем координаты только если нужно или их еще нет
                    if (updateCoordinates || !latitude || !longitude) {
                        setLatitude(coords[0]);
                        setLongitude(coords[1]);
                    }
                }
            } catch {
                // ignore
            }
        },
        [latitude, longitude],
    );

    // Загрузка координат города
    const fetchCityCenter = useCallback(
        async (id: number, updateCoordinates: boolean = false) => {
            try {
                const res = await fetch(`/dashboard/api/cities/${id}`);
                if (!res.ok) return;
                const data = await res.json();
                if (data?.latitude && data?.longitude) {
                    const coords: [number, number] = [
                        Number(data.latitude),
                        Number(data.longitude),
                    ];
                    // Сохраняем координаты города для ограничения геокодирования
                    setCityCoordinates({
                        latitude: coords[0],
                        longitude: coords[1],
                    });
                    // Устанавливаем название города
                    if (data?.name) {
                        setCityName(data.name);
                    }
                    // Всегда обновляем центр карты
                    setMapCenter(coords);
                    setMapZoom(12);
                    // Обновляем координаты только если нужно или их еще нет
                    if (updateCoordinates || !latitude || !longitude) {
                        setLatitude(coords[0]);
                        setLongitude(coords[1]);
                    }
                }
            } catch {
                // ignore
            }
        },
        [latitude, longitude],
    );

    // Геокодирование адреса с ограничением по выбранному городу
    const geocodeAddress = useCallback(
        async (addressText: string) => {
            if (!addressText.trim() || !isGeocodingReady || !window.ymaps) {
                return;
            }

            if (geocodeTimeoutRef.current) {
                clearTimeout(geocodeTimeoutRef.current);
            }

            geocodeTimeoutRef.current = setTimeout(async () => {
                try {
                    await window.ymaps.ready();

                    // Если выбран город, добавляем его название к адресу для более точного поиска
                    let searchQuery = addressText.trim();
                    if (cityId && cityName) {
                        // Добавляем название города к адресу для ограничения поиска
                        searchQuery = `${cityName}, ${searchQuery}`;
                    }

                    // Параметры геокодирования
                    const geocodeOptions: any = {
                        results: 1,
                    };

                    // Если есть координаты города, ограничиваем область поиска
                    if (cityCoordinates) {
                        // Используем boundedBy для ограничения области поиска
                        // Создаем область вокруг города (примерно 20 км радиус)
                        const radius = 0.18; // примерно 20 км в градусах
                        geocodeOptions.boundedBy = [
                            [
                                cityCoordinates.latitude - radius,
                                cityCoordinates.longitude - radius,
                            ],
                            [
                                cityCoordinates.latitude + radius,
                                cityCoordinates.longitude + radius,
                            ],
                        ];
                        // Также указываем центр поиска
                        geocodeOptions.ll = [
                            cityCoordinates.latitude,
                            cityCoordinates.longitude,
                        ];
                    }

                    window.ymaps
                        .geocode(searchQuery, geocodeOptions)
                        .then((res: any) => {
                            const firstGeoObject = res.geoObjects.get(0);
                            if (firstGeoObject) {
                                const coords =
                                    firstGeoObject.geometry.getCoordinates() as [
                                        number,
                                        number,
                                    ];
                                if (coords && coords.length === 2) {
                                    // Проверяем, что найденный адрес находится в пределах города
                                    // (примерно в радиусе 30 км от центра города)
                                    let isValidLocation = true;
                                    if (cityCoordinates) {
                                        const distance = calculateDistance(
                                            cityCoordinates.latitude,
                                            cityCoordinates.longitude,
                                            coords[0],
                                            coords[1],
                                        );
                                        // Если расстояние больше 30 км, считаем что адрес вне города
                                        if (distance > 30) {
                                            isValidLocation = false;
                                        }
                                    }

                                    if (isValidLocation) {
                                        setLatitude(coords[0]);
                                        setLongitude(coords[1]);
                                        setMapCenter([coords[0], coords[1]]);
                                        setMapZoom(ZOOM_WITH_COORDS);
                                    } else {
                                        // Адрес найден, но вне города - ставим метку в центре города
                                        if (cityCoordinates) {
                                            setLatitude(
                                                cityCoordinates.latitude,
                                            );
                                            setLongitude(
                                                cityCoordinates.longitude,
                                            );
                                            setMapCenter([
                                                cityCoordinates.latitude,
                                                cityCoordinates.longitude,
                                            ]);
                                            setMapZoom(13); // Зум для города
                                        }
                                    }
                                }
                            } else {
                                // Адрес не найден - ставим метку в центре города (если город выбран)
                                if (cityCoordinates) {
                                    setLatitude(cityCoordinates.latitude);
                                    setLongitude(cityCoordinates.longitude);
                                    setMapCenter([
                                        cityCoordinates.latitude,
                                        cityCoordinates.longitude,
                                    ]);
                                    setMapZoom(13); // Зум для города
                                }
                            }
                        })
                        .catch(() => {
                            // При ошибке ставим метку в центре города (если город выбран)
                            if (cityCoordinates) {
                                setLatitude(cityCoordinates.latitude);
                                setLongitude(cityCoordinates.longitude);
                                setMapCenter([
                                    cityCoordinates.latitude,
                                    cityCoordinates.longitude,
                                ]);
                                setMapZoom(13);
                            }
                        });
                } catch (error) {
                    console.debug('Geocoding error:', error);
                    // При ошибке ставим метку в центре города (если город выбран)
                    if (cityCoordinates) {
                        setLatitude(cityCoordinates.latitude);
                        setLongitude(cityCoordinates.longitude);
                        setMapCenter([
                            cityCoordinates.latitude,
                            cityCoordinates.longitude,
                        ]);
                        setMapZoom(13);
                    }
                }
            }, 300);
        },
        [isGeocodingReady, cityId, cityName, cityCoordinates],
    );

    // Функция для вычисления расстояния между двумя точками (формула гаверсинуса)
    const calculateDistance = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
    ): number => {
        const R = 6371; // Радиус Земли в км
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Обработчики изменения региона и города
    const handleRegionChange = useCallback(
        (id: number | null) => {
            setRegionId(id);
            // При смене региона всегда обновляем карту, но координаты обновляем только если их еще нет
            if (id) {
                fetchRegionCenter(id, !latitude || !longitude);
            }
        },
        [fetchRegionCenter, latitude, longitude],
    );

    const handleCityChange = useCallback(
        (id: number | null) => {
            setCityId(id);
            // При смене города сбрасываем координаты города
            if (!id) {
                setCityCoordinates(null);
            }
            // При смене города всегда обновляем карту, но координаты обновляем только если их еще нет
            if (id) {
                fetchCityCenter(id, !latitude || !longitude);
            }
        },
        [fetchCityCenter, latitude, longitude],
    );

    return {
        regionId,
        cityId,
        cityName,
        address,
        latitude,
        longitude,
        mapCenter,
        mapZoom,
        isGeocodingReady,
        setRegionId: handleRegionChange,
        setCityId: handleCityChange,
        setCityName,
        setAddress,
        setLatitude,
        setLongitude,
        geocodeAddress,
    };
}

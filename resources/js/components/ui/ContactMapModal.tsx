import { YandexMap, type MapMarker } from '@/components/maps/YandexMap';
import { useYandexMap } from '@/hooks/useYandexMap';
import { MapPin, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ContactMapModalProps {
    open: boolean;
    onClose: () => void;
    /** Адрес для геокодирования (обычно card.value) */
    address: string;
    /** Подзаголовок (обычно card.label) */
    label?: string;
}

const DEFAULT_CENTER: [number, number] = [55.751244, 37.618423];

export function ContactMapModal({ open, onClose, address, label }: ContactMapModalProps) {
    const { ymaps, isReady } = useYandexMap();
    const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
    const [zoom, setZoom] = useState(10);
    const [geocoded, setGeocoded] = useState(false);
    const geocodingRef = useRef(false);

    // Геокодируем адрес как только карты готовы и модалка открыта
    useEffect(() => {
        if (!open || !isReady || !ymaps || !address || geocodingRef.current) return;
        geocodingRef.current = true;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ymaps.geocode(address, { results: 1 }).then((result: any) => {
            const obj = result.geoObjects.get(0);
            if (obj) {
                const coords = obj.geometry.getCoordinates() as [number, number];
                setCenter(coords);
                setZoom(16);
            }
            setGeocoded(true);
        }).catch(() => setGeocoded(true));
    }, [open, isReady, ymaps, address]);

    // Сброс при закрытии — чтобы при повторном открытии перегеокодировать
    useEffect(() => {
        if (!open) {
            geocodingRef.current = false;
            setGeocoded(false);
            setCenter(DEFAULT_CENTER);
            setZoom(10);
        }
    }, [open]);

    const markers = useMemo<MapMarker[]>(
        () => (geocoded ? [{ id: 'contact-map', position: center, hint: address }] : []),
        [geocoded, center, address],
    );

    // Закрытие по Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Карточка модалки */}
            <div
                className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[32px] bg-white shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-label={address}
            >
                {/* Шапка */}
                <div className="flex items-center gap-3 p-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f6f8]">
                        <MapPin className="h-4 w-4 text-[#96bdff]" />
                    </div>
                    <div className="min-w-0 flex-1">
                        {label && (
                            <p className="mb-0.5 text-xs font-bold leading-tight text-[#96bdff]">
                                {label}
                            </p>
                        )}
                        <p className="truncate text-sm font-semibold leading-tight text-[#1a1a1a]">
                            {address}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f5f6f8] text-[#b5b9c3] transition-colors hover:text-[#1a1a1a]"
                        aria-label="Закрыть"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Карта */}
                <div className="h-[380px] w-full">
                    {isReady ? (
                        <YandexMap
                            center={center}
                            zoom={zoom}
                            markers={markers}
                            height="100%"
                            customIconUrl="/icons/map-blue-marker.svg"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-[#f5f6f8]">
                            <span className="text-sm text-[#b5b9c3]">Загрузка карты…</span>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body,
    );
}

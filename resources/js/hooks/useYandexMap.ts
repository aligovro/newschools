import { fetchMapsConfig } from '@/lib/api/public';
import { useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        ymaps?: any;
    }
}

export interface UseYandexMapResult {
    ymaps: any | null;
    isReady: boolean;
    apiKey: string | null;
    loadError: string | null;
}

export function useYandexMap(): UseYandexMapResult {
    const [ymapsInstance, setYmapsInstance] = useState<any | null>(null);
    const [ready, setReady] = useState(false);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const loadingRef = useRef(false);

    useEffect(() => {
        let cancelled = false;
        if (loadingRef.current) return;
        loadingRef.current = true;

        (async () => {
            try {
                const cfg = await fetchMapsConfig();
                const key = cfg.yandexMapApiKey || '';
                setApiKey(key || null);

                if (window.ymaps) {
                    setYmapsInstance(window.ymaps);
                    window.ymaps.ready(() => !cancelled && setReady(true));
                    return;
                }

                const script = document.createElement('script');
                const lang = 'ru_RU';
                const srcBase = 'https://api-maps.yandex.ru/2.1/';
                const apiPart = key
                    ? `?apikey=${encodeURIComponent(key)}&lang=${lang}`
                    : `?lang=${lang}`;
                script.src = srcBase + apiPart;
                script.async = true;
                script.onload = () => {
                    if (window.ymaps) {
                        setYmapsInstance(window.ymaps);
                        window.ymaps.ready(() => !cancelled && setReady(true));
                    } else {
                        setError('Yandex Maps failed to initialize');
                    }
                };
                script.onerror = () =>
                    setError('Failed to load Yandex Maps script');
                document.head.appendChild(script);
            } catch (e: any) {
                setError(e?.message || 'Failed to load maps config');
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    return { ymaps: ymapsInstance, isReady: ready, apiKey, loadError: error };
}

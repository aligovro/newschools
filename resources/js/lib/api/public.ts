export interface MapsConfig {
    yandexMapApiKey?: string | null;
    yandexSuggestApiKey?: string | null;
    defaultCityId?: number | null;
    defaultCityFallback?: string | null;
}

export async function fetchMapsConfig(): Promise<MapsConfig> {
    const res = await fetch('/api/public/maps-config');
    if (!res.ok) throw new Error('Failed to load maps config');
    return res.json();
}

// Cached loader to avoid duplicate requests
let mapsConfigCache: MapsConfig | null = null;
let mapsConfigPromise: Promise<MapsConfig> | null = null;
export function getMapsConfigCached(): Promise<MapsConfig> {
    if (mapsConfigCache) return Promise.resolve(mapsConfigCache);
    if (mapsConfigPromise) return mapsConfigPromise;
    mapsConfigPromise = fetchMapsConfig()
        .then((cfg: MapsConfig) => {
            mapsConfigCache = cfg;
            return cfg;
        })
        .finally(() => {
            mapsConfigPromise = null;
        });
    return mapsConfigPromise;
}

export async function resolveCityByName(name: string) {
    const url = new URL('/api/public/cities/resolve', window.location.origin);
    url.searchParams.set('name', name);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to resolve city');
    return res.json();
}

export async function fetchPublicOrganizations(
    params: Record<string, string | number | undefined>,
) {
    const url = new URL('/api/public/organizations', window.location.origin);
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '')
            url.searchParams.set(k, String(v));
    });
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to load organizations');
    return res.json();
}

export async function fetchPublicCities(params?: {
    search?: string;
    limit?: number;
}): Promise<Array<{ id: number; name: string; region?: { name: string } }>> {
    const url = new URL('/api/public/cities', window.location.origin);
    if (params?.search) {
        url.searchParams.set('search', params.search);
    }
    if (params?.limit) {
        url.searchParams.set('limit', String(params.limit));
    }
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to load cities');
    return res.json();
}

export async function detectCityByGeolocation(): Promise<{
    id: number;
    name: string;
    region?: { name: string };
} | null> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const url = new URL(
                        '/api/public/cities/detect',
                        window.location.origin,
                    );
                    url.searchParams.set(
                        'latitude',
                        String(position.coords.latitude),
                    );
                    url.searchParams.set(
                        'longitude',
                        String(position.coords.longitude),
                    );
                    const res = await fetch(url.toString());
                    if (res.ok) {
                        const city = await res.json();
                        resolve(city);
                    } else {
                        resolve(null);
                    }
                } catch (error) {
                    console.error('Ошибка определения города:', error);
                    resolve(null);
                }
            },
            () => {
                resolve(null);
            },
            { timeout: 5000 },
        );
    });
}

export async function fetchRegionById(id: number) {
    const res = await fetch(`/dashboard/api/regions/${id}`);
    if (!res.ok) throw new Error('Failed to load region');
    return await res.json();
}

export async function fetchCityById(id: number) {
    const res = await fetch(`/dashboard/api/cities/${id}`);
    if (!res.ok) throw new Error('Failed to load city');
    return await res.json();
}

export async function fetchMapsConfig() {
    const res = await fetch('/api/public/maps-config');
    if (!res.ok) throw new Error('Failed to load maps config');
    return res.json();
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

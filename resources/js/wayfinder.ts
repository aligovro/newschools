export type RouteQueryOptions = {
    query?: Record<string, any>;
    mergeQuery?: Record<string, any>;
};

export type RouteDefinition<T extends string> = {
    url: string;
    method: T;
};

export type RouteFormDefinition<T extends string> = {
    action: string;
    method: T;
};

export function queryParams(options?: RouteQueryOptions): string {
    if (!options?.query && !options?.mergeQuery) {
        return '';
    }

    const params = new URLSearchParams();
    const query = options.query || options.mergeQuery || {};

    Object.entries(query).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            params.append(key, String(value));
        }
    });

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
}

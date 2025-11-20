import type { SelectOption } from '@/components/ui/universal-select/UniversalSelect';

export interface SlugValidation {
    isUnique: boolean;
    suggestedSlug?: string;
    isValid: boolean;
}

export interface CascadeSelectData {
    regions: {
        options: SelectOption[];
        loading: boolean;
        hasMore: boolean;
        loadingMore: boolean;
        search: string;
        setSearch: (query: string) => void;
        loadMore: () => void;
        refresh: () => void;
    };
    localities: {
        options: SelectOption[];
        loading: boolean;
        hasMore: boolean;
        loadingMore: boolean;
        search: string;
        setSearch: (query: string) => void;
        loadMore: () => void;
        refresh: () => void;
        setExtraParams: (params: Record<string, unknown>) => void;
    };
    handleRegionChange: (id: number) => void;
    handleCityChange: (id: number) => void;
}

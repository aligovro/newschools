export type RegionType =
    | 'region'
    | 'republic'
    | 'krai'
    | 'oblast'
    | 'autonomous_okrug'
    | 'autonomous_oblast'
    | 'federal_city';

export interface FederalDistrict {
    id: number;
    name: string;
    code?: string;
}

export interface Region {
    id: number;
    federal_district_id: number;
    federal_district?: FederalDistrict;
    name: string;
    slug: string;
    code: string;
    capital: string;
    latitude?: number | null;
    longitude?: number | null;
    population?: number | null;
    timezone: string;
    type: RegionType;
    is_active: boolean;
    flag_image?: string | null;
    flag_image_url?: string | null;
    localities_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface RegionFilters {
    search?: string;
    federal_district_id?: number | string;
    is_active?: boolean | string;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
}

export interface CreateRegionForm {
    federal_district_id: number | '';
    name: string;
    code: string;
    capital: string;
    latitude?: number;
    longitude?: number;
    population?: number;
    timezone: string;
    type: RegionType;
    flag_image?: string | null;
    is_active: boolean;
}

export type UpdateRegionForm = Partial<CreateRegionForm>;

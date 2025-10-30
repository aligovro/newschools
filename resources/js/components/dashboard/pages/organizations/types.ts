export type Status = 'active' | 'inactive' | 'pending';

export interface Region {
    id: number;
    name: string;
    code: string;
}

export interface City {
    id: number;
    name: string;
    region_id: number;
}

export interface Settlement {
    id: number;
    name: string;
    city_id: number;
}

export interface OrganizationLite {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    type: string;
    status: Status;
    is_public: boolean;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    website?: string | null;
    logo?: string | null;
    images?: string[] | null;
    latitude?: number | null;
    longitude?: number | null;
    region?: Region | null;
    city?: City | null;
    settlement?: Settlement | null;
    admin_user_id?: number | null;
}

export interface ReferenceData {
    organizationTypes: Array<{
        value: string;
        label: string;
        description: string;
    }>;
    regions?: Region[];
    cities?: City[];
    settlements?: Settlement[];
}

export interface OrganizationFormProps {
    mode: 'create' | 'edit';
    organization?: OrganizationLite;
    referenceData: ReferenceData;
    organizationSettings?: { payment_settings?: unknown };
}



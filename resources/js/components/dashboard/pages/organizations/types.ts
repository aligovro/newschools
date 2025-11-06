export type Status = 'active' | 'inactive' | 'pending';
export type OrganizationStatus = 'active' | 'inactive' | 'pending';
export type OrganizationType = 'school' | 'university' | 'kindergarten' | 'other';

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
}

export interface OrganizationDirector {
    id: number;
    full_name?: string;
    last_name?: string;
    first_name?: string;
    middle_name?: string;
    position?: string;
    photo?: string;
    email?: string;
    address?: string;
}

export interface OrganizationStaffMember {
    id: number;
    full_name: string;
    position: string;
    photo?: string;
    email?: string;
    address?: string;
}

export interface OrganizationShow {
    id: number;
    name: string;
    slug: string;
    description?: string;
    type: OrganizationType;
    status: OrganizationStatus;
    is_public: boolean;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    logo?: string;
    created_at: string;
    updated_at: string;
    region?: {
        name: string;
    };
    city?: {
        name: string;
    };
    settlement?: {
        name: string;
    };
    members_count?: number;
    donations_count?: number;
    donations_total?: number | null;
    donations_sum?: number | null;
    director?: OrganizationDirector;
    staff?: OrganizationStaffMember[];
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

export interface StaffFormData {
    last_name: string;
    first_name: string;
    middle_name: string;
    position: string;
    is_director: boolean;
    email: string;
    address: string;
    photo: File | string | null;
}

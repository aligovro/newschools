export type Status = 'active' | 'inactive' | 'pending';
export type OrganizationStatus = 'active' | 'inactive' | 'pending';
export type OrganizationType =
    | 'school'
    | 'university'
    | 'kindergarten'
    | 'other';

export interface Region {
    id: number;
    name: string;
    code: string;
}

export interface Locality {
    id: number;
    name: string;
    region_id: number;
}

import type { MoneyAmount } from '@/types/money';

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
    locality?: Locality | null;
    needs?: {
        target: MoneyAmount;
        collected: MoneyAmount;
        progress_percentage: number;
    } | null;
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
    locality?: {
        name: string;
    };
    members_count?: number;
    donations_count?: number;
    donations_total?: number | null;
    donations_sum?: number | null;
    needs?: {
        target: MoneyAmount;
        collected: MoneyAmount;
        progress_percentage: number;
    } | null;
    director?: OrganizationDirector;
    staff?: OrganizationStaffMember[];
    primary_site?: {
        id: number;
    } | null;
    sites?: Array<{
        id: number;
    }>;
}

export interface ReferenceData {
    organizationTypes: Array<{
        value: string;
        label: string;
        description: string;
    }>;
    regions?: Region[];
    localities?: Locality[];
}

import type { PaymentGatewaysSettingsValue } from '@/components/dashboard/payments/PaymentGatewaysSettings';

export interface OrganizationFormProps {
    mode: 'create' | 'edit';
    organization?: OrganizationLite;
    referenceData: ReferenceData;
    organizationSettings?: { payment_settings?: unknown };
    defaultPaymentSettings?: PaymentGatewaysSettingsValue;
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

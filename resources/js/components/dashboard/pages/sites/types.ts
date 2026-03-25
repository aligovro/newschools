// Shared types for SitePageForm and its section sub-components

export type PageStatus = 'draft' | 'published' | 'private';
export type ImagePosition = 'left' | 'right';
export type ActionVariant = 'primary' | 'outline';
export type SocialKey = 'vk' | 'telegram' | 'whatsapp' | 'max' | 'youtube';

export interface Site {
    id: number;
    name: string;
    slug: string;
    template?: string;
}

export interface ParentPage {
    id: number;
    title: string;
    slug: string;
}

export interface Page {
    id: number;
    title: string;
    /** Показывать h1 на публичной странице (по умолчанию true) */
    show_title?: boolean;
    slug: string;
    excerpt?: string;
    content?: string;
    status: string;
    template?: string;
    is_homepage: boolean;
    is_public: boolean;
    show_in_navigation: boolean;
    parent_id?: number;
    sort_order: number;
    image?: string;
    images?: string[];
    published_at?: string;
    created_at: string;
    updated_at: string;
    layout_config?: Record<string, unknown>;
}

export interface SitePageFormData {
    title: string;
    show_title: boolean;
    slug: string;
    excerpt?: string;
    content?: string;
    status: PageStatus;
    template?: string;
    is_homepage: boolean;
    is_public: boolean;
    show_in_navigation: boolean;
    parent_id?: number | null;
    sort_order: number;
    image?: string;
    images?: string[];
    published_at?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    layout_config?: Record<string, any>;
}

export interface SitePageFormProps {
    mode: 'create' | 'edit';
    site: Site;
    page?: Page;
    parentPages: ParentPage[];
}

// ── About ─────────────────────────────────────────────────────────────────────

export interface AboutMission {
    title: string;
    body: string;
    image: string;
    imagePosition: ImagePosition;
}

export interface AboutValue {
    title?: string;
    body?: string;
}

// ── Thanks ────────────────────────────────────────────────────────────────────

export interface ThanksLayout {
    collected_amount: string;
    profile_link_text: string;
    profile_url: string;
    cta_text: string;
    cta_url: string;
    requisites_url: string;
}

// ── Contacts ──────────────────────────────────────────────────────────────────

export interface ContactCard {
    label?: string;
    value?: string;
    hours?: string;
    email?: string;
    action_text?: string;
    action_url?: string;
    action_variant?: ActionVariant;
    map_enabled?: boolean;
    socials?: Partial<Record<SocialKey, { enabled?: boolean; url?: string }>>;
}

export interface ContactDoc {
    name?: string;
    url?: string;
    meta?: string;
}

export interface ContactsLayout {
    cards: ContactCard[];
    documents: ContactDoc[];
    docs_title: string;
}

import { usePage } from '@inertiajs/react';
import type { OrganizationType } from './types';

export const getTypeLabel = (type: OrganizationType | string): string => {
    const typeLabels: Record<string, string> = {
        school: 'Школа',
        university: 'Университет',
        kindergarten: 'Детский сад',
        other: 'Другое',
    };
    return typeLabels[type] || type;
};

type OrganizationTerminology = {
    singular_nominative?: string;
    singular_genitive?: string;
    singular_prepositional?: string;
    plural_nominative?: string;
    plural_genitive?: string;
};

const lowerFirst = (value?: string, fallback?: string): string => {
    const source = (value && value.trim().length > 0 ? value : null) ?? fallback ?? '';
    if (!source) {
        return '';
    }
    return source.charAt(0).toLowerCase() + source.slice(1);
};

const normalize = (
    raw: OrganizationTerminology | undefined,
): {
    singularNominative: string;
    singularGenitive: string;
    singularPrepositional: string;
    pluralNominative: string;
    pluralGenitive: string;
} => {
    return {
        singularNominative: raw?.singular_nominative?.length
            ? raw.singular_nominative
            : 'Организация',
        singularGenitive: lowerFirst(raw?.singular_genitive, 'организации'),
        singularPrepositional: lowerFirst(
            raw?.singular_prepositional,
            'организации',
        ),
        pluralNominative: raw?.plural_nominative?.length
            ? raw.plural_nominative
            : 'Организации',
        pluralGenitive: lowerFirst(raw?.plural_genitive, 'организаций'),
    };
};

export const useOrganizationTerms = () => {
    const page = usePage();
    const rawTerms = ((page.props as any)?.terminology?.organization ??
        {}) as OrganizationTerminology;
    return normalize(rawTerms);
};

export const buildAboutPhrase = (word: string): string => {
    if (!word) {
        return '';
    }
    const trimmed = word.trim();
    const preposition = /^[аеёиоуыэюя]/i.test(trimmed) ? 'об' : 'о';
    return `${preposition} ${trimmed}`;
};

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

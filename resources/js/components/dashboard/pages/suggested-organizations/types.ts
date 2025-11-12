import type {
    SuggestedOrganization as SuggestedOrganizationDto,
    SuggestedOrganizationFilters,
    SuggestedOrganizationStatus,
} from '@/lib/api/suggested-organizations';

import type { PaginationMeta } from './hooks/useSuggestedOrganizations';

export type SuggestedOrganization = SuggestedOrganizationDto;
export type SuggestedOrganizationsFiltersState = SuggestedOrganizationFilters;
export type SuggestedOrganizationsStatus = SuggestedOrganizationStatus;
export type SuggestedOrganizationsMeta = PaginationMeta;



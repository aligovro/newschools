import SponsorsSection, {
    type Pagination,
    type SortOption,
    type Sponsor,
    type SponsorsPayload,
} from '@/components/sponsors/SponsorsSection';

interface ProjectSponsorsSectionProps {
    projectSlug: string;
    initialData: Sponsor[];
    initialPagination: Pagination;
    initialSort?: SortOption;
}

const SECTION_TITLE = 'Спонсоры проекта';
const EMPTY_STATE_MESSAGE =
    'Спонсоры проекта ещё не отображаются. Станьте первым, кто поддержит проект.';

export default function ProjectSponsorsSection({
    projectSlug,
    initialData,
    initialPagination,
    initialSort = 'top',
}: ProjectSponsorsSectionProps) {
    // Если у проекта нет ни одного спонсора, не показываем секцию вовсе
    const hasSponsors =
        Array.isArray(initialData) &&
        initialData.length > 0 &&
        (initialPagination?.total ?? initialData.length) > 0;

    if (!hasSponsors) {
        return null;
    }

    return (
        <SponsorsSection
            title={SECTION_TITLE}
            fetchEndpoint={`/project/${projectSlug}/sponsors`}
            initialData={initialData}
            initialPagination={initialPagination}
            initialSort={initialSort}
            emptyStateMessage={EMPTY_STATE_MESSAGE}
        />
    );
}

export type { Pagination, SortOption, Sponsor, SponsorsPayload };

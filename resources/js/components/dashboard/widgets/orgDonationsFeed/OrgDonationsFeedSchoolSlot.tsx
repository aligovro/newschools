import React from 'react';
import { OrgDonationsFeedSchoolWidget } from './OrgDonationsFeedSchoolWidget';
import { useOrgDonationsFeed } from './useOrgDonationsFeed';

interface Props {
    slug: string;
    isProject: boolean;
    perPage: number;
    title: string;
}

export const OrgDonationsFeedSchoolSlot: React.FC<Props> = ({
    slug,
    isProject,
    perPage,
    title,
}) => {
    const {
        items,
        loading,
        loadingMore,
        error,
        hasMore,
        loadMore,
    } = useOrgDonationsFeed(slug, isProject, perPage);

    return (
        <OrgDonationsFeedSchoolWidget
            items={items}
            loading={loading}
            loadingMore={loadingMore}
            error={error}
            hasMore={hasMore}
            onLoadMore={loadMore}
            title={title}
        />
    );
};

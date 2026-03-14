import { Heart } from 'lucide-react';
import React from 'react';
import type { DonationFeedItem } from './useOrgDonationsFeed';

interface Props {
    item: DonationFeedItem;
}

export const OrgDonationsFeedSchoolRow: React.FC<Props> = ({ item }) => {
    return (
        <div className="org-donations-feed-school__row">
            <div className="org-donations-feed-school__cell org-donations-feed-school__cell--donor">
                <span className="org-donations-feed-school__donor-icon" aria-hidden>
                    <Heart size={14} fill="currentColor" stroke="currentColor" />
                </span>
                <span className="org-donations-feed-school__donor-name">
                    {item.donor_name}
                </span>
            </div>
            <div className="org-donations-feed-school__cell org-donations-feed-school__cell--purpose">
                {item.project_title || '—'}
            </div>
            <div className="org-donations-feed-school__cell org-donations-feed-school__cell--datetime">
                {item.datetime_formatted || `${item.date_label || ''} ${item.paid_at || ''}`.trim() || '—'}
            </div>
            <div className="org-donations-feed-school__cell org-donations-feed-school__cell--amount">
                {item.amount_formatted}
            </div>
            <div className="org-donations-feed-school__cell org-donations-feed-school__cell--method">
                {item.payment_method_label && item.payment_method_label !== '—'
                    ? item.payment_method_label
                    : null}
            </div>
        </div>
    );
};

import { SchoolCtaPill } from '@/components/site/school/SchoolCtaPill';
import React from 'react';
import type { DonationFeedItem } from './useOrgDonationsFeed';
import { OrgDonationsFeedSchoolRow } from './OrgDonationsFeedSchoolRow';

interface Props {
    items: DonationFeedItem[];
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    onLoadMore: () => void;
    title: string;
}

export const OrgDonationsFeedSchoolWidget: React.FC<Props> = ({
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    onLoadMore,
    title,
}) => {
    return (
        <section className="org-donations-feed-school wrapper__block">
            <div className="org-donations-feed-school__container">
                <h2 className="org-donations-feed-school__title">{title}</h2>

                {error && (
                    <p className="org-donations-feed-school__error">{error}</p>
                )}

                {loading && items.length === 0 && (
                    <div className="org-donations-feed-school__placeholder">
                        <span>Загрузка…</span>
                    </div>
                )}

                {!loading && !error && items.length === 0 && (
                    <div className="org-donations-feed-school__placeholder">
                        <span>Пока нет поступлений</span>
                    </div>
                )}

                {!loading && !error && items.length > 0 && (
                    <>
                        <div className="org-donations-feed-school__table">
                            <div className="org-donations-feed-school__header">
                                <div className="org-donations-feed-school__cell org-donations-feed-school__cell--donor">
                                    Донор
                                </div>
                                <div className="org-donations-feed-school__cell org-donations-feed-school__cell--purpose">
                                    Назначение
                                </div>
                                <div className="org-donations-feed-school__cell org-donations-feed-school__cell--datetime">
                                    Дата и время
                                </div>
                                <div className="org-donations-feed-school__cell org-donations-feed-school__cell--amount">
                                    Сумма
                                </div>
                                <div className="org-donations-feed-school__cell org-donations-feed-school__cell--method" />
                            </div>
                            <div className="org-donations-feed-school__body">
                                {items.map((item) => (
                                    <OrgDonationsFeedSchoolRow
                                        key={item.id}
                                        item={item}
                                    />
                                ))}
                            </div>
                        </div>

                        {hasMore && (
                            <SchoolCtaPill
                                className="org-donations-feed-school__load-more"
                                type="button"
                                onClick={onLoadMore}
                                disabled={loadingMore}
                            >
                                {loadingMore ? 'Загрузка…' : 'Загрузить больше'}
                            </SchoolCtaPill>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};

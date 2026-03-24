import axios from 'axios';
import React, { useCallback, useState } from 'react';

interface ReferralEntry {
    position: number;
    referrer_user_id: number;
    name: string;
    days_in_system: number;
    invites_count: number;
    total_amount: number;
    formatted_total_amount: string;
}

interface LeaderboardMeta {
    page: number;
    per_page: number;
    total: number;
    has_more: boolean;
}

interface Props {
    organizationId: number;
    initialData: ReferralEntry[];
    initialMeta: LeaderboardMeta;
}

const AvatarPlaceholder: React.FC = () => (
    <div className="referral-leaderboard__avatar" aria-hidden="true">
        <img
            src="/icons/school-template/user.svg"
            alt=""
            width={24}
            height={24}
        />
    </div>
);

const EntryRow: React.FC<{ entry: ReferralEntry }> = React.memo(({ entry }) => {
    const days = Math.max(0, Math.round(entry.days_in_system));

    return (
        <div className="referral-leaderboard__row">
            {/* ── 1. Персона ── */}
            <div className="referral-leaderboard__person">
                <AvatarPlaceholder />
                <div className="referral-leaderboard__person-info">
                    <span className="referral-leaderboard__days">
                        {days} дней в благом
                    </span>
                    <span className="referral-leaderboard__name">
                        {entry.name}
                    </span>
                </div>
            </div>

            {/* ── 2. Приглашения ── */}
            <div className="referral-leaderboard__invites">
                <div className="referral-leaderboard__col-icon referral-leaderboard__col-icon--accent">
                    <img
                        src="/icons/school-template/profile-2user-second.svg"
                        alt=""
                        width={24}
                        height={24}
                    />
                </div>
                <div>
                    <span className="referral-leaderboard__label">
                        Пригласил(а)
                    </span>
                    <span className="referral-leaderboard__invites-count">
                        +{entry.invites_count} доноров
                    </span>
                </div>
            </div>

            {/* ── 3. Сумма ── */}
            <div className="referral-leaderboard__amount">
                <div className="referral-leaderboard__col-icon">
                    <img
                        src="/icons/school-template/heart-straight.svg"
                        alt=""
                        width={24}
                        height={24}
                    />
                </div>
                <div>
                    <span className="referral-leaderboard__label">
                        Сумма по приглашениям
                    </span>
                    <span className="referral-leaderboard__amount-value">
                        +{entry.formatted_total_amount}
                    </span>
                </div>
            </div>
        </div>
    );
});

EntryRow.displayName = 'EntryRow';

const ProjectReferralLeaderboard: React.FC<Props> = ({
    organizationId,
    initialData,
    initialMeta,
}) => {
    const [entries, setEntries] = useState<ReferralEntry[]>(initialData);
    const [meta, setMeta] = useState<LeaderboardMeta>(initialMeta);
    const [loading, setLoading] = useState(false);

    const loadMore = useCallback(async () => {
        if (loading || !meta.has_more) return;
        setLoading(true);
        try {
            const res = await axios.get<{
                data: ReferralEntry[];
                meta: LeaderboardMeta;
            }>(`/api/referral/${organizationId}/leaderboard`, {
                params: {
                    page: meta.page + 1,
                    per_page: meta.per_page,
                    sort_by: 'invites',
                },
            });
            setEntries((prev) => [...prev, ...res.data.data]);
            setMeta(res.data.meta);
        } finally {
            setLoading(false);
        }
    }, [organizationId, meta, loading]);

    if (entries.length === 0) return null;

    return (
        <section className="referral-leaderboard">
            <h2 className="referral-leaderboard__heading">
                Рейтинг по приглашениям
            </h2>

            <div className="referral-leaderboard__list">
                {entries.map((entry) => (
                    <EntryRow key={entry.referrer_user_id} entry={entry} />
                ))}
            </div>

            {meta.has_more && (
                <button
                    type="button"
                    className="referral-leaderboard__load-more"
                    onClick={loadMore}
                    disabled={loading}
                >
                    {loading ? 'Загрузка...' : 'Загрузить больше'}
                </button>
            )}
        </section>
    );
};

export default ProjectReferralLeaderboard;

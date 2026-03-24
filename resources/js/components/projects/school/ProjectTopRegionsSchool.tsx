import axios from 'axios';
import React, { useCallback, useState } from 'react';

export interface RegionEntry {
    id: number;
    name: string;
    code: string | null;
    flag_image_url?: string | null;
    donation_count: number;
    total_amount: number;
    formatted_amount: string;
}

interface Props {
    projectId: number;
    initialData: RegionEntry[];
    initialHasMore: boolean;
    initialPage?: number;
    perPage?: number;
}

const RegionCell: React.FC<{ entry: RegionEntry }> = React.memo(({ entry }) => (
    <div className="project-top-regions__cell">
        <div className="project-top-regions__avatar" aria-hidden="true">
            {entry.flag_image_url ? (
                <img
                    src={entry.flag_image_url}
                    alt=""
                    width={36}
                    height={36}
                    className="project-top-regions__flag"
                />
            ) : (
                <img
                    src="/icons/school-template/map-grey.svg"
                    alt=""
                    width={36}
                    height={36}
                />
            )}
        </div>
        <div className="project-top-regions__info">
            <span className="project-top-regions__count">
                {entry.donation_count} платежей
            </span>
            <span className="project-top-regions__name">{entry.name}</span>
        </div>
        <div className="project-top-regions__amount-wrap">
            <span className="project-top-regions__label">собрали</span>
            <span className="project-top-regions__amount">
                {entry.formatted_amount}
            </span>
        </div>
    </div>
));

RegionCell.displayName = 'RegionCell';

function chunkPairs<T>(arr: T[]): [T, T | null][] {
    const pairs: [T, T | null][] = [];
    for (let i = 0; i < arr.length; i += 2) {
        pairs.push([arr[i], arr[i + 1] ?? null]);
    }
    return pairs;
}

const ProjectTopRegionsSchool: React.FC<Props> = ({
    projectId,
    initialData,
    initialHasMore,
    initialPage = 1,
    perPage = 6,
}) => {
    const [entries, setEntries] = useState<RegionEntry[]>(initialData);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [page, setPage] = useState(initialPage);
    const [loading, setLoading] = useState(false);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const next = page + 1;
            const res = await axios.get<{
                data: RegionEntry[];
                has_more: boolean;
            }>(`/api/public/projects/${projectId}/top-regions`, {
                params: { page: next, per_page: perPage },
            });
            setEntries((prev) => [...prev, ...res.data.data]);
            setHasMore(res.data.has_more);
            setPage(next);
        } finally {
            setLoading(false);
        }
    }, [projectId, page, perPage, hasMore, loading]);

    if (entries.length === 0) return null;

    const rows = chunkPairs(entries);

    return (
        <section className="project-top-regions">
            <h2 className="project-top-regions__heading">
                Топ регионов поддержки
            </h2>

            <div className="project-top-regions__list">
                {rows.map(([left, right], idx) => (
                    <div key={idx} className="project-top-regions__row">
                        <RegionCell entry={left} />
                        {right ? (
                            <RegionCell entry={right} />
                        ) : (
                            <div className="project-top-regions__cell project-top-regions__cell--empty" />
                        )}
                    </div>
                ))}
            </div>

            {hasMore && (
                <button
                    type="button"
                    className="project-top-regions__load-more"
                    onClick={loadMore}
                    disabled={loading}
                >
                    {loading ? 'Загрузка...' : 'Загрузить больше'}
                </button>
            )}
        </section>
    );
};

export default ProjectTopRegionsSchool;

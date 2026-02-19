import { useCallback, useEffect, useState } from 'react';

const PERIODS = [
    { key: 'week', label: 'За неделю' },
    { key: 'month', label: 'За месяц' },
    { key: 'all', label: 'За всё время' },
] as const;

type PeriodKey = (typeof PERIODS)[number]['key'];

interface TopDonorRow {
    donor_label: string;
    total_amount: number;
    total_amount_formatted: string;
    donations_count: number;
}

interface DonationRow {
    id: number;
    donor_name: string;
    amount: number;
    amount_formatted: string;
    payment_method: string;
    payment_method_label: string;
    paid_at: string;
    date_label?: string;
    created_at: string;
}

interface ProjectDonationsSectionProps {
    projectSlug: string;
}

export default function ProjectDonationsSection({
    projectSlug,
}: ProjectDonationsSectionProps) {
    const [activeTab, setActiveTab] = useState<
        'top' | 'top-recurring' | 'all'
    >('top');
    const [period, setPeriod] = useState<PeriodKey>('all');
    const [topData, setTopData] = useState<TopDonorRow[]>([]);
    const [topRecurringData, setTopRecurringData] = useState<TopDonorRow[]>(
        [],
    );
    const [allData, setAllData] = useState<DonationRow[]>([]);
    const [allPagination, setAllPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
    });
    const [loading, setLoading] = useState(false);
    const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set());

    const baseUrl = `/project/${projectSlug}/donations`;

    const fetchTop = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${baseUrl}/top?period=${period}&limit=20`,
            );
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                setTopData(json.data);
            }
        } finally {
            setLoading(false);
        }
    }, [baseUrl, period]);

    const fetchTopRecurring = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${baseUrl}/top-recurring?period=${period}&limit=20`,
            );
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                setTopRecurringData(json.data);
            }
        } finally {
            setLoading(false);
        }
    }, [baseUrl, period]);

    const fetchAll = useCallback(
        async (page = 1) => {
            setLoading(true);
            try {
                const res = await fetch(
                    `${baseUrl}?page=${page}&per_page=20`,
                );
                const json = await res.json();
                if (json.success && Array.isArray(json.data)) {
                    setAllData(json.data);
                    setAllPagination(json.pagination ?? allPagination);
                }
            } finally {
                setLoading(false);
            }
        },
        [baseUrl],
    );

    useEffect(() => {
        if (activeTab === 'top') {
            void fetchTop();
        } else if (activeTab === 'top-recurring') {
            void fetchTopRecurring();
        } else if (activeTab === 'all' && !loadedTabs.has('all')) {
            void fetchAll(1);
            setLoadedTabs((prev) => new Set(prev).add('all'));
        }
    }, [activeTab, period, fetchTop, fetchTopRecurring, fetchAll, loadedTabs]);

    useEffect(() => {
        if (activeTab === 'top') {
            void fetchTop();
        } else if (activeTab === 'top-recurring') {
            void fetchTopRecurring();
        }
    }, [period, activeTab, fetchTop, fetchTopRecurring]);

    const handleLoadMoreAll = () => {
        const next = allPagination.current_page + 1;
        if (next <= allPagination.last_page) {
            setLoading(true);
            fetch(`${baseUrl}?page=${next}&per_page=20`)
                .then((r) => r.json())
                .then((json) => {
                    if (json.success && Array.isArray(json.data)) {
                        setAllData((prev) => [...prev, ...json.data]);
                        setAllPagination(json.pagination ?? allPagination);
                    }
                })
                .finally(() => setLoading(false));
        }
    };

    const renderTopList = (rows: TopDonorRow[]) => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {rows.map((row, i) => (
                <div
                    key={`${row.donor_label}-${i}`}
                    className="project-donations-section__card flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4"
                >
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500">
                            {row.donations_count}{' '}
                            {row.donations_count === 1
                                ? 'платеж'
                                : row.donations_count < 5
                                  ? 'платежа'
                                  : 'платежей'}
                        </span>
                        <span className="font-semibold text-gray-900">
                            {row.donor_label}
                        </span>
                    </div>
                    <div className="rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 px-3 py-1.5 text-sm font-semibold text-white">
                        {row.total_amount_formatted}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderAllList = () => (
        <div className="space-y-2">
            {allData.map((d) => (
                <div
                    key={d.id}
                    className="project-donations-section__row flex items-center justify-between gap-4 rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3"
                >
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                            {d.donor_name}
                        </span>
                        <span className="text-xs text-gray-500">
                            {d.date_label ? `${d.date_label} ` : ''}
                            {d.paid_at} · {d.payment_method_label}
                        </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                        {d.amount_formatted}
                    </span>
                </div>
            ))}
        </div>
    );

    return (
        <section className="project-donations-section mt-12 space-y-6">
            <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-gray-900">
                    Поддержка проекта
                </h2>

                <div className="flex flex-wrap gap-2">
                    {(['top', 'top-recurring', 'all'] as const).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                activeTab === tab
                                    ? 'bg-indigo-600 text-white'
                                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {tab === 'top'
                                ? 'Топ поддержавших выпусков'
                                : tab === 'top-recurring'
                                  ? 'Топ регулярно-поддерживающих'
                                  : 'Все поступления'}
                        </button>
                    ))}
                </div>

                {(activeTab === 'top' || activeTab === 'top-recurring') && (
                    <div className="flex flex-wrap gap-2">
                        {PERIODS.map((p) => (
                            <button
                                key={p.key}
                                type="button"
                                onClick={() => setPeriod(p.key)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                    period === p.key
                                        ? 'bg-indigo-600 text-white'
                                        : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {loading && (
                <div className="py-8 text-center text-sm text-gray-500">
                    Загрузка…
                </div>
            )}

            {!loading && activeTab === 'top' && renderTopList(topData)}
            {!loading &&
                activeTab === 'top-recurring' &&
                (topRecurringData.length > 0 ? (
                    renderTopList(topRecurringData)
                ) : (
                    <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-8 text-center text-sm text-gray-500">
                        Пока нет регулярных пожертвований
                    </p>
                ))}
            {!loading && activeTab === 'all' && renderAllList()}

            {!loading &&
                activeTab === 'all' &&
                allData.length === 0 &&
                loadedTabs.has('all') && (
                    <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-8 text-center text-sm text-gray-500">
                        Пока нет поступлений
                    </p>
                )}

            {!loading &&
                activeTab === 'all' &&
                allPagination.current_page < allPagination.last_page && (
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={handleLoadMoreAll}
                            disabled={loading}
                            className="font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-70"
                        >
                            Загрузить больше
                        </button>
                    </div>
                )}
        </section>
    );
}

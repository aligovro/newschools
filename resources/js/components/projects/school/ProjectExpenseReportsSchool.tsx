import axios from 'axios';
import React, { useCallback, useState } from 'react';

export interface ExpenseReport {
    id: number;
    title: string;
    formatted_amount: string;
    status_label: string;
    formatted_date: string;
    pdf_url: string | null;
    formatted_file_size: string | null;
}

export interface MonthTab {
    value: string; // "2026-02"
    label: string; // "фев 2026"
    count: number;
}

interface Props {
    projectId: number;
    monthTabs: MonthTab[];
    initialMonth: string | null;
    initialData: ExpenseReport[];
    initialHasMore: boolean;
}

const PER_PAGE = 3;

const ReportRow: React.FC<{ report: ExpenseReport }> = React.memo(({ report }) => (
    <div className="project-expense-reports__item">
        <div className="project-expense-reports__item-icon">
            <img src="/icons/school-template/document-text.svg" alt="" width={20} height={20} />
        </div>
        <div className="project-expense-reports__item-body">
            <span className="project-expense-reports__item-meta">
                {report.formatted_date}
                {report.pdf_url && (
                    <>
                        {' · '}
                        <a
                            href={report.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-expense-reports__item-meta-link"
                        >
                            файл PDF
                        </a>
                        {report.formatted_file_size && <> · {report.formatted_file_size}</>}
                    </>
                )}
            </span>
            <span className="project-expense-reports__item-title">{report.title}</span>
        </div>
        <div className="project-expense-reports__item-amount-wrap">
            <span className="project-expense-reports__item-status">{report.status_label}</span>
            <span className="project-expense-reports__item-amount">{report.formatted_amount}</span>
        </div>
    </div>
));

const ProjectExpenseReportsSchool: React.FC<Props> = ({
    projectId,
    monthTabs,
    initialMonth,
    initialData,
    initialHasMore,
}) => {
    const [activeMonth, setActiveMonth] = useState(initialMonth);
    const [reports, setReports] = useState(initialData);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    if (monthTabs.length === 0) return null;

    const fetchReports = useCallback(
        async (month: string | null, targetPage: number, append: boolean) => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/public/projects/${projectId}/expense-reports`, {
                    params: { month, per_page: PER_PAGE, page: targetPage },
                });
                const { data, has_more } = res.data;
                setReports((prev) => (append ? [...prev, ...data] : data));
                setHasMore(has_more);
            } finally {
                setLoading(false);
            }
        },
        [projectId],
    );

    const handleMonthChange = (month: string) => {
        if (month === activeMonth) return;
        setActiveMonth(month);
        setPage(1);
        fetchReports(month, 1, false);
    };

    const handleLoadMore = () => {
        if (loading) return;
        const next = page + 1;
        setPage(next);
        fetchReports(activeMonth, next, true);
    };

    return (
        <section className="project-expense-reports">
            <h2 className="project-expense-reports__title">Отчеты по расходам</h2>

            {/* Month tabs */}
            <div className="project-expense-reports__months">
                {monthTabs.map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        className={`project-expense-reports__month-tab${
                            activeMonth === tab.value
                                ? ' project-expense-reports__month-tab--active'
                                : ''
                        }`}
                        onClick={() => handleMonthChange(tab.value)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Report rows */}
            <div className="project-expense-reports__list">
                {reports.map((report) => (
                    <ReportRow key={report.id} report={report} />
                ))}
                {reports.length === 0 && !loading && (
                    <p className="project-expense-reports__empty">Нет отчётов за этот период</p>
                )}
            </div>

            {/* Load more */}
            {hasMore && (
                <button
                    type="button"
                    className="project-expense-reports__load-more"
                    onClick={handleLoadMore}
                    disabled={loading}
                >
                    Загрузить больше
                </button>
            )}
        </section>
    );
};

export default ProjectExpenseReportsSchool;

import { formsApi } from '@/lib/api/index';
import React, { useCallback, useEffect, useState } from 'react';
import { FormSubmission } from './types';

interface FormSubmissionsManagerProps {
    widgetId: number;
    siteId: number;
}

export const FormSubmissionsManager: React.FC<FormSubmissionsManagerProps> = ({
    widgetId,
    siteId,
}) => {
    const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [selectedSubmission, setSelectedSubmission] =
        useState<FormSubmission | null>(null);
    const [filters, setFilters] = useState({
        status: 'all',
        dateFrom: '',
        dateTo: '',
        search: '',
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        perPage: 20,
    });

    // Загрузка отправок
    const loadSubmissions = useCallback(async () => {
        try {
            setLoading(true);
            const response = await formsApi.getFormSubmissions(
                siteId,
                widgetId,
                {
                    page: pagination.currentPage,
                    per_page: pagination.perPage,
                    search: filters.search,
                },
            );

            setSubmissions(response.data || []);
            setPagination((prev) => ({
                ...prev,
                totalPages: response.last_page || 1,
            }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка');
        } finally {
            setLoading(false);
        }
    }, [widgetId, siteId, pagination.currentPage, pagination.perPage, filters]);

    useEffect(() => {
        loadSubmissions();
    }, [loadSubmissions]);

    // Удаление отправки
    const handleDeleteSubmission = useCallback(
        async (submissionId: number) => {
            if (!confirm('Вы уверены, что хотите удалить эту отправку?')) {
                return;
            }

            try {
                await formsApi.deleteFormSubmission(
                    siteId,
                    widgetId,
                    submissionId,
                );

                setSubmissions((prev) =>
                    prev.filter((s) => s.id !== submissionId),
                );
                if (selectedSubmission?.id === submissionId) {
                    setSelectedSubmission(null);
                }
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : 'Ошибка удаления',
                );
            }
        },
        [widgetId, siteId, selectedSubmission],
    );

    // Экспорт в CSV
    const handleExportCSV = useCallback(() => {
        if (submissions.length === 0) return;

        const headers = ['ID', 'Дата', 'IP адрес', 'Статус'];
        const dataKeys = new Set<string>();

        // Собираем все ключи данных из всех отправок
        submissions.forEach((submission) => {
            Object.keys(submission.data || {}).forEach((key) => {
                dataKeys.add(key);
            });
        });

        const allHeaders = [...headers, ...Array.from(dataKeys)];
        const csvContent = [
            allHeaders.join(','),
            ...submissions.map((submission) =>
                [
                    submission.id,
                    submission.created_at,
                    submission.ip_address || '',
                    submission.status,
                    ...Array.from(dataKeys).map((key) => {
                        const value = submission.data?.[key];
                        if (Array.isArray(value)) {
                            return `"${value.join('; ')}"`;
                        }
                        return `"${value || ''}"`;
                    }),
                ].join(','),
            ),
        ].join('\n');

        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `form-submissions-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }, [submissions]);

    // Фильтрация
    const handleFilterChange = useCallback((field: string, value: string) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }, []);

    // Пагинация
    const handlePageChange = useCallback((page: number) => {
        setPagination((prev) => ({ ...prev, currentPage: page }));
    }, []);

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: 'Ожидает', className: 'status-pending' },
            processed: { label: 'Обработано', className: 'status-processed' },
            failed: { label: 'Ошибка', className: 'status-failed' },
        };

        const config =
            statusConfig[status as keyof typeof statusConfig] ||
            statusConfig.pending;

        return (
            <span className={`status-badge ${config.className}`}>
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ru-RU');
    };

    if (loading) {
        return (
            <div className="form-submissions-manager">
                <div className="form-submissions-manager__loading">
                    <div className="spinner"></div>
                    <p>Загрузка отправок...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="form-submissions-manager">
            <div className="form-submissions-manager__header">
                <h3>Отправки формы</h3>
                <div className="form-submissions-manager__actions">
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        className="form-submissions-manager__export-btn"
                        disabled={submissions.length === 0}
                    >
                        📊 Экспорт CSV
                    </button>
                    <button
                        type="button"
                        onClick={loadSubmissions}
                        className="form-submissions-manager__refresh-btn"
                    >
                        🔄 Обновить
                    </button>
                </div>
            </div>

            {error && (
                <div className="form-submissions-manager__error">{error}</div>
            )}

            {/* Фильтры */}
            <div className="form-submissions-manager__filters">
                <div className="form-submissions-manager__filter-group">
                    <label>Статус</label>
                    <select
                        value={filters.status}
                        onChange={(e) =>
                            handleFilterChange('status', e.target.value)
                        }
                    >
                        <option value="all">Все</option>
                        <option value="pending">Ожидает</option>
                        <option value="processed">Обработано</option>
                        <option value="failed">Ошибка</option>
                    </select>
                </div>

                <div className="form-submissions-manager__filter-group">
                    <label>Дата от</label>
                    <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) =>
                            handleFilterChange('dateFrom', e.target.value)
                        }
                    />
                </div>

                <div className="form-submissions-manager__filter-group">
                    <label>Дата до</label>
                    <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) =>
                            handleFilterChange('dateTo', e.target.value)
                        }
                    />
                </div>

                <div className="form-submissions-manager__filter-group">
                    <label>Поиск</label>
                    <input
                        type="text"
                        placeholder="Поиск по данным..."
                        value={filters.search}
                        onChange={(e) =>
                            handleFilterChange('search', e.target.value)
                        }
                    />
                </div>
            </div>

            {/* Список отправок */}
            <div className="form-submissions-manager__content">
                <div className="form-submissions-manager__list">
                    {submissions.length === 0 ? (
                        <div className="form-submissions-manager__empty">
                            <p>Отправки не найдены</p>
                        </div>
                    ) : (
                        <div className="form-submissions-manager__table">
                            <div className="form-submissions-manager__table-header">
                                <div>ID</div>
                                <div>Дата</div>
                                <div>IP адрес</div>
                                <div>Статус</div>
                                <div>Действия</div>
                            </div>
                            {submissions.map((submission) => (
                                <div
                                    key={submission.id}
                                    className={`form-submissions-manager__table-row ${
                                        selectedSubmission?.id === submission.id
                                            ? 'selected'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setSelectedSubmission(submission)
                                    }
                                >
                                    <div>#{submission.id}</div>
                                    <div>
                                        {formatDate(
                                            submission.created_at || '',
                                        )}
                                    </div>
                                    <div>{submission.ip_address || '-'}</div>
                                    <div>
                                        {getStatusBadge(submission.status)}
                                    </div>
                                    <div className="form-submissions-manager__actions">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedSubmission(
                                                    submission,
                                                );
                                            }}
                                            title="Просмотр"
                                        >
                                            👁️
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteSubmission(
                                                    submission.id!,
                                                );
                                            }}
                                            title="Удалить"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Детали отправки */}
                {selectedSubmission && (
                    <div className="form-submissions-manager__details">
                        <div className="form-submissions-manager__details-header">
                            <h4>Отправка #{selectedSubmission.id}</h4>
                            <button
                                type="button"
                                onClick={() => setSelectedSubmission(null)}
                                className="form-submissions-manager__close-btn"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="form-submissions-manager__details-content">
                            <div className="form-submissions-manager__meta">
                                <div className="form-submissions-manager__meta-item">
                                    <strong>Дата:</strong>{' '}
                                    {formatDate(
                                        selectedSubmission.created_at || '',
                                    )}
                                </div>
                                <div className="form-submissions-manager__meta-item">
                                    <strong>IP адрес:</strong>{' '}
                                    {selectedSubmission.ip_address ||
                                        'Неизвестно'}
                                </div>
                                <div className="form-submissions-manager__meta-item">
                                    <strong>Статус:</strong>{' '}
                                    {getStatusBadge(selectedSubmission.status)}
                                </div>
                                {selectedSubmission.user_agent && (
                                    <div className="form-submissions-manager__meta-item">
                                        <strong>User Agent:</strong>{' '}
                                        {selectedSubmission.user_agent}
                                    </div>
                                )}
                                {selectedSubmission.referer && (
                                    <div className="form-submissions-manager__meta-item">
                                        <strong>Источник:</strong>{' '}
                                        {selectedSubmission.referer}
                                    </div>
                                )}
                            </div>

                            <div className="form-submissions-manager__data">
                                <h5>Данные формы</h5>
                                {selectedSubmission.data &&
                                Object.keys(selectedSubmission.data).length >
                                    0 ? (
                                    <div className="form-submissions-manager__data-grid">
                                        {Object.entries(
                                            selectedSubmission.data,
                                        ).map(([key, value]) => (
                                            <div
                                                key={key}
                                                className="form-submissions-manager__data-item"
                                            >
                                                <strong>{key}:</strong>
                                                <span>
                                                    {Array.isArray(value)
                                                        ? value.join(', ')
                                                        : String(value || '')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>Данные отсутствуют</p>
                                )}
                            </div>

                            {selectedSubmission.error_message && (
                                <div className="form-submissions-manager__error-details">
                                    <h5>Ошибка</h5>
                                    <p>{selectedSubmission.error_message}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Пагинация */}
            {pagination.totalPages > 1 && (
                <div className="form-submissions-manager__pagination">
                    <button
                        type="button"
                        onClick={() =>
                            handlePageChange(pagination.currentPage - 1)
                        }
                        disabled={pagination.currentPage === 1}
                    >
                        ← Предыдущая
                    </button>

                    <span className="form-submissions-manager__pagination-info">
                        Страница {pagination.currentPage} из{' '}
                        {pagination.totalPages}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            handlePageChange(pagination.currentPage + 1)
                        }
                        disabled={
                            pagination.currentPage === pagination.totalPages
                        }
                    >
                        Следующая →
                    </button>
                </div>
            )}
        </div>
    );
};

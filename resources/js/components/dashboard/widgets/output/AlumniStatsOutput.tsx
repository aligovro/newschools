import { useAlumniStatsData } from '@/hooks/useAlumniStats';
import { usePage } from '@inertiajs/react';
import React from 'react';
import { WidgetOutputProps } from './types';

interface ColumnConfig {
    label: string;
    subtitle: string;
    icon: string;
    isVisible: boolean;
}

export const AlumniStatsOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = widget.config as {
        organization_id?: number;
        title?: string;
        show_title?: boolean;
        showIcons?: boolean;
        columns?: ColumnConfig[];
    };

    const { organization_id, title, show_title = true, showIcons = true, columns } = config || {};

    const page = usePage();
    const propsAny = (page?.props as any) || {};

    const parseId = (value: unknown): number | undefined => {
        const numeric = Number(value);
        return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
    };

    const configOrganizationId =
        parseId(organization_id) ??
        parseId((config as any)?.organizationId) ??
        parseId((widget as any)?.organization_id);

    const pageOrganizationId =
        parseId(propsAny?.organizationId) ??
        parseId(propsAny?.organization?.id) ??
        parseId(propsAny?.project?.organization?.id) ??
        parseId(propsAny?.site?.organization_id);

    const resolvedOrganizationId = configOrganizationId ?? pageOrganizationId;

    const { stats, loading, error } = useAlumniStatsData(resolvedOrganizationId);

    const formatNumber = (num: number): string => {
        return num.toLocaleString('ru-RU');
    };

    const formatAmount = (amount: number): string => {
        // amount хранится в копейках, конвертируем в рубли
        const rubles = amount / 100;
        return `${formatNumber(rubles)} ₽`;
    };

    // Иконки для статистики
    const PeopleIcon = () => (
        <svg
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
        </svg>
    );

    const CurrencyIcon = () => (
        <svg
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    );

    const LightbulbIcon = () => (
        <svg
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
        </svg>
    );

    if (loading) {
        return (
            <div
                className={`alumni-stats-output alumni-stats-output--loading ${className || ''}`}
                style={style}
            >
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">Загрузка статистики...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className={`alumni-stats-output alumni-stats-output--error ${className || ''}`}
                style={style}
            >
                <div className="flex items-center justify-center py-12 text-red-600">
                    <div>Ошибка: {error}</div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div
                className={`alumni-stats-output alumni-stats-output--empty ${className || ''}`}
                style={style}
            >
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">
                        Нет данных для отображения
                    </div>
                </div>
            </div>
        );
    }

    // Значения для трех колонок (по умолчанию из API)
    const columnValues = [
        formatNumber(stats.supporters_count),
        formatAmount(stats.total_donated),
        formatNumber(stats.projects_count),
    ];

    // Дефолтные иконки SVG
    const defaultIcons = [<PeopleIcon />, <CurrencyIcon />, <LightbulbIcon />];

    // Если есть кастомные настройки колонок, используем их
    const statsItems = columns
        ? columns
              .filter((col) => col.isVisible !== false)
              .map((col, index) => ({
                  icon: col.icon ? (
                      <img
                          src={col.icon}
                          alt={col.label}
                          className="h-22 w-22 object-contain"
                      />
                  ) : (
                      defaultIcons[index]
                  ),
                  value: columnValues[index],
                  label: col.label,
                  subtitle: col.subtitle,
              }))
        : // Иначе используем дефолтные
          [
              {
                  icon: <PeopleIcon />,
                  value: formatNumber(stats.supporters_count),
                  label: 'людей',
                  subtitle: 'Поддерживают свои школы',
              },
              {
                  icon: <CurrencyIcon />,
                  value: formatAmount(stats.total_donated),
                  label: '',
                  subtitle: 'Сумма поддержки бывшими выпускниками',
              },
              {
                  icon: <LightbulbIcon />,
                  value: formatNumber(stats.projects_count),
                  label: 'проектов',
                  subtitle: 'Реализовали бывшие выпускники',
              },
          ];

    return (
        <div className={`alumni-stats-output ${className || ''}`} style={style}>
            <section className="py-12">
                <div className="container mx-auto px-4">
                    {title && show_title && (
                        <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
                            {title}
                        </h2>
                    )}

                    <div className="grid gap-8 md:grid-cols-3">
                        {statsItems.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-end rounded-lg bg-white p-6"
                            >
                                <div>
                                    <div className="alumni-stats-output__value mb-2">
                                        {item.value} {item.label}
                                    </div>
                                    <span className="alumni-stats-output__subtitle">
                                        {item.subtitle}
                                    </span>
                                </div>
                                {showIcons && (
                                    <div className="ml-4 flex-shrink-0 text-blue-600">
                                        {item.icon}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

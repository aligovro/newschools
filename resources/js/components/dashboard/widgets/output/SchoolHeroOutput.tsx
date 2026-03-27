import {
    widgetsSystemApi,
    type DonationWidgetData,
} from '@/lib/api/index';
import { GOAL_PERIODS, getPeriodLabel } from '@/lib/goal-periods';
import { getImageUrl } from '@/utils/getImageUrl';
import { usePage } from '@inertiajs/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SchoolHeroConfig } from '../SchoolHeroWidget';
import { WidgetOutputProps } from './types';

const parseNumericId = (val: unknown): number | undefined => {
    if (val === null || val === undefined) return undefined;
    const n = Number(val);
    return Number.isFinite(n) && n > 0 ? n : undefined;
};

const formatMoney = (amount: number) =>
    new Intl.NumberFormat('ru-RU').format(Math.round(amount)) + ' ₽';

export const SchoolHeroOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = widget.config as SchoolHeroConfig;
    const page = usePage();
    const propsAny = (page?.props as any) || {};

    const {
        title = 'Гимназия №107',
        subtitle = 'Поддерживай свою школу — поддержи будущее поколение',
        backgroundImage,
        showMonthlyGoal = true,
        goalPeriod = 'monthly',
        monthlyGoalTarget,
        showTotalProgress = true,
    } = config;

    const bgImage = backgroundImage ? getImageUrl(backgroundImage) : '';

    const organizationId = useMemo(
        () =>
            parseNumericId(config.organizationId) ??
            parseNumericId(propsAny?.site?.organization_id),
        [config.organizationId, propsAny?.site?.organization_id],
    );

    const siteId = useMemo(
        () => parseNumericId(propsAny?.site?.id),
        [propsAny?.site?.id],
    );

    const [needsData, setNeedsData]         = useState<DonationWidgetData['organization_needs']>(null);
    const [periodGoalData, setPeriodGoalData] = useState<DonationWidgetData['monthly_goal']>(null);
    const [activePeriod, setActivePeriod]     = useState(goalPeriod);
    const [isLoaded, setIsLoaded]             = useState(false);

    const loadData = useCallback(async () => {
        if (!organizationId) {
            setIsLoaded(true);
            return;
        }

        try {
            const params: { site_id?: number } = {};
            if (siteId) params.site_id = siteId;

            const data = await widgetsSystemApi.getDonationWidgetData(organizationId, params);

            setNeedsData(data.organization_needs ?? null);

            // Предпочитаем сконфигурированный период; если у него нет данных — берём первый с данными
            const preferred = data[`${goalPeriod}_goal` as keyof DonationWidgetData] as DonationWidgetData['monthly_goal'];
            if (preferred) {
                setPeriodGoalData(preferred);
                setActivePeriod(goalPeriod);
            } else {
                const fallback = GOAL_PERIODS.find(
                    (p) => (data[`${p.value}_goal` as keyof DonationWidgetData] as DonationWidgetData['monthly_goal'])?.target?.value,
                );
                if (fallback) {
                    setPeriodGoalData(data[`${fallback.value}_goal` as keyof DonationWidgetData] as DonationWidgetData['monthly_goal']);
                    setActivePeriod(fallback.value);
                }
            }
        } catch (err) {
            console.error('SchoolHeroOutput: failed to load data', err);
        } finally {
            setIsLoaded(true);
        }
    }, [organizationId, siteId, goalPeriod]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const totalGoal      = needsData?.target?.value ?? 0;
    const totalCollected = needsData?.collected?.value ?? 0;
    const totalRemaining = Math.max(0, totalGoal - totalCollected);
    const totalPercent   = totalGoal > 0 ? Math.round((totalCollected / totalGoal) * 100) : 0;
    const totalBarWidth  = Math.min(totalPercent, 100);

    // Приоритет: цель из настроек виджета (ручной override) → данные API → не показываем
    const periodTarget =
        monthlyGoalTarget && monthlyGoalTarget > 0
            ? monthlyGoalTarget
            : (periodGoalData?.target?.value ?? 0);
    const periodCollected = periodGoalData?.collected?.value ?? 0;
    const periodRemaining = Math.max(0, periodTarget - periodCollected);

    const hasMonthlyData = periodTarget > 0;
    const hasTotalData   = totalGoal > 0;

    return (
        <div className={`school-hero-widget ${className || ''}`} style={style}>
            {bgImage && (
                <img
                    src={bgImage}
                    alt={title}
                    className="school-hero-bg-image"
                />
            )}
            <div className="school-hero-bg-overlay"></div>

            <div className="school-hero-content">
                {/* Текстовая группа — всегда вверху */}
                <div className="school-hero-text">
                    <h1 className="school-hero-title">{title}</h1>
                    {subtitle && (
                        <p className="school-hero-subtitle">{subtitle}</p>
                    )}
                </div>

                {/* Группа данных — прибита к низу через margin-top: auto в CSS */}
                <div className="school-hero-data">
                    {showMonthlyGoal && isLoaded && hasMonthlyData && (
                        <div className="school-hero-monthly">
                            <div className="school-hero-monthly__goal-block">
                                <div className="school-hero-monthly__label">
                                    {getPeriodLabel(activePeriod)}
                                </div>
                                <div className="school-hero-monthly__goal">
                                    {formatMoney(periodTarget)}
                                </div>
                            </div>
                            <div className="school-hero-monthly__collected">
                                {formatMoney(periodRemaining)}
                            </div>
                            <div className="school-hero-monthly__text">
                                Осталось
                                <br />
                                собрать
                            </div>
                        </div>
                    )}

                    {showTotalProgress && isLoaded && hasTotalData && (
                        <div className="school-hero-progress">
                            <div className="school-hero-progress__bar-container">
                                <div className="school-hero-progress__bar-bg"></div>
                                <div
                                    className="school-hero-progress__bar-fill"
                                    style={{ width: `${totalBarWidth}%` }}
                                ></div>
                            </div>

                            <div className="school-hero-progress__stats">
                                <div className="school-hero-progress__stat-col">
                                    <div className="school-hero-progress__stat-value school-hero-progress__stat-value--collected">
                                        {formatMoney(totalCollected)}
                                    </div>
                                    <div className="school-hero-progress__stat-label">
                                        Собрали
                                    </div>
                                </div>
                                <div className="school-hero-progress__stat-col school-hero-progress__stat-col--center">
                                    <div className="school-hero-progress__percent">
                                        {totalPercent}%
                                    </div>
                                    <div className="school-hero-progress__stat-remaining">
                                        Осталось {formatMoney(totalRemaining)}
                                    </div>
                                </div>
                                <div className="school-hero-progress__stat-col school-hero-progress__stat-col--right">
                                    <div className="school-hero-progress__stat-value">
                                        {formatMoney(totalGoal)}
                                    </div>
                                    <div className="school-hero-progress__stat-label">
                                        Необходимо
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

import {
    widgetsSystemApi,
    type DonationWidgetData,
} from '@/lib/api/index';
import type { MoneyAmount } from '@/types/money';
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

    const [needsData, setNeedsData] = useState<{
        target: MoneyAmount;
        collected: MoneyAmount;
        progress_percentage: number;
    } | null>(null);

    const [monthlyGoalData, setMonthlyGoalData] = useState<{
        target: MoneyAmount;
        collected: MoneyAmount;
        progress_percentage: number;
    } | null>(null);

    const [isLoaded, setIsLoaded] = useState(false);

    const loadData = useCallback(async () => {
        if (!organizationId) {
            setIsLoaded(true);
            return;
        }

        try {
            const params: { site_id?: number } = {};
            if (siteId) params.site_id = siteId;

            const data: DonationWidgetData =
                await widgetsSystemApi.getDonationWidgetData(
                    organizationId,
                    params,
                );

            if (data.organization_needs) {
                setNeedsData({
                    target: data.organization_needs.target,
                    collected: data.organization_needs.collected,
                    progress_percentage:
                        data.organization_needs.progress_percentage,
                });
            }

            if (data.monthly_goal) {
                const mg = data.monthly_goal as {
                    target: MoneyAmount;
                    collected: MoneyAmount;
                    progress_percentage: number;
                };
                setMonthlyGoalData(mg);
            }
        } catch (err) {
            console.error('SchoolHeroOutput: failed to load data', err);
        } finally {
            setIsLoaded(true);
        }
    }, [organizationId, siteId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const totalGoal = needsData?.target?.value ?? 0;
    const totalCollected = needsData?.collected?.value ?? 0;
    const totalRemaining = Math.max(0, totalGoal - totalCollected);
    const totalPercent =
        totalGoal > 0 ? Math.round((totalCollected / totalGoal) * 100) : 0;

    const monthlyTarget = monthlyGoalData?.target?.value ?? 0;
    const monthlyCollected = monthlyGoalData?.collected?.value ?? 0;
    const monthlyRemaining = Math.max(0, monthlyTarget - monthlyCollected);

    const hasMonthlyData = monthlyTarget > 0;
    const hasTotalData = totalGoal > 0;

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
                <h1 className="school-hero-title">{title}</h1>

                {subtitle && (
                    <p className="school-hero-subtitle">{subtitle}</p>
                )}

                {showMonthlyGoal && isLoaded && hasMonthlyData && (
                    <div className="school-hero-monthly">
                        <div className="school-hero-monthly__goal-block">
                            <div className="school-hero-monthly__label">
                                Цель на месяц
                            </div>
                            <div className="school-hero-monthly__goal">
                                {formatMoney(monthlyTarget)}
                            </div>
                        </div>
                        <div className="school-hero-monthly__collected">
                            {formatMoney(monthlyRemaining)}
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
                                style={{ width: `${totalPercent}%` }}
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
    );
};

import { DonationWidget } from '@/components/dashboard/widgets/DonationWidget';
import { usePage } from '@inertiajs/react';
import React, { useMemo } from 'react';
import { DonationOutputConfig, WidgetOutputProps } from './types';

export const DonationOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = widget.config as DonationOutputConfig;

    const page = usePage();
    const propsAny = (page?.props as any) || {};
    const pageOrganization = propsAny?.organization;
    const pageProject = propsAny?.project;

    const parseId = (value: unknown): number | undefined => {
        if (value === null || value === undefined) {
            return undefined;
        }
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
    };

    const organizationIdFromPage =
        parseId(propsAny?.organizationId) ??
        parseId(pageOrganization?.id) ??
        parseId(pageProject?.organization?.id) ??
        parseId(propsAny?.site?.organization_id);

    const resolvedOrganizationId =
        parseId(config.organizationId) ?? organizationIdFromPage;

    const publicContext = useMemo(() => {
        const siteId = parseId(propsAny?.site?.id);

        const safeNumber = (value: unknown): number => {
            if (
                value &&
                typeof value === 'object' &&
                'value' in (value as Record<string, unknown>)
            ) {
                const raw = (value as Record<string, unknown>).value;
                const numeric =
                    typeof raw === 'string'
                        ? Number.parseFloat(raw)
                        : Number(raw);
                return Number.isFinite(numeric) ? numeric : 0;
            }

            if (value == null) return 0;
            const num =
                typeof value === 'string'
                    ? Number.parseFloat(value)
                    : Number(value);
            return Number.isFinite(num) ? num : 0;
        };

        if (pageProject?.id) {
            const activeStage = (pageProject?.stages || [])?.find(
                (stage: any) => stage?.is_active || stage?.status === 'active',
            );

            const stageTarget = activeStage
                ? safeNumber(
                      activeStage.funding?.target ??
                          activeStage.target_amount_rubles ??
                          activeStage.target_amount,
                  )
                : 0;
            const stageCollected = activeStage
                ? safeNumber(
                      activeStage.funding?.collected ??
                          activeStage.collected_amount_rubles ??
                          activeStage.collected_amount,
                  )
                : 0;

            const projectTarget = safeNumber(
                pageProject.funding?.target ??
                    pageProject.target_amount_rubles ??
                    pageProject.target_amount,
            );
            const projectCollected = safeNumber(
                pageProject.funding?.collected ??
                    pageProject.collected_amount_rubles ??
                    pageProject.collected_amount,
            );

            if (activeStage && stageTarget > 0) {
                return {
                    organizationId: resolvedOrganizationId,
                    projectId: parseId(pageProject.id),
                    projectStageId: parseId(activeStage.id),
                    ...(siteId !== undefined && { siteId }),
                    progress: {
                        targetAmount: stageTarget,
                        collectedAmount: stageCollected,
                        currency: 'RUB',
                        labelTarget: 'Цель этапа',
                        labelCollected: 'Собрали',
                    },
                };
            }

            if (projectTarget > 0) {
                return {
                    organizationId: resolvedOrganizationId,
                    projectId: parseId(pageProject.id),
                    ...(siteId !== undefined && { siteId }),
                    progress: {
                        targetAmount: projectTarget,
                        collectedAmount: projectCollected,
                        currency: 'RUB',
                        labelTarget: 'Цель проекта',
                        labelCollected: 'Собрали',
                    },
                };
            }

            return {
                organizationId: resolvedOrganizationId,
                projectId: parseId(pageProject.id),
                ...(siteId !== undefined && { siteId }),
            };
        }

        if (pageOrganization?.id) {
            const needsTarget = safeNumber(pageOrganization.needs?.target);
            const needsCollected = safeNumber(pageOrganization.needs?.collected);

            return {
                organizationId:
                    resolvedOrganizationId ?? parseId(pageOrganization.id),
                ...(siteId !== undefined && { siteId }),
                progress:
                    needsTarget > 0
                        ? {
                              targetAmount: needsTarget,
                              collectedAmount: needsCollected,
                              currency: 'RUB',
                              labelTarget: 'Нужды школы',
                              labelCollected: 'Собрали',
                          }
                        : undefined,
            };
        }

        if (resolvedOrganizationId) {
            return {
                organizationId: resolvedOrganizationId,
                ...(siteId !== undefined && { siteId }),
            };
        }

        return undefined;
    }, [pageOrganization, pageProject, propsAny?.site, resolvedOrganizationId]);

    const mapped = {
        title: config.title,
        show_title: config.show_title ?? true,
        description: config.description,
        preset_amounts: config.suggestedAmounts,
        min_amount: config.minAmount,
        max_amount: config.maxAmount,
        currency: (config.currency as 'RUB' | 'USD' | 'EUR') || 'RUB',
        show_progress: config.showProgress,
        show_target_amount: (config as any).show_target_amount ?? true,
        show_collected_amount: (config as any).show_collected_amount ?? true,
        allow_recurring: (config as any).allowRecurring ?? (config as any).allow_recurring ?? true,
        recurring_periods: (config as any).recurringPeriods ?? (config as any).recurring_periods ?? ['daily', 'weekly', 'monthly'],
        require_name: (config as any).requireName ?? (config as any).require_name ?? true,
        require_phone: false, // phone never required; shown read-only when user has it in profile
        require_email: (config as any).requireEmail ?? (config as any).require_email ?? false,
        allow_anonymous: (config as any).allowAnonymous ?? (config as any).allow_anonymous ?? true,
        show_message_field: (config as any).showMessageField ?? (config as any).show_message_field ?? false,
        button_text: (config as any).buttonText ?? (config as any).button_text ?? 'Внести свой вклад',
    } as Record<string, unknown>;

    return (
        <div className={`donation-output ${className || ''}`} style={style}>
            <DonationWidget
                config={mapped}
                isEditable={false}
                organizationId={resolvedOrganizationId}
                publicContext={publicContext}
            />
        </div>
    );
};

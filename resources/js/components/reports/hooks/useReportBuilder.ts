import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { reportsApi } from '../api';
import {
    ProjectOption,
    ProjectStageOption,
    Report,
    ReportFiltersState,
    ReportRun,
    ReportTypeDefinition,
} from '../types';

interface BuilderOptions {
    organizationId: number;
    reportTypes: ReportTypeDefinition[];
    projects: ProjectOption[];
    initialReport?: Report | null;
}

interface BuilderState extends ReportFiltersState {
    period: string;
    includeRevenue: boolean;
    includeMembers: boolean;
    includeProjects: boolean;
    includeAnalytics: boolean;
    includeInactive: boolean;
    siteId: number | null;
}

type BuilderAction =
    | { type: 'set'; payload: Partial<BuilderState> }
    | { type: 'reset'; payload: BuilderState };

const initialState: BuilderState = {
    reportType: 'revenue',
    period: 'month',
    dateFrom: null,
    dateTo: null,
    groupBy: 'month',
    status: 'all',
    projectId: null,
    projectStageId: null,
    siteId: null,
    includeRevenue: true,
    includeMembers: true,
    includeProjects: true,
    includeAnalytics: true,
    includeInactive: false,
};

function buildInitialState(
    report?: Report | null,
    defaults: BuilderState = initialState,
): BuilderState {
    if (!report) {
        return defaults;
    }

    const filters = report.filters || {};
    const rawSiteId =
        (filters.site_id as string | number | undefined) ??
        (filters.siteId as string | number | undefined);
    const normalizedSiteId =
        report.site?.id ??
        (rawSiteId !== undefined && rawSiteId !== null && rawSiteId !== ''
            ? Number(rawSiteId)
            : null);

    return {
        ...defaults,
        reportType: report.report_type,
        period: String(filters.period || defaults.period),
        dateFrom: (filters.date_from as string) || null,
        dateTo: (filters.date_to as string) || null,
        groupBy: (filters.group_by as string) || null,
        status: (filters.status as string) || 'all',
        projectId: report.project?.id ?? null,
        projectStageId: report.project_stage?.id ?? null,
        siteId: Number.isNaN(normalizedSiteId ?? NaN) ? null : normalizedSiteId,
        includeRevenue: Boolean(filters.include_revenue ?? defaults.includeRevenue),
        includeMembers: Boolean(filters.include_members ?? defaults.includeMembers),
        includeProjects: Boolean(filters.include_projects ?? defaults.includeProjects),
        includeAnalytics: Boolean(
            filters.include_analytics ?? defaults.includeAnalytics,
        ),
        includeInactive: Boolean(filters.include_inactive ?? defaults.includeInactive),
    };
}

function reducer(state: BuilderState, action: BuilderAction): BuilderState {
    switch (action.type) {
        case 'set':
            return { ...state, ...action.payload };
        case 'reset':
            return action.payload;
        default:
            return state;
    }
}

export function useReportBuilder({
    organizationId,
    reportTypes,
    projects,
    initialReport = null,
}: BuilderOptions) {
    const [state, dispatch] = useReducer(
        reducer,
        buildInitialState(initialReport ?? undefined),
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
    const [lastRun, setLastRun] = useState<ReportRun | null>(null);
    const [stageOptions, setStageOptions] = useState<ProjectStageOption[]>([]);
    const stageCache = useRef<Map<number, ProjectStageOption[]>>(new Map());

    const selectedReportType = useMemo(() => {
        return (
            reportTypes.find((type) => type.id === state.reportType) ??
            reportTypes[0] ??
            null
        );
    }, [state.reportType, reportTypes]);

    const projectOptions = useMemo(() => projects, [projects]);

    const projectId = state.projectId ?? undefined;

    useEffect(() => {
        if (!projectId) {
            setStageOptions([]);
            dispatch({ type: 'set', payload: { projectStageId: null } });
            return;
        }

        if (stageCache.current.has(projectId)) {
            setStageOptions(stageCache.current.get(projectId) ?? []);
            return;
        }

        let isMounted = true;
        reportsApi
            .projectStages(organizationId, projectId)
            .then((response) => {
                if (!isMounted) return;
                const stages = response.data.stages ?? [];
                stageCache.current.set(projectId, stages);
                setStageOptions(stages);
            })
            .catch(() => {
                if (isMounted) {
                    setStageOptions([]);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [organizationId, projectId]);

    useEffect(() => {
        const definition = reportTypes.find((type) => type.id === state.reportType);
        if (!definition) return;

        const availableGroupings = (definition.groupings ?? []) as string[];
        const defaultGroupBy =
            (definition.defaults?.group_by as string | undefined) ??
            availableGroupings[0] ??
            null;

        if (availableGroupings.length === 0 && state.groupBy) {
            dispatch({ type: 'set', payload: { groupBy: null } });
            return;
        }

        if (
            availableGroupings.length > 0 &&
            state.groupBy &&
            availableGroupings.includes(state.groupBy)
        ) {
            return;
        }

        if (availableGroupings.length > 0) {
            dispatch({
                type: 'set',
                payload: { groupBy: defaultGroupBy },
            });
        }
    }, [reportTypes, state.reportType, state.groupBy]);

    const setField = useCallback(
        (payload: Partial<BuilderState>) => {
            dispatch({ type: 'set', payload });
        },
        [dispatch],
    );

    const reset = useCallback(() => {
        dispatch({
            type: 'reset',
            payload: buildInitialState(initialReport ?? undefined),
        });
        setPayload(null);
        setLastRun(null);
        setError(null);
    }, [initialReport]);

    const generate = useCallback(
        async (options: { persist?: boolean; reportId?: number } = {}) => {
            if (!state.reportType || !state.period) {
                setError('Выберите тип отчета и период');
                return null;
            }

            setIsLoading(true);
            setError(null);

            try {
                const response = await reportsApi.generate(organizationId, {
                    report_type: state.reportType,
                    period: state.period,
                    date_from: state.dateFrom ?? undefined,
                    date_to: state.dateTo ?? undefined,
                    group_by: state.groupBy ?? undefined,
                    status: state.status ?? undefined,
                    include_revenue: state.includeRevenue,
                    include_members: state.includeMembers,
                    include_projects: state.includeProjects,
                    include_analytics: state.includeAnalytics,
                    include_inactive: state.includeInactive,
                    project_id: state.projectId ?? undefined,
                    project_stage_id: state.projectStageId ?? undefined,
                    site_id: state.siteId ?? undefined,
                    persist: options.persist ?? false,
                    report_id: options.reportId ?? undefined,
                });

                const { payload: reportPayload, run } = response.data;

                setPayload(reportPayload);
                setLastRun(run ?? null);

                return response.data;
            } catch (err: any) {
                console.error(err);
                setError(
                    err?.response?.data?.message ??
                        'Не удалось сформировать отчет. Попробуйте позже.',
                );
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [
            organizationId,
            state.reportType,
            state.period,
            state.dateFrom,
            state.dateTo,
            state.groupBy,
            state.status,
            state.includeRevenue,
            state.includeMembers,
            state.includeProjects,
            state.includeAnalytics,
            state.includeInactive,
            state.projectId,
            state.projectStageId,
        ],
    );

    return {
        state,
        setField,
        reset,
        generate,
        isLoading,
        error,
        payload,
        lastRun,
        selectedReportType,
        projectOptions,
        stageOptions,
    };
}



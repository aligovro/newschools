import { apiClient } from '@/lib/api';
import reportsRoutes from '@/routes/organizations/reports';
import { Paginated, ProjectStageOption, Report, ReportRun } from './types';

interface GenerateReportPayload {
    report_type: string;
    period: string;
    date_from?: string | null;
    date_to?: string | null;
    group_by?: string | null;
    status?: string | null;
    include_revenue?: boolean;
    include_members?: boolean;
    include_projects?: boolean;
    include_analytics?: boolean;
    include_inactive?: boolean;
    project_id?: number | null;
    project_stage_id?: number | null;
    persist?: boolean;
    report_id?: number | null;
}

interface GenerateReportResponse {
    message: string;
    payload: Record<string, unknown>;
    run?: ReportRun;
    report?: Report;
}

export const reportsApi = {
    generate: (organizationId: number, payload: GenerateReportPayload) => {
        const url = reportsRoutes.generate.url(organizationId);
        return apiClient.postAbsolute<GenerateReportResponse>(url, payload);
    },

    create: (organizationId: number, payload: Record<string, unknown>) => {
        const url = reportsRoutes.store.url(organizationId);
        return apiClient.postAbsolute<{ message: string; report: Report }>(
            url,
            payload,
        );
    },

    update: (
        organizationId: number,
        reportId: number,
        payload: Record<string, unknown>,
    ) => {
        const url = reportsRoutes.update.url([organizationId, reportId]);
        return apiClient.patchAbsolute<{ message: string; report: Report }>(
            url,
            payload,
        );
    },

    destroy: (organizationId: number, reportId: number) => {
        const url = reportsRoutes.destroy.url([organizationId, reportId]);
        return apiClient.deleteAbsolute(url);
    },

    runs: (organizationId: number, reportId: number) => {
        const url = reportsRoutes.runs.url([organizationId, reportId]);
        return apiClient.getAbsolute<Paginated<ReportRun>>(url);
    },

    projectStages: (organizationId: number, projectId: number) => {
        const url = reportsRoutes.projects.stages.url([
            organizationId,
            projectId,
        ]);
        return apiClient.getAbsolute<{
            project: { id: number; title: string };
            stages: ProjectStageOption[];
        }>(url);
    },

    export: (organizationId: number, payload: Record<string, unknown>) => {
        const url = reportsRoutes.export.url(organizationId);
        const format =
            typeof payload.format === 'string'
                ? payload.format === 'xlsx'
                    ? 'excel'
                    : payload.format
                : 'csv';

        return apiClient.postAbsolute(url, payload, {
            responseType: 'blob',
            headers:
                format === 'excel'
                    ? {
                          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                      }
                    : format === 'pdf'
                      ? { Accept: 'application/pdf' }
                      : { Accept: 'text/csv;charset=utf-8' },
        });
    },
};

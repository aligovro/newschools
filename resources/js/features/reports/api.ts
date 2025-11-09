import { apiClient } from '@/lib/api';
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
    generate: (
        organizationId: number,
        payload: GenerateReportPayload,
    ) => {
        const url = route('organization.reports.generate', organizationId);
        return apiClient.post<GenerateReportResponse>(url, payload);
    },

    create: (organizationId: number, payload: Record<string, unknown>) => {
        const url = route('organization.reports.store', organizationId);
        return apiClient.post<{ message: string; report: Report }>(url, payload);
    },

    update: (
        organizationId: number,
        reportId: number,
        payload: Record<string, unknown>,
    ) => {
        const url = route('organization.reports.update', [
            organizationId,
            reportId,
        ]);
        return apiClient.patch<{ message: string; report: Report }>(url, payload);
    },

    destroy: (organizationId: number, reportId: number) => {
        const url = route('organization.reports.destroy', [
            organizationId,
            reportId,
        ]);
        return apiClient.delete(url);
    },

    runs: (organizationId: number, reportId: number) => {
        const url = route('organization.reports.runs', [
            organizationId,
            reportId,
        ]);
        return apiClient.get<Paginated<ReportRun>>(url);
    },

    projectStages: (organizationId: number, projectId: number) => {
        const url = route('organization.reports.projects.stages', [
            organizationId,
            projectId,
        ]);
        return apiClient.get<{
            project: { id: number; title: string };
            stages: ProjectStageOption[];
        }>(url);
    },

    export: (organizationId: number, payload: Record<string, unknown>) => {
        const url = route('organization.reports.export', organizationId);
        const format =
            typeof payload.format === 'string' ? payload.format : 'csv';

        return apiClient.post(url, payload, {
            responseType: format === 'csv' ? 'blob' : undefined,
        });
    },
};



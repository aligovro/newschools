export type ReportTypeId =
    | 'revenue'
    | 'members'
    | 'projects'
    | 'comprehensive'
    | 'custom';

export interface ReportTypeDefinition {
    id: ReportTypeId;
    name: string;
    description: string;
    icon: string;
    color: string;
    defaults: Record<string, unknown>;
    groupings?: string[];
}

export interface ReportFiltersState {
    reportType?: ReportTypeId;
    status?: string;
    search?: string;
    period?: string;
    dateFrom?: string | null;
    dateTo?: string | null;
    groupBy?: string | null;
    projectId?: number | null;
    projectStageId?: number | null;
    siteId?: number | null;
    includeInactive?: boolean;
    includeRevenue?: boolean;
    includeMembers?: boolean;
    includeProjects?: boolean;
    includeAnalytics?: boolean;
}

export interface ReportSummary {
    total_amount?: number;
    total_amount_rubles?: number;
    total_transactions?: number;
    average_transaction?: number;
    new_members?: number;
    active_members?: number;
    top_source?: string | null;
    total_projects?: number;
    total_target?: number;
    total_collected?: number;
    overall_progress?: number;
}

export interface ReportRun {
    id: number;
    uuid: string;
    report_id: number | null;
    report_type: ReportTypeId;
    status: string;
    format: string;
    filters: Record<string, unknown>;
    summary: ReportSummary;
    meta: Record<string, unknown>;
    rows_count: number;
    generated_at: string;
    organization?: {
        id: number;
        name: string;
    };
    site?: {
        id: number;
        name: string;
        status?: string;
    } | null;
    report?: {
        id: number;
        title: string;
    };
}

export interface Report {
    id: number;
    uuid: string;
    title: string;
    slug?: string | null;
    description?: string | null;
    report_type: ReportTypeId;
    status: string;
    visibility: string;
    filters: Record<string, unknown>;
    meta: Record<string, unknown>;
    summary: ReportSummary;
    generated_at?: string | null;
    created_at: string;
    updated_at: string;
    project?: {
        id: number;
        title: string;
    } | null;
    project_stage?: {
        id: number;
        title: string;
    } | null;
    runs_count?: number;
    latest_run?: ReportRun | null;
    site?: {
        id: number;
        name: string;
        status?: string;
    } | null;
}

export interface Paginated<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

export interface ProjectOption {
    id: number;
    title: string;
    status: string;
}

export interface ProjectStageOption {
    id: number;
    title: string;
    status: string;
    start_date?: string | null;
    end_date?: string | null;
}

export interface SiteOption {
    id: number;
    name: string;
    status?: string;
}



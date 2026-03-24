import { GalleryModal } from '@/components/main-site/GalleryModal';
import { GallerySlider } from '@/components/main-site/GallerySlider';
import SubscribeSponsorModal from '@/components/main-site/SubscribeSponsorModal';
import ProjectDonationColumn from '@/components/projects/school/ProjectDonationColumn';
import ProjectAboutSchool from '@/components/projects/school/ProjectAboutSchool';
import ProjectExpenseReportsSchool, { type MonthTab, type ExpenseReport } from '@/components/projects/school/ProjectExpenseReportsSchool';
import ProjectGallerySchool from '@/components/projects/school/ProjectGallerySchool';
import ProjectHeroSchool from '@/components/projects/school/ProjectHeroSchool';
import ProjectMonthlyGoalPill from '@/components/projects/school/ProjectMonthlyGoalPill';
import ProjectReferralLeaderboard from '@/components/projects/school/ProjectReferralLeaderboard';
import ProjectSupportersSchool from '@/components/projects/school/ProjectSupportersSchool';
import ProjectTopRegionsSchool, { type RegionEntry } from '@/components/projects/school/ProjectTopRegionsSchool';
import ProjectStageCardSchool from '@/components/projects/school/ProjectStageCardSchool';
import ProjectStatsBar from '@/components/projects/school/ProjectStatsBar';
import { ShareButtonsSchoolWidget } from '@/components/dashboard/widgets/shareButtons/ShareButtonsSchoolWidget';
import ProjectSponsorsSection, {
    type SponsorsPayload,
} from '@/components/projects/ProjectSponsorsSection';
import ProjectTopRecurringSection from '@/components/projects/ProjectTopRecurringSection';
import ProjectStageCard from '@/components/projects/ProjectStageCard';
import MainLayout from '@/layouts/MainLayout';
import type { MoneyAmount } from '@/types/money';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useState, useMemo, type ComponentProps } from 'react';
import { toast } from 'sonner';

// ─── Типы ─────────────────────────────────────────────────────────────────────

interface Organization {
    id: number;
    name: string;
    slug: string;
    address?: string;
    region?: { name: string };
    locality?: { name: string };
}

interface FundingSummary {
    target: MoneyAmount;
    collected: MoneyAmount;
    progress_percentage: number;
}

interface ProjectStage {
    id: number;
    stage_number?: number;
    title: string;
    description?: string;
    image?: string;
    gallery?: string[];
    funding: FundingSummary;
    target_amount_rubles: number;
    collected_amount_rubles: number;
    progress_percentage: number;
    formatted_target_amount: string;
    formatted_collected_amount: string;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
    is_completed: boolean;
    is_active: boolean;
    is_pending: boolean;
    start_date?: string;
    end_date?: string;
    sort_order: number;
}

interface BudgetItem {
    id: number;
    title: string;
    amount_kopecks: number;
    amount_rubles: number;
    formatted_amount: string;
    sort_order: number;
}

interface ReferralEntry {
    position: number;
    referrer_user_id: number;
    name: string;
    days_in_system: number;
    invites_count: number;
    total_amount: number;
    formatted_total_amount: string;
}

interface ReferralLeaderboard {
    data: ReferralEntry[];
    meta: { page: number; per_page: number; total: number; has_more: boolean };
}

interface Project {
    id: number;
    title: string;
    slug: string;
    description?: string;
    short_description?: string;
    image?: string;
    gallery?: string[];
    funding: FundingSummary;
    target_amount_rubles: number;
    collected_amount_rubles: number;
    progress_percentage: number;
    formatted_target_amount?: string;
    formatted_collected_amount?: string;
    has_stages?: boolean;
    stages?: ProjectStage[];
    category?: string;
    start_date?: string;
    end_date?: string;
    monthly_goal_amount?: number | null;
    donors_count?: number;
    top_payment_amount?: number;
    organization?: Organization;
    seo_settings?: Record<string, unknown>;
}

type LayoutProps = ComponentProps<typeof MainLayout>;

interface TopRecurringPayload {
    data: Array<{
        id: string;
        donor_label: string;
        total_amount: number;
        total_amount_formatted: string;
        donations_count: number;
        duration_label: string;
        avatar?: string | null;
    }>;
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

interface ExpenseReportsPayload {
    month_tabs: MonthTab[];
    initial_month: string | null;
    initial_data: ExpenseReport[];
    has_more: boolean;
}

interface TopRegionsPayload {
    data: RegionEntry[];
    has_more: boolean;
    meta: { page: number; per_page: number };
}

interface ProjectShowProps {
    site: LayoutProps['site'];
    positions: LayoutProps['positions'];
    position_settings?: LayoutProps['position_settings'];
    project: Project;
    sponsors: SponsorsPayload;
    topRecurring?: TopRecurringPayload;
    budgetItems?: BudgetItem[];
    monthlyCollected?: number | null;
    referralLeaderboard?: ReferralLeaderboard;
    expenseReports?: ExpenseReportsPayload;
    topRegions?: TopRegionsPayload;
}

// ─── School-layout ────────────────────────────────────────────────────────────

interface SchoolLayoutProps {
    project: Project;
    site: LayoutProps['site'];
    budgetItems: BudgetItem[];
    monthlyCollected: number | null;
    referralLeaderboard: ReferralLeaderboard;
    sponsors: SponsorsPayload;
    topRecurring?: TopRecurringPayload;
    expenseReports?: ExpenseReportsPayload;
    topRegions?: TopRegionsPayload;
    onBecomeSponsor: () => void;
    isSponsorActionLoading: boolean;
}

function ProjectShowSchoolLayout({
    project,
    site,
    budgetItems,
    monthlyCollected,
    referralLeaderboard,
    sponsors,
    topRecurring,
    expenseReports,
    topRegions,
    onBecomeSponsor,
    isSponsorActionLoading,
}: SchoolLayoutProps) {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    const widgets = useMemo(() => site.widgets_config ?? [], [site.widgets_config]);

    return (
        <div className="project-show-school">
            {/* ── Левая колонка ── */}
            <div className="project-show-school__left">

                {/* Hero */}
                <ProjectHeroSchool
                    title={project.title}
                    image={project.image}
                    funding={project.funding}
                    pill={
                        project.monthly_goal_amount != null && project.monthly_goal_amount > 0
                            ? (
                                <ProjectMonthlyGoalPill
                                    monthlyGoalAmount={project.monthly_goal_amount}
                                    monthlyCollected={monthlyCollected ?? null}
                                />
                            )
                            : undefined
                    }
                    share={
                        <ShareButtonsSchoolWidget
                            shareUrl={shareUrl}
                            shareText={project.title}
                        />
                    }
                />

                {/* Статистика: доноры / автоплатежи / топ платёж */}
                <ProjectStatsBar
                    donorsCount={project.donors_count ?? 0}
                    autoPaymentsCount={topRecurring?.pagination?.total ?? 0}
                    topPaymentKopecks={project.top_payment_amount ?? 0}
                />

                {/* О проекте + Статьи расходов */}
                <ProjectAboutSchool
                    description={project.description}
                    budgetItems={budgetItems}
                />

                {/* Фотографии проекта */}
                {project.gallery && project.gallery.length > 0 && (
                    <ProjectGallerySchool images={project.gallery} />
                )}

                {/* Этапы проекта */}
                {project.has_stages && project.stages && project.stages.length > 0 && (
                    <section className="project-stages-school">
                        <h2 className="project-stages-school__heading">Этапы проекта</h2>
                        {project.stages.map((stage, idx) => (
                            <ProjectStageCardSchool
                                key={stage.id}
                                stage={stage}
                                stageIndex={idx}
                            />
                        ))}
                    </section>
                )}

                {/* Поддерживают проект (спонсоры) */}
                <ProjectSupportersSchool
                    projectSlug={project.slug}
                    initialData={sponsors?.data ?? []}
                    initialPagination={
                        sponsors?.pagination ?? {
                            current_page: 1,
                            last_page: 1,
                            per_page: 6,
                            total: 0,
                        }
                    }
                />

                {/* Рейтинг по приглашениям */}
                {project.organization?.id && referralLeaderboard.data.length > 0 && (
                    <ProjectReferralLeaderboard
                        organizationId={project.organization.id}
                        initialData={referralLeaderboard.data}
                        initialMeta={referralLeaderboard.meta}
                    />
                )}

                {/* Топ регионов поддержки */}
                {topRegions && topRegions.data.length > 0 && project.id && (
                    <ProjectTopRegionsSchool
                        projectId={project.id}
                        initialData={topRegions.data}
                        initialHasMore={topRegions.has_more}
                        initialPage={topRegions.meta.page}
                        perPage={topRegions.meta.per_page}
                    />
                )}

                {/* Отчёты по расходам */}
                {expenseReports && expenseReports.month_tabs.length > 0 && project.id && (
                    <ProjectExpenseReportsSchool
                        projectId={project.id}
                        monthTabs={expenseReports.month_tabs}
                        initialMonth={expenseReports.initial_month}
                        initialData={expenseReports.initial_data}
                        initialHasMore={expenseReports.has_more}
                    />
                )}
            </div>

            {/* ── Правая колонка: форма пожертвования ── */}
            <ProjectDonationColumn widgets={widgets} />
        </div>
    );
}

// ─── Основная страница ────────────────────────────────────────────────────────

export default function ProjectShow({
    site,
    positions,
    position_settings = [],
    project,
    sponsors,
    topRecurring,
    budgetItems = [],
    monthlyCollected = null,
    referralLeaderboard = { data: [], meta: { page: 1, per_page: 6, total: 0, has_more: false } },
    expenseReports,
    topRegions,
}: ProjectShowProps) {
    const [galleryModalOpen, setGalleryModalOpen] = useState(false);
    const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);
    const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
    const [isSponsorActionLoading, setIsSponsorActionLoading] = useState(false);

    const { props } = usePage<{ auth?: { user?: any } }>();
    const currentUser = props.auth?.user ?? null;
    const isSchool = site.template === 'school';

    const organizationForModal = useMemo(
        () =>
            project.organization
                ? { id: project.organization.id, name: project.organization.name }
                : null,
        [project.organization],
    );

    const handleImageClick = (index: number) => {
        setGalleryInitialIndex(index);
        setGalleryModalOpen(true);
    };

    const handleBecomeSponsor = async () => {
        if (!organizationForModal) {
            toast.error('Организация проекта не найдена');
            return;
        }

        if (currentUser) {
            try {
                setIsSponsorActionLoading(true);
                await axios.post(
                    '/api/auth/phone/attach',
                    { organization_id: organizationForModal.id, project_id: project.id },
                    { withCredentials: true },
                );
                toast.success('Вы подключены как спонсор проекта!');
            } catch (error: any) {
                toast.error(
                    error?.response?.data?.message ||
                        'Не удалось оформить спонсорство. Попробуйте позже.',
                );
            } finally {
                setIsSponsorActionLoading(false);
            }
            return;
        }

        setIsSponsorModalOpen(true);
    };

    // SEO: seo_settings + fallback на данные проекта
    const seoOverrides = useMemo((): Record<string, unknown> => {
        const base: Record<string, unknown> = { ...(project.seo_settings || {}) };
        if (!base['seo_title'])       base['seo_title']       = project.title;
        if (!base['seo_description']) base['seo_description'] = project.short_description || project.description || '';
        if (!base['og_title'])        base['og_title']        = project.title;
        if (!base['og_description'])  base['og_description']  = project.short_description || project.description || '';
        if (!base['og_image']) {
            const img = project.image ?? project.gallery?.[0];
            if (img) base['og_image'] = img;
        }
        return base;
    }, [project]);

    return (
        <MainLayout
            site={site}
            positions={positions}
            position_settings={position_settings}
            pageTitle={project.title}
            pageDescription={project.short_description}
            seoOverrides={seoOverrides}
            breadcrumbs={[
                { title: 'Главная', href: '/' },
                { title: 'Проекты', href: '/projects' },
                { title: project.title, href: '' },
            ]}
        >
            {/* ── School-template: собственный двухколоночный layout ── */}
            {isSchool ? (
                <ProjectShowSchoolLayout
                    project={project}
                    site={site}
                    budgetItems={budgetItems}
                    monthlyCollected={monthlyCollected}
                    referralLeaderboard={referralLeaderboard}
                    sponsors={sponsors}
                    topRecurring={topRecurring}
                    expenseReports={expenseReports}
                    topRegions={topRegions}
                    onBecomeSponsor={handleBecomeSponsor}
                    isSponsorActionLoading={isSponsorActionLoading}
                />
            ) : (
                /* ── Default-template: оригинальный layout ── */
                <div className="space-y-8">
                    {project.gallery && project.gallery.length > 0 && (
                        <div>
                            <GallerySlider
                                images={project.gallery}
                                onImageClick={handleImageClick}
                            />
                            <GalleryModal
                                isOpen={galleryModalOpen}
                                images={project.gallery}
                                initialIndex={galleryInitialIndex}
                                onClose={() => setGalleryModalOpen(false)}
                            />
                        </div>
                    )}

                    <h1 className="page__title project-show__title">{project.title}</h1>

                    {project.organization && (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <img src="/icons/map.svg" alt="" className="h-4 w-4 flex-shrink-0" />
                                <span className="project-show__org-info">
                                    <Link
                                        href={`/organization/${project.organization.slug}`}
                                        className="hover:text-blue-600"
                                    >
                                        {project.organization.name}
                                    </Link>
                                    {project.organization.locality?.name && (
                                        <> · {project.organization.locality.name}</>
                                    )}
                                    {project.organization.address && (
                                        <>
                                            {project.organization.locality?.name ? ', ' : ' · '}
                                            {project.organization.address}
                                        </>
                                    )}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={handleBecomeSponsor}
                                disabled={isSponsorActionLoading}
                                className="project-show__cta inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-wait disabled:opacity-70"
                            >
                                {isSponsorActionLoading ? (
                                    'Подключаем...'
                                ) : (
                                    <>
                                        Стать спонсором
                                        <img src="/icons/heart-white.svg" alt="" className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {!project.gallery && project.image && (
                        <div className="mb-6">
                            <img
                                src={project.image}
                                alt={project.title}
                                className="h-64 w-full rounded-lg object-cover"
                            />
                        </div>
                    )}

                    {project.description && (
                        <div
                            className="prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: project.description }}
                        />
                    )}

                    {project.has_stages && project.stages && project.stages.length > 0 && (
                        <div className="mt-8">
                            <h3 className="mb-6 text-xl font-semibold text-gray-900">Этапы проекта</h3>
                            <div className="space-y-6">
                                {project.stages.map((stage) => (
                                    <ProjectStageCard key={stage.id} stage={stage} />
                                ))}
                            </div>
                        </div>
                    )}

                    <ProjectSponsorsSection
                        projectSlug={project.slug}
                        initialData={sponsors?.data ?? []}
                        initialPagination={
                            sponsors?.pagination ?? {
                                current_page: 1,
                                last_page: 1,
                                per_page: 6,
                                total: 0,
                            }
                        }
                        initialSort={sponsors?.sort ?? 'top'}
                    />

                    <ProjectTopRecurringSection
                        projectSlug={project.slug}
                        initialData={topRecurring?.data}
                        initialPagination={topRecurring?.pagination}
                    />
                </div>
            )}

            {/* Модалка спонсора — общая для обоих шаблонов */}
            {organizationForModal && (
                <SubscribeSponsorModal
                    open={isSponsorModalOpen}
                    onOpenChange={setIsSponsorModalOpen}
                    organization={organizationForModal}
                    projectId={project.id}
                    onCompleted={() => setIsSponsorModalOpen(false)}
                />
            )}
        </MainLayout>
    );
}

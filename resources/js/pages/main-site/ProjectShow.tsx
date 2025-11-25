import { GalleryModal } from '@/components/main-site/GalleryModal';
import { GallerySlider } from '@/components/main-site/GallerySlider';
import SubscribeSponsorModal from '@/components/main-site/SubscribeSponsorModal';
import ProjectSponsorsSection, {
    type SponsorsPayload,
} from '@/components/projects/ProjectSponsorsSection';
import ProjectStageCard from '@/components/projects/ProjectStageCard';
import MainLayout from '@/layouts/MainLayout';
import type { MoneyAmount } from '@/types/money';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useState, type ComponentProps } from 'react';
import { toast } from 'sonner';

interface Organization {
    id: number;
    name: string;
    slug: string;
    address?: string;
    region?: {
        name: string;
    };
    locality?: {
        name: string;
    };
}

interface FundingSummary {
    target: MoneyAmount;
    collected: MoneyAmount;
    progress_percentage: number;
}

interface ProjectStage {
    id: number;
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
    order: number;
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
    beneficiaries?: unknown[];
    progress_updates?: unknown[];
    organization?: Organization;
    seo_settings?: Record<string, unknown>;
}

type LayoutProps = ComponentProps<typeof MainLayout>;

interface ProjectShowProps {
    site: LayoutProps['site'];
    positions: LayoutProps['positions'];
    position_settings?: LayoutProps['position_settings'];
    project: Project;
    sponsors: SponsorsPayload;
}

export default function ProjectShow({
    site,
    positions,
    position_settings = [],
    project,
    sponsors,
}: ProjectShowProps) {
    const [galleryModalOpen, setGalleryModalOpen] = useState(false);
    const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);
    const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
    const [isSponsorActionLoading, setIsSponsorActionLoading] = useState(false);
    const { props } = usePage<{ auth?: { user?: any } }>();
    const currentUser = props.auth?.user || null;

    const handleImageClick = (index: number) => {
        setGalleryInitialIndex(index);
        setGalleryModalOpen(true);
    };

    // Формируем полный адрес организации
    const organizationAddress = project.organization
        ? [
              project.organization.region?.name,
              project.organization.locality?.name,
              project.organization.address,
          ]
              .filter(Boolean)
              .join(', ')
        : null;

    const organizationForModal = project.organization
        ? {
              id: project.organization.id,
              name: project.organization.name,
          }
        : null;

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
                    {
                        organization_id: organizationForModal.id,
                        project_id: project.id,
                    },
                    { withCredentials: true },
                );

                toast.success('Вы подключены как спонсор проекта!');
            } catch (error: any) {
                const message =
                    error?.response?.data?.message ||
                    'Не удалось оформить спонсорство. Попробуйте позже.';
                toast.error(message);
            } finally {
                setIsSponsorActionLoading(false);
            }

            return;
        }

        setIsSponsorModalOpen(true);
    };

    // SEO overrides для проекта: используем seo_settings (если есть) + fallback на данные проекта
    const seoOverrides: Record<string, unknown> = {
        ...(project.seo_settings || {}),
    };

    if (!('seo_title' in seoOverrides) || !seoOverrides['seo_title']) {
        seoOverrides['seo_title'] = project.title;
    }
    if (
        !('seo_description' in seoOverrides) ||
        !seoOverrides['seo_description']
    ) {
        seoOverrides['seo_description'] =
            project.short_description || project.description || '';
    }
    if (!('og_title' in seoOverrides) || !seoOverrides['og_title']) {
        seoOverrides['og_title'] = project.title;
    }
    if (
        !('og_description' in seoOverrides) ||
        !seoOverrides['og_description']
    ) {
        seoOverrides['og_description'] =
            project.short_description || project.description || '';
    }
    if (!('og_image' in seoOverrides) || !seoOverrides['og_image']) {
        const ogImage =
            project.image ||
            (project.gallery && project.gallery.length > 0
                ? project.gallery[0]
                : undefined);
        if (ogImage) {
            seoOverrides['og_image'] = ogImage;
        }
    }

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
            <div className="space-y-8">
                {/* Слайдер галереи */}
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

                {/* Заголовок с названием проекта */}
                <h1 className="page__title project-show__title">
                    {project.title}
                </h1>

                {project.organization && (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <img
                                src="/icons/map.svg"
                                alt=""
                                className="h-4 w-4 flex-shrink-0"
                            />
                            <span className="project-show__org-info">
                                <Link
                                    href={`/organization/${project.organization.slug}`}
                                    className="hover:text-blue-600"
                                >
                                    {project.organization.name}
                                </Link>
                                {project.organization.locality?.name && (
                                    <>
                                        {' · '}
                                        {project.organization.locality.name}
                                    </>
                                )}
                                {project.organization.address && (
                                    <>
                                        {project.organization.locality?.name
                                            ? ', '
                                            : ' · '}
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
                                    <img
                                        src="/icons/heart-white.svg"
                                        alt=""
                                        className="ml-2 h-4 w-4"
                                    />
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
                        dangerouslySetInnerHTML={{
                            __html: project.description,
                        }}
                    />
                )}

                {project.has_stages &&
                    project.stages &&
                    project.stages.length > 0 && (
                        <div className="mt-8">
                            <h3 className="mb-6 text-xl font-semibold text-gray-900">
                                Этапы проекта
                            </h3>
                            <div className="space-y-6">
                                {project.stages.map((stage) => (
                                    <ProjectStageCard
                                        key={stage.id}
                                        stage={stage}
                                    />
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

                {organizationForModal && (
                    <SubscribeSponsorModal
                        open={isSponsorModalOpen}
                        onOpenChange={setIsSponsorModalOpen}
                        organization={organizationForModal}
                        projectId={project.id}
                        onCompleted={() => {
                            setIsSponsorModalOpen(false);
                        }}
                    />
                )}
            </div>
        </MainLayout>
    );
}

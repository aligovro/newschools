import { Breadcrumbs } from '@/components/breadcrumbs';
import { GalleryModal } from '@/components/main-site/GalleryModal';
import { GallerySlider } from '@/components/main-site/GallerySlider';
import ProjectStageCard from '@/components/projects/ProjectStageCard';
import MainLayout from '@/layouts/MainLayout';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

interface Organization {
    id: number;
    name: string;
    slug: string;
    address?: string;
    region?: {
        name: string;
    };
    city?: {
        name: string;
    };
}

interface ProjectStage {
    id: number;
    title: string;
    description?: string;
    image?: string;
    gallery?: string[];
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
    beneficiaries?: any[];
    progress_updates?: any[];
    organization?: Organization;
}

interface ProjectShowProps {
    site: any;
    positions: any[];
    position_settings?: any[];
    project: Project;
}

export default function ProjectShow({
    site,
    positions,
    position_settings = [],
    project,
}: ProjectShowProps) {
    const [galleryModalOpen, setGalleryModalOpen] = useState(false);
    const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);

    const handleImageClick = (index: number) => {
        setGalleryInitialIndex(index);
        setGalleryModalOpen(true);
    };

    // Формируем полный адрес организации
    const organizationAddress = project.organization
        ? [
              project.organization.region?.name,
              project.organization.city?.name,
              project.organization.address,
          ]
              .filter(Boolean)
              .join(', ')
        : null;

    return (
        <MainLayout
            site={site}
            positions={positions}
            position_settings={position_settings}
            pageTitle={project.title}
            pageDescription={project.short_description}
        >
            <div className="space-y-8">
                {/* Хлебные крошки */}
                <Breadcrumbs
                    breadcrumbs={[
                        { title: 'Главная', href: '/' },
                        { title: 'Проекты', href: '/projects' },
                        { title: project.title, href: '' },
                    ]}
                />

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
                <h1
                    style={{
                        fontFamily: 'var(--font-family)',
                        fontWeight: 700,
                        fontSize: '40px',
                        lineHeight: '120%',
                        color: '#1a1a1a',
                    }}
                >
                    {project.title}
                </h1>

                {/* Адрес организации */}
                {organizationAddress && (
                    <div className="flex items-center gap-2">
                        <img
                            src="/icons/map.svg"
                            alt=""
                            className="h-4 w-4 flex-shrink-0"
                        />
                        <span
                            style={{
                                fontFamily: 'var(--font-family)',
                                fontWeight: 600,
                                fontSize: '12px',
                                lineHeight: '120%',
                                letterSpacing: '0.01em',
                                color: '#1a1a1a',
                            }}
                        >
                            {organizationAddress}
                        </span>
                    </div>
                )}

                {project.organization && (
                    <p className="mb-4 text-gray-600">
                        <Link
                            href={`/organization/${project.organization.slug}`}
                            className="hover:text-blue-600"
                        >
                            {project.organization.name}
                        </Link>
                    </p>
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
            </div>
        </MainLayout>
    );
}

import { GalleryModal } from '@/components/main-site/GalleryModal';
import { GallerySlider } from '@/components/main-site/GallerySlider';
import ProjectCard from '@/components/projects/ProjectCard';
import MainLayout from '@/layouts/MainLayout';
import { useState } from 'react';
import type { MoneyAmount } from '@/types/money';

interface Project {
    id: number;
    title: string;
    slug: string;
    description?: string;
    image?: string;
    target_amount_rubles: number;
    collected_amount_rubles: number;
    progress_percentage: number;
}

interface Organization {
    id: number;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    gallery?: string[];
    address?: string;
    region?: {
        name: string;
    };
    city?: {
        name: string;
    };
    type: string;
    projects?: Project[];
    needs?: {
        target: MoneyAmount;
        collected: MoneyAmount;
        progress_percentage: number;
    };
}

interface OrganizationShowProps {
    site: any;
    positions: any[];
    position_settings?: any[];
    organization: Organization;
}

export default function OrganizationShow({
    site,
    positions,
    position_settings = [],
    organization,
}: OrganizationShowProps) {
    const [galleryModalOpen, setGalleryModalOpen] = useState(false);
    const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);

    const handleImageClick = (index: number) => {
        setGalleryInitialIndex(index);
        setGalleryModalOpen(true);
    };

    // Формируем полный адрес
    const fullAddress = [
        organization.region?.name,
        organization.city?.name,
        organization.address,
    ]
        .filter(Boolean)
        .join(', ');

    return (
        <MainLayout
            site={site}
            positions={positions}
            position_settings={position_settings}
            pageTitle={organization.name}
            pageDescription={organization.description}
            breadcrumbs={[
                { title: 'Главная', href: '/' },
                { title: 'Школы', href: '/organizations' },
                { title: organization.name, href: '' },
            ]}
        >
            <div className="space-y-8">
                {/* Слайдер галереи */}
                {organization.gallery && organization.gallery.length > 0 && (
                    <div>
                        <GallerySlider
                            images={organization.gallery}
                            onImageClick={handleImageClick}
                        />
                        <GalleryModal
                            isOpen={galleryModalOpen}
                            images={organization.gallery}
                            initialIndex={galleryInitialIndex}
                            onClose={() => setGalleryModalOpen(false)}
                        />
                    </div>
                )}

                {/* Заголовок с названием организации */}
                <h1
                    style={{
                        fontFamily: 'var(--font-family)',
                        fontWeight: 700,
                        fontSize: '40px',
                        lineHeight: '120%',
                        color: '#1a1a1a',
                    }}
                >
                    {organization.name}
                </h1>

                {/* Адрес школы */}
                {fullAddress && (
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
                            {fullAddress}
                        </span>
                    </div>
                )}

                {/* Описание организации */}
                {organization.description && (
                    <p className="mt-4 text-gray-600">
                        {organization.description}
                    </p>
                )}

                {/* Проекты */}
                {organization.projects && organization.projects.length > 0 && (
                    <div className="mt-8">
                        <h2 className="mb-6 text-2xl font-bold text-gray-900">
                            Проекты
                        </h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {organization.projects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

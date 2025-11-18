import OrganizationAlumniSection, {
    type AlumniPayload,
} from '@/components/alumni/OrganizationAlumniSection';
import { GalleryModal } from '@/components/main-site/GalleryModal';
import { GallerySlider } from '@/components/main-site/GallerySlider';
import ProjectWideCard from '@/components/projects/ProjectWideCard';
import SponsorsSection, {
    createEmptyPagination,
    type SponsorsPayload,
} from '@/components/sponsors/SponsorsSection';
import MainLayout from '@/layouts/MainLayout';
import type { MoneyAmount } from '@/types/money';
import '@css/pages/organizations/organization-show.scss';
import { useState } from 'react';

interface Project {
    id: number;
    title: string;
    slug: string;
    description?: string;
    image?: string;
    target_amount_rubles: number;
    collected_amount_rubles: number;
    progress_percentage: number;
    organization_name?: string;
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
    stats?: {
        alumni?: number;
        sponsors?: number;
        autopayments?: number;
        projects?: number;
    };
    director?: {
        full_name?: string;
        photo?: string | null;
    } | null;
}

interface OrganizationShowProps {
    site: any;
    positions: any[];
    position_settings?: any[];
    organization: Organization;
    sponsors: SponsorsPayload | null;
    alumni: AlumniPayload | null;
    seo?: any;
}

export default function OrganizationShow({
    site,
    positions,
    position_settings = [],
    organization,
    sponsors,
    alumni,
    seo,
}: OrganizationShowProps) {
    const [galleryModalOpen, setGalleryModalOpen] = useState(false);
    const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);

    const formatNumber = (value?: number) =>
        new Intl.NumberFormat('ru-RU').format(value ?? 0);

    const hasSponsors =
        !!sponsors &&
        Array.isArray(sponsors.data) &&
        (sponsors.pagination?.total ?? sponsors.data.length) > 0;

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
            seo={seo}
            pageTitle={organization.name}
            pageDescription={organization.description}
            breadcrumbs={[
                { title: 'Главная', href: '/' },
                { title: 'Школы', href: '/organizations' },
                { title: organization.name, href: '' },
            ]}
        >
            <div className="organization-show space-y-8">
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
                <h1 className="page__title organization-show__title">
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
                        <span className="organization-show__address">
                            {fullAddress}
                        </span>
                    </div>
                )}

                <div className="organization-show__stats">
                    {[
                        {
                            label: 'Выпускники',
                            value: formatNumber(organization.stats?.alumni),
                            icon: '/icons/organization/graduates.svg',
                        },
                        {
                            label: 'Спонсоры',
                            value: formatNumber(organization.stats?.sponsors),
                            icon: '/icons/organization/sponsors.svg',
                        },
                        {
                            label: 'Автоплатежи',
                            value: formatNumber(
                                organization.stats?.autopayments,
                            ),
                            icon: '/icons/organization/auto-payments.svg',
                        },
                        {
                            label: 'Проекты',
                            value: formatNumber(organization.stats?.projects),
                            icon: '/icons/organization/projects.svg',
                        },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="organization-show__stat-card"
                        >
                            <img
                                src={stat.icon}
                                alt=""
                                className="organization-show__stat-icon"
                            />
                            <div className="organization-show__stat-label">
                                {stat.label}
                            </div>
                            <div className="organization-show__stat-value">
                                {stat.value}
                            </div>
                        </div>
                    ))}

                    {organization.director && (
                        <div className="organization-show__director-card">
                            <div className="organization-show__director-avatar">
                                {organization.director.photo ? (
                                    <img
                                        src={organization.director.photo}
                                        alt={organization.director.full_name}
                                        className="organization-show__director-photo"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-500">
                                        {organization.director.full_name
                                            ?.charAt(0)
                                            .toUpperCase() || '—'}
                                    </div>
                                )}
                            </div>
                            <div className="organization-show__director-info">
                                <div className="organization-show__director-label">
                                    Директор школы
                                </div>
                                <div className="organization-show__director-name">
                                    {organization.director.full_name}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Описание организации */}
                {organization.description && (
                    <p className="mt-4 text-gray-600">
                        {organization.description}
                    </p>
                )}

                {hasSponsors && (
                    <SponsorsSection
                        title="Спонсоры школы"
                        fetchEndpoint={`/organization/${organization.slug}/sponsors`}
                        initialData={sponsors.data}
                        initialPagination={
                            sponsors.pagination ?? createEmptyPagination()
                        }
                        initialSort={sponsors.sort ?? 'top'}
                    />
                )}

                <OrganizationAlumniSection
                    fetchEndpoint={`/organization/${organization.slug}/alumni`}
                    initialData={alumni?.data ?? []}
                    initialPagination={
                        alumni?.pagination ?? createEmptyPagination()
                    }
                    emptyStateMessage="Выпускники школы ещё не отображаются. Станьте первым, кто расскажет свою историю."
                />

                {/* Проекты */}
                {organization.projects && organization.projects.length > 0 && (
                    <div className="mt-8">
                        <h2 className="block__title">Проекты</h2>
                        <div className="space-y-6">
                            {organization.projects.map((project) => (
                                <ProjectWideCard
                                    key={project.id}
                                    project={{
                                        ...project,
                                        organization_name: organization.name,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

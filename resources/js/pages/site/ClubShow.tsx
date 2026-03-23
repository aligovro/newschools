import { ClubSignUpModal } from '@/components/dashboard/widgets/ClubSignUpModal';
import type { WidgetData, WidgetPosition } from '@/components/dashboard/site-builder/types';
import { submitClubApplication } from '@/lib/api/public';
import MainLayout from '@/layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { useState, useCallback } from 'react';

interface ClubSchedule {
    mon?: string | null;
    tue?: string | null;
    wed?: string | null;
    thu?: string | null;
    fri?: string | null;
    sat?: string | null;
    sun?: string | null;
}

const DAY_LABELS: Record<keyof ClubSchedule, string> = {
    mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт',
    fri: 'Пт', sat: 'Сб', sun: 'Вс',
};

interface ClubData {
    id: number;
    name: string;
    description?: string | null;
    image?: string | null;
    schedule?: ClubSchedule | null;
    organization?: {
        id: number;
        name: string;
        phone?: string | null;
    } | null;
}

interface Site {
    id: number;
    name: string;
    slug: string;
    description?: string;
    favicon?: string;
    template: string;
    site_type: 'main' | 'organization';
    widgets_config: WidgetData[];
    seo_config?: Record<string, unknown>;
    layout_config?: { sidebar_position?: 'left' | 'right' };
    custom_css?: string | null;
}

interface Props {
    site: Site;
    club: ClubData;
    positions?: WidgetPosition[];
    position_settings?: Array<{
        position_slug: string;
        visibility_rules?: Record<string, unknown>;
        layout_overrides?: Record<string, unknown>;
    }>;
    seo?: {
        title?: string;
        description?: string;
        og_image?: string;
    };
}

export default function ClubShow({
    site,
    club,
    positions = [],
    position_settings = [],
    seo,
}: Props) {
    const [modalOpen, setModalOpen] = useState(false);

    const handleSignUpSubmit = useCallback(
        async (payload: import('@/components/dashboard/widgets/ClubSignUpModal').ClubSignUpPayload) => {
            await submitClubApplication({
                club_id:         payload.clubId,
                organization_id: payload.organizationId,
                club_name:       payload.clubName,
                name:            payload.name,
                phone:           payload.phone,
                comment:         payload.comment,
            });
        },
        [],
    );

    const scheduleEntries = club.schedule
        ? (Object.entries(DAY_LABELS) as [keyof ClubSchedule, string][]).filter(
              ([day]) => club.schedule![day] && String(club.schedule![day]).trim(),
          )
        : [];

    const pageTitle = seo?.title ?? `${club.name} — ${site.name}`;
    const pageDescription = seo?.description ?? '';

    return (
        <MainLayout
            site={site}
            positions={positions}
            position_settings={position_settings}
            seo={seo}
            pageTitle={pageTitle}
            pageDescription={pageDescription}
            breadcrumbs={[
                { title: 'Главная', href: '/' },
                { title: 'Кружки и секции', href: '/#clubs-all' },
                { title: club.name, href: '' },
            ]}
        >
            <Head title={pageTitle} />

            <article className="club-show w-full">
                {/* Обложка */}
                {club.image && (
                    <div className="club-show__image-wrap">
                        <img
                            src={club.image}
                            alt={club.name}
                            className="club-show__image"
                            loading="eager"
                        />
                    </div>
                )}

                <div className="club-show__body">
                    <header className="club-show__header">
                        <h1 className="club-show__title">{club.name}</h1>
                        {club.organization && (
                            <p className="club-show__org">{club.organization.name}</p>
                        )}
                    </header>

                    {/* Расписание */}
                    {scheduleEntries.length > 0 && (
                        <section className="club-show__schedule">
                            <h2 className="club-show__section-title">Расписание</h2>
                            <ul className="club-show__schedule-list">
                                {scheduleEntries.map(([day, label]) => (
                                    <li key={day} className="club-show__schedule-item">
                                        <span className="club-show__schedule-day">{label}</span>
                                        <span className="club-show__schedule-time">
                                            {club.schedule![day]}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Описание */}
                    {club.description && (
                        <section className="club-show__description">
                            <p>{club.description}</p>
                        </section>
                    )}

                    {/* Контакт */}
                    {club.organization?.phone && (
                        <p className="club-show__phone">
                            Телефон:{' '}
                            <a href={`tel:${club.organization.phone}`} className="club-show__phone-link">
                                {club.organization.phone}
                            </a>
                        </p>
                    )}

                    {/* Кнопка записи */}
                    <button
                        type="button"
                        className="club-show__signup-btn"
                        onClick={() => setModalOpen(true)}
                    >
                        Записаться
                    </button>
                </div>
            </article>

            <ClubSignUpModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                club={{ id: club.id, name: club.name }}
                organizationId={club.organization?.id}
                onSubmit={handleSignUpSubmit}
            />
        </MainLayout>
    );
}

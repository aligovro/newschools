import type { ClubPublicView } from '@/components/clubs/clubPublicTypes';
import ClubShowSchoolLayout from '@/components/clubs/school/ClubShowSchoolLayout';
import { ClubSignUpModal } from '@/components/dashboard/widgets/ClubSignUpModal';
import type { WidgetData, WidgetPosition } from '@/components/dashboard/site-builder/types';
import type { ClubScheduleMap } from '@/components/clubs/school/ClubScheduleBoard';
import type { ClubSignUpPayload } from '@/components/clubs/clubSignUpTypes';
import { submitClubApplication } from '@/lib/api/public';
import MainLayout from '@/layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { useCallback, useState } from 'react';

const DAY_LABELS: Record<keyof ClubScheduleMap, string> = {
    mon: 'Пн',
    tue: 'Вт',
    wed: 'Ср',
    thu: 'Чт',
    fri: 'Пт',
    sat: 'Сб',
    sun: 'Вс',
};

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
    club: ClubPublicView;
    related_clubs?: ClubPublicView[];
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
    related_clubs = [],
    positions = [],
    position_settings = [],
    seo,
}: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const isSchool = site.template === 'school';

    const handleSignUpSubmit = useCallback(async (payload: ClubSignUpPayload) => {
        await submitClubApplication({
            club_id: payload.clubId,
            organization_id: payload.organizationId,
            club_name: payload.clubName,
            name: payload.name,
            phone: payload.phone,
            email: payload.email,
            comment: payload.comment,
        });
    }, []);

    const scheduleEntries = club.schedule
        ? (Object.entries(DAY_LABELS) as [keyof ClubScheduleMap, string][]).filter(
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
            fullWidthMainContent={isSchool}
            breadcrumbs={[
                { title: 'Главная', href: '/' },
                { title: 'Кружки и секции', href: '/clubs' },
                { title: club.name, href: '' },
            ]}
        >
            <Head title={pageTitle} />

            {isSchool ? (
                <ClubShowSchoolLayout
                    club={club}
                    onSignUpSubmit={handleSignUpSubmit}
                    relatedClubs={related_clubs}
                />
            ) : (
                <article className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
                    {club.image && (
                        <div className="overflow-hidden rounded-2xl">
                            <img
                                src={club.image}
                                alt={club.name}
                                className="max-h-[420px] w-full object-cover"
                                loading="eager"
                            />
                        </div>
                    )}

                    <header className="space-y-1">
                        <h1 className="text-3xl font-bold text-neutral-900">{club.name}</h1>
                        {club.organization && (
                            <p className="text-sm text-neutral-600">{club.organization.name}</p>
                        )}
                    </header>

                    {scheduleEntries.length > 0 && (
                        <section>
                            <h2 className="mb-3 text-lg font-semibold">Расписание</h2>
                            <ul className="space-y-2">
                                {scheduleEntries.map(([day, label]) => (
                                    <li key={day} className="flex gap-4 text-sm">
                                        <span className="w-8 font-semibold">{label}</span>
                                        <span className="text-neutral-600">{club.schedule![day]}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {club.description && (
                        <section className="prose prose-neutral max-w-none text-neutral-800">
                            <p className="whitespace-pre-wrap">{club.description}</p>
                        </section>
                    )}

                    {club.gallery && club.gallery.length > 0 && (
                        <section>
                            <h2 className="mb-3 text-lg font-semibold">Галерея</h2>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {club.gallery.map((src, i) => (
                                    <img
                                        key={i}
                                        src={src}
                                        alt=""
                                        className="aspect-video w-full rounded-lg object-cover"
                                        loading="lazy"
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {club.organization?.phone && (
                        <p className="text-sm text-neutral-600">
                            Телефон:{' '}
                            <a
                                href={`tel:${club.organization.phone}`}
                                className="font-semibold text-neutral-900 underline"
                            >
                                {club.organization.phone}
                            </a>
                        </p>
                    )}

                    <button
                        type="button"
                        className="inline-flex rounded-full bg-blue-600 px-7 py-3.5 text-sm font-bold text-white hover:bg-blue-700"
                        onClick={() => setModalOpen(true)}
                    >
                        Записаться
                    </button>
                </article>
            )}

            {!isSchool && (
                <ClubSignUpModal
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                    club={{ id: club.id, name: club.name }}
                    organizationId={club.organization?.id}
                    onSubmit={handleSignUpSubmit}
                />
            )}
        </MainLayout>
    );
}

import type { ClubPublicView } from '@/components/clubs/clubPublicTypes';
import { ClubSignUpForm } from '@/components/clubs/ClubSignUpForm';
import ClubHeroSchool from '@/components/clubs/school/ClubHeroSchool';
import ClubScheduleBoard from '@/components/clubs/school/ClubScheduleBoard';
import ProjectGallerySchool from '@/components/projects/school/ProjectGallerySchool';
import type { ClubSignUpPayload } from '@/components/clubs/clubSignUpTypes';
import { scheduleTimeGroups } from '@/lib/clubSchedule';
import React from 'react';

interface Props {
    club: ClubPublicView;
    onSignUpSubmit: (payload: ClubSignUpPayload) => void | Promise<void>;
}

const ClubShowSchoolLayout: React.FC<Props> = ({ club, onSignUpSubmit }) => {
    const groups = scheduleTimeGroups(club.schedule ?? undefined);
    const scheduleChips = groups.map((g) => `${g.time} — ${g.days.join(', ')}`);

    const hasDescription = !!club.description?.trim();

    return (
        <div className="club-show-school">
            <div className="club-show-school__left">
                <ClubHeroSchool
                    title={club.name}
                    image={club.image}
                    scheduleChips={scheduleChips}
                />

                {hasDescription && (
                    <section className="club-about-card" aria-labelledby="club-about-heading">
                        <h2 id="club-about-heading" className="club-about-card__title">
                            О секции
                        </h2>
                        <div className="club-about-card__body whitespace-pre-wrap">
                            {club.description}
                        </div>
                    </section>
                )}

                <ClubScheduleBoard schedule={club.schedule} />

                {club.gallery && club.gallery.length > 0 && (
                    <ProjectGallerySchool
                        images={club.gallery}
                        heading="Галерея секции"
                        imageAltPrefix="Фото секции"
                    />
                )}

                {club.organization?.phone && (
                    <p className="club-show-school__phone">
                        Телефон:{' '}
                        <a
                            href={`tel:${club.organization.phone}`}
                            className="club-show-school__phone-link"
                        >
                            {club.organization.phone}
                        </a>
                    </p>
                )}
            </div>

            <aside className="club-show-school__right">
                <div className="club-show-school__signup-card">
                    <ClubSignUpForm
                        variant="sidebar"
                        club={{ id: club.id, name: club.name }}
                        organizationId={club.organization?.id}
                        onSubmit={onSignUpSubmit}
                    />
                </div>
            </aside>
        </div>
    );
};

export default React.memo(ClubShowSchoolLayout);

import type { ClubPublicView } from '@/components/clubs/clubPublicTypes';
import { ClubSignUpForm } from '@/components/clubs/ClubSignUpForm';
import type { ClubSignUpPayload } from '@/components/clubs/clubSignUpTypes';
import ClubHeroSchool from '@/components/clubs/school/ClubHeroSchool';
import ClubScheduleBoard from '@/components/clubs/school/ClubScheduleBoard';
import ClubsRelatedSchool from '@/components/clubs/school/ClubsRelatedSchool';
import ProjectGallerySchool from '@/components/projects/school/ProjectGallerySchool';
import { scheduleTimeGroups } from '@/lib/clubSchedule';
import React from 'react';

interface Props {
    club: ClubPublicView;
    onSignUpSubmit: (payload: ClubSignUpPayload) => void | Promise<void>;
    relatedClubs?: ClubPublicView[];
}

const ClubShowSchoolLayout: React.FC<Props> = ({
    club,
    onSignUpSubmit,
    relatedClubs = [],
}) => {
    const groups = scheduleTimeGroups(club.schedule ?? undefined);
    const scheduleChips = groups.map((g) => `${g.time} — ${g.days.join(', ')}`);

    const hasDescription = !!club.description?.trim();

    return (
        <>
            <div className="club-show-school">
                <div className="club-show-school__left">
                    <ClubHeroSchool
                        title={club.name}
                        image={club.image}
                        scheduleChips={scheduleChips}
                    />

                    {hasDescription && (
                        <section
                            className="club-about-card"
                            aria-labelledby="club-about-heading"
                        >
                            <h2
                                id="club-about-heading"
                                className="club-about-card__title"
                            >
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

            {relatedClubs.length > 0 && (
                <ClubsRelatedSchool clubs={relatedClubs} />
            )}
        </>
    );
};

export default React.memo(ClubShowSchoolLayout);

import { User } from 'lucide-react';
import React from 'react';
import type { StaffMemberForSchool } from './useTeachersSliderSchool';

interface Props {
    member: StaffMemberForSchool;
}

export const TeachersSliderSchoolCard: React.FC<Props> = ({ member }) => {
    const photoUrl =
        member.photo &&
        !String(member.photo).startsWith('blob:') &&
        String(member.photo).trim()
            ? member.photo
            : null;

    return (
        <article className="teachers-slider-school__card">
            <div className="teachers-slider-school__card-inner">
                <div className="teachers-slider-school__card-image-wrap">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={member.full_name}
                            className="teachers-slider-school__card-image"
                            loading="lazy"
                        />
                    ) : (
                        <div className="teachers-slider-school__card-image-placeholder">
                            <User size={64} strokeWidth={1.5} />
                        </div>
                    )}
                </div>
                <h3 className="teachers-slider-school__card-name">
                    {member.full_name}
                </h3>
                {member.position && (
                    <p className="teachers-slider-school__card-position">
                        {member.position}
                    </p>
                )}
            </div>
        </article>
    );
};

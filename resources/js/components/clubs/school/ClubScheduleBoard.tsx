import type { ClubScheduleDay } from '@/lib/clubSchedule';
import React from 'react';

const DAY_ORDER: ClubScheduleDay[] = [
    'mon',
    'tue',
    'wed',
    'thu',
    'fri',
    'sat',
    'sun',
];

const DAY_LABEL: Record<ClubScheduleDay, string> = {
    mon: 'Пн',
    tue: 'Вт',
    wed: 'Ср',
    thu: 'Чт',
    fri: 'Пт',
    sat: 'Сб',
    sun: 'Вс',
};

export interface ClubScheduleMap {
    mon?: string | null;
    tue?: string | null;
    wed?: string | null;
    thu?: string | null;
    fri?: string | null;
    sat?: string | null;
    sun?: string | null;
}

interface Props {
    schedule: ClubScheduleMap | null | undefined;
}

const ClubScheduleBoard: React.FC<Props> = ({ schedule }) => {
    const entries = DAY_ORDER.map((day) => ({
        day,
        label: DAY_LABEL[day],
        time: schedule?.[day] && String(schedule[day]).trim() ? String(schedule[day]).trim() : null,
    })).filter((e) => e.time);

    if (entries.length === 0) return null;

    return (
        <section className="club-schedule-board" aria-labelledby="club-schedule-heading">
            <h2 id="club-schedule-heading" className="club-schedule-board__title">
                Расписание
            </h2>
            <div className="club-schedule-board__row">
                {entries.map((e, i) => (
                    <React.Fragment key={e.day}>
                        {i > 0 && (
                            <div className="club-schedule-board__divider" aria-hidden />
                        )}
                        <div className="club-schedule-board__cell">
                            <span className="club-schedule-board__day">{e.label}</span>
                            <span className="club-schedule-board__time">{e.time}</span>
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </section>
    );
};

export default React.memo(ClubScheduleBoard);

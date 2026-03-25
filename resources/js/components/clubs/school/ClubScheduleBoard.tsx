import type { ClubScheduleDay } from '@/lib/clubSchedule';
import { parseScheduleDayTime } from '@/lib/clubSchedule';
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

function ScheduleDayTime({ raw }: { raw: string | null }) {
    if (!raw) {
        return (
            <span className="club-schedule-board__time club-schedule-board__time--empty">
                —
            </span>
        );
    }
    const { primary, secondary } = parseScheduleDayTime(raw);
    if (!primary) {
        return (
            <span className="club-schedule-board__time club-schedule-board__time--empty">
                —
            </span>
        );
    }
    return (
        <div className="club-schedule-board__time-stack">
            <span className="club-schedule-board__time-primary">{primary}</span>
            {secondary ? (
                <span className="club-schedule-board__time-secondary">
                    {secondary}
                </span>
            ) : null}
        </div>
    );
}

const ClubScheduleBoard: React.FC<Props> = ({ schedule }) => {
    const hasAny = DAY_ORDER.some((day) => {
        const v = schedule?.[day];
        return v && String(v).trim();
    });

    if (!hasAny) return null;

    const entries = DAY_ORDER.map((day) => {
        const raw = schedule?.[day];
        const time = raw && String(raw).trim() ? String(raw).trim() : null;
        return { day, label: DAY_LABEL[day], time };
    });

    return (
        <section className="club-schedule-board" aria-labelledby="club-schedule-heading">
            <h2 id="club-schedule-heading" className="club-schedule-board__title">
                Расписание
            </h2>
            <div className="club-schedule-board__grid">
                <div className="club-schedule-board__row" role="list">
                    {entries.map((e) => (
                        <div
                            key={e.day}
                            className="club-schedule-board__cell"
                            role="listitem"
                        >
                            <span className="club-schedule-board__day">{e.label}</span>
                            <div className="club-schedule-board__time-block">
                                <ScheduleDayTime raw={e.time} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default React.memo(ClubScheduleBoard);

export type ClubScheduleDay =
    | 'mon'
    | 'tue'
    | 'wed'
    | 'thu'
    | 'fri'
    | 'sat'
    | 'sun';

const DAY_ORDER: ClubScheduleDay[] = [
    'mon',
    'tue',
    'wed',
    'thu',
    'fri',
    'sat',
    'sun',
];

const DAY_SHORT: Record<ClubScheduleDay, string> = {
    mon: 'Пн',
    tue: 'Вт',
    wed: 'Ср',
    thu: 'Чт',
    fri: 'Пт',
    sat: 'Сб',
    sun: 'Вс',
};

/**
 * Группирует дни с одинаковым временем — для чипов на hero (как в макете).
 */
export function scheduleTimeGroups(
    schedule: Partial<Record<ClubScheduleDay, string | null>> | null | undefined,
): { time: string; days: string[] }[] {
    if (!schedule || typeof schedule !== 'object') return [];

    const byTime = new Map<string, ClubScheduleDay[]>();
    for (const day of DAY_ORDER) {
        const raw = schedule[day];
        const t = raw && String(raw).trim();
        if (!t) continue;
        const list = byTime.get(t) ?? [];
        list.push(day);
        byTime.set(t, list);
    }

    return [...byTime.entries()].map(([time, days]) => ({
        time,
        days: days.map((d) => DAY_SHORT[d]),
    }));
}

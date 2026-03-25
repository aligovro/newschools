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

/** Разделители «от–до» в строке расписания (тире, en/em dash, минус). */
const SCHEDULE_TIME_RANGE_SEP = /\s*[–—−\-]\s*/;

/**
 * Разбивает значение дня на время «с» и опционально «до» для отображения в две строки.
 */
export function parseScheduleDayTime(raw: string): {
    primary: string;
    secondary?: string;
} {
    const s = raw.trim();
    if (!s) {
        return { primary: '' };
    }
    const parts = s
        .split(SCHEDULE_TIME_RANGE_SEP)
        .map((p) => p.trim())
        .filter(Boolean);
    if (parts.length >= 2) {
        return { primary: parts[0], secondary: parts[1] };
    }
    return { primary: parts[0] ?? s };
}

/** Shared types and constants for club schedule (schedule widget, clubs slider, etc.) */

export interface ClubSchedule {
    mon?: string | null;
    tue?: string | null;
    wed?: string | null;
    thu?: string | null;
    fri?: string | null;
    sat?: string | null;
    sun?: string | null;
}

export type ClubScheduleDayKey = keyof ClubSchedule;

export interface ClubScheduleItem {
    id: number;
    name: string;
    schedule?: ClubSchedule;
}

export const CLUB_SCHEDULE_DAYS: ReadonlyArray<{ key: ClubScheduleDayKey; label: string }> = [
    { key: 'mon', label: 'Пн' },
    { key: 'tue', label: 'Вт' },
    { key: 'wed', label: 'Ср' },
    { key: 'thu', label: 'Чт' },
    { key: 'fri', label: 'Пт' },
    { key: 'sat', label: 'Сб' },
    { key: 'sun', label: 'Вс' },
];

export function getClubScheduleCellValue(
    schedule: ClubSchedule | undefined | null,
    dayKey: ClubScheduleDayKey
): string {
    const v = schedule?.[dayKey];
    return v != null && String(v).trim() !== '' ? String(v).trim() : '—';
}

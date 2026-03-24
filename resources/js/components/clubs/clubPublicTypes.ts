import type { ClubScheduleMap } from '@/components/clubs/school/ClubScheduleBoard';

export interface ClubPublicView {
    id: number;
    name: string;
    description?: string | null;
    image?: string | null;
    gallery?: string[];
    schedule?: ClubScheduleMap;
    organization?: {
        id: number;
        name: string;
        phone?: string | null;
    } | null;
}

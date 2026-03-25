export interface ClubSignUpPayload {
    clubId: number;
    clubName: string;
    organizationId?: number;
    name: string;
    phone: string;
    email?: string;
    comment?: string;
}

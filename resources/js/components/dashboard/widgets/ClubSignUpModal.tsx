import { ClubSignUpForm } from '@/components/clubs/ClubSignUpForm';
import type { ClubSignUpPayload } from '@/components/clubs/clubSignUpTypes';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import React, { useState } from 'react';

export type { ClubSignUpPayload };

export interface ClubSignUpModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    club: { id: number; name: string };
    organizationId?: number;
    onSubmit?: (payload: ClubSignUpPayload) => void | Promise<void>;
}

export const ClubSignUpModal: React.FC<ClubSignUpModalProps> = ({
    open,
    onOpenChange,
    club,
    organizationId,
    onSubmit,
}) => {
    const [formKey, setFormKey] = useState(0);

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                onOpenChange(o);
                if (o) setFormKey((k) => k + 1);
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Записаться в секцию</DialogTitle>
                    <DialogDescription>{club.name}</DialogDescription>
                </DialogHeader>
                <ClubSignUpForm
                    key={formKey}
                    variant="modal"
                    club={club}
                    organizationId={organizationId}
                    onSubmit={onSubmit}
                    onCancel={() => onOpenChange(false)}
                    onSubmitted={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
};

export default ClubSignUpModal;

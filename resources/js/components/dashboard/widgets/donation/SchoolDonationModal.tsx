import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import { useAppSelector } from '@/store';
import React, { useEffect, useState } from 'react';
import { DonationWidget } from '../DonationWidget';
import type { DonationWidgetConfig } from './types';

const MODAL_DONATION_CONFIG: DonationWidgetConfig = {
    title: 'Помочь сейчас',
    show_title: true,
    show_progress: false,
    default_amount: 2000,
    preset_amounts: [250, 500, 1000],
    button_text: 'Помочь сейчас',
};

export interface SchoolDonationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    organizationId: number;
}

/**
 * Модальное окно пожертвования для шаблона school: тот же поток, что у DonationWidget на странице
 * (оплата, СПБ, счёт), без дублирования логики.
 */
export const SchoolDonationModal: React.FC<SchoolDonationModalProps> = ({
    open,
    onOpenChange,
    organizationId,
}) => {
    const currentSite = useAppSelector((s) => s.sites.currentSite);
    const siteId = currentSite?.id;

    const [shouldMountWidget, setShouldMountWidget] = useState(false);

    useEffect(() => {
        if (open) {
            setShouldMountWidget(true);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="school-donation-modal gap-0 border-0 bg-transparent p-0 shadow-none sm:max-w-[min(540px,calc(100vw-2rem))] [&>button]:z-10 [&>button]:text-[#b5b9c3] [&>button]:hover:text-[#1a1a1a]">
                <DialogTitle className="sr-only">
                    {MODAL_DONATION_CONFIG.title}
                </DialogTitle>
                {shouldMountWidget ? (
                    <div className="site-preview site-template--school school-donation-modal__root max-h-[min(90vh,806px)]">
                        <DonationWidget
                            organizationId={organizationId}
                            publicContext={{
                                organizationId,
                                siteId: siteId ?? undefined,
                            }}
                            config={MODAL_DONATION_CONFIG}
                        />
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
};

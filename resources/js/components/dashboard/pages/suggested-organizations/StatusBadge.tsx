import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, type LucideIcon } from 'lucide-react';

import type { SuggestedOrganizationsStatus } from './types';

const STATUS_CONFIG: Record<
    SuggestedOrganizationsStatus,
    {
        label: string;
        variant: 'default' | 'secondary' | 'outline';
        icon: LucideIcon;
    }
> = {
    pending: {
        label: 'Ожидает рассмотрения',
        variant: 'outline',
        icon: Clock,
    },
    approved: {
        label: 'Одобрена',
        variant: 'default',
        icon: CheckCircle2,
    },
    rejected: {
        label: 'Отклонена',
        variant: 'secondary',
        icon: XCircle,
    },
};

interface StatusBadgeProps {
    status: SuggestedOrganizationsStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
    const Icon = config.icon;

    return (
        <Badge variant={config.variant} className="flex items-center gap-1">
            <Icon className="h-3.5 w-3.5" />
            {config.label}
        </Badge>
    );
};

import { Badge } from '@/components/ui/badge';
import type { OrganizationStatus } from './types';

interface StatusBadgeProps {
    status: OrganizationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const statusConfig = {
        active: { label: 'Активна', variant: 'default' as const },
        inactive: { label: 'Неактивна', variant: 'secondary' as const },
        pending: { label: 'На рассмотрении', variant: 'outline' as const },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
}


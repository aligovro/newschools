import { cn } from '@/lib/utils';

interface LoadMoreButtonProps {
    onClick: () => void;
    isLoading?: boolean;
    hasMore?: boolean;
    className?: string;
}

export default function LoadMoreButton({
    onClick,
    isLoading = false,
    hasMore = true,
    className,
}: LoadMoreButtonProps) {
    if (!hasMore) return null;

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isLoading}
            className={cn('load-more-button', className)}
        >
            {isLoading ? 'Загрузка…' : 'Загрузить ещё'}
        </button>
    );
}

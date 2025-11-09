import '@css/components/main-site/LoadMoreButton.scss';

interface LoadMoreButtonProps {
    onClick: () => void;
    isLoading?: boolean;
    hasMore?: boolean;
}

export default function LoadMoreButton({
    onClick,
    isLoading = false,
    hasMore = true,
}: LoadMoreButtonProps) {
    if (!hasMore) return null;

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isLoading}
            className="load-more-button"
        >
            {isLoading ? 'Загрузка…' : 'Загрузить ещё'}
        </button>
    );
}

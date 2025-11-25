import { useState } from 'react';

interface ShareButtonProps {
    /**
     * Относительный путь ("/news/slug") или полный URL.
     * При копировании всегда превращается в абсолютный URL.
     */
    url: string;
    className?: string;
    successMessage?: string;
}

const buildAbsoluteUrl = (rawUrl: string): string => {
    // Если уже полный URL – возвращаем как есть
    if (/^https?:\/\//i.test(rawUrl)) {
        return rawUrl;
    }

    if (typeof window === 'undefined') {
        return rawUrl;
    }

    try {
        return new URL(rawUrl, window.location.origin).toString();
    } catch {
        return rawUrl;
    }
};

export default function ShareButton({
    url,
    className,
    successMessage = 'Ссылка скопирована в буфер обмена',
}: ShareButtonProps) {
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleShareClick = async () => {
        try {
            const finalUrl = buildAbsoluteUrl(url);
            await navigator.clipboard.writeText(finalUrl);
            setCopied(true);
            setError(null);
            setTimeout(() => setCopied(false), 3000);
        } catch (err) {
            console.error('Failed to copy link', err);
            setError('Не удалось скопировать ссылку');
            setCopied(false);
        }
    };

    const containerClass = ['share-button-container', className]
        .filter(Boolean)
        .join(' ')
        .trim();

    return (
        <div className={containerClass}>
            <button
                className="share-button"
                type="button"
                onClick={handleShareClick}
            >
                <span className="share-button-text">Поделиться</span>
                <img src="/icons/share.svg" alt="" className="share-button-icon" />
            </button>
            <div className="share-button-status" aria-live="polite">
                {copied && (
                    <span className="share-button-success">{successMessage}</span>
                )}
                {error && !copied && (
                    <span className="share-button-error">{error}</span>
                )}
            </div>
        </div>
    );
}


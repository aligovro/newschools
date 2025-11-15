import '@css/components/ui/share-button.scss';
import { useState } from 'react';

interface ShareButtonProps {
    url: string;
    className?: string;
    successMessage?: string;
}

export default function ShareButton({
    url,
    className,
    successMessage = 'Ссылка скопирована в буфер обмена',
}: ShareButtonProps) {
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleShareClick = async () => {
        try {
            await navigator.clipboard.writeText(url);
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
            <button className="share-button" type="button" onClick={handleShareClick}>
                <span className="share-button-text">Поделиться</span>
                <img src="/icons/share.svg" alt="" className="share-button-icon" />
            </button>
            <div className="share-button-status" aria-live="polite">
                {copied && <span className="share-button-success">{successMessage}</span>}
                {error && !copied && <span className="share-button-error">{error}</span>}
            </div>
        </div>
    );
}


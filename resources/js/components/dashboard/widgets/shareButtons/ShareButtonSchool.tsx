import React, { useState } from 'react';
import type { ShareNetworkConfig } from './shareNetworksConfig';

interface Props {
    network: ShareNetworkConfig;
    count: number;
    shareUrl: string;
    shareText: string;
    onShare: (url: string) => void;
    widgetId?: string | number;
}

export const ShareButtonSchool: React.FC<Props> = ({
    network,
    count,
    shareUrl,
    shareText,
    onShare,
    widgetId,
}) => {
    const [displayCount, setDisplayCount] = useState(count);

    const handleClick = () => {
        const url = network.buildUrl(shareUrl, shareText);
        onShare(url);

        if (widgetId) {
            setDisplayCount((c) => c + 1); // оптимистично
            fetch('/api/public/share-click', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ widget_id: widgetId, network: network.id }),
                credentials: 'same-origin',
            })
                .then((r) => r.json())
                .then((data: { count: number }) => setDisplayCount(data.count))
                .catch(() => {}); // счётчик — не критичная функция
        }
    };

    return (
        <button
            type="button"
            className="share-buttons-school__btn"
            onClick={handleClick}
            title={`Поделиться в ${network.label}`}
        >
            <img
                src={network.iconPath}
                alt=""
                className="share-buttons-school__icon"
                width={14}
                height={14}
                loading="lazy"
            />
            {displayCount > 0 && (
                <span className="share-buttons-school__count">{displayCount}</span>
            )}
        </button>
    );
};

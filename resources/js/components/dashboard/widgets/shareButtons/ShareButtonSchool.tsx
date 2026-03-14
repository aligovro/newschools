import React from 'react';
import type { ShareNetworkConfig } from './shareNetworksConfig';

interface Props {
    network: ShareNetworkConfig;
    count: number;
    shareUrl: string;
    shareText: string;
    onShare: (url: string) => void;
}

export const ShareButtonSchool: React.FC<Props> = ({
    network,
    count,
    shareUrl,
    shareText,
    onShare,
}) => {
    const handleClick = () => {
        const url = network.buildUrl(shareUrl, shareText);
        onShare(url);
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
            <span className="share-buttons-school__count">{count}</span>
        </button>
    );
};

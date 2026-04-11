import React from 'react';
import { DEFAULT_NETWORKS, SHARE_NETWORKS } from './shareNetworksConfig';
import { ShareButtonSchool } from './ShareButtonSchool';

interface Props {
    shareUrl: string;
    shareText: string;
    networks?: string[];
    counts?: Record<string, number>;
    slogan?: string;
    showSlogan?: boolean;
    widgetId?: string | number;
}

export const ShareButtonsSchoolWidget: React.FC<Props> = ({
    shareUrl,
    shareText,
    networks = DEFAULT_NETWORKS,
    counts = {},
    slogan,
    showSlogan = false,
    widgetId,
}) => {
    const handleShare = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
    };

    return (
        <div className="share-buttons-school">
            <div className="share-buttons-school__list">
                {networks.map((networkId) => {
                    const network = SHARE_NETWORKS[networkId];
                    if (!network) return null;
                    const count = counts[networkId] ?? 0;
                    return (
                        <ShareButtonSchool
                            key={networkId}
                            network={network}
                            count={count}
                            shareUrl={shareUrl}
                            shareText={shareText}
                            onShare={handleShare}
                            widgetId={widgetId}
                        />
                    );
                })}
            </div>
            {showSlogan && slogan && (
                <div className="share-buttons-school__slogan">{slogan}</div>
            )}
        </div>
    );
};

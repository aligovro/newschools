import React from 'react';
import { WidgetOutputProps } from './types';

interface ShareNetwork {
    id: string;
    label: string;
    color: string;
    icon: React.ReactNode;
    buildUrl: (shareUrl: string, shareText: string) => string;
}

interface ShareButtonsConfig {
    title?: string;
    show_title?: boolean;
    share_url?: string;
    share_text?: string;
    networks?: string[];
    show_counts?: boolean;
    counts?: Record<string, number>;
}

const WhatsAppIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 16C0.172 15.371 0.336 14.774 0.499 14.177C0.695 13.456 0.894 12.736 1.085 12.014C1.104 11.936 1.095 11.854 1.06 11.782C0.292 10.388 -0.042 8.893 0.091 7.313C0.282 5.051 1.277 3.193 3.033 1.752C4.01 0.948 5.172 0.4 6.414 0.158C10.124 -0.58 13.693 1.319 15.222 4.658C15.793 5.905 16.009 7.218 15.903 8.58C15.636 12.005 13.103 14.921 9.748 15.669C7.857 16.091 6.048 15.843 4.322 14.968C4.245 14.932 4.158 14.923 4.075 14.943C2.784 15.276 1.494 15.614 0.204 15.952C0.147 15.966 0.089 15.979 0 16ZM1.915 14.106C1.991 14.088 2.049 14.075 2.106 14.06C2.807 13.876 3.508 13.697 4.21 13.506C4.351 13.467 4.458 13.489 4.582 13.562C6.11 14.468 7.745 14.736 9.48 14.345C13.186 13.511 15.43 9.604 14.288 5.983C13.247 2.684 9.954 0.774 6.566 1.508C3.772 2.116 1.558 4.563 1.418 7.65C1.36 8.926 1.641 10.135 2.308 11.227C2.52 11.572 2.557 11.861 2.433 12.237C2.234 12.844 2.089 13.47 1.915 14.106Z" fill="white"/>
        <path d="M3.952 6.146C3.963 5.483 4.222 4.938 4.69 4.484C4.758 4.414 4.839 4.359 4.929 4.322C5.019 4.284 5.116 4.265 5.213 4.267C5.325 4.267 5.437 4.283 5.547 4.272C5.781 4.249 5.915 4.364 5.996 4.563C6.216 5.089 6.443 5.613 6.648 6.145C6.685 6.241 6.663 6.396 6.608 6.486C6.457 6.718 6.292 6.941 6.115 7.153C6.008 7.285 6 7.402 6.086 7.546C6.732 8.632 7.632 9.422 8.811 9.887C8.97 9.951 9.101 9.926 9.21 9.787C9.406 9.54 9.61 9.298 9.802 9.046C9.912 8.9 10.041 8.846 10.205 8.921C10.772 9.189 11.336 9.456 11.896 9.736C11.955 9.765 12.009 9.865 12.012 9.934C12.034 10.523 11.863 11.017 11.338 11.36C10.684 11.788 9.997 11.825 9.267 11.62C7.395 11.095 6.005 9.924 4.889 8.378C4.521 7.868 4.183 7.341 4.04 6.718C3.995 6.532 3.98 6.337 3.952 6.146Z" fill="white"/>
    </svg>
);

const TelegramIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM8.287 5.906C7.509 6.23 5.953 6.899 3.621 7.916C3.242 8.066 3.044 8.213 3.026 8.358C2.996 8.601 3.3 8.697 3.716 8.827C3.772 8.845 3.831 8.864 3.891 8.883C4.299 9.016 4.848 9.171 5.134 9.177C5.393 9.183 5.682 9.076 6.002 8.857C8.181 7.386 9.306 6.643 9.376 6.627C9.426 6.615 9.495 6.601 9.542 6.643C9.589 6.684 9.584 6.763 9.579 6.784C9.549 6.913 8.352 8.025 7.733 8.601C7.54 8.781 7.403 8.908 7.375 8.937C7.312 9.002 7.248 9.064 7.187 9.123C6.807 9.489 6.523 9.763 7.202 10.211C7.529 10.427 7.79 10.605 8.051 10.782C8.336 10.976 8.62 11.17 8.988 11.41C9.081 11.472 9.171 11.536 9.258 11.598C9.589 11.834 9.887 12.046 10.255 12.012C10.469 11.993 10.69 11.792 10.802 11.192C11.067 9.775 11.588 6.706 11.708 5.441C11.719 5.33 11.705 5.188 11.695 5.126C11.684 5.063 11.662 4.975 11.581 4.909C11.485 4.831 11.337 4.815 11.271 4.816C10.97 4.821 10.508 4.982 8.287 5.906Z" fill="white"/>
    </svg>
);

const VKIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.877 1.123C13.75 0 11.94 0 8.333 0H7.667C4.06 0 2.25 0 1.123 1.123C-0.003 2.247 0 4.06 0 7.667V8.333C0 11.94 0 13.75 1.123 14.877C2.247 16.003 4.06 16 7.667 16H8.333C11.953 16 13.763 16 14.89 14.877C16.017 13.753 16 11.94 16 8.333V7.667C16 4.06 16 2.25 14.877 1.123ZM11.48 11.527C11.306 10.902 10.951 10.343 10.46 9.92C9.969 9.496 9.363 9.227 8.72 9.147V11.527H8.513C4.867 11.527 2.787 9.027 2.7 4.867H4.527C4.587 7.913 5.933 9.193 7 9.473V4.867H8.72V7.5C9.773 7.387 10.88 6.187 11.253 4.867H12.973C12.835 5.553 12.557 6.204 12.155 6.777C11.753 7.351 11.238 7.835 10.64 8.2C11.306 8.53 11.895 8.998 12.367 9.573C12.84 10.148 13.185 10.816 13.38 11.533L11.48 11.527Z" fill="white"/>
    </svg>
);

const NETWORKS: Record<string, ShareNetwork> = {
    whatsapp: {
        id: 'whatsapp',
        label: 'WhatsApp',
        color: '#25D366',
        icon: <WhatsAppIcon />,
        buildUrl: (url, text) =>
            `https://api.whatsapp.com/send?text=${encodeURIComponent(url + '\n' + text)}`,
    },
    telegram: {
        id: 'telegram',
        label: 'Telegram',
        color: '#0088cc',
        icon: <TelegramIcon />,
        buildUrl: (url, text) =>
            `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    },
    vk: {
        id: 'vk',
        label: 'VK',
        color: '#4680C2',
        icon: <VKIcon />,
        buildUrl: (url, _text) =>
            `https://vk.com/share.php?url=${encodeURIComponent(url)}&noparse=true`,
    },
};

export const ShareButtonsOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = (widget.config || {}) as ShareButtonsConfig;
    const {
        title = 'Поделись сбором:',
        show_title = true,
        share_url,
        share_text = '',
        networks = ['whatsapp', 'telegram', 'vk'],
        show_counts = true,
        counts = {},
    } = config;

    const resolvedUrl =
        share_url || (typeof window !== 'undefined' ? window.location.href : '');

    const handleShare = (network: ShareNetwork) => {
        const url = network.buildUrl(resolvedUrl, share_text);
        window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
    };

    return (
        <div
            className={`share-buttons-output ${className || ''}`}
            style={style}
        >
            {title && show_title && (
                <h4 className="mb-3 text-base font-semibold text-gray-800">
                    {title}
                </h4>
            )}
            <div className="flex flex-wrap items-center gap-2">
                {networks.map((networkId) => {
                    const network = NETWORKS[networkId];
                    if (!network) return null;
                    const count = counts[networkId] ?? 0;
                    return (
                        <button
                            key={networkId}
                            type="button"
                            className="share-btn inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80"
                            style={{ backgroundColor: network.color }}
                            onClick={() => handleShare(network)}
                            title={`Поделиться в ${network.label}`}
                        >
                            {network.icon}
                            {show_counts && count > 0 && (
                                <span className="share-count ml-0.5 text-xs font-bold opacity-90">
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

/**
 * Конфигурация соцсетей для виджета «Поделиться».
 * Иконки берутся из /icons/school-template/ (14×14, fill #1A1A1A).
 */
export interface ShareNetworkConfig {
    id: string;
    label: string;
    iconPath: string;
    buildUrl: (shareUrl: string, shareText: string) => string;
}

export const SHARE_NETWORKS: Record<string, ShareNetworkConfig> = {
    whatsapp: {
        id: 'whatsapp',
        label: 'WhatsApp',
        iconPath: '/icons/school-template/whatsapp.svg',
        buildUrl: (url, text) =>
            `https://api.whatsapp.com/send?text=${encodeURIComponent(url + '\n' + text)}`,
    },
    telegram: {
        id: 'telegram',
        label: 'Telegram',
        iconPath: '/icons/school-template/telegram.svg',
        buildUrl: (url, text) =>
            `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    },
    vk: {
        id: 'vk',
        label: 'VK',
        iconPath: '/icons/school-template/vk.svg',
        buildUrl: (url) =>
            `https://vk.com/share.php?url=${encodeURIComponent(url)}&noparse=true`,
    },
    max: {
        id: 'max',
        label: 'Max',
        iconPath: '/icons/school-template/max.svg',
        buildUrl: (url, text) =>
            `https://share.max.ru?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    },
};

export const DEFAULT_NETWORKS = ['whatsapp', 'telegram', 'vk', 'max'];

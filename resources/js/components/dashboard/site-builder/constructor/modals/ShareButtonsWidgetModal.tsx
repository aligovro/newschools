import { TitleField } from '@/components/dashboard/widgets/common/TitleField';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DEFAULT_NETWORKS,
    SHARE_NETWORKS,
} from '@/components/dashboard/widgets/shareButtons/shareNetworksConfig';
import type { WidgetConfig } from '@/utils/widgetConfigUtils';
import React, { useCallback } from 'react';
import type { WidgetData } from '../../types';

interface Props {
    widget: WidgetData;
    pendingConfig: WidgetConfig | null;
    onConfigUpdate: (updates: WidgetConfig) => void;
}

const NETWORK_ORDER = ['whatsapp', 'telegram', 'vk', 'max'] as const;

export const ShareButtonsWidgetModal: React.FC<Props> = ({
    widget,
    pendingConfig,
    onConfigUpdate,
}) => {
    const config = (pendingConfig || widget.config || {}) as Record<
        string,
        unknown
    >;
    const title = (config.title as string) ?? 'Поделись сбором:';
    const showTitle = (config.show_title as boolean) ?? true;
    const shareUrl = (config.share_url as string) ?? '';
    const shareText = (config.share_text as string) ?? '';
    const networks = (config.networks as string[]) ?? [...DEFAULT_NETWORKS];
    const showCounts = (config.show_counts as boolean) ?? true;
    const counts = (config.counts as Record<string, number>) ?? {};

    const handleChange = useCallback(
        (updates: Record<string, unknown>) => {
            onConfigUpdate({ ...config, ...updates } as WidgetConfig);
        },
        [config, onConfigUpdate],
    );

    const toggleNetwork = (id: string, checked: boolean) => {
        const next = checked
            ? [...new Set([...networks, id])]
            : networks.filter((n) => n !== id);
        handleChange({ networks: next });
    };

    const setCount = (id: string, value: number) => {
        handleChange({
            counts: { ...counts, [id]: Math.max(0, value) },
        });
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">
                        Поделиться — настройки
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TitleField
                        title={title}
                        showTitle={showTitle}
                        onTitleChange={(t) => handleChange({ title: t })}
                        onShowTitleChange={(show) =>
                            handleChange({ show_title: show })
                        }
                        placeholder="Поделись сбором:"
                    />
                    <div className="space-y-2">
                        <Label htmlFor="share-url">URL для шаринга</Label>
                        <Input
                            id="share-url"
                            type="url"
                            placeholder="https://..."
                            value={shareUrl}
                            onChange={(e) =>
                                handleChange({ share_url: e.target.value })
                            }
                        />
                        <p className="text-xs text-muted-foreground">
                            Оставьте пустым, чтобы использовать текущий URL страницы
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="share-text">Текст сообщения</Label>
                        <Input
                            id="share-text"
                            type="text"
                            placeholder="Название сбора или организации"
                            value={shareText}
                            onChange={(e) =>
                                handleChange({ share_text: e.target.value })
                            }
                        />
                    </div>
                    <div className="space-y-3">
                        <Label>Соцсети и мессенджеры</Label>
                        <div className="flex flex-wrap gap-4">
                            {NETWORK_ORDER.map((id) => {
                                const net = SHARE_NETWORKS[id];
                                if (!net) return null;
                                const checked = networks.includes(id);
                                return (
                                    <div
                                        key={id}
                                        className="flex items-center gap-2"
                                    >
                                        <Checkbox
                                            id={`share-net-${id}`}
                                            checked={checked}
                                            onCheckedChange={(c) =>
                                                toggleNetwork(id, !!c)
                                            }
                                        />
                                        <Label
                                            htmlFor={`share-net-${id}`}
                                            className="cursor-pointer font-normal"
                                        >
                                            {net.label}
                                        </Label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="share-show-counts"
                            checked={showCounts}
                            onCheckedChange={(c) =>
                                handleChange({ show_counts: !!c })
                            }
                        />
                        <Label
                            htmlFor="share-show-counts"
                            className="cursor-pointer font-normal"
                        >
                            Показывать счётчики расшариваний
                        </Label>
                    </div>
                    {showCounts && (
                        <div className="space-y-2 rounded-md border p-3">
                            <Label className="text-xs">
                                Счётчики (для отладки/ручного ввода)
                            </Label>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {NETWORK_ORDER.map((id) => {
                                    const net = SHARE_NETWORKS[id];
                                    if (!net) return null;
                                    const count = counts[id] ?? 0;
                                    return (
                                        <div
                                            key={id}
                                            className="flex flex-col gap-1"
                                        >
                                            <Label
                                                htmlFor={`share-count-${id}`}
                                                className="text-xs"
                                            >
                                                {net.label}
                                            </Label>
                                            <Input
                                                id={`share-count-${id}`}
                                                type="number"
                                                min={0}
                                                value={count}
                                                onChange={(e) =>
                                                    setCount(
                                                        id,
                                                        parseInt(
                                                            e.target.value || '0',
                                                            10,
                                                        ),
                                                    )
                                                }
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

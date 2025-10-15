import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { widgetsApi } from '@/lib/api/index';
import { ChevronDown, ChevronUp, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface LeaderItem {
    position: number;
    referrer_user_id: number;
    name: string;
    days_in_system: number;
    invites_count: number;
    total_amount: number;
    formatted_total_amount: string;
}

interface ReferralLeaderboardConfig {
    title?: string;
    subtitle?: string;
    items_per_page?: number;
    sort_by?: 'amount' | 'invites';
    sort_order?: 'asc' | 'desc';
    layout?: 'list' | 'compact';
    card_style?: 'default' | 'modern' | 'minimal';
}

interface ReferralLeaderboardProps {
    config?: ReferralLeaderboardConfig;
    isEditable?: boolean;
    autoExpandSettings?: boolean;
    onSave?: (config: Record<string, unknown>) => Promise<void>;
    onConfigChange?: (config: Record<string, unknown>) => void;
    widgetId?: string;
    organizationId?: number;
}

export const ReferralLeaderboardWidget: React.FC<ReferralLeaderboardProps> = ({
    config = {},
    isEditable = false,
    autoExpandSettings = false,
    onSave,
    onConfigChange,
    widgetId: _widgetId,
    organizationId,
}) => {
    const [isSettingsExpanded, setIsSettingsExpanded] =
        useState(autoExpandSettings);
    const [localConfig, setLocalConfig] =
        useState<ReferralLeaderboardConfig>(config);

    const [leaders, setLeaders] = useState<LeaderItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    useEffect(() => {
        if (autoExpandSettings || isEditable) {
            setIsSettingsExpanded(true);
        }
    }, [autoExpandSettings, isEditable]);

    const updateConfig = (updates: Partial<ReferralLeaderboardConfig>) => {
        const newConfig = { ...localConfig, ...updates };
        setLocalConfig(newConfig);
        onConfigChange?.(newConfig);
    };

    const loadLeaders = React.useCallback(async () => {
        if (!organizationId || isEditable) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await widgetsApi.getReferralLeaderboard(
                organizationId,
                {
                    per_page: localConfig.items_per_page || 10,
                    sort_by: localConfig.sort_by || 'amount',
                    sort_order: localConfig.sort_order || 'desc',
                    page: currentPage,
                },
            );
            setLeaders(response.data || []);
        } catch (e) {
            setError('Ошибка загрузки рейтинга');
        } finally {
            setIsLoading(false);
        }
    }, [
        organizationId,
        isEditable,
        localConfig.items_per_page,
        localConfig.sort_by,
        localConfig.sort_order,
        currentPage,
    ]);

    useEffect(() => {
        loadLeaders();
    }, [loadLeaders]);

    useEffect(() => {
        if (!onSave || !isEditable) return;
        const t = setTimeout(
            () => onSave(localConfig as Record<string, unknown>),
            500,
        );
        return () => clearTimeout(t);
    }, [localConfig, onSave, isEditable]);

    const {
        title = 'Рейтинг по приглашениям',
        subtitle,
        layout = 'list',
        card_style = 'modern',
    } = localConfig;

    if (isEditable) {
        return (
            <div className="referral-leaderboard-widget">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                        Рейтинг по приглашениям
                    </h3>
                    <button
                        onClick={() =>
                            setIsSettingsExpanded(!isSettingsExpanded)
                        }
                        className="flex items-center space-x-2 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                    >
                        <Settings className="h-4 w-4" />
                        <span>Настройки</span>
                        {isSettingsExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </button>
                </div>
                {isSettingsExpanded && (
                    <Card>
                        <CardContent className="space-y-4 p-6">
                            <div>
                                <Label htmlFor="title">Заголовок</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) =>
                                        updateConfig({ title: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="subtitle">Подзаголовок</Label>
                                <Input
                                    id="subtitle"
                                    value={subtitle || ''}
                                    onChange={(e) =>
                                        updateConfig({
                                            subtitle: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="items_per_page">
                                    Количество на странице
                                </Label>
                                <Input
                                    id="items_per_page"
                                    type="number"
                                    min={5}
                                    max={50}
                                    value={localConfig.items_per_page || 10}
                                    onChange={(e) =>
                                        updateConfig({
                                            items_per_page:
                                                parseInt(e.target.value) || 10,
                                        })
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Сортировка</Label>
                                    <Select
                                        value={localConfig.sort_by || 'amount'}
                                        onValueChange={(
                                            v: 'amount' | 'invites',
                                        ) => updateConfig({ sort_by: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="amount">
                                                По сумме
                                            </SelectItem>
                                            <SelectItem value="invites">
                                                По приглашениям
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Порядок</Label>
                                    <Select
                                        value={localConfig.sort_order || 'desc'}
                                        onValueChange={(v: 'asc' | 'desc') =>
                                            updateConfig({ sort_order: v })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="desc">
                                                По убыванию
                                            </SelectItem>
                                            <SelectItem value="asc">
                                                По возрастанию
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
                <div className="mt-6 rounded-lg border-2 border-dashed p-6 text-center text-gray-500">
                    Превью рейтинга по приглашениям
                </div>
            </div>
        );
    }

    return (
        <div className="referral-leaderboard-widget">
            <div className="mb-6 text-center">
                <h3 className="mb-2 text-2xl font-bold">{title}</h3>
                {subtitle && (
                    <p className="text-sm text-gray-600">{subtitle}</p>
                )}
            </div>
            {isLoading ? (
                <div className="py-8 text-center text-gray-500">
                    Загрузка...
                </div>
            ) : error ? (
                <div className="rounded-lg bg-red-50 p-4 text-center text-red-600">
                    {error}
                </div>
            ) : leaders.length === 0 ? (
                <div className="py-8 text-center text-gray-500">Нет данных</div>
            ) : (
                <div
                    className={layout === 'compact' ? 'space-y-2' : 'space-y-3'}
                >
                    {leaders.map((item) => (
                        <Card
                            key={item.referrer_user_id}
                            className={
                                card_style === 'modern'
                                    ? 'shadow-sm'
                                    : card_style === 'minimal'
                                      ? 'border-gray-100'
                                      : ''
                            }
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                            <span className="text-sm font-semibold">
                                                {item.position}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                {item.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {item.days_in_system} дней в
                                                благом
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500">
                                                Пригласил
                                            </div>
                                            <div className="text-lg font-semibold">
                                                + {item.invites_count}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500">
                                                Платежей
                                            </div>
                                            <div className="text-lg font-semibold">
                                                + {item.formatted_total_amount}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Пагинация (упрощенная, так как API отдает только первую страницу при кешировании) */}
            {leaders.length > 0 && (
                <div className="mt-6 flex justify-center">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() =>
                                setCurrentPage(Math.max(1, currentPage - 1))
                            }
                            disabled={currentPage === 1}
                            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                        >
                            Назад
                        </button>
                        <span className="px-3 py-1 text-sm">
                            Страница {currentPage}
                        </span>
                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            className="rounded border px-3 py-1 text-sm"
                        >
                            Далее
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

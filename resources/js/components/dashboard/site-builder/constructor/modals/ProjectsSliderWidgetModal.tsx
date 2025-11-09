import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import UniversalSelect, {
    type SelectOption,
} from '@/components/ui/universal-select/UniversalSelect';
import { TitleField } from '@/components/dashboard/widgets/common/TitleField';
import { fetchPublicOrganizations } from '@/lib/api/public';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { WidgetConfig } from '@/utils/widgetConfigUtils';
import type { WidgetData } from '../../types';

interface Props {
    widget: WidgetData;
    pendingConfig: WidgetConfig | null;
    onConfigUpdate: (updates: WidgetConfig) => void;
}

interface PublicOrganization {
    id: number;
    name: string;
    description?: string | null;
    city?: { name?: string | null } | null;
    region?: { name?: string | null } | null;
}

export const ProjectsSliderWidgetModal: React.FC<Props> = ({
    widget,
    pendingConfig,
    onConfigUpdate,
}) => {
    const config = (pendingConfig || widget.config || {}) as Record<
        string,
        unknown
    >;

    const [options, setOptions] = useState<SelectOption[]>([]);
    const [optionsLoading, setOptionsLoading] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const selectedOrganizationId = config.organization_id
        ? Number(config.organization_id)
        : undefined;

    const handleChange = useCallback(
        (key: string, value: unknown) => {
            onConfigUpdate({
                ...config,
                [key]: value,
            });
        },
        [config, onConfigUpdate],
    );

    const makeOption = useCallback((org: PublicOrganization): SelectOption => {
        const city = org.city?.name;
        const region = org.region?.name;
        const descriptionParts = [city, region].filter(Boolean);

        return {
            value: org.id,
            label: org.name,
            description:
                descriptionParts.length > 0
                    ? descriptionParts.join(', ')
                    : org.description ?? undefined,
        };
    }, []);

    const loadOptions = useCallback(
        async (query = '', ensureSelected = true) => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                setOptionsLoading(true);

                const baseParams: Record<string, string | number | undefined> = {
                    limit: 20,
                    search: query || undefined,
                    order_by: 'created_at',
                    order_direction: 'desc',
                };

                const response = await fetchPublicOrganizations(baseParams, {
                    signal: controller.signal,
                });

                let organizations: PublicOrganization[] = Array.isArray(
                    response?.data,
                )
                    ? response.data
                    : [];

                if (ensureSelected && selectedOrganizationId) {
                    const hasSelected = organizations.some(
                        (item) => item.id === selectedOrganizationId,
                    );

                    if (!hasSelected) {
                        try {
                            const selectedResponse =
                                await fetchPublicOrganizations(
                                    {
                                        ids: selectedOrganizationId,
                                        limit: 1,
                                    },
                                    { signal: controller.signal },
                                );
                            if (Array.isArray(selectedResponse?.data)) {
                                organizations = [
                                    ...selectedResponse.data,
                                    ...organizations,
                                ];
                            }
                        } catch (error) {
                            if (
                                (error as { name?: string })?.name ===
                                'AbortError'
                            ) {
                                return;
                            }
                            console.warn(
                                'Не удалось загрузить выбранную организацию',
                                error,
                            );
                        }
                    }
                }

                const uniqueOptions = new Map<number, SelectOption>();
                organizations.forEach((org) => {
                    uniqueOptions.set(org.id, makeOption(org));
                });

                setOptions(Array.from(uniqueOptions.values()));
            } catch (error) {
                if ((error as { name?: string })?.name === 'AbortError') {
                    return;
                }
                console.error('Failed to load organizations', error);
            } finally {
                setOptionsLoading(false);
            }
        },
        [makeOption, selectedOrganizationId],
    );

    useEffect(() => {
        loadOptions('', true);

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [loadOptions]);

    const handleSearch = useCallback(
        (query: string) => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }

            searchTimeoutRef.current = setTimeout(() => {
                loadOptions(query, false);
            }, 300);
        },
        [loadOptions],
    );

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">
                        Настройки виджета
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TitleField
                        title={(config.title as string) || 'Проекты'}
                        showTitle={(config.show_title as boolean) ?? true}
                        onTitleChange={(title) => handleChange('title', title)}
                        onShowTitleChange={(showTitle) =>
                            handleChange('show_title', showTitle)
                        }
                        placeholder="Проекты"
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <Label>Организация (опционально)</Label>
                            <UniversalSelect
                                options={options}
                                value={selectedOrganizationId ?? null}
                                onChange={(value) =>
                                    handleChange(
                                        'organization_id',
                                        value ? Number(value) : undefined,
                                    )
                                }
                                placeholder="Выберите организацию"
                                loading={optionsLoading}
                                searchable
                                clearable
                                onSearch={handleSearch}
                                emptyMessage="Организации не найдены"
                            />
                        </div>

                        <div>
                            <Label htmlFor="limit">Количество проектов</Label>
                            <Input
                                id="limit"
                                type="number"
                                min={1}
                                max={20}
                                value={Number(config.limit ?? 6)}
                                onChange={(e) =>
                                    handleChange(
                                        'limit',
                                        Math.max(
                                            1,
                                            Math.min(
                                                20,
                                                parseInt(e.target.value || '6', 10),
                                            ),
                                        ),
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <Label htmlFor="slidesPerView">
                                Слайдов на экране (desktop)
                            </Label>
                            <Input
                                id="slidesPerView"
                                type="number"
                                min={1}
                                max={6}
                                value={Number(config.slidesPerView ?? 3)}
                                onChange={(e) =>
                                    handleChange(
                                        'slidesPerView',
                                        Math.max(
                                            1,
                                            Math.min(
                                                6,
                                                parseInt(
                                                    e.target.value || '3',
                                                    10,
                                                ),
                                            ),
                                        ),
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Switch
                            checked={config.showHeaderActions !== false}
                            onCheckedChange={(checked) =>
                                handleChange('showHeaderActions', !!checked)
                            }
                        />
                        <Label>Показать кнопку “Все проекты”</Label>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProjectsSliderWidgetModal;


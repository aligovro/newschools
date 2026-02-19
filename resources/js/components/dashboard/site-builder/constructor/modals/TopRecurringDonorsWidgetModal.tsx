import { TitleField } from '@/components/dashboard/widgets/common/TitleField';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useOrganizationProjects } from '@/hooks/useOrganizationProjects';
import { getOrganizationId } from '@/utils/widgetHelpers';
import type { WidgetConfig } from '@/utils/widgetConfigUtils';
import React, { useCallback, useMemo } from 'react';
import type { WidgetData } from '../../types';

interface Props {
    widget: WidgetData;
    pendingConfig: WidgetConfig | null;
    onConfigUpdate: (updates: WidgetConfig) => void;
}

export const TopRecurringDonorsWidgetModal: React.FC<Props> = ({
    widget,
    pendingConfig,
    onConfigUpdate,
}) => {
    const config = (pendingConfig || widget.config || {}) as Record<
        string,
        unknown
    >;
    const organizationId = useMemo(
        () => getOrganizationId(widget?.config as Record<string, unknown>),
        [widget?.config],
    );
    const { projects, loading: projectsLoading, error: projectsError } =
        useOrganizationProjects(organizationId);

    const projectId =
        config.project_id != null
            ? Number(config.project_id)
            : config.projectId != null
              ? Number(config.projectId)
              : undefined;
    const limit = Math.max(1, Math.min(50, Number(config.limit ?? 10)));
    const title = (config.title as string) ?? '';

    const handleChange = useCallback(
        (updates: Record<string, unknown>) => {
            onConfigUpdate({ ...config, ...updates } as WidgetConfig);
        },
        [config, onConfigUpdate],
    );

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">
                        Топ регулярно-поддерживающих — настройки
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TitleField
                        title={title}
                        showTitle={(config.show_title as boolean) ?? true}
                        onTitleChange={(t) => handleChange({ title: t })}
                        onShowTitleChange={(show) =>
                            handleChange({ show_title: show })
                        }
                        placeholder="Топ регулярно-поддерживающих"
                    />

                    <div className="space-y-2">
                        <Label>Проект</Label>
                        <Select
                            value={projectId != null ? String(projectId) : ''}
                            onValueChange={(v) => {
                                const id = v ? Number(v) : undefined;
                                const selected = projects.find(
                                    (p) => p.id === id,
                                );
                                handleChange({
                                    project_id: id,
                                    projectId: id,
                                    projectSlug: selected?.slug,
                                    project_slug: selected?.slug,
                                });
                            }}
                            disabled={projectsLoading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите проект" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>
                                        {p.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {projectsError && (
                            <p className="text-xs text-red-600">
                                {projectsError}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="top-recurring-limit">
                            Количество записей (1–50)
                        </Label>
                        <Input
                            id="top-recurring-limit"
                            type="number"
                            min={1}
                            max={50}
                            value={limit}
                            onChange={(e) =>
                                handleChange({
                                    limit: Math.max(
                                        1,
                                        Math.min(
                                            50,
                                            parseInt(
                                                e.target.value || '10',
                                                10,
                                            ),
                                        ),
                                    ),
                                })
                            }
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

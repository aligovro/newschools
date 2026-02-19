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

export const OrgDonationsFeedWidgetModal: React.FC<Props> = ({
    widget,
    pendingConfig,
    onConfigUpdate,
}) => {
    const config = (pendingConfig || widget.config || {}) as Record<
        string,
        unknown
    >;
    const organizationId = useMemo(
        () => getOrganizationId(config),
        [config.organizationId, config.organization_id],
    );
    const { projects } = useOrganizationProjects(organizationId);

    const projectId =
        config.project_id != null
            ? Number(config.project_id)
            : config.projectId != null
              ? Number(config.projectId)
              : undefined;
    const per_page = Math.max(
        5,
        Math.min(100, Number(config.per_page ?? 20)),
    );
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
                        Все поступления — настройки
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
                        placeholder="Все поступления"
                    />
                    {organizationId && (
                        <div className="space-y-2">
                            <Label>По проекту (один проект)</Label>
                            <Select
                                value={
                                    projectId != null
                                        ? String(projectId)
                                        : '__all__'
                                }
                                onValueChange={(v) =>
                                    handleChange({
                                        project_id:
                                            v === '__all__' ? undefined : Number(v),
                                        projectId:
                                            v === '__all__' ? undefined : Number(v),
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Вся организация" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__all__">
                                        Вся организация
                                    </SelectItem>
                                    {projects.map((p) => (
                                        <SelectItem
                                            key={p.id}
                                            value={String(p.id)}
                                        >
                                            {p.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="org-donations-feed-per-page">
                            Записей на странице (5–100)
                        </Label>
                        <Input
                            id="org-donations-feed-per-page"
                            type="number"
                            min={5}
                            max={100}
                            value={per_page}
                            onChange={(e) =>
                                handleChange({
                                    per_page: Math.max(
                                        5,
                                        Math.min(
                                            100,
                                            parseInt(
                                                e.target.value || '20',
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

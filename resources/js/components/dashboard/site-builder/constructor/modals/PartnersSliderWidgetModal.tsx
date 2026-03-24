import { TitleField } from '@/components/dashboard/widgets/common/TitleField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LogoUploader from '@/components/ui/image-uploader/LogoUploader';
import { organizationsApi } from '@/lib/api/organizations';
import type { WidgetConfig } from '@/utils/widgetConfigUtils';
import { Plus, Trash2 } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import type { WidgetData } from '../../types';

interface PartnerRow {
    id?: string;
    name: string;
    logo?: string;
    url?: string;
    linkLabel?: string;
}

interface Props {
    widget: WidgetData;
    pendingConfig: WidgetConfig | null;
    onConfigUpdate: (updates: WidgetConfig) => void;
}

function normalizePartners(raw: unknown): PartnerRow[] {
    if (!Array.isArray(raw)) return [];
    return raw.map((item, i) => {
        const o = (item || {}) as Record<string, unknown>;
        return {
            id: typeof o.id === 'string' ? o.id : `row-${i}`,
            name: String(o.name ?? ''),
            logo: o.logo != null ? String(o.logo) : '',
            url: o.url != null ? String(o.url) : '',
            linkLabel:
                o.linkLabel != null ? String(o.linkLabel) : '',
        };
    });
}

export const PartnersSliderWidgetModal: React.FC<Props> = ({
    widget,
    pendingConfig,
    onConfigUpdate,
}) => {
    const config = (pendingConfig || widget.config || {}) as Record<
        string,
        unknown
    >;

    const partners = useMemo(
        () => normalizePartners(config.partners),
        [config.partners],
    );

    const setPartners = useCallback(
        (next: PartnerRow[]) => {
            onConfigUpdate({
                ...config,
                partners: next,
            });
        },
        [config, onConfigUpdate],
    );

    const handleChange = useCallback(
        (key: string, value: unknown) => {
            onConfigUpdate({
                ...config,
                [key]: value,
            });
        },
        [config, onConfigUpdate],
    );

    const updateRow = (index: number, patch: Partial<PartnerRow>) => {
        const next = partners.map((p, i) =>
            i === index ? { ...p, ...patch } : p,
        );
        setPartners(next);
    };

    const addRow = () => {
        setPartners([
            ...partners,
            {
                id:
                    typeof crypto !== 'undefined' && crypto.randomUUID
                        ? crypto.randomUUID()
                        : `p-${Date.now()}`,
                name: '',
                logo: '',
                url: '',
                linkLabel: '',
            },
        ]);
    };

    const removeRow = (index: number) => {
        setPartners(partners.filter((_, i) => i !== index));
    };

    const uploadPartnerLogo = useCallback(async (file: File): Promise<string> => {
        const response = await organizationsApi.uploadLogo(file);
        return response.url;
    }, []);

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Настройки виджета</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TitleField
                        title={(config.title as string) || 'Партнёры фонда'}
                        showTitle={(config.show_title as boolean) ?? true}
                        onTitleChange={(title) => handleChange('title', title)}
                        onShowTitleChange={(showTitle) =>
                            handleChange('show_title', showTitle)
                        }
                        placeholder="Партнёры фонда"
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <Label htmlFor="ps-slides">Слайдов на экране</Label>
                            <Input
                                id="ps-slides"
                                type="number"
                                min={2}
                                max={6}
                                value={Number(config.slidesPerView ?? 4)}
                                onChange={(e) =>
                                    handleChange(
                                        'slidesPerView',
                                        Math.max(
                                            2,
                                            Math.min(
                                                6,
                                                parseInt(
                                                    e.target.value || '4',
                                                    10,
                                                ),
                                            ),
                                        ),
                                    )
                                }
                            />
                        </div>
                        <div className="flex items-end gap-2 pb-2">
                            <Checkbox
                                id="ps-autoplay"
                                checked={(config.autoplay as boolean) ?? true}
                                onCheckedChange={(c) =>
                                    handleChange('autoplay', Boolean(c))
                                }
                            />
                            <Label htmlFor="ps-autoplay">Автопрокрутка</Label>
                        </div>
                        <div className="flex items-end gap-2 pb-2">
                            <Checkbox
                                id="ps-loop"
                                checked={(config.loop as boolean) ?? true}
                                onCheckedChange={(c) =>
                                    handleChange('loop', Boolean(c))
                                }
                            />
                            <Label htmlFor="ps-loop">Зациклить</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm">Партнёры</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={addRow}>
                        <Plus className="mr-1 h-4 w-4" />
                        Добавить
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {partners.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            Добавьте хотя бы одного партнёра.
                        </p>
                    )}
                    {partners.map((row, index) => (
                        <div
                            key={row.id || index}
                            className="space-y-2 rounded-md border p-3"
                        >
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() => removeRow(index)}
                                    aria-label="Удалить"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div>
                                <Label>Название *</Label>
                                <Input
                                    value={row.name}
                                    onChange={(e) =>
                                        updateRow(index, {
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="Название"
                                />
                            </div>
                            <div>
                                <Label>Логотип</Label>
                                <LogoUploader
                                    value={row.logo?.trim() ? row.logo : null}
                                    onChange={(_file, previewUrl) =>
                                        updateRow(index, {
                                            logo: previewUrl || '',
                                        })
                                    }
                                    onUpload={uploadPartnerLogo}
                                    maxSize={10 * 1024 * 1024}
                                    aspectRatio={null}
                                    showCropControls={true}
                                    className="mt-2"
                                />
                            </div>
                            <div>
                                <Label>Ссылка (необязательно)</Label>
                                <Input
                                    value={row.url || ''}
                                    onChange={(e) =>
                                        updateRow(index, {
                                            url: e.target.value,
                                        })
                                    }
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <Label>Подпись ссылки</Label>
                                <Input
                                    value={row.linkLabel || ''}
                                    onChange={(e) =>
                                        updateRow(index, {
                                            linkLabel: e.target.value,
                                        })
                                    }
                                    placeholder="site.ru"
                                />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

export default PartnersSliderWidgetModal;

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTemplateSettings } from '@/hooks/useTemplateSettings';
import { Loader2, Save } from 'lucide-react';
import React from 'react';

interface TemplateOption {
    slug: string;
    name: string;
}

interface TemplateSettingsProps {
    siteId: number;
    currentTemplate: string;
    templates: TemplateOption[];
}

export const TemplateSettings: React.FC<TemplateSettingsProps> = React.memo(
    ({ siteId, currentTemplate, templates }) => {
        const { template, isLoading, errors, setTemplate, saveTemplate } =
            useTemplateSettings(siteId, currentTemplate);

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Шаблон сайта
                        <Button
                            onClick={saveTemplate}
                            disabled={isLoading || template === currentTemplate}
                            size="sm"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {isLoading ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {errors.length > 0 && (
                        <div className="rounded border border-red-200 bg-red-50 p-3">
                            <ul className="space-y-1 text-sm text-red-600">
                                {errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div>
                        <Label htmlFor="template">Шаблон</Label>
                        <Select
                            value={template || currentTemplate}
                            onValueChange={setTemplate}
                        >
                            <SelectTrigger id="template">
                                <SelectValue placeholder="Выберите шаблон" />
                            </SelectTrigger>
                            <SelectContent>
                                {templates.map((t) => (
                                    <SelectItem
                                        key={t.slug}
                                        value={t.slug}
                                    >
                                        {t.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        );
    },
);

TemplateSettings.displayName = 'TemplateSettings';

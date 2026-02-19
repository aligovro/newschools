import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCustomStylesSettings } from '@/hooks/useCustomStylesSettings';
import { FileCode, Loader2, Save } from 'lucide-react';
import React from 'react';

interface CustomStylesSettingsProps {
    siteId: number;
    initialCss?: string | null;
    stylesFilePath?: string | null;
}

export const CustomStylesSettings: React.FC<CustomStylesSettingsProps> =
    React.memo(({ siteId, initialCss, stylesFilePath }) => {
        const {
            customCss,
            setCustomCss,
            isLoading,
            errors,
            saveSettings,
        } = useCustomStylesSettings(siteId, initialCss ?? '');

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Дополнительные стили
                        <Button
                            onClick={saveSettings}
                            disabled={isLoading}
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
                    {stylesFilePath && (
                        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm">
                            <FileCode className="h-4 w-4 shrink-0 text-blue-600" />
                            <div>
                                <span className="font-medium text-blue-800">
                                    Файл SCSS:
                                </span>{' '}
                                <code className="rounded bg-blue-100 px-1 py-0.5 font-mono text-blue-900">
                                    {stylesFilePath}
                                </code>
                                <p className="mt-1 text-blue-700">
                                    Редактируйте этот файл — изменения применяются
                                    после обновления страницы (npm run build не
                                    требуется).
                                </p>
                            </div>
                        </div>
                    )}
                    <p className="text-muted-foreground text-sm">
                        CSS в поле ниже подключается к страницам этого сайта
                        поверх стилей виджетов. Оставьте пустым, чтобы
                        использовать только стили виджетов и темы. Для
                        больших правок удобнее использовать файл SCSS выше.
                    </p>
                    {errors.length > 0 && (
                        <ul className="space-y-1 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                            {errors.map((err, i) => (
                                <li key={i}>{err}</li>
                            ))}
                        </ul>
                    )}
                    <div>
                        <Label htmlFor="custom_css">CSS</Label>
                        <Textarea
                            id="custom_css"
                            value={customCss}
                            onChange={(e) => setCustomCss(e.target.value)}
                            placeholder="/* свои правила */"
                            className="mt-1 min-h-[120px] font-mono text-sm"
                            rows={10}
                        />
                    </div>
                </CardContent>
            </Card>
        );
    });

CustomStylesSettings.displayName = 'CustomStylesSettings';

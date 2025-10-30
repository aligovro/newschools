import ImageUploader from '@/components/dashboard/settings/sites/ImageUploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBasicSettings } from '@/hooks/useBasicSettings';
import { Loader2, Save } from 'lucide-react';
import React from 'react';

interface BasicSettingsProps {
    siteId: number;
    initialSettings: {
        name: string;
        description: string;
        favicon?: string;
    };
}

export const BasicSettings: React.FC<BasicSettingsProps> = React.memo(
    ({ siteId, initialSettings }) => {
        const { settings, isLoading, errors, updateSetting, saveSettings } =
            useBasicSettings(siteId, {
                name: initialSettings.name,
                description: initialSettings.description,
                favicon: initialSettings.favicon || '',
            });

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Основные настройки
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
                    {errors.length > 0 && (
                        <div className="rounded border border-red-200 bg-red-50 p-3">
                            <ul className="space-y-1 text-sm text-red-600">
                                {errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div>
                        <Label htmlFor="name">Название сайта</Label>
                        <Input
                            id="name"
                            value={settings.name}
                            onChange={(e) =>
                                updateSetting('name', e.target.value)
                            }
                            placeholder="Введите название сайта"
                        />
                    </div>
                    <div>
                        <Label htmlFor="description">Описание сайта</Label>
                        <Textarea
                            id="description"
                            value={settings.description}
                            onChange={(e) =>
                                updateSetting('description', e.target.value)
                            }
                            placeholder="Введите описание сайта"
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label>Иконка сайта (Favicon)</Label>
                        <p className="mb-2 text-sm text-gray-500">
                            Загрузите иконку для сайта. Рекомендуемый размер:
                            32x32 пикселя
                        </p>
                        <ImageUploader
                            onImageUpload={(file, serverUrl) => {
                                // Используем URL с сервера, если есть, иначе blob URL
                                if (serverUrl) {
                                    updateSetting('favicon', serverUrl);
                                } else {
                                    const blobUrl = URL.createObjectURL(file);
                                    updateSetting('favicon', blobUrl);
                                }
                            }}
                            onImageCrop={(url) => {
                                updateSetting('favicon', url);
                            }}
                            onImageDelete={() => {
                                updateSetting('favicon', '');
                            }}
                            className="mt-2"
                            widgetSlug="favicon"
                            imageType="image"
                            enableServerUpload={true}
                            existingImageUrl={settings.favicon}
                            hidePreview={true}
                        />
                        {settings.favicon && (
                            <div className="mt-2 flex items-center gap-2">
                                <img
                                    src={settings.favicon}
                                    alt="Favicon"
                                    className="h-8 w-8 rounded"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        updateSetting('favicon', '');
                                    }}
                                >
                                    Удалить
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    },
);

BasicSettings.displayName = 'BasicSettings';

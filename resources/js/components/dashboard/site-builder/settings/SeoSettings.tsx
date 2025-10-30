import ImageUploader from '@/components/dashboard/settings/sites/ImageUploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSeoSettings } from '@/hooks/useSeoSettings';
import { Loader2, Save } from 'lucide-react';
import React from 'react';

interface SeoSettingsProps {
    siteId: number;
    initialSettings?: {
        seo_title?: string;
        seo_description?: string;
        seo_keywords?: string;
        og_title?: string;
        og_description?: string;
        og_type?: string;
        og_image?: string;
        twitter_card?: string;
        twitter_title?: string;
        twitter_description?: string;
        twitter_image?: string;
    };
}

export const SeoSettings: React.FC<SeoSettingsProps> = React.memo(
    ({ siteId, initialSettings = {} }) => {
        const { settings, isLoading, errors, updateSetting, saveSettings } =
            useSeoSettings(siteId, initialSettings);

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        SEO настройки
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
                        <Label htmlFor="seo_title">SEO заголовок</Label>
                        <Input
                            id="seo_title"
                            value={settings.seo_title || ''}
                            onChange={(e) =>
                                updateSetting('seo_title', e.target.value)
                            }
                            placeholder="Введите SEO заголовок (до 60 символов)"
                            maxLength={60}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            {settings.seo_title?.length || 0}/60 символов
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="seo_description">SEO описание</Label>
                        <Textarea
                            id="seo_description"
                            value={settings.seo_description || ''}
                            onChange={(e) =>
                                updateSetting('seo_description', e.target.value)
                            }
                            placeholder="Введите SEO описание (до 160 символов)"
                            rows={3}
                            maxLength={160}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            {settings.seo_description?.length || 0}/160 символов
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="seo_keywords">SEO ключевые слова</Label>
                        <Input
                            id="seo_keywords"
                            value={settings.seo_keywords || ''}
                            onChange={(e) =>
                                updateSetting('seo_keywords', e.target.value)
                            }
                            placeholder="Введите ключевые слова через запятую"
                            maxLength={255}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            {settings.seo_keywords?.length || 0}/255 символов
                        </p>
                    </div>

                    {/* Open Graph */}
                    <div className="pt-2">
                        <h3 className="text-base font-semibold">Open Graph</h3>
                    </div>
                    <div>
                        <Label htmlFor="og_title">OG Title</Label>
                        <Input
                            id="og_title"
                            value={settings.og_title || ''}
                            onChange={(e) =>
                                updateSetting('og_title', e.target.value)
                            }
                            placeholder="Заголовок для соцсетей"
                            maxLength={100}
                        />
                    </div>
                    <div>
                        <Label htmlFor="og_description">OG Description</Label>
                        <Textarea
                            id="og_description"
                            value={settings.og_description || ''}
                            onChange={(e) =>
                                updateSetting('og_description', e.target.value)
                            }
                            placeholder="Короткое описание для соцсетей"
                            rows={3}
                            maxLength={200}
                        />
                    </div>
                    <div>
                        <Label htmlFor="og_type">OG Type</Label>
                        <Input
                            id="og_type"
                            value={settings.og_type || 'website'}
                            onChange={(e) =>
                                updateSetting('og_type', e.target.value)
                            }
                            placeholder="website"
                        />
                    </div>
                    <div>
                        <Label>OG Image</Label>
                        <ImageUploader
                            onImageUpload={(_file, serverUrl) => {
                                if (serverUrl)
                                    updateSetting('og_image', serverUrl);
                            }}
                            onImageCrop={undefined as unknown as any}
                            imageType="image"
                            widgetSlug="og"
                            enableServerUpload={true}
                            acceptedTypes={[
                                'image/jpeg',
                                'image/png',
                                'image/gif',
                                'image/webp',
                            ]}
                            existingImageUrl={settings.og_image}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Рекомендуем 1200×630, будет создано несколько
                            размеров
                        </p>
                    </div>

                    {/* Twitter Card */}
                    <div className="pt-2">
                        <h3 className="text-base font-semibold">Twitter</h3>
                    </div>
                    <div>
                        <Label htmlFor="twitter_card">Twitter Card</Label>
                        <Input
                            id="twitter_card"
                            value={
                                settings.twitter_card || 'summary_large_image'
                            }
                            onChange={(e) =>
                                updateSetting('twitter_card', e.target.value)
                            }
                            placeholder="summary_large_image"
                        />
                    </div>
                    <div>
                        <Label htmlFor="twitter_title">Twitter Title</Label>
                        <Input
                            id="twitter_title"
                            value={settings.twitter_title || ''}
                            onChange={(e) =>
                                updateSetting('twitter_title', e.target.value)
                            }
                            placeholder="Заголовок для Twitter"
                            maxLength={100}
                        />
                    </div>
                    <div>
                        <Label htmlFor="twitter_description">
                            Twitter Description
                        </Label>
                        <Textarea
                            id="twitter_description"
                            value={settings.twitter_description || ''}
                            onChange={(e) =>
                                updateSetting(
                                    'twitter_description',
                                    e.target.value,
                                )
                            }
                            placeholder="Описание для Twitter"
                            rows={3}
                            maxLength={200}
                        />
                    </div>
                    {/* Twitter Image derived from OG upload on the backend */}
                </CardContent>
            </Card>
        );
    },
);

SeoSettings.displayName = 'SeoSettings';

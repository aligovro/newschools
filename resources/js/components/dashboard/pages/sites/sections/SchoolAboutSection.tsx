import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import LogoUploader from '@/components/ui/image-uploader/LogoUploader';
import { Plus, Trash2 } from 'lucide-react';
import type { AboutMission, AboutValue } from '../types';

export interface AboutSectionData {
    mission: AboutMission;
    values: AboutValue[];
}

interface Props {
    data: AboutSectionData;
    onChange: (data: AboutSectionData) => void;
    onImageUpload: (file: File) => Promise<string>;
}

export function SchoolAboutSection({ data, onChange, onImageUpload }: Props) {
    const setMission = (patch: Partial<AboutMission>) =>
        onChange({ ...data, mission: { ...data.mission, ...patch } });

    const setValues = (values: AboutValue[]) => onChange({ ...data, values });

    const updateValue = (idx: number, patch: Partial<AboutValue>) => {
        const next = [...data.values];
        next[idx] = { ...next[idx], ...patch };
        setValues(next);
    };

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Секция «Деятельность» на сайте формируется из поля «Содержимое» в этой же вкладке.
            </p>

            <div>
                <Label>Заголовок миссии</Label>
                <Input
                    value={data.mission.title}
                    onChange={(e) => setMission({ title: e.target.value })}
                    placeholder="Наша миссия"
                    className="mt-1"
                />
            </div>

            <div>
                <Label>Текст миссии</Label>
                <Textarea
                    value={data.mission.body}
                    onChange={(e) => setMission({ body: e.target.value })}
                    placeholder="Текст…"
                    rows={8}
                    className="mt-1"
                />
            </div>

            <div>
                <Label>Изображение к миссии</Label>
                <LogoUploader
                    value={data.mission.image || null}
                    onChange={(_file, previewUrl) => setMission({ image: previewUrl || '' })}
                    onUpload={onImageUpload}
                    maxSize={10 * 1024 * 1024}
                    aspectRatio={null}
                    showCropControls={true}
                    className="mt-2"
                />
            </div>

            <div>
                <Label>Позиция изображения</Label>
                <Select
                    value={data.mission.imagePosition}
                    onValueChange={(v) => setMission({ imagePosition: v as 'left' | 'right' })}
                >
                    <SelectTrigger className="mt-1">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="left">Слева от текста</SelectItem>
                        <SelectItem value="right">Справа от текста</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <div className="mb-2 flex items-center justify-between">
                    <Label>Ключевые ценности</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setValues([...data.values, { title: '', body: '' }])}
                    >
                        <Plus className="mr-1 h-4 w-4" />
                        Карточка
                    </Button>
                </div>
                <div className="space-y-3">
                    {data.values.map((row, idx) => (
                        <div key={idx} className="space-y-2 rounded-md border p-3">
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() => setValues(data.values.filter((_, i) => i !== idx))}
                                    aria-label="Удалить"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <Input
                                placeholder="Заголовок"
                                value={row.title || ''}
                                onChange={(e) => updateValue(idx, { title: e.target.value })}
                            />
                            <Textarea
                                placeholder="Текст"
                                rows={3}
                                value={row.body || ''}
                                onChange={(e) => updateValue(idx, { body: e.target.value })}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

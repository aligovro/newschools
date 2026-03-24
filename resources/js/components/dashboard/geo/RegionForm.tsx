import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useRegions } from '@/hooks/useRegions';
import { CreateRegionForm, FederalDistrict, Region, RegionType } from '@/types/geo';
import { router } from '@inertiajs/react';
import { Upload, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const REGION_TYPE_LABELS: Record<RegionType, string> = {
    region: 'Регион',
    republic: 'Республика',
    krai: 'Край',
    oblast: 'Область',
    autonomous_okrug: 'Автономный округ',
    autonomous_oblast: 'Автономная область',
    federal_city: 'Город федерального значения',
};

interface Props {
    region?: Region | null;
    federalDistricts: FederalDistrict[];
    onClose: () => void;
}

const RegionForm: React.FC<Props> = ({ region, federalDistricts, onClose }) => {
    const { create, update } = useRegions();
    const isEditing = !!region;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<CreateRegionForm>({
        federal_district_id: '',
        name: '',
        code: '',
        capital: '',
        latitude: undefined,
        longitude: undefined,
        population: undefined,
        timezone: 'Europe/Moscow',
        type: 'region',
        flag_image: undefined,
        is_active: true,
    });

    const [flagPreview, setFlagPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (region) {
            setFormData({
                federal_district_id: region.federal_district_id,
                name: region.name,
                code: region.code,
                capital: region.capital,
                latitude: region.latitude ?? undefined,
                longitude: region.longitude ?? undefined,
                population: region.population ?? undefined,
                timezone: region.timezone,
                type: region.type,
                flag_image: region.flag_image ?? undefined,
                is_active: region.is_active,
            });
            setFlagPreview(region.flag_image_url ?? null);
        }
    }, [region]);

    const set = <K extends keyof CreateRegionForm>(field: K, value: CreateRegionForm[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleFlagUpload = async (file: File) => {
        setUploading(true);
        try {
            const form = new FormData();
            form.append('image', file);
            const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
            const res = await fetch('/dashboard/api/upload/region-flag', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': meta?.content ?? '' },
                body: form,
            });
            const data = await res.json();
            if (data.success) {
                set('flag_image', data.path);
                setFlagPreview(data.url);
            } else {
                setErrors((prev) => ({ ...prev, flag_image: data.message || 'Ошибка загрузки' }));
            }
        } catch {
            setErrors((prev) => ({ ...prev, flag_image: 'Ошибка при загрузке изображения' }));
        } finally {
            setUploading(false);
        }
    };

    const clearFlag = () => {
        set('flag_image', null);
        setFlagPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.federal_district_id) newErrors.federal_district_id = 'Выберите федеральный округ';
        if (!formData.name.trim()) newErrors.name = 'Введите название региона';
        if (!formData.code.trim()) newErrors.code = 'Введите код региона';
        if (!formData.capital.trim()) newErrors.capital = 'Введите столицу';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || submitting) return;
        setSubmitting(true);

        if (isEditing) {
            update(region!.id, formData);
        } else {
            create(formData);
        }

        router.reload({
            only: ['regions'],
            onFinish: () => {
                setSubmitting(false);
                onClose();
            },
        });
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Редактировать регион' : 'Создать регион'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Измените данные региона'
                            : 'Заполните форму для создания нового региона'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Federal district */}
                    <div className="space-y-2">
                        <Label>
                            Федеральный округ <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={String(formData.federal_district_id || '')}
                            onValueChange={(v) => set('federal_district_id', Number(v))}
                        >
                            <SelectTrigger className={errors.federal_district_id ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Выберите округ..." />
                            </SelectTrigger>
                            <SelectContent>
                                {federalDistricts.map((fd) => (
                                    <SelectItem key={fd.id} value={String(fd.id)}>
                                        {fd.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.federal_district_id && (
                            <p className="text-sm text-red-500">{errors.federal_district_id}</p>
                        )}
                    </div>

                    {/* Name + Code */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="rg-name">
                                Название <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="rg-name"
                                value={formData.name}
                                onChange={(e) => set('name', e.target.value)}
                                placeholder="Московская область"
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rg-code">
                                Код <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="rg-code"
                                value={formData.code}
                                onChange={(e) => set('code', e.target.value.toUpperCase())}
                                placeholder="RU-MOS"
                                maxLength={10}
                                className={errors.code ? 'border-red-500' : ''}
                            />
                            {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
                        </div>
                    </div>

                    {/* Capital + Type */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="rg-capital">
                                Столица <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="rg-capital"
                                value={formData.capital}
                                onChange={(e) => set('capital', e.target.value)}
                                placeholder="Москва"
                                className={errors.capital ? 'border-red-500' : ''}
                            />
                            {errors.capital && (
                                <p className="text-sm text-red-500">{errors.capital}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Тип</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(v) => set('type', v as RegionType)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {(Object.entries(REGION_TYPE_LABELS) as [RegionType, string][]).map(
                                        ([val, label]) => (
                                            <SelectItem key={val} value={val}>
                                                {label}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Lat + Lng */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="rg-lat">Широта</Label>
                            <Input
                                id="rg-lat"
                                type="number"
                                step="any"
                                value={formData.latitude ?? ''}
                                onChange={(e) =>
                                    set('latitude', e.target.value ? parseFloat(e.target.value) : undefined)
                                }
                                placeholder="55.7558"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rg-lng">Долгота</Label>
                            <Input
                                id="rg-lng"
                                type="number"
                                step="any"
                                value={formData.longitude ?? ''}
                                onChange={(e) =>
                                    set('longitude', e.target.value ? parseFloat(e.target.value) : undefined)
                                }
                                placeholder="37.6173"
                            />
                        </div>
                    </div>

                    {/* Population + Timezone */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="rg-pop">Население</Label>
                            <Input
                                id="rg-pop"
                                type="number"
                                min="0"
                                value={formData.population ?? ''}
                                onChange={(e) =>
                                    set(
                                        'population',
                                        e.target.value ? parseInt(e.target.value, 10) : undefined,
                                    )
                                }
                                placeholder="8 000 000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rg-tz">Часовой пояс</Label>
                            <Input
                                id="rg-tz"
                                value={formData.timezone}
                                onChange={(e) => set('timezone', e.target.value)}
                                placeholder="Europe/Moscow"
                            />
                        </div>
                    </div>

                    {/* Flag image */}
                    <div className="space-y-2">
                        <Label>Флаг региона</Label>
                        <div className="flex items-center gap-4">
                            {flagPreview ? (
                                <div className="relative">
                                    <img
                                        src={flagPreview}
                                        alt="Флаг региона"
                                        className="h-10 w-16 rounded border object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={clearFlag}
                                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex h-10 w-16 items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 dark:border-gray-600 dark:bg-gray-700">
                                    <Upload className="h-4 w-4" />
                                </div>
                            )}
                            <div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={uploading}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {uploading ? 'Загрузка...' : 'Выбрать изображение'}
                                </Button>
                                <p className="mt-1 text-xs text-gray-500">
                                    JPEG, PNG, GIF, WebP, SVG. Максимум 2 МБ.
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFlagUpload(file);
                                    }}
                                />
                            </div>
                        </div>
                        {errors.flag_image && (
                            <p className="text-sm text-red-500">{errors.flag_image}</p>
                        )}
                    </div>

                    {/* Is Active */}
                    <div className="flex items-center gap-3">
                        <Switch
                            id="rg-active"
                            checked={formData.is_active}
                            onCheckedChange={(v) => set('is_active', v)}
                        />
                        <Label htmlFor="rg-active">Активен</Label>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Отмена
                        </Button>
                        <Button type="submit" disabled={submitting || uploading}>
                            {submitting ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Создать'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default RegionForm;

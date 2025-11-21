import YandexMap from '@/components/maps/YandexMap';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UniversalSelect from '@/components/ui/universal-select/UniversalSelect';
import { memo } from 'react';
import type { CascadeSelectData } from '../types';

interface LocationSectionProps {
    name: string;
    regionId: number | null;
    cityId: number | null;
    address: string;
    latitude: number | null;
    longitude: number | null;
    mapCenter: [number, number];
    mapZoom: number;
    cascadeData: CascadeSelectData;
    regionOptions: Array<{
        value: number;
        label: string;
        description?: string;
    }>;
    terminology: {
        organization?: {
            singular_genitive?: string;
        };
    };
    errors?: {
        region_id?: string;
        locality_id?: string;
        address?: string;
        latitude?: string;
        longitude?: string;
        city_name?: string;
    };
    onRegionChange: (id: number | null) => void;
    onCityChange: (id: number | null) => void;
    onAddressChange: (value: string) => void;
    onAddressBlur: (value: string) => void;
    onLatitudeChange: (value: number | null) => void;
    onLongitudeChange: (value: number | null) => void;
    onMapClick: (coords: [number, number]) => void;
}

export const LocationSection = memo(function LocationSection({
    name,
    regionId,
    cityId,
    address,
    latitude,
    longitude,
    mapCenter,
    mapZoom,
    cascadeData,
    regionOptions,
    terminology,
    errors = {},
    onRegionChange,
    onCityChange,
    onAddressChange,
    onAddressBlur,
    onLatitudeChange,
    onLongitudeChange,
    onMapClick,
}: LocationSectionProps) {
    return (
        <div className="rounded-lg border bg-white p-4">
            <Label className="mb-2 block">Локация</Label>
            <div className="mb-4 text-sm text-gray-600">
                Перетащите карту или выберите точку для организации. Координаты
                сохраняются ниже.
            </div>
            <div className="mb-4">
                <YandexMap
                    center={mapCenter}
                    zoom={mapZoom}
                    markers={
                        latitude && longitude
                            ? [
                                  {
                                      id: 'org',
                                      position: [latitude, longitude],
                                      hint: name || 'Организация',
                                      balloon: name || 'Организация',
                                  },
                              ]
                            : []
                    }
                    allowMarkerClick={true}
                    draggableMarker={true}
                    onClick={onMapClick}
                    onBoundsChange={() => {}}
                />
            </div>
            <div className="mb-2 text-xs text-gray-500">
                Кликните на карте, чтобы установить метку, или перетащите метку
                для изменения координат
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                    <UniversalSelect
                        {...cascadeData.regions}
                        value={regionId}
                        options={regionOptions}
                        onChange={(value) => onRegionChange(value as number)}
                        error={errors.region_id}
                        label="Регион"
                        placeholder="Выберите регион"
                        searchable
                        clearable
                        onSearch={cascadeData.regions.setSearch}
                        searchValue={cascadeData.regions.search}
                    />
                </div>
                <div>
                    <UniversalSelect
                        {...cascadeData.localities}
                        value={cityId}
                        onChange={(value) => onCityChange(value as number)}
                        error={errors.locality_id}
                        label="Город"
                        placeholder="Выберите город"
                        searchable
                        clearable
                        onSearch={cascadeData.localities.setSearch}
                        searchValue={cascadeData.localities.search}
                    />
                </div>
                <div>
                    <Label htmlFor="org-address">Адрес</Label>
                    <Input
                        id="org-address"
                        value={address ?? ''}
                        onChange={(e) => onAddressChange(e.target.value)}
                        onBlur={(e) => {
                            const addressValue = e.target.value.trim();
                            if (addressValue) {
                                onAddressBlur(addressValue);
                            }
                        }}
                        placeholder={`Введите адрес ${terminology.organization?.singular_genitive || 'организации'}`}
                        className={`mt-1 ${errors.address ? 'border-red-500' : ''}`}
                    />
                    {errors.address && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.address}
                        </p>
                    )}
                </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor="latitude">Широта</Label>
                    <Input
                        id="latitude"
                        value={latitude ?? ''}
                        onChange={(e) =>
                            onLatitudeChange(
                                e.target.value ? Number(e.target.value) : null,
                            )
                        }
                        placeholder="Например: 55.751244"
                        className={errors.latitude ? 'border-red-500' : ''}
                    />
                    {errors.latitude && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.latitude}
                        </p>
                    )}
                </div>
                <div>
                    <Label htmlFor="longitude">Долгота</Label>
                    <Input
                        id="longitude"
                        value={longitude ?? ''}
                        onChange={(e) =>
                            onLongitudeChange(
                                e.target.value ? Number(e.target.value) : null,
                            )
                        }
                        placeholder="Например: 37.618423"
                        className={errors.longitude ? 'border-red-500' : ''}
                    />
                    {errors.longitude && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.longitude}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
});

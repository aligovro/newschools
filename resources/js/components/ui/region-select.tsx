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
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Region {
    id: number;
    name: string;
    code: string;
}

interface RegionSelectProps {
    value?: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    label?: string;
    error?: string;
}

export function RegionSelect({
    value,
    onValueChange,
    placeholder = 'Выберите регион',
    disabled = false,
    label,
    error,
}: RegionSelectProps) {
    const [regions, setRegions] = useState<Region[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

    // Загрузка регионов
    const loadRegions = async (page = 1, searchTerm = '') => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: '20',
                ...(searchTerm && { search: searchTerm }),
            });

            const response = await fetch(`/dashboard/api/regions?${params}`);
            const data = await response.json();

            if (page === 1) {
                setRegions(data.data);
            } else {
                setRegions(prev => [...prev, ...data.data]);
            }

            setHasMore(data.current_page < data.last_page);
            setCurrentPage(data.current_page);
        } catch (error) {
            console.error('Error loading regions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Загрузка при монтировании
    useEffect(() => {
        loadRegions(1, search);
    }, []);

    // Поиск с дебаунсом
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (search !== '') {
                loadRegions(1, search);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search]);

    // Загрузка выбранного региона при изменении value
    useEffect(() => {
        if (value && regions.length > 0) {
            const region = regions.find(r => r.id.toString() === value);
            if (region) {
                setSelectedRegion(region);
            }
        }
    }, [value, regions]);

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            loadRegions(currentPage + 1, search);
        }
    };

    const handleSelect = (regionId: string) => {
        const region = regions.find(r => r.id.toString() === regionId);
        setSelectedRegion(region || null);
        onValueChange(regionId);
    };

    const handleClear = () => {
        setSearch('');
        setSelectedRegion(null);
        onValueChange('');
        loadRegions(1, '');
    };

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}

            <Select
                value={value || ''}
                onValueChange={handleSelect}
                disabled={disabled}
            >
                <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {/* Поиск */}
                    <div className="p-2 border-b">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Поиск региона..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8 pr-8"
                            />
                            {search && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1 h-6 w-6 p-0"
                                    onClick={handleClear}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Список регионов */}
                    <div className="max-h-60 overflow-y-auto">
                        {regions.map((region) => (
                            <SelectItem
                                key={region.id}
                                value={region.id.toString()}
                            >
                                {region.name}
                            </SelectItem>
                        ))}

                        {/* Кнопка загрузки еще */}
                        {hasMore && (
                            <div className="p-2 border-t">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                >
                                    {loading ? 'Загрузка...' : 'Загрузить еще'}
                                </Button>
                            </div>
                        )}

                        {regions.length === 0 && !loading && (
                            <div className="p-4 text-center text-muted-foreground">
                                Регионы не найдены
                            </div>
                        )}
                    </div>
                </SelectContent>
            </Select>

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}

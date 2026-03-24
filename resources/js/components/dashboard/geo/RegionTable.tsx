import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useRegions } from '@/hooks/useRegions';
import { Region, RegionType } from '@/types/geo';
import { router } from '@inertiajs/react';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import React, { useCallback } from 'react';

const REGION_TYPE_LABELS: Record<RegionType, string> = {
    region: 'Регион',
    republic: 'Республика',
    krai: 'Край',
    oblast: 'Область',
    autonomous_okrug: 'А. округ',
    autonomous_oblast: 'А. область',
    federal_city: 'Фед. город',
};

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    regions: Region[];
    pagination: PaginationMeta;
    onEdit: (region: Region) => void;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
}

const RegionTable: React.FC<Props> = ({
    regions,
    pagination,
    onEdit,
    onPageChange,
    onPerPageChange,
}) => {
    const { remove, toggleActive } = useRegions();

    const handleDelete = useCallback(
        (id: number) => {
            if (!window.confirm('Удалить регион? Это действие нельзя отменить.')) return;
            remove(id);
            router.reload({ only: ['regions'] });
        },
        [remove],
    );

    const handleToggle = useCallback(
        (id: number) => {
            toggleActive(id);
            router.reload({ only: ['regions'] });
        },
        [toggleActive],
    );

    return (
        <div className="space-y-4">
            <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-14">Флаг</TableHead>
                                <TableHead>Название</TableHead>
                                <TableHead>Код</TableHead>
                                <TableHead>Столица</TableHead>
                                <TableHead>Тип</TableHead>
                                <TableHead>Округ</TableHead>
                                <TableHead className="text-center">Нас. пункты</TableHead>
                                <TableHead>Активен</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {regions.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={9}
                                        className="py-8 text-center text-gray-500"
                                    >
                                        Регионы не найдены
                                    </TableCell>
                                </TableRow>
                            ) : (
                                regions.map((region) => (
                                    <TableRow key={region.id}>
                                        <TableCell>
                                            {region.flag_image_url ? (
                                                <img
                                                    src={region.flag_image_url}
                                                    alt={region.name}
                                                    className="h-6 w-10 rounded object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-6 w-10 items-center justify-center rounded bg-gray-100 text-xs text-gray-400 dark:bg-gray-700">
                                                    —
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {region.name}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-sm">{region.code}</span>
                                        </TableCell>
                                        <TableCell className="text-gray-600 dark:text-gray-400">
                                            {region.capital}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                            {REGION_TYPE_LABELS[region.type] ?? region.type}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                            {region.federal_district?.name ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-center text-sm text-gray-600 dark:text-gray-400">
                                            {region.localities_count ?? 0}
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={region.is_active}
                                                onCheckedChange={() => handleToggle(region.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => onEdit(region)}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Редактировать
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(region.id)}
                                                        className="text-red-600 dark:text-red-400"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Удалить
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {pagination.last_page > 1 && (
                <div className="flex items-center justify-between rounded-lg bg-white px-6 py-4 shadow dark:bg-gray-800">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        Показано{' '}
                        {(pagination.current_page - 1) * pagination.per_page + 1}–
                        {Math.min(
                            pagination.current_page * pagination.per_page,
                            pagination.total,
                        )}{' '}
                        из {pagination.total} регионов
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={pagination.per_page}
                            onChange={(e) => onPerPageChange(parseInt(e.target.value, 10))}
                            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                        <div className="flex gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(1)}
                                disabled={pagination.current_page === 1}
                            >
                                Первая
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                            >
                                Назад
                            </Button>
                            <span className="flex items-center px-3 text-sm">
                                {pagination.current_page} / {pagination.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                            >
                                Вперёд
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(pagination.last_page)}
                                disabled={pagination.current_page === pagination.last_page}
                            >
                                Последняя
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegionTable;

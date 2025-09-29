import { Badge } from '@/components/common/ui/badge';
import { Button } from '@/components/common/ui/button';
import { Card } from '@/components/common/ui/card';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Globe, MapPin, Users } from 'lucide-react';
import React from 'react';

interface Organization {
    id: number;
    name: string;
    slug: string;
    description: string;
    address: string;
    type: string;
    logo_url?: string;
    website_url?: string;
    created_at: string;
    stats: {
        members_count: number;
        projects_count: number;
        donations_total: number;
    };
}

interface Props {
    organizations: Organization[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        type?: string;
        region?: string;
        search?: string;
    };
}

export default function Organizations({
    organizations,
    pagination,
    filters,
}: Props) {
    const getTypeName = (type: string) => {
        const types: Record<string, string> = {
            school: 'Школа',
            gymnasium: 'Гимназия',
            lyceum: 'Лицей',
            college: 'Колледж',
            shelter: 'Приют',
            hospital: 'Больница',
            church: 'Церковь',
            charity: 'Благотворительность',
            foundation: 'Фонд',
            ngo: 'НКО',
        };
        return types[type] || type;
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            school: 'bg-blue-100 text-blue-800',
            gymnasium: 'bg-purple-100 text-purple-800',
            lyceum: 'bg-indigo-100 text-indigo-800',
            college: 'bg-green-100 text-green-800',
            shelter: 'bg-orange-100 text-orange-800',
            hospital: 'bg-red-100 text-red-800',
            church: 'bg-yellow-100 text-yellow-800',
            charity: 'bg-pink-100 text-pink-800',
            foundation: 'bg-teal-100 text-teal-800',
            ngo: 'bg-gray-100 text-gray-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <>
            <Head title="Организации" />

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Организации
                            </h1>
                            <p className="mt-2 text-lg text-gray-600">
                                Найдите организации, которые нуждаются в вашей
                                поддержке
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="border-b bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex flex-wrap gap-4">
                            <div className="min-w-64 flex-1">
                                <input
                                    type="text"
                                    placeholder="Поиск по названию или описанию..."
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <select className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500">
                                <option value="">Все типы</option>
                                <option value="school">Школы</option>
                                <option value="gymnasium">Гимназии</option>
                                <option value="lyceum">Лицеи</option>
                                <option value="college">Колледжи</option>
                                <option value="charity">
                                    Благотворительность
                                </option>
                                <option value="ngo">НКО</option>
                            </select>
                            <Button>Найти</Button>
                        </div>
                    </div>
                </div>

                {/* Organizations Grid */}
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {organizations.length === 0 ? (
                        <div className="py-12 text-center">
                            <div className="mx-auto h-24 w-24 text-gray-400">
                                <Users className="h-full w-full" />
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">
                                Организации не найдены
                            </h3>
                            <p className="mt-2 text-gray-500">
                                Попробуйте изменить параметры поиска
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {organizations.map((organization) => (
                                <Card
                                    key={organization.id}
                                    className="overflow-hidden transition-shadow hover:shadow-lg"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    {organization.logo_url && (
                                                        <img
                                                            src={
                                                                organization.logo_url
                                                            }
                                                            alt={
                                                                organization.name
                                                            }
                                                            className="h-12 w-12 rounded-lg object-cover"
                                                        />
                                                    )}
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {organization.name}
                                                        </h3>
                                                        <Badge
                                                            className={`mt-1 ${getTypeColor(organization.type)}`}
                                                        >
                                                            {getTypeName(
                                                                organization.type,
                                                            )}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <p className="mt-3 line-clamp-3 text-gray-600">
                                                    {organization.description}
                                                </p>

                                                <div className="mt-4 space-y-2">
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <MapPin className="mr-2 h-4 w-4" />
                                                        <span>
                                                            {
                                                                organization.address
                                                            }
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Calendar className="mr-2 h-4 w-4" />
                                                        <span>
                                                            Создана{' '}
                                                            {formatDate(
                                                                organization.created_at,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                                                    <div>
                                                        <div className="text-lg font-semibold text-gray-900">
                                                            {
                                                                organization
                                                                    .stats
                                                                    .members_count
                                                            }
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Участников
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-lg font-semibold text-gray-900">
                                                            {
                                                                organization
                                                                    .stats
                                                                    .projects_count
                                                            }
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Проектов
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-lg font-semibold text-gray-900">
                                                            {formatAmount(
                                                                organization
                                                                    .stats
                                                                    .donations_total,
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Собрано
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex space-x-3">
                                            <Link
                                                href={`/organizations/${organization.slug}`}
                                                className="flex-1"
                                            >
                                                <Button className="w-full">
                                                    Подробнее
                                                </Button>
                                            </Link>

                                            {organization.website_url && (
                                                <a
                                                    href={
                                                        organization.website_url
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                                                >
                                                    <Globe className="h-4 w-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Показано{' '}
                                {(pagination.current_page - 1) *
                                    pagination.per_page +
                                    1}{' '}
                                -{' '}
                                {Math.min(
                                    pagination.current_page *
                                        pagination.per_page,
                                    pagination.total,
                                )}{' '}
                                из {pagination.total} организаций
                            </div>

                            <div className="flex space-x-2">
                                {pagination.current_page > 1 && (
                                    <Button variant="outline" size="sm">
                                        Предыдущая
                                    </Button>
                                )}

                                {Array.from(
                                    { length: pagination.last_page },
                                    (_, i) => i + 1,
                                )
                                    .filter(
                                        (page) =>
                                            page === 1 ||
                                            page === pagination.last_page ||
                                            Math.abs(
                                                page - pagination.current_page,
                                            ) <= 2,
                                    )
                                    .map((page, index, array) => (
                                        <React.Fragment key={page}>
                                            {index > 0 &&
                                                array[index - 1] !==
                                                    page - 1 && (
                                                    <span className="px-2 py-1 text-gray-500">
                                                        ...
                                                    </span>
                                                )}
                                            <Button
                                                variant={
                                                    page ===
                                                    pagination.current_page
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                            >
                                                {page}
                                            </Button>
                                        </React.Fragment>
                                    ))}

                                {pagination.current_page <
                                    pagination.last_page && (
                                    <Button variant="outline" size="sm">
                                        Следующая
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

import { Link, router } from '@inertiajs/react';
import { FolderKanban, HandHeart, User, Users } from 'lucide-react';

interface School {
    id: number;
    name: string;
    slug?: string;
    address?: string;
    city?: {
        name: string;
    };
    image?: string;
    logo?: string;
    donations_total?: number;
    donations_collected?: number;
    members_count?: number;
    sponsors_count?: number;
    projects_count?: number;
    director?: {
        name: string;
    };
    director_name?: string | null;
}

interface OrganizationCardProps {
    organization: School;
}

export default function OrganizationCard({
    organization,
}: OrganizationCardProps) {
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };
    const formatNumber = (num: number): string => {
        return new Intl.NumberFormat('ru-RU').format(num);
    };

    const organizationUrl = organization.slug
        ? `/organization/${organization.slug}`
        : `/organization/${organization.id}`;

    // Формирование адреса: город + адрес
    const fullAddress = [organization.city?.name, organization.address]
        .filter(Boolean)
        .join(', ');

    const targetAmount = organization.donations_total || 0;
    const collectedAmount = organization.donations_collected || 0;
    const progressPercentage =
        targetAmount > 0
            ? Math.round((collectedAmount / targetAmount) * 100)
            : 0;

    const directorName =
        organization.director?.name || organization.director_name || null;

    return (
        <Link
            href={organizationUrl}
            className="group block overflow-hidden rounded-xl bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl"
        >
            {/* School Image */}
            <div className="relative h-48 bg-gradient-to-br from-blue-400 to-indigo-600">
                {organization.image ? (
                    <img
                        src={organization.image}
                        alt={organization.name}
                        className="h-full w-full object-cover"
                    />
                ) : organization.logo ? (
                    <div className="flex h-full w-full items-center justify-center bg-white">
                        <img
                            src={organization.logo}
                            alt={organization.name}
                            className="h-32 w-32 object-contain"
                        />
                    </div>
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <div className="text-center text-2xl font-bold text-white">
                            {organization.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>

            <div className="p-6">
                {/* Address */}
                {fullAddress && (
                    <div className="mb-2 text-sm font-medium text-gray-500">
                        {fullAddress}
                    </div>
                )}
                {/* School Name */}
                <h3 className="mb-4 text-xl font-bold text-gray-900">
                    {organization.name}
                </h3>

                {/* Progress Section */}
                <div className="mb-4 rounded-lg bg-gray-50 p-4">
                    <div className="mb-3 flex justify-between text-xs font-medium text-gray-600">
                        <span>Нужды школы</span>
                        <span>Собрали</span>
                    </div>
                    <div className="mb-2 flex justify-between text-lg font-bold">
                        <span className="text-gray-900">
                            {formatCurrency(targetAmount)}
                        </span>
                        <span className="text-blue-600">
                            {formatCurrency(collectedAmount)}
                        </span>
                    </div>
                    {/* Progress Bar */}
                    {targetAmount > 0 && (
                        <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                style={{
                                    width: `${Math.min(progressPercentage, 100)}%`,
                                }}
                            ></div>
                        </div>
                    )}
                </div>

                {/* Statistics */}
                <div className="mb-4 grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
                    <div className="text-center">
                        <div className="mb-1 flex items-center justify-center text-gray-400">
                            <Users className="h-5 w-5" />
                        </div>
                        <div className="text-sm font-medium text-gray-600">
                            Выпускники
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                            {formatNumber(organization.members_count || 0)}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="mb-1 flex items-center justify-center text-gray-400">
                            <HandHeart className="h-5 w-5" />
                        </div>
                        <div className="text-sm font-medium text-gray-600">
                            Спонсоры
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                            {formatNumber(organization.sponsors_count || 0)}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="mb-1 flex items-center justify-center text-gray-400">
                            <FolderKanban className="h-5 w-5" />
                        </div>
                        <div className="text-sm font-medium text-gray-600">
                            Проекты
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                            {formatNumber(organization.projects_count || 0)}
                        </div>
                    </div>
                </div>

                {/* Director */}
                {directorName && (
                    <div className="mb-4 flex items-center space-x-2 border-t border-gray-200 pt-4">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                            <div className="text-xs font-medium text-gray-500">
                                Директор школы
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                                {directorName}
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <button
                    className="block w-full rounded-lg bg-blue-600 px-6 py-3 text-center font-medium text-white transition-colors hover:bg-blue-700"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.visit(organizationUrl);
                    }}
                    type="button"
                >
                    Помочь
                </button>
            </div>
        </Link>
    );
}

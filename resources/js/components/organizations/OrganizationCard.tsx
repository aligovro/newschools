import '@css/components/organizations/organization-card.scss';
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
        id: number;
        full_name: string;
        last_name: string;
        first_name: string;
        middle_name?: string | null;
        position: string;
        is_director: boolean;
        photo?: string | null;
    };
    director_name?: string | null; // Для обратной совместимости
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
        organization.director?.full_name || organization.director_name || null;

    return (
        <Link href={organizationUrl} className="organization-card group block">
            <div className="p-4 pb-0">
                {/* Address */}
                {fullAddress && (
                    <div className="organization-address mb-2">
                        {fullAddress}
                    </div>
                )}
                {/* School Name */}
                <h3 className="organization-name mb-4">{organization.name}</h3>
            </div>

            {/* School Image */}
            <div className="organization-image-wrapper relative bg-gradient-to-br from-blue-400 to-indigo-600">
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
                <div className="organization-image-gradient"></div>

                {/* Donation Info Overlay */}
                <div className="organization-donation-overlay">
                    <div className="organization-donation-info">
                        <div className="organization-donation-labels">
                            <span>Нужды школы</span>
                            <span>Собрали</span>
                        </div>
                        <div className="organization-donation-progress-wrapper">
                            <div className="organization-donation-progress-bar">
                                {targetAmount > 0 && (
                                    <div
                                        className="organization-donation-progress-fill"
                                        style={{
                                            width: `${Math.min(progressPercentage, 100)}%`,
                                        }}
                                    ></div>
                                )}
                            </div>
                        </div>
                        <div className="organization-donation-amounts">
                            <span className="organization-donation-target">
                                {formatCurrency(targetAmount)}
                            </span>
                            <span className="organization-donation-collected">
                                {formatCurrency(collectedAmount)}
                            </span>
                        </div>
                    </div>
                    <button
                        className="organization-help-button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.visit(organizationUrl);
                        }}
                        type="button"
                    >
                        Помочь
                    </button>
                </div>
            </div>

            <div className="p-4">
                {/* Statistics */}
                <div className="mb-4 grid grid-cols-3 gap-4">
                    <div className="organization-stat-item">
                        <div className="mb-1 flex items-center justify-center text-gray-400">
                            <Users className="h-5 w-5" />
                        </div>
                        <div className="organization-stat-label">
                            Выпускники
                        </div>
                        <div className="organization-stat-value">
                            {formatNumber(organization.members_count || 0)}
                        </div>
                    </div>
                    <div className="organization-stat-item">
                        <div className="mb-1 flex items-center justify-center text-gray-400">
                            <HandHeart className="h-5 w-5" />
                        </div>
                        <div className="organization-stat-label">Спонсоры</div>
                        <div className="organization-stat-value">
                            {formatNumber(organization.sponsors_count || 0)}
                        </div>
                    </div>
                    <div className="organization-stat-item">
                        <div className="mb-1 flex items-center justify-center text-gray-400">
                            <FolderKanban className="h-5 w-5" />
                        </div>
                        <div className="organization-stat-label">Проекты</div>
                        <div className="organization-stat-value">
                            {formatNumber(organization.projects_count || 0)}
                        </div>
                    </div>
                </div>

                {/* Director */}
                {directorName && (
                    <div className="mb-4 flex items-center space-x-3">
                        {organization.director?.photo ? (
                            <img
                                src={organization.director.photo}
                                alt={directorName}
                                className="h-9 w-9 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="organization-director-label">
                                Директор школы
                            </div>
                            <div className="organization-director-name">
                                {directorName}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
}

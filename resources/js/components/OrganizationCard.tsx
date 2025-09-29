import { Link } from '@inertiajs/react';

interface Organization {
    id: number;
    name: string;
    description: string;
    address: string;
    image?: string;
    projects_count: number;
    donations_total: number;
    donations_collected: number;
}

interface OrganizationCardProps {
    organization: Organization;
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

    const progressPercentage =
        organization.donations_total > 0
            ? Math.round(
                  (organization.donations_collected /
                      organization.donations_total) *
                      100,
              )
            : 0;

    return (
        <div className="overflow-hidden rounded-xl bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl">
            <Link href={`/organizations/${organization.id}`} className="block">
                {/* Organization Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500">
                    {organization.image ? (
                        <img
                            src={organization.image}
                            alt={organization.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <div className="text-4xl font-bold text-white">
                                {organization.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                </div>

                <div className="p-6">
                    {/* Organization Info */}
                    <div className="mb-4">
                        <div className="mb-1 text-sm text-gray-500">
                            {organization.address}
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-gray-900">
                            {organization.name}
                        </h3>
                        {organization.description && (
                            <p className="line-clamp-2 text-sm text-gray-600">
                                {organization.description}
                            </p>
                        )}
                    </div>

                    {/* Progress Section */}
                    <div className="mb-4">
                        <div className="mb-2 flex justify-between text-sm">
                            <span className="text-gray-600">Цель проекта</span>
                            <span className="text-gray-600">Собрали</span>
                        </div>
                        <div className="mb-2 flex justify-between font-semibold">
                            <span className="text-gray-900">
                                {formatCurrency(organization.donations_total)}
                            </span>
                            <span className="text-blue-600">
                                {formatCurrency(
                                    organization.donations_collected,
                                )}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        {organization.donations_total > 0 && (
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

                    {/* Action Button */}
                    <div className="flex items-center justify-between">
                        <button className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700">
                            Поддержать
                        </button>
                        <div className="text-sm text-gray-500">
                            {organization.projects_count} проектов
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}

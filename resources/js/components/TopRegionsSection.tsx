interface Region {
    name: string;
    total_amount: number;
    organizations_count: number;
}

interface Terminology {
    organization?: {
        plural_nominative: string;
        plural_genitive: string;
    };
}

interface TopRegionsSectionProps {
    regions: Region[];
    terminology: Terminology;
}

export default function TopRegionsSection({
    regions,
    terminology,
}: TopRegionsSectionProps) {
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <section className="bg-white py-16">
            <div className="container mx-auto">
                {/* Section Header */}
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                        Топ поддерживающих регионов
                    </h2>
                    <p className="mx-auto max-w-2xl text-xl text-gray-600">
                        Регионы с наибольшим объемом поддержки образовательных
                        {terminology.organization?.plural_genitive ||
                            'организаций'}
                    </p>
                </div>

                {/* Regions Table */}
                <div className="overflow-hidden rounded-xl bg-white shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Регион
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        {terminology.organization
                                            ?.plural_nominative ||
                                            'Организации'}
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Поддержка
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Сумма пожертвований
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {regions.map((region, index) => (
                                    <tr
                                        key={region.name}
                                        className="transition-colors hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {region.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                <span className="font-semibold">
                                                    {region.organizations_count}
                                                </span>{' '}
                                                {terminology.organization
                                                    ?.plural_genitive ||
                                                    'организаций'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <svg
                                                    className="mr-2 h-5 w-5 text-red-500"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <span className="text-sm text-gray-600">
                                                    Активная поддержка
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(
                                                    region.total_amount,
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Load More Button */}
                <div className="mt-8 text-center">
                    <button className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700">
                        Загрузить еще
                    </button>
                </div>
            </div>
        </section>
    );
}

import { useState } from 'react';

export default function SubscribeSection() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('Все регионы');

    const regions = [
        'Все регионы',
        'Московская область',
        'Санкт-Петербург',
        'Республика Татарстан',
        'Республика Башкортостан',
        'Краснодарский край',
        'Свердловская область',
        'Нижегородская область',
    ];

    const popularOrganizations = [
        {
            id: 1,
            name: 'Школа №1',
            address: 'Москва, ул. Ленина, 1',
            image: '/images/school-1.jpg',
        },
        {
            id: 2,
            name: 'Гимназия №2',
            address: 'СПб, пр. Невский, 2',
            image: '/images/gymnasium-2.jpg',
        },
        {
            id: 3,
            name: 'Лицей №3',
            address: 'Казань, ул. Баумана, 3',
            image: '/images/lyceum-3.jpg',
        },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            console.log(
                'Searching for:',
                searchQuery,
                'in region:',
                selectedRegion,
            );
        }
    };

    const handleSubscribe = (organizationId: number) => {
        console.log('Subscribing to organization:', organizationId);
    };

    return (
        <section className="bg-white py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                    {/* Content */}
                    <div>
                        <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">
                            Подпишись на постоянную поддержку своей организации
                        </h2>
                        <p className="mb-8 text-xl text-gray-600">
                            Подписка поможет закрывать регулярные нужды
                            организации и реализовывать проекты
                        </p>

                        {/* Search Form */}
                        <form onSubmit={handleSearch} className="mb-8">
                            <div className="flex flex-col gap-4 sm:flex-row">
                                {/* Region Selector */}
                                <div className="relative">
                                    <select
                                        value={selectedRegion}
                                        onChange={(e) =>
                                            setSelectedRegion(e.target.value)
                                        }
                                        className="appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-8 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {regions.map((region) => (
                                            <option key={region} value={region}>
                                                {region}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <svg
                                            className="h-4 w-4 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </div>
                                </div>

                                {/* Search Input */}
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        placeholder="Поиск по названию, адресу организации..."
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-blue-600"
                                    >
                                        <svg
                                            className="h-5 w-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Popular Organizations */}
                        <div>
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Популярные организации
                            </h3>
                            <div className="space-y-3">
                                {popularOrganizations.map((org) => (
                                    <div
                                        key={org.id}
                                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                                                <span className="text-sm font-semibold text-white">
                                                    {org.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {org.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {org.address}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleSubscribe(org.id)
                                            }
                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700"
                                        >
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 4v16m8-8H4"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="hidden lg:block">
                        <div className="relative">
                            <div className="flex h-96 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500">
                                <div className="text-center text-white">
                                    <div className="mb-4 text-6xl">🎓</div>
                                    <div className="text-2xl font-bold">
                                        Образование
                                    </div>
                                    <div className="text-lg opacity-90">
                                        для всех
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-4 -right-4 flex h-24 w-24 items-center justify-center rounded-full bg-yellow-400">
                                <div className="text-3xl">📚</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

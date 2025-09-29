import { Link } from '@inertiajs/react';
import { useState } from 'react';

interface Terminology {
    site_name: string;
    site_description: string;
    org_plural: string;
    org_genitive: string;
    support_action: string;
}

interface HeroSectionProps {
    terminology: Terminology;
}

export default function HeroSection({ terminology }: HeroSectionProps) {
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Здесь будет логика поиска
            console.log(
                'Searching for:',
                searchQuery,
                'in region:',
                selectedRegion,
            );
        }
    };

    return (
        <section className="hero relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-4xl text-center">
                    {/* Hero Background Image */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="h-full w-full rounded-3xl bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
                    </div>

                    <div className="relative z-10">
                        {/* Search Form */}
                        <form onSubmit={handleSearch} className="mb-8">
                            <div className="mx-auto flex max-w-2xl flex-col gap-4 md:flex-row">
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

                        {/* Main Heading */}
                        <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl">
                            {terminology.support_action}{' '}
                            {terminology.org_plural.toLowerCase()}
                            <br />
                            <span className="text-blue-600">
                                — укрепляй будущее
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
                            Подписывайся на{' '}
                            {terminology.org_plural.toLowerCase()}, поддерживай
                            их финансирование, отслеживай прогресс сборов
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <Link
                                href="/organizations"
                                className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
                            >
                                {terminology.org_plural} города
                            </Link>
                            <Link
                                href="/projects"
                                className="rounded-lg border-2 border-blue-600 px-8 py-4 text-lg font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                            >
                                Все проекты
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

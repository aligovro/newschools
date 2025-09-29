import SliderDisplay from '@/components/sliders/SliderDisplay';
import { Head } from '@inertiajs/react';

interface Site {
    id: number;
    name: string;
    description?: string;
    logo_url?: string;
    favicon_url?: string;
    theme_config: any;
    is_maintenance_mode: boolean;
    maintenance_message?: string;
}

interface Page {
    id: number;
    title: string;
    content: string;
    template: string;
    layout_config: any;
    content_blocks: any[];
    featured_image_url?: string;
    is_homepage: boolean;
}

interface NavigationItem {
    id: number;
    title: string;
    url: string;
    children: NavigationItem[];
}

interface Slider {
    id: number;
    name: string;
    type: string;
    position: string;
    settings: any;
    slides: any[];
}

interface Props {
    site: Site;
    homepage: Page;
    navigation: NavigationItem[];
    sliders: Slider[];
}

export default function SiteShow({
    site,
    homepage,
    navigation,
    sliders,
}: Props) {
    if (site.is_maintenance_mode) {
        return (
            <>
                <Head title={`${site.name} - Обслуживание`} />
                <div className="flex min-h-screen items-center justify-center bg-gray-100">
                    <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
                        <div className="mb-6">
                            {site.logo_url && (
                                <img
                                    src={site.logo_url}
                                    alt={site.name}
                                    className="mx-auto h-16 w-16 object-contain"
                                />
                            )}
                        </div>
                        <h1 className="mb-4 text-2xl font-bold text-gray-900">
                            {site.name}
                        </h1>
                        <p className="text-gray-600">
                            {site.maintenance_message ||
                                'Сайт временно недоступен. Ведутся технические работы.'}
                        </p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={homepage.title} />

            <div className="min-h-screen bg-white">
                {/* Header */}
                <header className="border-b bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center">
                                {site.logo_url && (
                                    <img
                                        src={site.logo_url}
                                        alt={site.name}
                                        className="h-8 w-auto"
                                    />
                                )}
                                <h1 className="ml-3 text-xl font-semibold text-gray-900">
                                    {site.name}
                                </h1>
                            </div>

                            {/* Navigation */}
                            <nav className="hidden space-x-8 md:flex">
                                {navigation.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group relative"
                                    >
                                        <a
                                            href={item.url}
                                            className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                                        >
                                            {item.title}
                                        </a>
                                        {item.children.length > 0 && (
                                            <div className="invisible absolute left-0 z-50 mt-2 w-48 rounded-md bg-white opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
                                                <div className="py-1">
                                                    {item.children.map(
                                                        (child) => (
                                                            <a
                                                                key={child.id}
                                                                href={child.url}
                                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            >
                                                                {child.title}
                                                            </a>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main>
                    {/* Hero Sliders */}
                    <SliderDisplay sliders={sliders} position="hero" />

                    {/* Page Content */}
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <div className="prose prose-lg max-w-none">
                            <h1 className="mb-6 text-3xl font-bold text-gray-900">
                                {homepage.title}
                            </h1>

                            {homepage.featured_image_url && (
                                <img
                                    src={homepage.featured_image_url}
                                    alt={homepage.title}
                                    className="mb-6 h-64 w-full rounded-lg object-cover"
                                />
                            )}

                            <div
                                dangerouslySetInnerHTML={{
                                    __html: homepage.content,
                                }}
                                className="leading-relaxed text-gray-700"
                            />
                        </div>
                    </div>

                    {/* Content Sliders */}
                    <SliderDisplay sliders={sliders} position="content" />
                </main>

                {/* Footer */}
                <footer className="bg-gray-900 text-white">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div>
                                <h3 className="mb-4 text-lg font-semibold">
                                    {site.name}
                                </h3>
                                {site.description && (
                                    <p className="text-gray-300">
                                        {site.description}
                                    </p>
                                )}
                            </div>

                            <div>
                                <h4 className="mb-4 text-lg font-semibold">
                                    Навигация
                                </h4>
                                <ul className="space-y-2">
                                    {navigation.map((item) => (
                                        <li key={item.id}>
                                            <a
                                                href={item.url}
                                                className="text-gray-300 hover:text-white"
                                            >
                                                {item.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="mb-4 text-lg font-semibold">
                                    Контакты
                                </h4>
                                <p className="text-gray-300">
                                    Свяжитесь с нами для получения
                                    дополнительной информации
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
                            <p>&copy; 2024 {site.name}. Все права защищены.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

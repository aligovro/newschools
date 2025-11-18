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
    image?: string;
    is_homepage: boolean;
    excerpt?: string;
}

interface NavigationItem {
    id: number;
    title: string;
    url: string;
    children: NavigationItem[];
}

interface BreadcrumbItem {
    title: string;
    url: string;
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
    page: Page;
    navigation: NavigationItem[];
    sliders: Slider[];
    breadcrumbs: BreadcrumbItem[];
}

export default function SitePage({
    site,
    page,
    navigation,
    sliders,
    breadcrumbs,
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
                        <h1 className="block__title mb-4">{site.name}</h1>
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
            <Head title={`${page.title} - ${site.name}`} />

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

                {/* Breadcrumbs */}
                {breadcrumbs.length > 1 && (
                    <nav className="border-b bg-gray-50">
                        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                            <ol className="flex items-center space-x-2 text-sm">
                                {breadcrumbs.map((item, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center"
                                    >
                                        {index > 0 && (
                                            <svg
                                                className="mx-2 h-4 w-4 text-gray-400"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                        <a
                                            href={item.url}
                                            className={`${
                                                index === breadcrumbs.length - 1
                                                    ? 'font-medium text-gray-900'
                                                    : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            {item.title}
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </nav>
                )}

                {/* Main Content */}
                <main>
                    {/* Hero Sliders */}
                    <SliderDisplay sliders={sliders} position="hero" />

                    {/* Page Content */}
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <div className="prose prose-lg max-w-none">
                            <h1 className="mb-6 text-3xl font-bold text-gray-900">
                                {page.title}
                            </h1>

                            {page.excerpt && (
                                <p className="mb-6 text-xl text-gray-600">
                                    {page.excerpt}
                                </p>
                            )}

                            {page.image && (
                                <img
                                    src={page.image}
                                    alt={page.title}
                                    className="mb-6 h-64 w-full rounded-lg object-cover"
                                />
                            )}

                            <div
                                dangerouslySetInnerHTML={{
                                    __html: page.content,
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

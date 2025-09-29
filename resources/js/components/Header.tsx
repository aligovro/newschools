import { Link } from '@inertiajs/react';
import { useState } from 'react';

interface OrganizationTypeConfig {
    name: string;
    plural: string;
    member_name: string;
    member_plural: string;
}

interface HeaderProps {
    auth?: {
        user?: {
            id: number;
            name: string;
            email: string;
        };
    };
    organizationTypes?: Record<string, OrganizationTypeConfig>;
    currentTypeConfig?: OrganizationTypeConfig;
}

export default function Header({
    auth,
    organizationTypes,
    currentTypeConfig,
}: HeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="header sticky top-0 z-50 bg-white shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                            <span className="text-lg font-bold text-white">
                                НС
                            </span>
                        </div>
                        <div className="hidden sm:block">
                            <div className="text-xl font-bold text-gray-900">
                                {currentTypeConfig?.plural || 'Организации'}
                            </div>
                            <div className="text-sm text-gray-500">
                                Поддерживай{' '}
                                {currentTypeConfig?.name?.toLowerCase() ||
                                    'организации'}
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center space-x-8 md:flex">
                        <Link
                            href="/organizations"
                            className="text-gray-700 transition-colors hover:text-blue-600"
                        >
                            Организации
                        </Link>
                        <Link
                            href="/projects"
                            className="text-gray-700 transition-colors hover:text-blue-600"
                        >
                            Проекты
                        </Link>
                        <Link
                            href="/events"
                            className="text-gray-700 transition-colors hover:text-blue-600"
                        >
                            События
                        </Link>
                        <Link
                            href="/reports"
                            className="text-gray-700 transition-colors hover:text-blue-600"
                        >
                            Отчетность
                        </Link>
                        <Link
                            href="/help"
                            className="text-gray-700 transition-colors hover:text-blue-600"
                        >
                            Помощь
                        </Link>
                    </nav>

                    {/* User Actions */}
                    <div className="flex items-center space-x-4">
                        {auth?.user ? (
                            <Link
                                href="/dashboard"
                                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                            >
                                Личный кабинет
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-gray-700 transition-colors hover:text-blue-600"
                                >
                                    Войти
                                </Link>
                                <Link
                                    href="/register"
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                                >
                                    Регистрация
                                </Link>
                            </>
                        )}

                        {/* Add Organization Button */}
                        <Link
                            href="/organizations/create"
                            className="hidden rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 sm:block"
                        >
                            Добавить организацию
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() =>
                                setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
                            className="rounded-lg p-2 transition-colors hover:bg-gray-100 md:hidden"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="border-t border-gray-200 py-4 md:hidden">
                        <nav className="flex flex-col space-y-4">
                            <Link
                                href="/organizations"
                                className="text-gray-700 transition-colors hover:text-blue-600"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Организации
                            </Link>
                            <Link
                                href="/projects"
                                className="text-gray-700 transition-colors hover:text-blue-600"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Проекты
                            </Link>
                            <Link
                                href="/events"
                                className="text-gray-700 transition-colors hover:text-blue-600"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                События
                            </Link>
                            <Link
                                href="/reports"
                                className="text-gray-700 transition-colors hover:text-blue-600"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Отчетность
                            </Link>
                            <Link
                                href="/help"
                                className="text-gray-700 transition-colors hover:text-blue-600"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Помощь
                            </Link>
                            <Link
                                href="/organizations/create"
                                className="rounded-lg bg-green-600 px-4 py-2 text-center text-white transition-colors hover:bg-green-700"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Добавить организацию
                            </Link>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}

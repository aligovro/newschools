import React from 'react';
import ThemeToggle from './ThemeToggle';

const TailwindTest: React.FC = () => {
    return (
        <div className="from-primary-500 via-primary-600 to-secondary-600 flex min-h-screen flex-col gap-8 bg-gradient-to-br p-8 text-white">
            {/* Header с переключателем темы */}
            <div className="flex items-center justify-between">
                <h1 className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-center text-4xl font-bold text-transparent">
                    🎨 Tailwind CSS Showcase 🎨
                </h1>
                <ThemeToggle />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="bg-error-500 rounded-lg p-4 shadow-lg">
                    <h2 className="mb-2 text-xl font-semibold">Error Box</h2>
                    <p className="text-error-100">
                        This is a test box with error colors
                    </p>
                </div>

                <div className="bg-success-500 rounded-lg p-4 shadow-lg">
                    <h2 className="mb-2 text-xl font-semibold">Success Box</h2>
                    <p className="text-success-100">
                        This is a test box with success colors
                    </p>
                </div>

                <div className="bg-warning-500 rounded-lg p-4 shadow-lg">
                    <h2 className="mb-2 text-xl font-semibold">Warning Box</h2>
                    <p className="text-warning-900">
                        This is a test box with warning colors
                    </p>
                </div>
            </div>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button className="bg-primary-600 hover:bg-primary-700 rounded-lg px-6 py-3 shadow-md transition-colors duration-200">
                    Primary Button
                </button>

                <button className="bg-secondary-600 hover:bg-secondary-700 rounded-lg px-6 py-3 shadow-md transition-colors duration-200">
                    Secondary Button
                </button>

                <button className="hover:text-primary-500 rounded-lg border-2 border-white px-6 py-3 transition-colors duration-200 hover:bg-white">
                    Outline Button
                </button>
            </div>

            <div className="mx-auto max-w-2xl">
                <h2 className="mb-4 text-center text-2xl font-bold">
                    Responsive Grid + Dark Theme Test
                </h2>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
                    {Array.from({ length: 12 }, (_, i) => (
                        <div
                            key={i}
                            className="rounded bg-white bg-opacity-20 p-4 text-center transition-all duration-200 hover:bg-opacity-30"
                        >
                            {i + 1}
                        </div>
                    ))}
                </div>
            </div>

            {/* Анимации и переходы */}
            <div className="mx-auto max-w-4xl">
                <h2 className="mb-6 text-center text-2xl font-bold">
                    🎭 Анимации и Эффекты
                </h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="group cursor-pointer rounded-lg bg-white/20 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/30 hover:shadow-xl">
                        <div className="text-center">
                            <div className="mx-auto mb-2 h-12 w-12 animate-pulse rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></div>
                            <p className="text-sm font-medium">
                                Pulse Animation
                            </p>
                        </div>
                    </div>

                    <div className="group cursor-pointer rounded-lg bg-white/20 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/30 hover:shadow-xl">
                        <div className="text-center">
                            <div className="mx-auto mb-2 h-12 w-12 animate-bounce rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                            <p className="text-sm font-medium">
                                Bounce Animation
                            </p>
                        </div>
                    </div>

                    <div className="group cursor-pointer rounded-lg bg-white/20 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/30 hover:shadow-xl">
                        <div className="text-center">
                            <div className="mx-auto mb-2 h-12 w-12 animate-ping rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                            <p className="text-sm font-medium">
                                Ping Animation
                            </p>
                        </div>
                    </div>

                    <div className="group cursor-pointer rounded-lg bg-white/20 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/30 hover:shadow-xl">
                        <div className="text-center">
                            <div className="mx-auto mb-2 h-12 w-12 animate-spin rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                            <p className="text-sm font-medium">
                                Spin Animation
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Градиенты и эффекты */}
            <div className="mx-auto max-w-4xl">
                <h2 className="mb-6 text-center text-2xl font-bold">
                    🌈 Градиенты и Визуальные Эффекты
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-6 shadow-2xl transition-all duration-500 hover:rotate-1 hover:scale-105">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                        <h3 className="relative text-xl font-bold">
                            Gradient Card
                        </h3>
                        <p className="relative mt-2 text-white/90">
                            Красивый градиент с hover эффектами
                        </p>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 p-6 shadow-2xl transition-all duration-500 hover:-rotate-1 hover:scale-105">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                        <h3 className="relative text-xl font-bold">
                            Animated Gradient
                        </h3>
                        <p className="relative mt-2 text-white/90">
                            Градиент с анимацией поворота
                        </p>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-bl from-green-400 via-emerald-500 to-teal-600 p-6 shadow-2xl transition-all duration-500 hover:rotate-1 hover:scale-105">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                        <h3 className="relative text-xl font-bold">
                            Eco Gradient
                        </h3>
                        <p className="relative mt-2 text-white/90">
                            Природные цвета с эффектами
                        </p>
                    </div>
                </div>
            </div>

            {/* Glassmorphism эффекты */}
            <div className="mx-auto max-w-4xl">
                <h2 className="mb-6 text-center text-2xl font-bold">
                    🪟 Glassmorphism Эффекты
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-md">
                        <h3 className="mb-3 text-xl font-bold">Glass Card</h3>
                        <p className="mb-4 text-white/90">
                            Стеклянный эффект с размытием фона
                        </p>
                        <button className="rounded-lg border border-white/30 bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all duration-200 hover:bg-white/30">
                            Glass Button
                        </button>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-lg">
                        <h3 className="mb-3 text-xl font-bold">Ultra Glass</h3>
                        <p className="mb-4 text-white/90">
                            Максимальное размытие и прозрачность
                        </p>
                        <button className="rounded-lg border border-white/20 bg-gradient-to-r from-white/20 to-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all duration-200 hover:from-white/30 hover:to-white/20">
                            Gradient Glass
                        </button>
                    </div>
                </div>
            </div>

            {/* Hover эффекты */}
            <div className="mx-auto max-w-4xl">
                <h2 className="mb-6 text-center text-2xl font-bold">
                    ✨ Hover Эффекты
                </h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <button className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                        <span className="relative z-10">Scale Up</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    </button>

                    <button className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                        <span className="relative z-10">Lift Up</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    </button>

                    <button className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:rotate-2 hover:shadow-2xl">
                        <span className="relative z-10">Rotate</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    </button>

                    <button className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:skew-x-2 hover:shadow-2xl">
                        <span className="relative z-10">Skew</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    </button>
                </div>
            </div>

            {/* Текст эффекты */}
            <div className="mx-auto max-w-4xl">
                <h2 className="mb-6 text-center text-2xl font-bold">
                    📝 Текст Эффекты
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
                        <h3 className="mb-4 text-xl font-bold">
                            Gradient Text
                        </h3>
                        <p className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                            Красивый градиентный текст
                        </p>
                        <p className="mt-2 text-white/80">
                            Используйте bg-clip-text для градиентного текста
                        </p>
                    </div>

                    <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
                        <h3 className="mb-4 text-xl font-bold">Text Shadow</h3>
                        <p className="text-2xl font-bold text-white drop-shadow-lg">
                            Текст с тенью
                        </p>
                        <p className="mt-2 text-white/80">
                            Используйте drop-shadow для теней текста
                        </p>
                    </div>
                </div>
            </div>

            {/* Responsive Grid */}
            <div className="mx-auto max-w-6xl">
                <h2 className="mb-6 text-center text-2xl font-bold">
                    📱 Responsive Grid System
                </h2>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                    {Array.from({ length: 16 }, (_, i) => (
                        <div
                            key={i}
                            className="group cursor-pointer rounded-lg bg-white/10 p-4 text-center backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-lg"
                        >
                            <div className="text-lg font-bold">{i + 1}</div>
                            <div className="text-xs opacity-75">
                                {i < 8
                                    ? 'sm'
                                    : i < 12
                                      ? 'md'
                                      : i < 14
                                        ? 'lg'
                                        : 'xl'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Loading States */}
            <div className="mx-auto max-w-4xl">
                <h2 className="mb-6 text-center text-2xl font-bold">
                    ⏳ Loading States
                </h2>
                <div className="flex flex-wrap justify-center gap-4">
                    <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                        <span>Loading...</span>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
                        <div className="flex space-x-1">
                            <div className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.3s]"></div>
                            <div className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.15s]"></div>
                            <div className="h-2 w-2 animate-bounce rounded-full bg-white"></div>
                        </div>
                        <span>Loading...</span>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
                        <div className="h-4 w-4 animate-pulse rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></div>
                        <span>Loading...</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center">
                <p className="text-primary-100 text-lg">
                    ✅ Tailwind CSS работает! ✅ Кастомные цвета работают! ✅
                    Темная тема работает! 🎉
                </p>
                <p className="text-primary-200 mt-2 text-sm">
                    Попробуйте переключатель темы в правом верхнем углу!
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur-sm">
                        Gradients
                    </span>
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur-sm">
                        Animations
                    </span>
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur-sm">
                        Glassmorphism
                    </span>
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur-sm">
                        Hover Effects
                    </span>
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur-sm">
                        Responsive
                    </span>
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur-sm">
                        Dark Theme
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TailwindTest;

import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import RussianPhoneInput from '@/components/ui/RussianPhoneInput';
import { Checkbox } from '@/components/ui/checkbox';
import MainLayout from '@/layouts/MainLayout';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    site: any;
    positions: any[];
    position_settings?: any[];
}

export default function Login({
    status,
    canResetPassword,
    site,
    positions,
    position_settings = [],
}: LoginProps) {
    const [mode, setMode] = useState<'email' | 'phone'>('email');
    return (
        <MainLayout
            site={site}
            positions={positions}
            position_settings={position_settings}
            pageTitle="Вход"
            pageDescription="Войдите в свой аккаунт, чтобы поддерживать школы и проекты"
            breadcrumbs={[
                { title: 'Главная', href: '/' },
                { title: 'Вход', href: '' },
            ]}
        >
            <Head title="Вход" />

            <div className="profile-page">
                <section className="profile-section w-full rounded-[20px] bg-white p-8 shadow-[0_4px_84px_0_rgba(26,26,26,0.08)]">
                    <div className="mx-auto max-w-md">
                        <h2 className="profile-section__title mb-2">Вход</h2>
                        <p className="profile-section__description mb-8">
                            Войдите в свой аккаунт, чтобы продолжить.
                        </p>

                        {status && (
                            <div className="mb-4 text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}

                        <Form
                            {...AuthenticatedSessionController.store.form()}
                            resetOnSuccess={['password']}
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="space-y-4">
                                        {/* Переключатель способа входа */}
                                        <div className="flex gap-2 text-sm">
                                            <button
                                                type="button"
                                                className={`rounded-full px-3 py-1 ${
                                                    mode === 'email'
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'bg-slate-50 text-slate-600'
                                                }`}
                                                onClick={() => setMode('email')}
                                            >
                                                По email
                                            </button>
                                        <button
                                                type="button"
                                                className={`rounded-full px-3 py-1 ${
                                                    mode === 'phone'
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'bg-slate-50 text-slate-600'
                                                }`}
                                                onClick={() => setMode('phone')}
                                            >
                                                По телефону
                                            </button>
                                        </div>

                                        {/* Логин */}
                                        {mode === 'email' ? (
                                            <div className="relative">
                                                <input
                                                    id="login"
                                                    type="email"
                                                    name="login"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="email"
                                                    placeholder="email@example.com"
                                                    className="profile-section__input w-full rounded-[10px] border border-[#e8ecf3] px-4 pb-3 pt-[33px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                />
                                                <label
                                                    htmlFor="login"
                                                    className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                                                >
                                                    Email
                                                </label>
                                                <InputError
                                                    message={errors.login}
                                                    className="profile-section__field-error"
                                                />
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <RussianPhoneInput
                                                    id="login"
                                                    name="login"
                                                    tabIndex={1}
                                                    autoComplete="tel"
                                                    className="profile-section__input w-full rounded-[10px] border border-[#e8ecf3] px-4 pb-3 pt-[33px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                />
                                                <label
                                                    htmlFor="login"
                                                    className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                                                >
                                                    Телефон
                                                </label>
                                                <InputError
                                                    message={errors.login}
                                                    className="profile-section__field-error"
                                                />
                                            </div>
                                        )}

                                        {/* Пароль */}
                                        <div className="relative">
                                            <input
                                                id="password"
                                                type="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="Пароль"
                                                className="profile-section__input w-full rounded-[10px] border border-[#e8ecf3] px-4 pb-3 pt-[33px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                            />
                                            <label
                                                htmlFor="password"
                                                className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                                            >
                                                Пароль
                                            </label>
                                            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                                <InputError message={errors.password} />
                                                {canResetPassword && (
                                                    <TextLink
                                                        href={request()}
                                                        className="text-xs"
                                                        tabIndex={5}
                                                    >
                                                        Забыли пароль?
                                                    </TextLink>
                                                )}
                                            </div>
                                        </div>

                                        {/* Запомнить меня */}
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                tabIndex={3}
                                            />
                                            <label
                                                htmlFor="remember"
                                                className="text-sm text-gray-700"
                                            >
                                                Запомнить меня
                                            </label>
                                        </div>
                                    </div>

                                    {/* Кнопка */}
                                    <button
                                        type="submit"
                                        className="profile-section__submit-button w-full rounded-[10px] bg-gradient-to-r from-[#96bdff] to-[#3259ff] px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing && (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                        )}
                                        Войти
                                    </button>
                                </>
                            )}
                        </Form>

                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            Нет аккаунта?{' '}
                            <TextLink href={register()} tabIndex={5}>
                                Зарегистрироваться
                            </TextLink>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}

import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import RussianPhoneInput from '@/components/ui/RussianPhoneInput';
import MainLayout from '@/layouts/MainLayout';

interface RegisterProps {
    site: any;
    positions: any[];
    position_settings?: any[];
}

export default function Register({
    site,
    positions,
    position_settings = [],
}: RegisterProps) {
    return (
        <MainLayout
            site={site}
            positions={positions}
            position_settings={position_settings}
            pageTitle="Регистрация"
            pageDescription="Создайте аккаунт, чтобы поддерживать школы и проекты"
            breadcrumbs={[
                { title: 'Главная', href: '/' },
                { title: 'Регистрация', href: '' },
            ]}
        >
            <Head title="Регистрация" />

            <div className="profile-page">
                <section className="profile-section w-full rounded-[20px] bg-white p-8 shadow-[0_4px_84px_0_rgba(26,26,26,0.08)]">
                    <div className="mx-auto max-w-md">
                        <h2 className="profile-section__title mb-2">
                            Регистрация
                        </h2>
                        <p className="profile-section__description mb-8">
                            Создайте аккаунт, чтобы поддерживать школы и
                            проекты.
                        </p>

                        <Form
                            {...RegisteredUserController.store.form()}
                            resetOnSuccess={[
                                'password',
                                'password_confirmation',
                            ]}
                            disableWhileProcessing
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="space-y-4">
                                        {/* Имя */}
                                        <div className="relative">
                                            <input
                                                id="name"
                                                type="text"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="name"
                                                name="name"
                                                placeholder="Имя и фамилия"
                                                className="profile-section__input w-full rounded-[10px] border border-[#e8ecf3] px-4 pb-3 pt-[33px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                            />
                                            <label
                                                htmlFor="name"
                                                className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                                            >
                                                Имя
                                            </label>
                                            <InputError
                                                message={errors.name}
                                                className="profile-section__field-error"
                                            />
                                        </div>

                                        {/* Email */}
                                        <div className="relative">
                                            <input
                                                id="email"
                                                type="email"
                                                tabIndex={2}
                                                autoComplete="email"
                                                name="email"
                                                placeholder="email@example.com"
                                                className="profile-section__input w-full rounded-[10px] border border-[#e8ecf3] px-4 pb-3 pt-[33px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                            />
                                            <label
                                                htmlFor="email"
                                                className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                                            >
                                                Email (необязательно)
                                            </label>
                                            <InputError
                                                message={errors.email}
                                                className="profile-section__field-error"
                                            />
                                        </div>

                                        {/* Телефон */}
                                        <div className="relative">
                                            <RussianPhoneInput
                                                id="phone"
                                                name="phone"
                                                tabIndex={3}
                                                autoComplete="tel"
                                                className="phone-input--with-label"
                                            />
                                            <label
                                                htmlFor="phone"
                                                className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                                            >
                                                Телефон (необязательно)
                                            </label>
                                            <span className="mt-1 block text-xs text-muted-foreground">
                                                Укажите email или телефон —
                                                достаточно одного
                                            </span>
                                            <InputError
                                                message={errors.phone}
                                                className="profile-section__field-error"
                                            />
                                        </div>

                                        {/* Пароль */}
                                        <div className="relative">
                                            <input
                                                id="password"
                                                type="password"
                                                required
                                                tabIndex={4}
                                                autoComplete="new-password"
                                                name="password"
                                                placeholder="Пароль"
                                                className="profile-section__input w-full rounded-[10px] border border-[#e8ecf3] px-4 pb-3 pt-[33px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                            />
                                            <label
                                                htmlFor="password"
                                                className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                                            >
                                                Пароль
                                            </label>
                                            <InputError
                                                message={errors.password}
                                                className="profile-section__field-error"
                                            />
                                        </div>

                                        {/* Подтверждение пароля */}
                                        <div className="relative">
                                            <input
                                                id="password_confirmation"
                                                type="password"
                                                required
                                                tabIndex={5}
                                                autoComplete="new-password"
                                                name="password_confirmation"
                                                placeholder="Повторите пароль"
                                                className="profile-section__input w-full rounded-[10px] border border-[#e8ecf3] px-4 pb-3 pt-[33px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                            />
                                            <label
                                                htmlFor="password_confirmation"
                                                className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                                            >
                                                Подтверждение пароля
                                            </label>
                                            <InputError
                                                message={
                                                    errors.password_confirmation
                                                }
                                                className="profile-section__field-error"
                                            />
                                        </div>
                                    </div>

                                    {/* Кнопка */}
                                    <button
                                        type="submit"
                                        className="profile-section__submit-button flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#96bdff] to-[#3259ff] px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                        tabIndex={6}
                                        data-test="register-user-button"
                                        disabled={processing}
                                    >
                                        {processing && (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                        )}
                                        Создать аккаунт
                                    </button>
                                </>
                            )}
                        </Form>

                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            Уже есть аккаунт?{' '}
                            <TextLink href={login()} tabIndex={7}>
                                Войти
                            </TextLink>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}

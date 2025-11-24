// Components
import PasswordResetLinkController from '@/actions/App/Http/Controllers/Auth/PasswordResetLinkController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import RussianPhoneInput from '@/components/ui/RussianPhoneInput';
import MainLayout from '@/layouts/MainLayout';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

interface ForgotPasswordProps {
    status?: string;
    site: any;
    positions: any[];
    position_settings?: any[];
}

export default function ForgotPassword({
    status,
    site,
    positions,
    position_settings = [],
}: ForgotPasswordProps) {
    return (
        <MainLayout
            site={site}
            positions={positions}
            position_settings={position_settings}
            pageTitle="Восстановление пароля"
            pageDescription="Введите email, чтобы получить ссылку для сброса пароля"
            breadcrumbs={[
                { title: 'Главная', href: '/' },
                { title: 'Восстановление пароля', href: '' },
            ]}
        >
            <Head title="Восстановление пароля" />

            <div className="profile-page">
                <section className="profile-section w-full rounded-[20px] bg-white p-8 shadow-[0_4px_84px_0_rgba(26,26,26,0.08)]">
                    <div className="mx-auto max-w-md">
                        <h2 className="profile-section__title mb-2">
                            Восстановление пароля
                        </h2>
                        <p className="profile-section__description mb-8">
                            Введите email, и мы отправим ссылку для сброса
                            пароля.
                        </p>

                        {status && (
                            <div className="mb-4 text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}

                        <Form {...PasswordResetLinkController.store.form()}>
                            {({ processing, errors }) => (
                                <>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                autoComplete="off"
                                                autoFocus
                                                placeholder="email@example.com"
                                                className="profile-section__input w-full rounded-[10px] border border-[#e8ecf3] px-4 pb-3 pt-[33px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                            />
                                            <label
                                                htmlFor="email"
                                                className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                                            >
                                                Email
                                            </label>
                                            <InputError
                                                message={errors.email}
                                                className="profile-section__field-error"
                                            />
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Можно указать email или номер
                                                телефона.
                                            </p>
                                        </div>

                                        <div className="relative">
                                            <RussianPhoneInput
                                                id="phone"
                                                name="phone"
                                                autoComplete="tel"
                                                className="phone-input--with-label"
                                            />
                                            <label
                                                htmlFor="phone"
                                                className="profile-section__label pointer-events-none absolute left-4 top-[9px]"
                                            >
                                                Телефон (необязательно)
                                            </label>
                                            <InputError
                                                message={errors.phone}
                                                className="profile-section__field-error"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        className="profile-section__submit-button mt-6 flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#96bdff] to-[#3259ff] px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={processing}
                                        data-test="email-password-reset-link-button"
                                        type="submit"
                                    >
                                        {processing && (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                        )}
                                        Отправить ссылку для сброса пароля
                                    </button>
                                </>
                            )}
                        </Form>

                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            <span>или вернуться ко </span>
                            <TextLink href={login()}>входу</TextLink>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}

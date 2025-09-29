import { useApp } from '@/hooks/useApp';
import { useAuth } from '@/hooks/useAuth';
import { cn, formatCardNumber, formatExpiryDate } from '@/lib/helpers';
import { donationSchema, type DonationFormData } from '@/lib/validations';
import { yupResolver } from '@hookform/resolvers/yup';
import * as cardValidator from 'card-validator';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const ExampleForm: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const { showNotification } = useApp();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<DonationFormData>({
        resolver: yupResolver(donationSchema),
    });

    const onSubmit = async (data: DonationFormData) => {
        try {
            // Здесь будет логика отправки формы
            console.log('Form data:', data);
            console.log('Selected date:', selectedDate);
            console.log('Card number:', cardNumber);
            console.log('Expiry date:', expiryDate);
            console.log('Phone number:', phoneNumber);

            showNotification({
                type: 'success',
                title: 'Успешно!',
                message: 'Форма отправлена успешно',
            });

            reset();
        } catch (error) {
            showNotification({
                type: 'error',
                title: 'Ошибка',
                message: 'Произошла ошибка при отправке формы',
            });
        }
    };

    const handleCardNumberChange = (value: string) => {
        const formatted = formatCardNumber(value);
        setCardNumber(formatted);
    };

    const handleExpiryDateChange = (value: string) => {
        const formatted = formatExpiryDate(value);
        setExpiryDate(formatted);
    };

    const cardType = cardValidator.number(cardNumber.replace(/\s/g, '')).card
        ?.type;
    const isCardValid = cardValidator.number(
        cardNumber.replace(/\s/g, ''),
    ).isValid;

    return (
        <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-6 text-center text-2xl font-bold">
                Пример формы с использованием всех библиотек
            </h2>

            {isAuthenticated && (
                <div className="mb-4 rounded-md bg-green-100 p-3">
                    <p className="text-sm text-green-800">
                        Привет, {user?.name}! Вы авторизованы.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Поле суммы пожертвования */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Сумма пожертвования
                    </label>
                    <input
                        {...register('amount')}
                        type="number"
                        className={cn(
                            'w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
                            errors.amount
                                ? 'border-red-500'
                                : 'border-gray-300',
                        )}
                        placeholder="Введите сумму"
                    />
                    {errors.amount && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.amount.message}
                        </p>
                    )}
                </div>

                {/* Поле имени жертвователя */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Ваше имя
                    </label>
                    <input
                        {...register('donor_name')}
                        type="text"
                        className={cn(
                            'w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
                            errors.donor_name
                                ? 'border-red-500'
                                : 'border-gray-300',
                        )}
                        placeholder="Введите ваше имя"
                    />
                    {errors.donor_name && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.donor_name.message}
                        </p>
                    )}
                </div>

                {/* Поле email */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        {...register('donor_email')}
                        type="email"
                        className={cn(
                            'w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
                            errors.donor_email
                                ? 'border-red-500'
                                : 'border-gray-300',
                        )}
                        placeholder="Введите email"
                    />
                    {errors.donor_email && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.donor_email.message}
                        </p>
                    )}
                </div>

                {/* Поле телефона */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Телефон
                    </label>
                    <PhoneInput
                        value={phoneNumber}
                        onChange={setPhoneNumber}
                        defaultCountry="RU"
                        placeholder="Введите номер телефона"
                        className="w-full"
                    />
                </div>

                {/* Поле номера карты */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Номер карты
                    </label>
                    <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        className={cn(
                            'w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
                            !isCardValid && cardNumber
                                ? 'border-red-500'
                                : 'border-gray-300',
                        )}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                    />
                    {cardType && (
                        <p className="mt-1 text-xs text-gray-600">
                            Тип карты: {cardType}
                        </p>
                    )}
                    {!isCardValid && cardNumber && (
                        <p className="mt-1 text-xs text-red-500">
                            Неверный номер карты
                        </p>
                    )}
                </div>

                {/* Поле срока действия карты */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Срок действия
                    </label>
                    <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => handleExpiryDateChange(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ММ/ГГ"
                        maxLength={5}
                    />
                </div>

                {/* Поле сообщения */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Сообщение (необязательно)
                    </label>
                    <textarea
                        {...register('message')}
                        rows={3}
                        className={cn(
                            'w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
                            errors.message
                                ? 'border-red-500'
                                : 'border-gray-300',
                        )}
                        placeholder="Ваше сообщение"
                    />
                    {errors.message && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.message.message}
                        </p>
                    )}
                </div>

                {/* Информация о выбранной дате */}
                <div className="rounded-md bg-gray-100 p-3">
                    <p className="text-sm text-gray-700">
                        Выбранная дата:{' '}
                        {format(selectedDate, 'dd MMMM yyyy', { locale: ru })}
                    </p>
                </div>

                {/* Кнопка отправки */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                        'w-full rounded-md px-4 py-2 font-medium transition-colors',
                        isSubmitting
                            ? 'cursor-not-allowed bg-gray-400'
                            : 'bg-blue-600 text-white hover:bg-blue-700',
                    )}
                >
                    {isSubmitting ? 'Отправка...' : 'Отправить пожертвование'}
                </button>
            </form>
        </div>
    );
};

export default ExampleForm;

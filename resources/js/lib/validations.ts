import * as yup from 'yup';

// Схемы валидации для различных форм

// Валидация для входа
export const loginSchema = yup.object({
    email: yup
        .string()
        .email('Введите корректный email адрес')
        .required('Email обязателен для заполнения'),
    password: yup
        .string()
        .min(6, 'Пароль должен содержать минимум 6 символов')
        .required('Пароль обязателен для заполнения'),
});

// Валидация для регистрации
export const registerSchema = yup.object({
    name: yup
        .string()
        .min(2, 'Имя должно содержать минимум 2 символа')
        .max(50, 'Имя не должно превышать 50 символов')
        .required('Имя обязательно для заполнения'),
    email: yup
        .string()
        .email('Введите корректный email адрес')
        .required('Email обязателен для заполнения'),
    password: yup
        .string()
        .min(8, 'Пароль должен содержать минимум 8 символов')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Пароль должен содержать минимум одну строчную букву, одну заглавную букву и одну цифру',
        )
        .required('Пароль обязателен для заполнения'),
    password_confirmation: yup
        .string()
        .oneOf([yup.ref('password')], 'Пароли должны совпадать')
        .required('Подтверждение пароля обязательно'),
});

// Валидация для сброса пароля
export const resetPasswordSchema = yup.object({
    email: yup
        .string()
        .email('Введите корректный email адрес')
        .required('Email обязателен для заполнения'),
});

// Валидация для изменения пароля
export const changePasswordSchema = yup.object({
    current_password: yup
        .string()
        .required('Текущий пароль обязателен для заполнения'),
    password: yup
        .string()
        .min(8, 'Пароль должен содержать минимум 8 символов')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Пароль должен содержать минимум одну строчную букву, одну заглавную букву и одну цифру',
        )
        .required('Новый пароль обязателен для заполнения'),
    password_confirmation: yup
        .string()
        .oneOf([yup.ref('password')], 'Пароли должны совпадать')
        .required('Подтверждение пароля обязательно'),
});

// Валидация для профиля пользователя
export const profileSchema = yup.object({
    name: yup
        .string()
        .min(2, 'Имя должно содержать минимум 2 символа')
        .max(50, 'Имя не должно превышать 50 символов')
        .required('Имя обязательно для заполнения'),
    email: yup
        .string()
        .email('Введите корректный email адрес')
        .required('Email обязателен для заполнения'),
});

// Валидация для контактной формы
export const contactSchema = yup.object({
    name: yup
        .string()
        .min(2, 'Имя должно содержать минимум 2 символа')
        .required('Имя обязательно для заполнения'),
    email: yup
        .string()
        .email('Введите корректный email адрес')
        .required('Email обязателен для заполнения'),
    subject: yup
        .string()
        .min(5, 'Тема должна содержать минимум 5 символов')
        .required('Тема обязательна для заполнения'),
    message: yup
        .string()
        .min(10, 'Сообщение должно содержать минимум 10 символов')
        .required('Сообщение обязательно для заполнения'),
});

// Валидация для пожертвования
export const donationSchema = yup.object({
    amount: yup
        .number()
        .min(1, 'Сумма должна быть больше 0')
        .required('Сумма пожертвования обязательна'),
    donor_name: yup
        .string()
        .min(2, 'Имя должно содержать минимум 2 символа')
        .required('Имя жертвователя обязательно'),
    donor_email: yup
        .string()
        .email('Введите корректный email адрес')
        .required('Email обязателен для заполнения'),
    message: yup
        .string()
        .max(500, 'Сообщение не должно превышать 500 символов'),
});

// Валидация для банковской карты
export const cardSchema = yup.object({
    cardNumber: yup
        .string()
        .matches(/^\d{16}$/, 'Номер карты должен содержать 16 цифр')
        .required('Номер карты обязателен'),
    expiryDate: yup
        .string()
        .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Формат даты: ММ/ГГ')
        .required('Срок действия обязателен'),
    cvv: yup
        .string()
        .matches(/^\d{3,4}$/, 'CVV должен содержать 3-4 цифры')
        .required('CVV обязателен'),
    cardholderName: yup
        .string()
        .min(2, 'Имя должно содержать минимум 2 символа')
        .required('Имя владельца карты обязательно'),
});

// Валидация для создания сайта
export const siteCreationSchema = yup.object({
    name: yup
        .string()
        .min(2, 'Название должно содержать минимум 2 символа')
        .max(100, 'Название не должно превышать 100 символов')
        .required('Название сайта обязательно'),
    domain: yup
        .string()
        .matches(
            /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
            'Введите корректный домен',
        )
        .required('Домен обязателен'),
    subdomain: yup
        .string()
        .matches(
            /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/,
            'Введите корректный поддомен',
        )
        .optional(),
    description: yup
        .string()
        .max(500, 'Описание не должно превышать 500 символов')
        .optional(),
    organizationId: yup
        .number()
        .positive('ID организации должен быть положительным')
        .required('ID организации обязателен'),
});

// Валидация для SEO настроек
export const seoSettingsSchema = yup.object({
    title: yup
        .string()
        .min(10, 'SEO заголовок должен содержать минимум 10 символов')
        .max(60, 'SEO заголовок не должен превышать 60 символов')
        .required('SEO заголовок обязателен'),
    description: yup
        .string()
        .min(50, 'SEO описание должно содержать минимум 50 символов')
        .max(160, 'SEO описание не должно превышать 160 символов')
        .required('SEO описание обязательно'),
    keywords: yup
        .string()
        .max(200, 'Ключевые слова не должны превышать 200 символов')
        .optional(),
    ogTitle: yup
        .string()
        .max(95, 'OG заголовок не должен превышать 95 символов')
        .optional(),
    ogDescription: yup
        .string()
        .max(200, 'OG описание не должно превышать 200 символов')
        .optional(),
    canonicalUrl: yup.string().url('Введите корректный URL').optional(),
    robots: yup
        .string()
        .oneOf(
            [
                'index, follow',
                'index, nofollow',
                'noindex, follow',
                'noindex, nofollow',
            ],
            'Выберите корректное значение для robots',
        ),
});

// Валидация для настроек темы
export const themeSettingsSchema = yup.object({
    name: yup
        .string()
        .min(2, 'Название темы должно содержать минимум 2 символа')
        .max(50, 'Название темы не должно превышать 50 символов')
        .required('Название темы обязательно'),
    primaryColor: yup
        .string()
        .matches(
            /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
            'Введите корректный hex цвет',
        )
        .required('Основной цвет обязателен'),
    secondaryColor: yup
        .string()
        .matches(
            /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
            'Введите корректный hex цвет',
        )
        .required('Дополнительный цвет обязателен'),
    backgroundColor: yup
        .string()
        .matches(
            /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
            'Введите корректный hex цвет',
        )
        .required('Цвет фона обязателен'),
    textColor: yup
        .string()
        .matches(
            /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
            'Введите корректный hex цвет',
        )
        .required('Цвет текста обязателен'),
    fontFamily: yup.string().required('Семейство шрифтов обязательно'),
    customCss: yup
        .string()
        .max(10000, 'Пользовательский CSS не должен превышать 10000 символов')
        .optional(),
});

// Валидация для загрузки медиа
export const mediaUploadSchema = yup.object({
    file: yup
        .mixed<File>()
        .required('Файл обязателен')
        .test('fileSize', 'Размер файла не должен превышать 10MB', (value) => {
            return value && value.size <= 10 * 1024 * 1024;
        })
        .test('fileType', 'Неподдерживаемый тип файла', (value) => {
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'image/svg+xml',
                'video/mp4',
                'video/webm',
                'application/pdf',
                'text/plain',
            ];
            return value && allowedTypes.includes(value.type);
        }),
});

// Типы для TypeScript
export type LoginFormData = yup.InferType<typeof loginSchema>;
export type RegisterFormData = yup.InferType<typeof registerSchema>;
export type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;
export type ChangePasswordFormData = yup.InferType<typeof changePasswordSchema>;
export type ProfileFormData = yup.InferType<typeof profileSchema>;
export type ContactFormData = yup.InferType<typeof contactSchema>;
export type DonationFormData = yup.InferType<typeof donationSchema>;
export type CardFormData = yup.InferType<typeof cardSchema>;
export type SiteCreationFormData = yup.InferType<typeof siteCreationSchema>;
export type SeoSettingsFormData = yup.InferType<typeof seoSettingsSchema>;
export type ThemeSettingsFormData = yup.InferType<typeof themeSettingsSchema>;
export type MediaUploadFormData = yup.InferType<typeof mediaUploadSchema>;

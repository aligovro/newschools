import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import RussianPhoneInput from '@/components/ui/RussianPhoneInput';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import PersonalDataConsent from '@/components/ui/personal-data-consent/PersonalDataConsent';
import { cn } from '@/lib/utils';
import type { User } from '@/types';
import { Loader2 } from 'lucide-react';

interface SubscribeSponsorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    organization: { id: number; name: string } | null;
    onCompleted?: (user: User) => void;
    projectId?: number | null;
    reloadOnSuccess?: boolean;
}

type Step = 'phone' | 'code' | 'profile' | 'success';

interface VerificationResponse {
    user: User;
    is_new_user: boolean;
    requires_profile_completion: boolean;
    requires_password: boolean;
}

interface RequestCodeResponse {
    token: string;
    masked_phone: string;
    expires_at: string | null;
}

type ApiErrorResponse = {
    message?: string;
    errors?: Record<string, string[]>;
};

const extractErrorMessage = (
    error: unknown,
    field: string,
    fallback: string,
): string => {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const data = error.response?.data;
        const fieldMessage = data?.errors?.[field]?.[0];
        if (fieldMessage) {
            return fieldMessage;
        }
        if (data?.message) {
            return data.message;
        }
    }

    return fallback;
};

const initialProfileState = {
    name: '',
    email: '',
    photo: '',
    password: '',
    password_confirmation: '',
};

export const SubscribeSponsorModal = ({
    open,
    onOpenChange,
    organization,
    onCompleted,
    projectId = null,
    reloadOnSuccess = true,
}: SubscribeSponsorModalProps) => {
    const [step, setStep] = useState<Step>('phone');
    const [phone, setPhone] = useState<string>('');
    const [maskedPhone, setMaskedPhone] = useState<string>('');
    const [verificationToken, setVerificationToken] = useState<string>('');
    const [code, setCode] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState(initialProfileState);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isPersonalDataAccepted, setIsPersonalDataAccepted] = useState(false);
    const [requiresPassword, setRequiresPassword] = useState(false);

    useEffect(() => {
        if (!open) {
            setStep('phone');
            setPhone('');
            setMaskedPhone('');
            setVerificationToken('');
            setCode('');
            setErrors({});
            setUser(null);
            setProfile(initialProfileState);
            setPhotoPreview(null);
            setIsPersonalDataAccepted(false);
            setRequiresPassword(false);
        }
    }, [open]);

    useEffect(() => {
        if (step === 'profile' && user) {
            setProfile({
                name: user.name || '',
                email: user.email || '',
                photo: user.photo || '',
                password: '',
                password_confirmation: '',
            });
            setPhotoPreview(user.photo || null);
        }
    }, [step, user]);

    const organizationName = useMemo(
        () => organization?.name ?? 'организацию',
        [organization],
    );

    const handleSuccess = useCallback(
        (nextUser: User, message?: string) => {
            setUser(nextUser);
            setStep('success');
            onCompleted?.(nextUser);
            toast.success(message ?? 'Вы успешно подписались как спонсор!');

            if (reloadOnSuccess) {
                setTimeout(() => {
                    window.location.reload();
                }, 150);
            }
        },
        [onCompleted, reloadOnSuccess],
    );

    const handlePhoneChange = useCallback((value: string) => {
        setPhone(value);
        setErrors((prev) => ({ ...prev, phone: null }));
    }, []);

    const phoneDigitsLength = useMemo(() => {
        const digitsOnly = phone.replace(/\D/g, '');
        if (phone.startsWith('+7')) {
            return digitsOnly.slice(1).length;
        }
        return digitsOnly.length;
    }, [phone]);

    const handleRequestCode = useCallback(async () => {
        if (!organization?.id) {
            setErrors((prev) => ({
                ...prev,
                organization: 'Невозможно подписаться: организация не найдена',
            }));
            return;
        }

        if (phoneDigitsLength !== 10) {
            setErrors((prev) => ({
                ...prev,
                phone: 'Введите корректный номер телефона',
            }));
            return;
        }

        if (!isPersonalDataAccepted) {
            setErrors((prev) => ({
                ...prev,
                personalData:
                    'Необходимо принять условия обработки персональных данных',
            }));
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await axios.post<RequestCodeResponse>(
                '/api/auth/phone/request-code',
                {
                    phone,
                    organization_id: organization.id,
                    project_id: projectId ?? undefined,
                },
                {
                    withCredentials: true,
                },
            );

            setVerificationToken(response.data.token);
            setMaskedPhone(response.data.masked_phone);
            setStep('code');
            toast.success('Код отправлен. Проверьте SMS.');
        } catch (error: unknown) {
            setErrors({
                phone: extractErrorMessage(
                    error,
                    'phone',
                    'Не удалось отправить код. Попробуйте позже.',
                ),
            });
        } finally {
            setLoading(false);
        }
    }, [
        organization?.id,
        phoneDigitsLength,
        isPersonalDataAccepted,
        phone,
        projectId,
    ]);

    const handleVerifyCode = useCallback(async () => {
        if (!verificationToken || code.length !== 6 || !organization?.id) {
            setErrors({
                code:
                    code.length !== 6
                        ? 'Введите 6-значный код'
                        : 'Ошибка проверки кода',
            });
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await axios.post<VerificationResponse>(
                '/api/auth/phone/verify-code',
                {
                    token: verificationToken,
                    code,
                    organization_id: organization.id,
                    project_id: projectId ?? undefined,
                    remember: true,
                },
                {
                    withCredentials: true,
                },
            );

            setUser(response.data.user);
            const needsProfileStep =
                response.data.requires_profile_completion ||
                response.data.requires_password;

            setRequiresPassword(response.data.requires_password);

            if (needsProfileStep) {
                setStep('profile');
                toast.success(
                    response.data.requires_password
                        ? 'Телефон подтверждён. Заполните профиль и придумайте пароль.'
                        : 'Телефон подтверждён. Заполните профиль, чтобы завершить подписку.',
                );
            } else {
                handleSuccess(response.data.user);
            }
        } catch (error: unknown) {
            setErrors({
                code: extractErrorMessage(
                    error,
                    'code',
                    'Неверный код. Попробуйте ещё раз.',
                ),
            });
        } finally {
            setLoading(false);
        }
    }, [verificationToken, code, organization?.id, projectId, handleSuccess]);

    const handleResendCode = useCallback(async () => {
        await handleRequestCode();
        setCode('');
    }, [handleRequestCode]);

    const handleUploadPhoto = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.length) {
            return;
        }

        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('photo', file);

        setLoading(true);
        setErrors({});

        try {
            const response = await axios.post<{
                success: boolean;
                url: string;
            }>('/api/auth/phone/photo', formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setProfile((prev) => ({
                    ...prev,
                    photo: response.data.url,
                }));
                setPhotoPreview(response.data.url);
                toast.success('Фото успешно загружено');
            }
        } catch (error: unknown) {
            setErrors({
                photo: extractErrorMessage(
                    error,
                    'photo',
                    'Не удалось загрузить фотографию.',
                ),
            });
        } finally {
            setLoading(false);
        }
        },
        [],
    );

    const handleCompleteProfile = useCallback(async () => {
        if (!profile.name.trim()) {
            setErrors({ profile: 'Введите имя' });
            return;
        }

        if (requiresPassword && profile.password.trim().length < 6) {
            setErrors((prev) => ({
                ...prev,
                password: 'Минимальная длина пароля — 6 символов',
            }));
            return;
        }

        if (
            requiresPassword &&
            profile.password !== profile.password_confirmation
        ) {
            setErrors((prev) => ({
                ...prev,
                password: 'Пароль и подтверждение должны совпадать',
            }));
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await axios.patch<{
                user: User;
            }>(
                '/api/auth/phone/profile',
                {
                    name: profile.name,
                    email: profile.email || null,
                    photo: profile.photo || null,
                    password: profile.password || null,
                    password_confirmation:
                        profile.password_confirmation || null,
                },
                {
                    withCredentials: true,
                },
            );

            handleSuccess(
                response.data.user,
                'Профиль обновлён и подписка оформлена!',
            );
        } catch (error: unknown) {
            const emailMessage = extractErrorMessage(error, 'email', '');
            const profileMessage = extractErrorMessage(
                error,
                'name',
                extractErrorMessage(
                    error,
                    'profile',
                    'Не удалось сохранить профиль',
                ),
            );

            setErrors({
                email: emailMessage || null,
                profile: profileMessage,
                password: extractErrorMessage(error, 'password', '') || null,
            });
        } finally {
            setLoading(false);
        }
    }, [profile, requiresPassword, handleSuccess]);

    const handlePersonalDataChange = useCallback((checked: boolean) => {
        setIsPersonalDataAccepted(checked);
        if (checked) {
            setErrors((prev) => ({
                ...prev,
                personalData: null,
            }));
        }
    }, []);

    const renderPhoneStep = useMemo(
        () => (
        <div className="space-y-6">
                <div className="subscribe-sponsor-modal__input-wrapper">
                    <span className="subscribe-sponsor-modal__label-text">
                        Введите номер телефона
                    </span>
                    <div
                        className={cn(
                            'relative',
                            errors.phone &&
                                'subscribe-sponsor-modal__phone-input-wrapper--error',
                        )}
                    >
                <RussianPhoneInput
                    value={phone}
                    onValueChange={handlePhoneChange}
                    name="phone"
                    autoComplete="tel"
                    inputMode="tel"
                            className="phone-input--with-label"
                />
                    </div>
                    <p className="subscribe-sponsor-modal__help-text">
                    Мы отправим SMS с кодом подтверждения. Номер должен быть
                    российским.
                </p>
                {errors.phone && (
                        <p className="subscribe-sponsor-modal__error-message">
                            {errors.phone}
                        </p>
                )}
            </div>
                <div className="subscribe-sponsor-modal__consent-wrapper">
            <PersonalDataConsent
                checked={isPersonalDataAccepted}
                        onChange={handlePersonalDataChange}
                policyHref="/privacy-policy"
            />
                </div>
            {errors.personalData && (
                    <p className="subscribe-sponsor-modal__error-message">
                    {errors.personalData}
                </p>
            )}
            <Button
                    className="subscribe-sponsor-modal__button subscribe-sponsor-modal__button--primary w-full"
                onClick={handleRequestCode}
                disabled={
                    loading ||
                    !organization?.id ||
                    phoneDigitsLength !== 10 ||
                    !isPersonalDataAccepted
                }
            >
                    {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                Получить код
            </Button>
        </div>
        ),
        [
            phone,
            handlePhoneChange,
            errors.phone,
            errors.personalData,
            isPersonalDataAccepted,
            handlePersonalDataChange,
            loading,
            organization?.id,
            phoneDigitsLength,
            handleRequestCode,
        ],
    );

    const handleCodeChange = useCallback(
        (value: string) => {
            setCode(value);
            if (errors.code) {
                setErrors((prev) => ({ ...prev, code: null }));
            }
        },
        [errors.code],
    );

    const renderCodeStep = useMemo(
        () => (
        <div className="space-y-6">
                <div className="space-y-4 text-center">
                    <p className="subscribe-sponsor-modal__help-text">
                    Введите код из SMS, отправленного на {maskedPhone}
                </p>
                    <div className="subscribe-sponsor-modal__otp-container">
                <InputOTP
                    maxLength={6}
                    value={code}
                            onChange={handleCodeChange}
                    containerClassName="flex justify-center"
                >
                    <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot key={index} index={index} />
                        ))}
                    </InputOTPGroup>
                </InputOTP>
                    </div>
                {errors.code && (
                        <p className="subscribe-sponsor-modal__error-message">
                            {errors.code}
                        </p>
                )}
            </div>
            <div className="space-y-3">
                <Button
                        className="subscribe-sponsor-modal__button subscribe-sponsor-modal__button--primary w-full"
                    onClick={handleVerifyCode}
                    disabled={loading || code.length !== 6}
                >
                    {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Подтвердить
                </Button>
                <Button
                        className="subscribe-sponsor-modal__button subscribe-sponsor-modal__button--outline w-full"
                    onClick={handleResendCode}
                    disabled={loading}
                >
                    Отправить код повторно
                </Button>
            </div>
        </div>
        ),
        [
            maskedPhone,
            code,
            handleCodeChange,
            errors.code,
            loading,
            handleVerifyCode,
            handleResendCode,
        ],
    );

    const handleProfileNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
                        setProfile((prev) => ({
                            ...prev,
                            name: e.target.value,
            }));
        },
        [],
    );

    const handleProfileEmailChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
                        setProfile((prev) => ({
                            ...prev,
                            email: e.target.value,
            }));
        },
        [],
    );

    const handleProfilePasswordChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
                                setProfile((prev) => ({
                                    ...prev,
                                    password: e.target.value,
                                }));
                                setErrors((prev) => ({
                                    ...prev,
                                    password: null,
                                }));
        },
        [],
    );

    const handleProfilePasswordConfirmationChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
                                setProfile((prev) => ({
                                    ...prev,
                                    password_confirmation: e.target.value,
                                }));
                                setErrors((prev) => ({
                                    ...prev,
                                    password: null,
                                }));
        },
        [],
    );

    const renderProfileStep = useMemo(
        () => (
            <div className="space-y-6">
                <div className="subscribe-sponsor-modal__input-wrapper">
                    <span className="subscribe-sponsor-modal__label-text">
                        Имя и фамилия
                    </span>
                    <input
                        id="profile-name"
                        type="text"
                        value={profile.name}
                        onChange={handleProfileNameChange}
                        placeholder="Как вас подписать"
                        className={cn(
                            'subscribe-sponsor-modal__input',
                            errors.profile &&
                                'subscribe-sponsor-modal__input--error',
                        )}
                    />
                </div>

                <div className="subscribe-sponsor-modal__input-wrapper">
                    <span className="subscribe-sponsor-modal__label-text">
                        Email (необязательно)
                    </span>
                    <input
                        id="profile-email"
                        type="email"
                        value={profile.email}
                        onChange={handleProfileEmailChange}
                        placeholder="email@example.com"
                        className={cn(
                            'subscribe-sponsor-modal__input',
                            errors.email &&
                                'subscribe-sponsor-modal__input--error',
                        )}
                    />
                    {errors.email && (
                        <p className="subscribe-sponsor-modal__error-message">
                            {errors.email}
                        </p>
                    )}
                </div>

                {requiresPassword && (
                    <>
                        <div className="subscribe-sponsor-modal__input-wrapper">
                            <span className="subscribe-sponsor-modal__label-text">
                                Пароль
                            </span>
                            <input
                                id="profile-password"
                                type="password"
                                value={profile.password}
                                onChange={handleProfilePasswordChange}
                                placeholder="Придумайте пароль"
                                className={cn(
                                    'subscribe-sponsor-modal__input',
                                    errors.password &&
                                        'subscribe-sponsor-modal__input--error',
                                )}
                            />
                        </div>

                        <div className="subscribe-sponsor-modal__input-wrapper">
                            <span className="subscribe-sponsor-modal__label-text">
                                Повторите пароль
                            </span>
                            <input
                                id="profile-password-confirmation"
                                type="password"
                                value={profile.password_confirmation}
                                onChange={
                                    handleProfilePasswordConfirmationChange
                                }
                            placeholder="Ещё раз пароль"
                                className={cn(
                                    'subscribe-sponsor-modal__input',
                                    errors.password &&
                                        'subscribe-sponsor-modal__input--error',
                                )}
                        />
                    </div>

                    {errors.password && (
                            <p className="subscribe-sponsor-modal__error-message">
                            {errors.password}
                        </p>
                    )}
                </>
            )}

            <div className="space-y-2">
                    <span className="subscribe-sponsor-modal__label-text block">
                        Фото (необязательно)
                    </span>
                    <input
                    id="profile-photo"
                    type="file"
                    accept="image/*"
                    onChange={handleUploadPhoto}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                />
                {photoPreview && (
                    <img
                        src={photoPreview}
                        alt="Предпросмотр"
                            className="subscribe-sponsor-modal__photo-preview"
                    />
                )}
                {errors.photo && (
                        <p className="subscribe-sponsor-modal__error-message">
                            {errors.photo}
                        </p>
                )}
            </div>

            {errors.profile && (
                    <p className="subscribe-sponsor-modal__error-message">
                        {errors.profile}
                    </p>
            )}

            <Button
                    className="subscribe-sponsor-modal__button subscribe-sponsor-modal__button--primary w-full"
                onClick={handleCompleteProfile}
                disabled={loading}
            >
                    {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                Завершить и подписаться
            </Button>
        </div>
        ),
        [
            profile,
            handleProfileNameChange,
            handleProfileEmailChange,
            handleProfilePasswordChange,
            handleProfilePasswordConfirmationChange,
            requiresPassword,
            errors,
            photoPreview,
            loading,
            handleCompleteProfile,
            handleUploadPhoto,
        ],
    );

    const handleClose = useCallback(() => {
        onOpenChange(false);
    }, [onOpenChange]);

    const renderSuccessStep = useMemo(
        () => (
        <div className="space-y-6 text-center">
            <div className="space-y-2">
                <h3 className="text-xl font-semibold">Готово!</h3>
                    <p className="subscribe-sponsor-modal__help-text">
                        Вы стали спонсором {organizationName}. Спасибо за
                        поддержку!
                </p>
            </div>
                <Button
                    className="subscribe-sponsor-modal__button subscribe-sponsor-modal__button--primary w-full"
                    onClick={handleClose}
                >
                Закрыть
            </Button>
        </div>
        ),
        [organizationName, handleClose],
    );

    const renderContent = useMemo(() => {
        switch (step) {
            case 'phone':
                return renderPhoneStep;
            case 'code':
                return renderCodeStep;
            case 'profile':
                return renderProfileStep;
            case 'success':
                return renderSuccessStep;
            default:
                return null;
        }
    }, [
        step,
        renderPhoneStep,
        renderCodeStep,
        renderProfileStep,
        renderSuccessStep,
    ]);

    const titleMap: Record<Step, string> = {
        phone: 'Поддержите школу',
        code: 'Подтверждение телефона',
        profile: 'Заполните профиль',
        success: 'Спасибо!',
    };

    const descriptionMap: Record<Step, string> = {
        phone: `Введите номер телефона, чтобы подписаться как спонсор ${organizationName}.`,
        code: 'Мы отправили вам код. Введите его ниже, чтобы продолжить.',
        profile:
            'Заполните данные профиля. Фото можно добавить позже, но с ним нам будет проще познакомить вас с командой.',
        success: 'Подписка оформлена! Мы свяжемся с вами при необходимости.',
    };

    const profileStepDescription = requiresPassword
        ? 'Заполните данные профиля и придумайте пароль для входа.'
        : descriptionMap.profile;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-2">
                    <DialogTitle>{titleMap[step]}</DialogTitle>
                    <DialogDescription>
                        {step === 'profile'
                            ? profileStepDescription
                            : descriptionMap[step]}
                    </DialogDescription>
                </DialogHeader>
                <div>{renderContent}</div>
            </DialogContent>
        </Dialog>
    );
};

export default SubscribeSponsorModal;

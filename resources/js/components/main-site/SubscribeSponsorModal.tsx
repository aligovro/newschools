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
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import type { User } from '@/types';
import { Loader2 } from 'lucide-react';

interface SubscribeSponsorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    organization: { id: number; name: string } | null;
    onCompleted?: (user: User) => void;
}

type Step = 'phone' | 'code' | 'profile' | 'success';

interface VerificationResponse {
    user: User;
    is_new_user: boolean;
    requires_profile_completion: boolean;
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
};

export const SubscribeSponsorModal = ({
    open,
    onOpenChange,
    organization,
    onCompleted,
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
        }
    }, [open]);

    useEffect(() => {
        if (step === 'profile' && user) {
            setProfile({
                name: user.name || '',
                email: user.email || '',
                photo: user.photo || '',
            });
            setPhotoPreview(user.photo || null);
        }
    }, [step, user]);

    const organizationName = useMemo(
        () => organization?.name ?? 'организацию',
        [organization],
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

    const handleRequestCode = async () => {
        if (!organization?.id || phoneDigitsLength !== 10) {
            setErrors({
                phone: 'Введите корректный номер телефона',
            });
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
    };

    const handleVerifyCode = async () => {
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
                    remember: true,
                },
                {
                    withCredentials: true,
                },
            );

            setUser(response.data.user);

            if (response.data.requires_profile_completion) {
                setStep('profile');
                toast.success(
                    'Телефон подтверждён. Заполните профиль, чтобы завершить подписку.',
                );
            } else {
                setStep('success');
                onCompleted?.(response.data.user);
                toast.success('Вы успешно подписались как спонсор!');
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
    };

    const handleResendCode = async () => {
        await handleRequestCode();
        setCode('');
    };

    const handleUploadPhoto = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
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
    };

    const handleCompleteProfile = async () => {
        if (!profile.name.trim()) {
            setErrors({ profile: 'Введите имя' });
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
                },
                {
                    withCredentials: true,
                },
            );

            setUser(response.data.user);
            setStep('success');
            toast.success('Профиль обновлён и подписка оформлена!');
            onCompleted?.(response.data.user);
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
            });
        } finally {
            setLoading(false);
        }
    };

    const renderPhoneStep = () => (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label>Введите номер телефона</Label>
                <RussianPhoneInput
                    value={phone}
                    onValueChange={handlePhoneChange}
                    name="phone"
                    autoComplete="tel"
                    inputMode="tel"
                />
                <p className="text-xs text-muted-foreground">
                    Мы отправим SMS с кодом подтверждения. Номер должен быть
                    российским.
                </p>
                {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                )}
            </div>
            <Button
                className="w-full"
                onClick={handleRequestCode}
                disabled={
                    loading || !organization?.id || phoneDigitsLength !== 10
                }
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Получить код
            </Button>
        </div>
    );

    const renderCodeStep = () => (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground">
                    Введите код из SMS, отправленного на {maskedPhone}
                </p>
                <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={(value) => setCode(value)}
                    containerClassName="flex justify-center"
                >
                    <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot key={index} index={index} />
                        ))}
                    </InputOTPGroup>
                </InputOTP>
                {errors.code && (
                    <p className="text-sm text-destructive">{errors.code}</p>
                )}
            </div>
            <div className="space-y-3">
                <Button
                    className="w-full"
                    onClick={handleVerifyCode}
                    disabled={loading || code.length !== 6}
                >
                    {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Подтвердить
                </Button>
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleResendCode}
                    disabled={loading}
                >
                    Отправить код повторно
                </Button>
            </div>
        </div>
    );

    const renderProfileStep = () => (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="profile-name">Имя и фамилия</Label>
                <Input
                    id="profile-name"
                    value={profile.name}
                    onChange={(e) =>
                        setProfile((prev) => ({
                            ...prev,
                            name: e.target.value,
                        }))
                    }
                    placeholder="Как вас подписать"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="profile-email">Email (необязательно)</Label>
                <Input
                    id="profile-email"
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                        setProfile((prev) => ({
                            ...prev,
                            email: e.target.value,
                        }))
                    }
                    placeholder="email@example.com"
                />
                {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="profile-photo">Фото (необязательно)</Label>
                <Input
                    id="profile-photo"
                    type="file"
                    accept="image/*"
                    onChange={handleUploadPhoto}
                />
                {photoPreview && (
                    <img
                        src={photoPreview}
                        alt="Предпросмотр"
                        className="h-24 w-24 rounded-full object-cover"
                    />
                )}
                {errors.photo && (
                    <p className="text-sm text-destructive">{errors.photo}</p>
                )}
            </div>

            {errors.profile && (
                <p className="text-sm text-destructive">{errors.profile}</p>
            )}

            <Button
                className="w-full"
                onClick={handleCompleteProfile}
                disabled={loading}
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Завершить и подписаться
            </Button>
        </div>
    );

    const renderSuccessStep = () => (
        <div className="space-y-6 text-center">
            <div className="space-y-2">
                <h3 className="text-xl font-semibold">Готово!</h3>
                <p className="text-sm text-muted-foreground">
                    Вы стали спонсором {organizationName}. Спасибо за поддержку!
                </p>
            </div>
            <Button className="w-full" onClick={() => onOpenChange(false)}>
                Закрыть
            </Button>
        </div>
    );

    const renderContent = () => {
        switch (step) {
            case 'phone':
                return renderPhoneStep();
            case 'code':
                return renderCodeStep();
            case 'profile':
                return renderProfileStep();
            case 'success':
                return renderSuccessStep();
            default:
                return null;
        }
    };

    const titleMap: Record<Step, string> = {
        phone: 'Поддержите организацию',
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-2">
                    <DialogTitle>{titleMap[step]}</DialogTitle>
                    <DialogDescription>
                        {descriptionMap[step]}
                    </DialogDescription>
                </DialogHeader>
                <div>{renderContent()}</div>
            </DialogContent>
        </Dialog>
    );
};

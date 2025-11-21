import { cn } from '@/lib/helpers';
import type { PageProps } from '@inertiajs/core';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

type Flash = {
    success?: string;
    error?: string;
    [key: string]: unknown;
};

type ErrorBag = Record<string, string | string[]>;

interface FormStatusBannerProps {
    flash?: Flash | null;
    errors?: ErrorBag;
    /**
     * Поля, ошибки по которым не должны влиять на показ общего сообщения
     * (например, когда форма сама отдельно подсвечивает их).
     */
    ignoreFields?: string[];
    /**
     * Дефолтный текст для случая, когда есть валидационные ошибки, но нет общего сообщения.
     */
    defaultErrorMessage?: string;
    className?: string;
}

/**
 * Универсальный баннер статуса формы для Inertia-страниц.
 *
 * - Показывает "зелёный" баннер при flash.success.
 * - Показывает "красный" баннер при flash.error или errors.general.
 * - Если есть другие errors.* — показывает "красный" баннер с defaultErrorMessage.
 */
export function FormStatusBanner({
    flash,
    errors = {},
    ignoreFields = [],
    defaultErrorMessage = 'Исправьте ошибки в форме',
    className,
}: FormStatusBannerProps) {
    const normalizedErrors: ErrorBag = errors || {};
    const generalErrorRaw =
        (normalizedErrors.general as string | string[] | undefined) ??
        (flash?.error as string | undefined);

    const generalError = Array.isArray(generalErrorRaw)
        ? generalErrorRaw[0]
        : generalErrorRaw;

    const successMessage =
        (flash?.success as string | undefined) ??
        (flash as PageProps['flash'] | undefined)?.success;

    const hasOtherErrors = Object.entries(normalizedErrors).some(
        ([key, value]) =>
            key !== 'general' &&
            !ignoreFields.includes(key) &&
            value !== undefined &&
            value !== null &&
            String(
                Array.isArray(value)
                    ? (value as string[]).join('')
                    : (value as string),
            ).trim().length > 0,
    );

    if (!successMessage && !generalError && !hasOtherErrors) {
        return null;
    }

    const isSuccess = Boolean(successMessage);
    const message =
        successMessage ??
        generalError ??
        (hasOtherErrors ? defaultErrorMessage : '');

    if (!message) {
        return null;
    }

    return (
        <div
            className={cn(
                'flex items-start gap-2 rounded-md border p-3 text-sm',
                isSuccess
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-red-200 bg-red-50 text-red-800',
                className,
            )}
        >
            {isSuccess ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
            ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            )}
            <span>{message}</span>
        </div>
    );
}



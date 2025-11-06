import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from './useDebounce';
import type { OrganizationType } from '@/components/dashboard/pages/organizations/types';

interface SlugValidationResult {
    isUnique: boolean;
    suggestedSlug?: string;
    isValid: boolean;
}

/**
 * Генерирует префикс слага на основе типа организации
 */
const getSlugPrefix = (type: OrganizationType | string): string => {
    switch (type) {
        case 'school':
            return 'school';
        case 'university':
            return 'university';
        case 'kindergarten':
            return 'kindergarten';
        default:
            return 'organization';
    }
};

/**
 * Генерирует слаг для организации на основе типа и ID
 * Для создания: генерируем префикс типа (school, university, etc.)
 * Для редактирования: используем существующий слаг или генерируем с ID
 */
const generateSlugForType = (
    type: OrganizationType | string,
    organizationId?: number,
): string => {
    const prefix = getSlugPrefix(type);
    if (organizationId) {
        return `${prefix}-${organizationId}`;
    }
    // Для создания используем только префикс, бэкенд добавит ID после сохранения
    return prefix;
};

/**
 * Хук для генерации и валидации слага организации
 */
export const useOrganizationSlug = (
    type: OrganizationType | string,
    organizationId?: number,
    initialSlug?: string,
    isEdit: boolean = false,
) => {
    // Мемоизируем префикс для избежания лишних вычислений
    const prefix = useMemo(() => getSlugPrefix(type), [type]);
    
    // Инициализируем слаг: для редактирования используем существующий, для создания - префикс
    const initialSlugValue = useMemo(() => {
        if (initialSlug) return initialSlug;
        if (isEdit && organizationId) {
            return generateSlugForType(type, organizationId);
        }
        return prefix;
    }, [initialSlug, isEdit, organizationId, type, prefix]);

    const [slug, setSlug] = useState<string>(initialSlugValue);
    const [isGenerating, setIsGenerating] = useState(false);
    const [validation, setValidation] = useState<SlugValidationResult>({
        isUnique: true,
        isValid: true,
    });
    const isManuallyEditedRef = useRef(false);
    const previousTypeRef = useRef(type);

    const debouncedSlug = useDebounce(slug, 500);

    // Обновляем слаг при изменении типа (только при создании и если не редактировался вручную)
    useEffect(() => {
        if (isEdit) return; // При редактировании не меняем слаг автоматически
        
        // Если тип изменился и слаг не редактировался вручную
        if (previousTypeRef.current !== type && !isManuallyEditedRef.current) {
            const generatedSlug = generateSlugForType(type, organizationId);
            setSlug(generatedSlug);
        }
        previousTypeRef.current = type;
    }, [type, isEdit, organizationId]);

    // Проверяем уникальность слага через API (только если слаг изменился и валиден)
    const validateSlug = useCallback(
        async (slugToValidate: string) => {
            // Быстрая валидация формата без запроса к API
            if (!slugToValidate.trim()) {
                setValidation({ isUnique: true, isValid: false });
                return;
            }

            // Базовая валидация формата
            if (!/^[a-z0-9-]+$/.test(slugToValidate)) {
                setValidation({ isUnique: false, isValid: false });
                return;
            }

            if (slugToValidate.length < 3) {
                setValidation({ isUnique: false, isValid: false });
                return;
            }

            // Если это только префикс (без ID), не валидируем через API - это нормально при создании
            if (!isEdit && slugToValidate === prefix) {
                setValidation({ isUnique: true, isValid: true });
                return;
            }

            setIsGenerating(true);
            try {
                const requestBody: {
                    text: string;
                    table: string;
                    column: string;
                    exclude_id?: number;
                } = {
                    text: slugToValidate,
                    table: 'organizations',
                    column: 'slug',
                };
                
                // Передаем exclude_id только если это редактирование и ID есть
                if (isEdit && organizationId) {
                    requestBody.exclude_id = organizationId;
                }
                
                const response = await fetch('/api/slug/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify(requestBody),
                });

                if (!response.ok) {
                    throw new Error('Validation failed');
                }

                const data = await response.json();
                setValidation({
                    isUnique: data.is_unique,
                    suggestedSlug: data.suggested_slug,
                    isValid: true,
                });
            } catch (error) {
                console.error('Ошибка валидации slug:', error);
                setValidation({ isUnique: true, isValid: true }); // По умолчанию считаем валидным
            } finally {
                setIsGenerating(false);
            }
        },
        [organizationId, isEdit, prefix],
    );

    // Валидируем слаг при изменении (debounced)
    useEffect(() => {
        if (debouncedSlug && debouncedSlug.trim()) {
            validateSlug(debouncedSlug);
        } else if (!debouncedSlug) {
            setValidation({ isUnique: true, isValid: false });
        }
    }, [debouncedSlug, validateSlug]);

    const handleSlugChange = useCallback(
        (newSlug: string) => {
            // Если поле полностью очищено, автоматически генерируем слаг
            if (!newSlug.trim()) {
                const generatedSlug = generateSlugForType(type, organizationId);
                setSlug(generatedSlug);
                isManuallyEditedRef.current = false;
            } else {
                setSlug(newSlug);
                isManuallyEditedRef.current = true;
            }
        },
        [type, organizationId],
    );

    const generateSlug = useCallback(() => {
        if (type) {
            const generatedSlug = generateSlugForType(type, organizationId);
            setSlug(generatedSlug);
            isManuallyEditedRef.current = false;
            // Сразу валидируем сгенерированный слаг
            validateSlug(generatedSlug);
        }
    }, [type, organizationId, validateSlug]);

    return {
        slug,
        setSlug: handleSlugChange,
        isGenerating,
        validation,
        generateSlug,
    };
};


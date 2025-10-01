import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { AlertCircle, Check, Copy, RefreshCw } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SlugGeneratorProps {
    value: string;
    onChange: (slug: string) => void;
    onNameChange?: (name: string) => void;
    placeholder?: string;
    className?: string;
    table?: string;
    column?: string;
    excludeId?: number;
}

interface SlugResponse {
    original: string;
    slug: string;
    has_cyrillic: boolean;
    is_unique: boolean;
    suggested_slug: string;
}

const SlugGenerator: React.FC<SlugGeneratorProps> = ({
    onChange,
    onNameChange,
    placeholder = 'Введите название...',
    className = '',
    table,
    column = 'slug',
    excludeId,
}) => {
    const [inputValue, setInputValue] = useState('');
    const [generatedSlug, setGeneratedSlug] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUnique, setIsUnique] = useState(true);
    const [suggestedSlug, setSuggestedSlug] = useState('');
    const [copied, setCopied] = useState(false);
    const [isWaitingForInput, setIsWaitingForInput] = useState(false);

    // Debounce для ввода (500ms задержка)
    const debouncedInputValue = useDebounce(inputValue, 500);

    const generateSlug = useCallback(
        async (text: string) => {
            if (!text.trim()) return;

            setIsGenerating(true);
            try {
                const response = await fetch('/api/slug/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        text,
                        table,
                        column,
                        exclude_id: excludeId,
                    }),
                });

                const data: SlugResponse = await response.json();
                setGeneratedSlug(data.slug);
                setIsUnique(data.is_unique);
                setSuggestedSlug(data.suggested_slug);
            } catch (error) {
                console.error('Ошибка генерации slug:', error);
                toast.error('Ошибка генерации slug');
            } finally {
                setIsGenerating(false);
            }
        },
        [table, column, excludeId],
    );

    // Отслеживаем изменения ввода для показа индикатора ожидания
    useEffect(() => {
        if (inputValue && inputValue !== debouncedInputValue) {
            setIsWaitingForInput(true);
        } else {
            setIsWaitingForInput(false);
        }
    }, [inputValue, debouncedInputValue]);

    // Генерируем slug при изменении debounced ввода
    useEffect(() => {
        if (debouncedInputValue) {
            generateSlug(debouncedInputValue);
        } else {
            setGeneratedSlug('');
            setIsUnique(true);
            setSuggestedSlug('');
        }
    }, [debouncedInputValue, generateSlug]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        if (onNameChange) {
            onNameChange(newValue);
        }
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSlug = e.target.value;
        setGeneratedSlug(newSlug);
        onChange(newSlug);
    };

    const handleRegenerate = () => {
        if (inputValue) {
            generateSlug(inputValue);
        }
    };

    const handleUseSuggested = () => {
        setGeneratedSlug(suggestedSlug);
        onChange(suggestedSlug);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generatedSlug);
            setCopied(true);
            toast.success('Slug скопирован в буфер обмена');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Ошибка копирования');
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Поле ввода */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Название</label>
                <div className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder={placeholder}
                        className="flex-1"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRegenerate}
                        disabled={!inputValue || isGenerating}
                        title={
                            isWaitingForInput
                                ? 'Ожидание завершения ввода...'
                                : 'Перегенерировать slug'
                        }
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${isGenerating || isWaitingForInput ? 'animate-spin' : ''}`}
                        />
                    </Button>
                </div>
            </div>

            {/* Поле slug'а */}
            <div className="space-y-2">
                <label className="text-sm font-medium">URL Slug</label>
                <div className="flex gap-2">
                    <Input
                        value={generatedSlug}
                        onChange={handleSlugChange}
                        placeholder="slug-budet-sgenerirovan-avtomaticheski"
                        className="flex-1"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        disabled={!generatedSlug}
                    >
                        {copied ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* Статус уникальности */}
                {generatedSlug && table && (
                    <div className="flex items-center gap-2">
                        {isGenerating || isWaitingForInput ? (
                            <Badge variant="secondary">
                                <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                                {isWaitingForInput
                                    ? 'Ожидание...'
                                    : 'Генерация...'}
                            </Badge>
                        ) : isUnique ? (
                            <Badge variant="default" className="bg-green-500">
                                <Check className="mr-1 h-3 w-3" />
                                Уникальный
                            </Badge>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Badge variant="destructive">
                                    <AlertCircle className="mr-1 h-3 w-3" />
                                    Уже используется
                                </Badge>
                                {suggestedSlug &&
                                    suggestedSlug !== generatedSlug && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleUseSuggested}
                                        >
                                            Использовать: {suggestedSlug}
                                        </Button>
                                    )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SlugGenerator;

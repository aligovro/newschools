import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    uploadFile,
    type UploadImageResponse,
    type UploadType,
} from '@/utils/uploadFile';

interface ImageUploadResult {
    url: string;
    response: UploadImageResponse;
}

interface ImageUploadProps {
    onUpload: (result: ImageUploadResult) => void;
    onError?: (error: string) => void;
    onRemove?: () => void;
    currentImage?: string;
    type: 'organization-logo' | 'slider-image' | 'gallery-image' | 'news-cover';
    maxSize?: number; // in MB
    className?: string;
    disabled?: boolean;
}

export function ImageUpload({
    onUpload,
    onError,
    onRemove,
    currentImage,
    type,
    maxSize = 10,
    className,
    disabled = false
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadTypeMap: Record<ImageUploadProps['type'], UploadType> = {
        'organization-logo': 'logo',
        'slider-image': 'slider',
        'gallery-image': 'gallery',
        'news-cover': 'news-cover',
    };

    const handleFileSelect = (file: File) => {
        // Валидация размера файла
        if (file.size > maxSize * 1024 * 1024) {
            onError?.(`Размер файла не должен превышать ${maxSize}MB`);
            return;
        }

        // Валидация типа файла
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            onError?.('Разрешены только файлы: JPEG, PNG, GIF, WebP');
            return;
        }

        // Создаем превью
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Загружаем файл
        performUpload(file);
    };

    const resolvePreviewUrl = (result: Awaited<ReturnType<typeof uploadFile>>): string | null => {
        return (
            result.data?.cover ||
            result.data?.slider ||
            result.data?.gallery ||
            result.data?.news ||
            result.data?.original ||
            result.url ||
            null
        );
    };

    const performUpload = async (file: File) => {
        setIsUploading(true);
        setUploadProgress(0);

        try {
            const uploadKind = uploadTypeMap[type] ?? 'logo';
            const response = await uploadFile(file, uploadKind, setUploadProgress);

            const previewUrl = resolvePreviewUrl(response);
            if (!previewUrl) {
                throw new Error('Не удалось получить ссылку на изображение');
            }

            setPreview(previewUrl);
            onUpload({
                url: previewUrl,
                response,
            });
            setUploadProgress(100);
        } catch (error: unknown) {
            console.error('Upload error:', error);
            const errorMessage =
                error instanceof Error ? error.message : 'Ошибка загрузки файла';
            onError?.(errorMessage);
            setPreview(null);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (disabled || isUploading) return;

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            handleFileSelect(files[0]);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onRemove?.();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        if (!disabled && !isUploading) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className={cn('w-full', className)}>
            <Card
                className={cn(
                    'relative border-2 border-dashed transition-colors cursor-pointer',
                    dragActive && 'border-primary bg-primary/5',
                    disabled && 'opacity-50 cursor-not-allowed',
                    isUploading && 'cursor-wait',
                    preview && 'border-solid border-primary'
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={disabled || isUploading}
                />

                {preview ? (
                    <div className="relative p-4">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                        />
                        {!disabled && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove();
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        {isUploading ? (
                            <div className="space-y-4">
                                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                                    <Upload className="h-6 w-6 text-primary animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Загрузка...</p>
                                    <Progress value={uploadProgress} className="w-full" />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">
                                        Перетащите изображение сюда или нажмите для выбора
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Максимальный размер: {maxSize}MB
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Поддерживаемые форматы: JPEG, PNG, GIF, WebP
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
}

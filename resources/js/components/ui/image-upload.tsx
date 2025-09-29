import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface ImageUploadProps {
    onUpload: (result: any) => void;
    onError?: (error: string) => void;
    onRemove?: () => void;
    currentImage?: string;
    type: 'organization-logo' | 'slider-image' | 'gallery-image';
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

    const getUploadEndpoint = () => {
        switch (type) {
            case 'organization-logo':
                return '/dashboard/api/upload/organization-logo';
            case 'slider-image':
                return '/dashboard/api/upload/slider-image';
            case 'gallery-image':
                return '/dashboard/api/upload/gallery-image';
            default:
                return '/dashboard/api/upload/organization-logo';
        }
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
        uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        setIsUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await axios.post(getUploadEndpoint(), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setUploadProgress(progress);
                },
            });

            if (response.data.message === 'Image uploaded and processed successfully') {
                setPreview(response.data.url);
                onUpload({
                    filename: response.data.filename,
                    url: response.data.url,
                    variants: response.data.variants,
                });
                setUploadProgress(100);
            } else {
                throw new Error(response.data.message || 'Ошибка загрузки');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Ошибка загрузки файла';
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

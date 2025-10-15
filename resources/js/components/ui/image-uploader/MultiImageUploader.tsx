import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Upload,
    X,
    Move,
    Eye,
    Trash2,
    Image as ImageIcon,
    Loader2,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/helpers';

export interface UploadedImage {
    id: string;
    file?: File;
    url: string;
    name: string;
    size: number;
    type: string;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
    progress?: number;
}

export interface MultiImageUploaderProps {
    images: UploadedImage[];
    onChange: (images: UploadedImage[]) => void;
    maxFiles?: number;
    maxSize?: number;
    acceptedTypes?: string[];
    className?: string;
    disabled?: boolean;
    showPreview?: boolean;
    enableDragDrop?: boolean;
    enableSorting?: boolean;
    enableDeletion?: boolean;
    onUpload?: (file: File) => Promise<string>;
    onDelete?: (imageId: string) => Promise<void>;
    previewSize?: 'sm' | 'md' | 'lg';
    layout?: 'grid' | 'list';
    showFileInfo?: boolean;
}

const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
    images = [],
    onChange,
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024, // 10MB
    acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    className,
    disabled = false,
    showPreview = true,
    enableDragDrop = true,
    enableSorting = true,
    enableDeletion = true,
    onUpload,
    onDelete,
    previewSize = 'md',
    layout = 'grid',
    showFileInfo = true,
}) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [previewImage, setPreviewImage] = useState<UploadedImage | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Генерация уникального ID
    const generateId = () => Math.random().toString(36).substr(2, 9);

    // Валидация файла
    const validateFile = (file: File): { valid: boolean; error?: string } => {
        if (file.size > maxSize) {
            return {
                valid: false,
                error: `Размер файла не должен превышать ${(maxSize / (1024 * 1024)).toFixed(1)}MB`
            };
        }

        if (!acceptedTypes.includes(file.type)) {
            return {
                valid: false,
                error: `Неподдерживаемый формат файла. Разрешены: ${acceptedTypes.map(type => type.split('/')[1]).join(', ')}`
            };
        }

        return { valid: true };
    };

    // Добавление файлов
    const addFiles = useCallback(async (newFiles: File[]) => {
        if (disabled) return;

        const filesToAdd = newFiles.slice(0, maxFiles - images.length);
        const newImages: UploadedImage[] = [];

        for (const file of filesToAdd) {
            const validation = validateFile(file);
            if (!validation.valid) {
                newImages.push({
                    id: generateId(),
                    file,
                    url: '',
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    status: 'error',
                    error: validation.error,
                });
                continue;
            }

            const image: UploadedImage = {
                id: generateId(),
                file,
                url: URL.createObjectURL(file),
                name: file.name,
                size: file.size,
                type: file.type,
                status: 'pending',
            };

            newImages.push(image);
        }

        const updatedImages = [...images, ...newImages];
        onChange(updatedImages);

        // Загружаем файлы на сервер если есть обработчик
        if (onUpload) {
            for (const image of newImages) {
                if (image.status === 'pending' && image.file) {
                    try {
                        // Обновляем статус на загрузку
                        const uploadingImages = updatedImages.map(img =>
                            img.id === image.id ? { ...img, status: 'uploading' as const, progress: 0 } : img
                        );
                        onChange(uploadingImages);

                        // Загружаем файл
                        const uploadedUrl = await onUpload(image.file);

                        // Обновляем статус на успех
                        const successImages = uploadingImages.map(img =>
                            img.id === image.id ? { ...img, status: 'success' as const, url: uploadedUrl, progress: 100 } : img
                        );
                        onChange(successImages);
                    } catch (error) {
                        // Обновляем статус на ошибку
                        const errorImages = updatedImages.map(img =>
                            img.id === image.id ? {
                                ...img,
                                status: 'error' as const,
                                error: error instanceof Error ? error.message : 'Ошибка загрузки'
                            } : img
                        );
                        onChange(errorImages);
                    }
                }
            }
        }
    }, [images, onChange, disabled, maxFiles, maxSize, acceptedTypes, onUpload]);

    // Удаление изображения
    const removeImage = useCallback(async (imageId: string) => {
        if (disabled) return;

        const image = images.find(img => img.id === imageId);
        if (!image) return;

        // Если есть обработчик удаления, вызываем его
        if (onDelete) {
            try {
                await onDelete(imageId);
            } catch (error) {
                console.error('Error deleting image:', error);
                // Продолжаем удаление из локального состояния даже если серверная операция не удалась
            }
        }

        // Удаляем из локального состояния
        const updatedImages = images.filter(img => img.id !== imageId);
        onChange(updatedImages);

        // Очищаем URL объекта если он был создан локально
        if (image.url.startsWith('blob:')) {
            URL.revokeObjectURL(image.url);
        }
    }, [images, onChange, disabled, onDelete]);

    // Перемещение изображения
    const moveImage = useCallback((fromIndex: number, toIndex: number) => {
        if (disabled || !enableSorting) return;

        const updatedImages = [...images];
        const [movedImage] = updatedImages.splice(fromIndex, 1);
        updatedImages.splice(toIndex, 0, movedImage);
        onChange(updatedImages);
    }, [images, onChange, disabled, enableSorting]);

    // Обработка drag & drop
    const onDrop = useCallback((acceptedFiles: File[]) => {
        addFiles(acceptedFiles);
    }, [addFiles]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: acceptedTypes.reduce((acc, type) => {
            acc[type] = [];
            return acc;
        }, {} as Record<string, string[]>),
        multiple: true,
        disabled,
        maxFiles: maxFiles - images.length,
    });

    // Обработка выбора файлов через input
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            addFiles(files);
        }
        // Очищаем input чтобы можно было выбрать тот же файл снова
        e.target.value = '';
    }, [addFiles]);

    // Форматирование размера файла
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Получение иконки статуса
    const getStatusIcon = (status: UploadedImage['status']) => {
        switch (status) {
            case 'uploading':
                return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
            case 'success':
                return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return <ImageIcon className="w-4 h-4 text-gray-400" />;
        }
    };

    // Рендер изображения
    const renderImage = (image: UploadedImage, index: number) => {
        const isDragging = draggedIndex === index;
        const canDrop = draggedIndex !== null && draggedIndex !== index;

        return (
            <div
                key={image.id}
                className={cn(
                    'multi-image-uploader__item',
                    `multi-image-uploader__item--${previewSize}`,
                    isDragging && 'multi-image-uploader__item--dragging',
                    canDrop && 'multi-image-uploader__item--can-drop',
                    layout === 'list' && 'multi-image-uploader__item--list'
                )}
                draggable={enableSorting && !disabled}
                onDragStart={(e) => {
                    setDraggedIndex(index);
                    e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    if (draggedIndex !== null && draggedIndex !== index) {
                        moveImage(draggedIndex, index);
                    }
                    setDraggedIndex(null);
                }}
                onDragEnd={() => setDraggedIndex(null)}
            >
                <div className="multi-image-uploader__preview">
                    {image.status === 'error' ? (
                        <div className="multi-image-uploader__error-preview">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                    ) : (
                        <img
                            src={image.url}
                            alt={image.name}
                            className="multi-image-uploader__image"
                            onClick={() => setPreviewImage(image)}
                        />
                    )}

                    {image.status === 'uploading' && (
                        <div className="multi-image-uploader__progress-overlay">
                            <div className="multi-image-uploader__progress-bar">
                                <div
                                    className="multi-image-uploader__progress-fill"
                                    style={{ width: `${image.progress || 0}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {showFileInfo && (
                    <div className="multi-image-uploader__info">
                        <div className="multi-image-uploader__name">
                            {image.name}
                        </div>
                        <div className="multi-image-uploader__size">
                            {formatFileSize(image.size)}
                        </div>
                        {image.error && (
                            <div className="multi-image-uploader__error">
                                {image.error}
                            </div>
                        )}
                    </div>
                )}

                <div className="multi-image-uploader__actions">
                    <button
                        type="button"
                        className="multi-image-uploader__action"
                        onClick={() => setPreviewImage(image)}
                        title="Предпросмотр"
                    >
                        <Eye className="w-4 h-4" />
                    </button>

                    {enableSorting && (
                        <button
                            type="button"
                            className="multi-image-uploader__action multi-image-uploader__action--drag"
                            title="Перетащить для сортировки"
                        >
                            <Move className="w-4 h-4" />
                        </button>
                    )}

                    {enableDeletion && (
                        <button
                            type="button"
                            className="multi-image-uploader__action multi-image-uploader__action--delete"
                            onClick={() => removeImage(image.id)}
                            title="Удалить"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="multi-image-uploader__status">
                    {getStatusIcon(image.status)}
                </div>
            </div>
        );
    };

    return (
        <div className={cn('multi-image-uploader', className)}>
            {/* Область загрузки */}
            {images.length < maxFiles && (
                <div
                    {...getRootProps()}
                    className={cn(
                        'multi-image-uploader__dropzone',
                        isDragActive && 'multi-image-uploader__dropzone--active',
                        disabled && 'multi-image-uploader__dropzone--disabled'
                    )}
                >
                    <input {...getInputProps()} />
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={acceptedTypes.join(',')}
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    <div className="multi-image-uploader__dropzone-content">
                        <Upload className="multi-image-uploader__dropzone-icon" />
                        <div className="multi-image-uploader__dropzone-text">
                            {isDragActive ? (
                                'Отпустите файлы здесь...'
                            ) : (
                                <>
                                    Перетащите изображения сюда или{' '}
                                    <button
                                        type="button"
                                        className="multi-image-uploader__dropzone-link"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        выберите файлы
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="multi-image-uploader__dropzone-hint">
                            Поддерживаются: {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
                            (до {formatFileSize(maxSize)})
                        </div>
                    </div>
                </div>
            )}

            {/* Список изображений */}
            {images.length > 0 && (
                <div className={cn(
                    'multi-image-uploader__list',
                    `multi-image-uploader__list--${layout}`
                )}>
                    {images.map((image, index) => renderImage(image, index))}
                </div>
            )}

            {/* Информация о лимитах */}
            <div className="multi-image-uploader__info-bar">
                <span>
                    {images.length} из {maxFiles} файлов загружено
                </span>
                {images.some(img => img.status === 'error') && (
                    <span className="multi-image-uploader__error-count">
                        {images.filter(img => img.status === 'error').length} ошибок
                    </span>
                )}
            </div>

            {/* Модальное окно предпросмотра */}
            {previewImage && (
                <div
                    className="multi-image-uploader__preview-modal"
                    onClick={() => setPreviewImage(null)}
                >
                    <div
                        className="multi-image-uploader__preview-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="multi-image-uploader__preview-modal-close"
                            onClick={() => setPreviewImage(null)}
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="multi-image-uploader__preview-modal-image">
                            <img
                                src={previewImage.url}
                                alt={previewImage.name}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>

                        <div className="multi-image-uploader__preview-modal-info">
                            <h3 className="multi-image-uploader__preview-modal-title">
                                {previewImage.name}
                            </h3>
                            <div className="multi-image-uploader__preview-modal-details">
                                <span>{formatFileSize(previewImage.size)}</span>
                                <span>{previewImage.type}</span>
                                <span className={cn(
                                    'multi-image-uploader__preview-modal-status',
                                    `multi-image-uploader__preview-modal-status--${previewImage.status}`
                                )}>
                                    {previewImage.status === 'uploading' && 'Загрузка...'}
                                    {previewImage.status === 'success' && 'Загружено'}
                                    {previewImage.status === 'error' && 'Ошибка'}
                                    {previewImage.status === 'pending' && 'Ожидание'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiImageUploader;

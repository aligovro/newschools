import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactCrop, {
    centerCrop,
    Crop,
    makeAspectCrop,
    PixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
    Upload,
    X,
    Edit,
    RotateCcw,
    ZoomIn,
    Check,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/helpers';

export interface LogoUploaderProps {
    value?: string | File | null;
    onChange: (file: File | null, previewUrl?: string) => void;
    className?: string;
    disabled?: boolean;
    maxSize?: number;
    aspectRatio?: number | null; // null/undefined => свободная рамка
    showCropControls?: boolean;
    onUpload?: (file: File) => Promise<string>;
    error?: string;
    label?: string;
    required?: boolean;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({
    value,
    onChange,
    className,
    disabled = false,
    maxSize = 5 * 1024 * 1024, // 5MB
    aspectRatio = null,
    showCropControls = true,
    onUpload,
    error,
    label,
    required = false,
}) => {
    const [imgSrc, setImgSrc] = useState<string>('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [showCropModal, setShowCropModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const imgRef = useRef<HTMLImageElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Поддерживаемые форматы
    const acceptedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml'
    ];

    // Инициализация существующего значения
    React.useEffect(() => {
        if (value) {
            if (typeof value === 'string') {
                setPreviewUrl(value);
                setImgSrc(value);
            } else if (value instanceof File) {
                const url = URL.createObjectURL(value);
                setPreviewUrl(url);
                setImgSrc(url);
            }
        } else {
            setPreviewUrl('');
            setImgSrc('');
        }
    }, [value]);

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
                error: `Неподдерживаемый формат файла. Разрешены: JPEG, PNG, GIF, WebP, SVG`
            };
        }

        return { valid: true };
    };

    // Проверка является ли файл SVG
    const isSvgFile = (file: File | string | null | undefined) => {
        if (!file) return false;
        if (typeof file === 'string') return file.includes('.svg');
        return file.type === 'image/svg+xml';
    };

    // Обработка загрузки файла
    const handleFileUpload = useCallback(async (file: File) => {
        const validation = validateFile(file);
        if (!validation.valid) {
            setUploadError(validation.error || 'Ошибка валидации файла');
            return;
        }

        setUploadError(null);

        // Если это SVG файл, не показываем кроп
        if (isSvgFile(file)) {
            setIsUploading(true);
            try {
                let finalUrl: string;

                if (onUpload) {
                    finalUrl = await onUpload(file);
                } else {
                    finalUrl = URL.createObjectURL(file);
                }

                setPreviewUrl(finalUrl);
                onChange(file, finalUrl);
            } catch (error) {
                setUploadError(error instanceof Error ? error.message : 'Ошибка загрузки файла');
            } finally {
                setIsUploading(false);
            }
            return;
        }

        // Для обычных изображений показываем кроп
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            const src = reader.result?.toString() || '';
            setImgSrc(src);
            setShowCropModal(true);
        });
        reader.readAsDataURL(file);
    }, [maxSize, acceptedTypes, onUpload, onChange]);

    // Обработка drop
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            handleFileUpload(file);
        }
    }, [handleFileUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: acceptedTypes.reduce((acc, type) => {
            acc[type] = [];
            return acc;
        }, {} as Record<string, string[]>),
        multiple: false,
        disabled,
        noClick: true,
        noKeyboard: true,
    });

    // Обработка выбора файла через input
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
        e.target.value = '';
    }, [handleFileUpload]);

    // Загрузка изображения для кропа
    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        imgRef.current = e.currentTarget as HTMLImageElement;

        if (aspectRatio) {
            const initial = centerCrop(
                makeAspectCrop(
                    {
                        unit: '%',
                        width: 90,
                    },
                    aspectRatio,
                    width,
                    height,
                ),
                width,
                height,
            );
            setCrop(initial);
        } else {
            setCrop({ unit: '%', x: 10, y: 10, width: 80, height: 80 });
        }
    }, [aspectRatio]);

    // Получение обрезанного изображения
    const getCroppedImg = (
        image: HTMLImageElement,
        crop: PixelCrop,
        rotateDeg: number,
        scaleVal: number,
    ): Promise<Blob | null> => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('No 2d context');

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const cropX = crop.x * scaleX;
        const cropY = crop.y * scaleY;
        const cropW = crop.width * scaleX;
        const cropH = crop.height * scaleY;

        const outputWidth = Math.max(1, Math.floor(cropW));
        const outputHeight = Math.max(1, Math.floor(cropH));

        canvas.width = outputWidth;
        canvas.height = outputHeight;
        ctx.imageSmoothingQuality = 'high';

        const radians = (rotateDeg * Math.PI) / 180;
        const centerX = outputWidth / 2;
        const centerY = outputHeight / 2;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(radians);
        ctx.scale(scaleVal, scaleVal);
        ctx.translate(-cropX - cropW / 2, -cropY - cropH / 2);
        ctx.drawImage(image, 0, 0);
        ctx.restore();

        return new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/jpeg', 0.92);
        });
    };

    // Применение кропа
    const handleCropComplete = useCallback(async () => {
        if (!completedCrop || !imgSrc) return;

        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.src = imgSrc;

        image.onload = async () => {
            try {
                setIsUploading(true);

                const blob = await getCroppedImg(image, completedCrop, rotate, scale);
                if (!blob) return;

                const file = new File([blob], 'logo-cropped.jpg', {
                    type: 'image/jpeg',
                });

                let finalUrl: string;

                if (onUpload) {
                    finalUrl = await onUpload(file);
                } else {
                    finalUrl = URL.createObjectURL(blob);
                }

                setPreviewUrl(finalUrl);
                onChange(file, finalUrl);
                setShowCropModal(false);
            } catch (error) {
                setUploadError(error instanceof Error ? error.message : 'Ошибка обработки изображения');
            } finally {
                setIsUploading(false);
            }
        };
    }, [completedCrop, imgSrc, rotate, scale, onUpload, onChange]);

    // Отмена кропа
    const handleCancelCrop = useCallback(() => {
        setShowCropModal(false);
        setCrop(undefined);
        setCompletedCrop(undefined);
        setScale(1);
        setRotate(0);
    }, []);

    // Сброс изображения
    const handleReset = useCallback(() => {
        setPreviewUrl('');
        setImgSrc('');
        setCrop(undefined);
        setCompletedCrop(undefined);
        setScale(1);
        setRotate(0);
        setUploadError(null);
        onChange(null);
    }, [onChange]);

    // Редактирование существующего изображения
    const handleEdit = useCallback(() => {
        if (imgSrc) {
            setShowCropModal(true);
        }
    }, [imgSrc]);

    return (
        <div className={cn('logo-uploader', className)}>
            {label && (
                <label className="logo-uploader__label">
                    {label}
                    {required && <span className="logo-uploader__required">*</span>}
                </label>
            )}

            <div
                {...getRootProps()}
                className={cn(
                    'logo-uploader__dropzone',
                    isDragActive && 'logo-uploader__dropzone--active',
                    disabled && 'logo-uploader__dropzone--disabled',
                    error && 'logo-uploader__dropzone--error'
                )}
                onClick={() => {
                    if (!disabled) {
                        fileInputRef.current?.click();
                    }
                }}
            >
                <input {...getInputProps()} />
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedTypes.join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {previewUrl ? (
                    <div className="logo-uploader__preview-container">
                        <div className="logo-uploader__preview">
                            {isSvgFile(value as File) ? (
                                <div
                                    className="logo-uploader__svg-preview"
                                    dangerouslySetInnerHTML={{ __html: previewUrl }}
                                />
                            ) : (
                                <img
                                    src={previewUrl}
                                    alt="Logo preview"
                                    className="logo-uploader__image"
                                />
                            )}

                            {isUploading && (
                                <div className="logo-uploader__loading-overlay">
                                    <Loader2 className="logo-uploader__loading-icon" />
                                    <span>Загрузка...</span>
                                </div>
                            )}
                        </div>

                        <div
                            className="logo-uploader__preview-actions"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                        >
                            {!isSvgFile(value as File) && (
                                <button
                                    type="button"
                                    className="logo-uploader__action"
                                    onClick={(e) => { e.stopPropagation(); handleEdit(); }}
                                    title="Редактировать"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                            )}

                            <button
                                type="button"
                                className="logo-uploader__action"
                                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                title="Заменить"
                            >
                                <Upload className="w-4 h-4" />
                            </button>

                            <button
                                type="button"
                                className="logo-uploader__action logo-uploader__action--delete"
                                onClick={(e) => { e.stopPropagation(); handleReset(); }}
                                title="Удалить"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="logo-uploader__placeholder">
                        <Upload className="logo-uploader__placeholder-icon" />
                        <div className="logo-uploader__placeholder-text">
                            {isDragActive ? (
                                'Отпустите файл здесь...'
                            ) : (
                                <>
                                    Перетащите логотип сюда или{' '}
                                    <button
                                        type="button"
                                        className="logo-uploader__placeholder-link"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        выберите файл
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="logo-uploader__placeholder-hint">
                            Поддерживаются: JPEG, PNG, GIF, WebP, SVG (до {maxSize / (1024 * 1024)}MB)
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="logo-uploader__error">
                    <AlertCircle className="logo-uploader__error-icon" />
                    {error}
                </div>
            )}

            {uploadError && (
                <div className="logo-uploader__error">
                    <AlertCircle className="logo-uploader__error-icon" />
                    {uploadError}
                </div>
            )}

            {/* Модальное окно кропа */}
            {showCropModal && (
                <div className="logo-uploader__modal" onClick={handleCancelCrop}>
                    <div
                        className="logo-uploader__modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="logo-uploader__modal-header">
                            <h3 className="logo-uploader__modal-title">
                                Обрезка логотипа
                            </h3>
                            <button
                                type="button"
                                className="logo-uploader__modal-close"
                                onClick={handleCancelCrop}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="logo-uploader__crop-container">
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={aspectRatio}
                            >
                                <img
                                    alt="Crop me"
                                    src={imgSrc}
                                    onLoad={onImageLoad}
                                    className="logo-uploader__crop-image"
                                    style={{
                                        transform: `scale(${scale}) rotate(${rotate}deg)`,
                                        transformOrigin: 'center',
                                    }}
                                />
                            </ReactCrop>
                        </div>

                        {showCropControls && (
                            <div className="logo-uploader__controls">
                                <div className="logo-uploader__control-group">
                                    <label className="logo-uploader__control-label">
                                        <ZoomIn className="w-4 h-4" />
                                        Масштаб: {scale.toFixed(2)}x
                                    </label>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="3"
                                        step="0.05"
                                        value={scale}
                                        onChange={(e) => setScale(Number(e.target.value))}
                                        className="logo-uploader__control-slider"
                                    />
                                </div>

                                <div className="logo-uploader__control-group">
                                    <label className="logo-uploader__control-label">
                                        <RotateCcw className="w-4 h-4" />
                                        Поворот: {rotate}°
                                    </label>
                                    <input
                                        type="range"
                                        min="-180"
                                        max="180"
                                        step="1"
                                        value={rotate}
                                        onChange={(e) => setRotate(Number(e.target.value))}
                                        className="logo-uploader__control-slider"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="logo-uploader__modal-actions">
                            <button
                                type="button"
                                className="logo-uploader__modal-button logo-uploader__modal-button--secondary"
                                onClick={handleCancelCrop}
                            >
                                Отмена
                            </button>
                            <button
                                type="button"
                                className="logo-uploader__modal-button logo-uploader__modal-button--primary"
                                onClick={handleCropComplete}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Обработка...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Применить
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LogoUploader;

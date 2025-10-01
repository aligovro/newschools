import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactCrop, {
    centerCrop,
    Crop,
    makeAspectCrop,
    PixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { widgetImageService } from '../../../../services/WidgetImageService';

interface ImageUploaderProps {
    onImageUpload: (file: File, croppedImage?: string) => void;
    onImageCrop: (croppedImage: string) => void;
    maxSize?: number;
    acceptedTypes?: string[];
    aspectRatio?: number;
    className?: string;
    widgetSlug?: string;
    imageType?: 'background' | 'avatar' | 'gallery';
    slideId?: string;
    enableServerUpload?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
    onImageUpload,
    onImageCrop,
    maxSize = 10 * 1024 * 1024, // 10MB
    acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    aspectRatio,
    className = '',
    widgetSlug,
    imageType = 'background',
    slideId,
    enableServerUpload = false,
}) => {
    const [imgSrc, setImgSrc] = useState<string>('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [showCropModal, setShowCropModal] = useState(false);
    const [hasCroppedImage, setHasCroppedImage] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Предотвращаем скроллинг body когда модальное окно открыто
    useEffect(() => {
        if (showCropModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Очищаем стили при размонтировании компонента
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showCropModal]);

    // Обработка клавиши Escape для закрытия модального окна
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showCropModal) {
                handleCancelCrop();
            }
        };

        if (showCropModal) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showCropModal]);

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (file) {
                // Валидируем файл
                const validation = widgetImageService.validateImageFile(file);
                if (!validation.valid) {
                    alert(validation.errors.join('\n'));
                    return;
                }

                if (file.size > maxSize) {
                    alert(
                        `Размер файла не должен превышать ${maxSize / (1024 * 1024)}MB`,
                    );
                    return;
                }

                // Сбрасываем состояние при загрузке нового файла
                setHasCroppedImage(false);
                setScale(1);
                setRotate(0);
                setCrop(undefined);
                setCompletedCrop(undefined);
                setUploadError(null);

                // Если включена серверная загрузка
                if (enableServerUpload && widgetSlug) {
                    setIsUploading(true);
                    try {
                        const result = await widgetImageService.uploadImage(
                            file,
                            widgetSlug,
                            imageType,
                            slideId,
                        );

                        if (result.success && result.data) {
                            // Используем URL с сервера
                            onImageUpload(file, result.data.url);

                            // Если нужно обрезание, показываем модальное окно
                            if (aspectRatio) {
                                setImgSrc(result.data.url);
                                setShowCropModal(true);
                            }
                        } else {
                            setUploadError(
                                result.message ||
                                    'Ошибка при загрузке изображения',
                            );
                        }
                    } catch (error) {
                        console.error('Error uploading image:', error);
                        setUploadError('Ошибка при загрузке изображения');
                    } finally {
                        setIsUploading(false);
                    }
                } else {
                    // Локальная обработка - используем только файл, без blob URL
                    onImageUpload(file);

                    // Если нужно обрезание, показываем модальное окно
                    if (aspectRatio) {
                        const reader = new FileReader();
                        reader.addEventListener('load', () => {
                            setImgSrc(reader.result?.toString() || '');
                            setShowCropModal(true);
                        });
                        reader.readAsDataURL(file);
                    }
                }
            }
        },
        [
            maxSize,
            aspectRatio,
            onImageUpload,
            enableServerUpload,
            widgetSlug,
            imageType,
            slideId,
        ],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: acceptedTypes.reduce(
            (acc, type) => {
                acc[type] = [];
                return acc;
            },
            {} as Record<string, string[]>,
        ),
        multiple: false,
    });

    const onImageLoad = useCallback(
        (e: React.SyntheticEvent<HTMLImageElement>) => {
            if (aspectRatio) {
                const { width, height } = e.currentTarget;
                const crop = centerCrop(
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
                setCrop(crop);
            }
        },
        [aspectRatio],
    );

    const getCroppedImg = (
        image: HTMLImageElement,
        canvas: HTMLCanvasElement,
        crop: PixelCrop,
    ): Promise<Blob | null> => {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('No 2d context');
        }

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const pixelRatio = window.devicePixelRatio;

        canvas.width = crop.width * pixelRatio * scaleX;
        canvas.height = crop.height * pixelRatio * scaleY;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width * scaleX,
            crop.height * scaleY,
        );

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    resolve(blob);
                },
                'image/jpeg',
                0.95,
            );
        });
    };

    const handleCropComplete = useCallback(async () => {
        if (!completedCrop || !imgSrc) return;

        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.src = imgSrc;

        image.onload = async () => {
            const canvas = document.createElement('canvas');
            const blob = await getCroppedImg(image, canvas, completedCrop);

            if (blob) {
                // Если включена серверная загрузка, загружаем обрезанное изображение на сервер
                if (enableServerUpload && widgetSlug) {
                    setIsUploading(true);
                    try {
                        // Создаем File из Blob
                        const file = new File([blob], 'cropped-image.jpg', {
                            type: 'image/jpeg',
                        });

                        const result = await widgetImageService.uploadImage(
                            file,
                            widgetSlug,
                            imageType,
                            slideId,
                        );

                        if (result.success && result.data) {
                            // Используем URL с сервера
                            onImageCrop(result.data.url);
                            setHasCroppedImage(true);
                            setShowCropModal(false);
                        } else {
                            setUploadError(
                                result.message ||
                                    'Ошибка при загрузке обрезанного изображения',
                            );
                        }
                    } catch (error) {
                        console.error('Error uploading cropped image:', error);
                        setUploadError(
                            'Ошибка при загрузке обрезанного изображения',
                        );
                    } finally {
                        setIsUploading(false);
                    }
                } else {
                    // Локальная обработка - используем data URL вместо blob URL
                    const reader = new FileReader();
                    reader.onload = () => {
                        onImageCrop(reader.result as string);
                        setHasCroppedImage(true);
                        setShowCropModal(false);
                    };
                    reader.readAsDataURL(blob);
                }
            }
        };
    }, [
        completedCrop,
        imgSrc,
        onImageCrop,
        enableServerUpload,
        widgetSlug,
        imageType,
        slideId,
    ]);

    const handleCancelCrop = () => {
        setShowCropModal(false);
        // Не очищаем imgSrc, чтобы можно было повторно редактировать
        setCrop(undefined);
        setCompletedCrop(undefined);
    };

    const handleEditImage = () => {
        if (imgSrc) {
            setShowCropModal(true);
        }
    };

    return (
        <div className={`image-uploader ${className}`}>
            <div
                {...getRootProps()}
                className={`image-uploader__dropzone ${
                    isDragActive ? 'image-uploader__dropzone--active' : ''
                }`}
            >
                <input {...getInputProps()} />
                <div className="image-uploader__content">
                    {isUploading ? (
                        <div className="image-uploader__uploading">
                            <div className="image-uploader__spinner">
                                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                            </div>
                            <p className="image-uploader__text">
                                Загрузка изображения...
                            </p>
                        </div>
                    ) : isDragActive ? (
                        <p className="image-uploader__text">
                            Отпустите файл здесь...
                        </p>
                    ) : (
                        <div className="image-uploader__placeholder">
                            <div className="image-uploader__icon">
                                <svg
                                    width="48"
                                    height="48"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect
                                        x="3"
                                        y="3"
                                        width="18"
                                        height="18"
                                        rx="2"
                                        ry="2"
                                    />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21,15 16,10 5,21" />
                                </svg>
                            </div>
                            <p className="image-uploader__text">
                                Перетащите изображение сюда или{' '}
                                <span className="image-uploader__text--link">
                                    выберите файл
                                </span>
                            </p>
                            <p className="image-uploader__hint">
                                Поддерживаются: JPG, PNG, GIF, WebP (до{' '}
                                {maxSize / (1024 * 1024)}MB)
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Отображение ошибок */}
            {uploadError && (
                <div className="image-uploader__error">
                    <p className="text-sm text-red-600">{uploadError}</p>
                </div>
            )}

            {/* Кнопка редактирования после обрезки */}
            {hasCroppedImage && !showCropModal && (
                <div className="image-uploader__edit-section">
                    <button
                        type="button"
                        className="image-uploader__edit-button"
                        onClick={handleEditImage}
                    >
                        ✏️ Редактировать изображение
                    </button>
                </div>
            )}

            {showCropModal && (
                <div
                    className="image-uploader__modal"
                    onClick={handleCancelCrop}
                >
                    <div
                        className="image-uploader__modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="image-uploader__modal-header">
                            <h3 className="image-uploader__modal-title">
                                Обрезка изображения
                            </h3>
                            <button
                                type="button"
                                className="image-uploader__modal-close"
                                onClick={handleCancelCrop}
                            >
                                ×
                            </button>
                        </div>

                        <div className="image-uploader__crop-container">
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) =>
                                    setCrop(percentCrop)
                                }
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={aspectRatio}
                            >
                                <img
                                    alt="Crop me"
                                    src={imgSrc}
                                    onLoad={onImageLoad}
                                    className="image-uploader__crop-image"
                                    style={{
                                        transform: `scale(${scale}) rotate(${rotate}deg)`,
                                        transformOrigin: 'center',
                                    }}
                                />
                            </ReactCrop>
                        </div>

                        <div className="image-uploader__controls">
                            <div className="image-uploader__control-group">
                                <label className="image-uploader__control-label">
                                    Масштаб: {scale}%
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="3"
                                    step="0.1"
                                    value={scale}
                                    onChange={(e) =>
                                        setScale(Number(e.target.value))
                                    }
                                    className="image-uploader__control-slider"
                                />
                            </div>

                            <div className="image-uploader__control-group">
                                <label className="image-uploader__control-label">
                                    Поворот: {rotate}°
                                </label>
                                <input
                                    type="range"
                                    min="-180"
                                    max="180"
                                    step="1"
                                    value={rotate}
                                    onChange={(e) =>
                                        setRotate(Number(e.target.value))
                                    }
                                    className="image-uploader__control-slider"
                                />
                            </div>
                        </div>

                        <div className="image-uploader__modal-actions">
                            <button
                                type="button"
                                className="image-uploader__button image-uploader__button--secondary"
                                onClick={handleCancelCrop}
                            >
                                Отмена
                            </button>
                            <button
                                type="button"
                                className="image-uploader__button image-uploader__button--primary"
                                onClick={handleCropComplete}
                            >
                                Обрезать
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;

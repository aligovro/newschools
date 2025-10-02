import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactCrop, {
    centerCrop,
    Crop,
    makeAspectCrop,
    PixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { widgetImageService } from '../../../../services/WidgetImageService';
// Debug flag for verbose logging
const DEBUG_CROP = false;

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
    existingImageUrl?: string;
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
    existingImageUrl,
}) => {
    const [imgSrc, setImgSrc] = useState<string>('');
    const [originalSrc, setOriginalSrc] = useState<string>('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [lockAspect, setLockAspect] = useState<boolean>(!!aspectRatio);
    const [showCropModal, setShowCropModal] = useState(false);
    const [hasCroppedImage, setHasCroppedImage] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const imgRef = useRef<HTMLImageElement | null>(null);

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

    // Если пришел уже сохраненный URL изображения, показываем кнопку редактирования
    useEffect(() => {
        if (existingImageUrl) {
            setImgSrc(existingImageUrl);
            setHasCroppedImage(true);
            setPreviewUrl(existingImageUrl);
            if (DEBUG_CROP) {
                console.groupCollapsed('[Uploader] existingImageUrl');
                console.log('url:', existingImageUrl);
                console.groupEnd();
            }
        }
    }, [existingImageUrl]);

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
                if (DEBUG_CROP) {
                    console.groupCollapsed('[Uploader] onDrop');
                    console.log('file:', {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                    });
                    console.log(
                        'enableServerUpload:',
                        enableServerUpload,
                        'widgetSlug:',
                        widgetSlug,
                        'imageType:',
                        imageType,
                        'slideId:',
                        slideId,
                    );
                    console.groupEnd();
                }

                // Если включена серверная загрузка
                if (enableServerUpload && widgetSlug) {
                    if (aspectRatio) {
                        // Не грузим оригинал, сначала открываем кроп модалку и после кропа грузим сжатый файл
                        const reader = new FileReader();
                        reader.addEventListener('load', () => {
                            const src = reader.result?.toString() || '';
                            setImgSrc(src);
                            setOriginalSrc(src);
                            setShowCropModal(true);
                            if (DEBUG_CROP)
                                console.log(
                                    '[Uploader] reader loaded (server upload, aspect)',
                                );
                        });
                        reader.readAsDataURL(file);
                    } else {
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
                                setOriginalSrc(result.data.url);
                                setPreviewUrl(result.data.url);
                                if (DEBUG_CROP) {
                                    console.groupCollapsed(
                                        '[Uploader] upload original success',
                                    );
                                    console.log('response:', result.data);
                                    console.groupEnd();
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
                    }
                } else {
                    // Локальная обработка - используем только файл, без blob URL
                    onImageUpload(file);

                    // Если нужно обрезание, показываем модальное окно
                    if (aspectRatio) {
                        const reader = new FileReader();
                        reader.addEventListener('load', () => {
                            const src = reader.result?.toString() || '';
                            setImgSrc(src);
                            setOriginalSrc(src);
                            setShowCropModal(true);
                            if (DEBUG_CROP)
                                console.log(
                                    '[Uploader] reader loaded (local, aspect)',
                                );
                        });
                        reader.readAsDataURL(file);
                    } else {
                        // Показать предпросмотр выбранного файла
                        const reader = new FileReader();
                        reader.addEventListener('load', () => {
                            setPreviewUrl(reader.result?.toString() || '');
                            if (DEBUG_CROP)
                                console.log(
                                    '[Uploader] preview set (local, no-aspect)',
                                );
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
            const { width, height } = e.currentTarget;
            imgRef.current = e.currentTarget as HTMLImageElement;
            if (DEBUG_CROP) {
                console.groupCollapsed('[Uploader] onImageLoad');
                console.log('displayed:', { width, height });
                console.log('natural:', {
                    width: (e.currentTarget as HTMLImageElement).naturalWidth,
                    height: (e.currentTarget as HTMLImageElement).naturalHeight,
                });
                console.log(
                    'aspectRatio:',
                    aspectRatio,
                    'lockAspect:',
                    lockAspect,
                );
                console.groupEnd();
            }
            if (lockAspect && aspectRatio) {
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
                // Свободная рамка: стартовый прямоугольник 80% без фикс. пропорций
                setCrop({ unit: '%', x: 10, y: 10, width: 80, height: 80 });
            }
        },
        [aspectRatio, lockAspect],
    );

    const getCroppedImg = (
        image: HTMLImageElement,
        crop: PixelCrop,
        rotateDeg: number,
        scaleVal: number,
    ): Promise<Blob | null> => {
        const sourceEl = imgRef.current || image;
        // Масштаб между натуральными и отображаемыми пикселями
        const displayWidth = (sourceEl as HTMLImageElement).width;
        const displayHeight = (sourceEl as HTMLImageElement).height;
        const scaleX =
            (sourceEl as HTMLImageElement).naturalWidth / displayWidth;
        const scaleY =
            (sourceEl as HTMLImageElement).naturalHeight / displayHeight;

        // Переводим рамку в натуральные пиксели исходника
        const cropXNat = crop.x * scaleX;
        const cropYNat = crop.y * scaleY;
        const cropWNat = crop.width * scaleX;
        const cropHNat = crop.height * scaleY;

        const outWidth = Math.max(1, Math.floor(cropWNat));
        const outHeight = Math.max(1, Math.floor(cropHNat));

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('No 2d context');
        canvas.width = outWidth;
        canvas.height = outHeight;
        ctx.imageSmoothingQuality = 'high';

        const radians = (rotateDeg * Math.PI) / 180;
        const effScale = scaleVal;

        // Рисуем так, чтобы центр рамки совпал с центром выходного канваса
        const cropCenterX = cropXNat + cropWNat / 2;
        const cropCenterY = cropYNat + cropHNat / 2;

        ctx.save();
        ctx.translate(outWidth / 2, outHeight / 2);
        ctx.rotate(radians);
        ctx.scale(effScale, effScale);
        ctx.translate(-cropCenterX, -cropCenterY);
        ctx.drawImage(image, 0, 0);
        ctx.restore();

        if (DEBUG_CROP) {
            console.groupCollapsed('[Uploader] getCroppedImg');
            console.log('natural:', {
                w: (sourceEl as HTMLImageElement).naturalWidth,
                h: (sourceEl as HTMLImageElement).naturalHeight,
            });
            console.log('displayed:', { w: displayWidth, h: displayHeight });
            console.log('scaleX/scaleY:', { scaleX, scaleY });
            console.log('incoming crop (px):', crop);
            console.log('computed nat crop:', {
                cropXNat,
                cropYNat,
                cropWNat,
                cropHNat,
            });
            console.log('rotate/scale:', { rotateDeg, scaleVal });
            console.log('out:', { outWidth, outHeight });
            console.groupEnd();
        }

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (DEBUG_CROP)
                        console.log(
                            '[Uploader] toBlob:',
                            blob ? { size: blob.size, type: blob.type } : null,
                        );
                    resolve(blob);
                },
                'image/jpeg',
                0.92,
            );
        });
    };

    const handleCropComplete = useCallback(async () => {
        if (!completedCrop || !imgSrc) return;

        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.src = imgSrc;

        image.onload = async () => {
            // Вычисляем актуальный пиксельный crop: используем completedCrop, иначе переводим percent -> px
            let effectiveCrop: PixelCrop | undefined = completedCrop;
            if (!effectiveCrop && crop && imgRef.current) {
                const el = imgRef.current;
                const px = Math.round((crop.x / 100) * el.width);
                const py = Math.round((crop.y / 100) * el.height);
                const pw = Math.round((crop.width / 100) * el.width);
                const ph = Math.round((crop.height / 100) * el.height);
                effectiveCrop = {
                    unit: 'px',
                    x: px,
                    y: py,
                    width: pw,
                    height: ph,
                } as PixelCrop;
            }

            if (DEBUG_CROP) {
                console.log('[Uploader] effectiveCrop (px):', effectiveCrop);
            }

            const blob = await getCroppedImg(
                image,
                effectiveCrop || completedCrop!,
                rotate,
                scale,
            );

            if (blob) {
                // Если включена серверная загрузка, загружаем обрезанное изображение на сервер
                if (enableServerUpload && widgetSlug) {
                    setIsUploading(true);
                    try {
                        // Создаем File из Blob
                        const file = new File([blob], 'cropped-image.jpg', {
                            type: 'image/jpeg',
                        });

                        if (DEBUG_CROP) {
                            console.groupCollapsed(
                                '[Uploader] upload cropped start',
                            );
                            console.log('file size/type:', {
                                size: file.size,
                                type: file.type,
                            });
                            console.log('widgetSlug/imageType/slideId:', {
                                widgetSlug,
                                imageType,
                                slideId,
                            });
                            console.groupEnd();
                        }
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
                            setPreviewUrl(result.data.url);
                            if (DEBUG_CROP) {
                                console.groupCollapsed(
                                    '[Uploader] upload cropped success',
                                );
                                console.log('response:', result.data);
                                console.groupEnd();
                            }
                        } else {
                            setUploadError(
                                result.message ||
                                    'Ошибка при загрузке обрезанного изображения',
                            );
                            if (DEBUG_CROP)
                                console.error(
                                    '[Uploader] upload cropped failed:',
                                    result,
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
                        setPreviewUrl(reader.result as string);
                        if (DEBUG_CROP)
                            console.log('[Uploader] local cropped preview set');
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
        rotate,
        scale,
        crop,
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
            {(hasCroppedImage ||
                (!!existingImageUrl && existingImageUrl.length > 0)) &&
                !showCropModal &&
                !uploadError && (
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
                                onChange={(_, percentCrop) => {
                                    if (DEBUG_CROP)
                                        console.log(
                                            '[Uploader] crop onChange (percent):',
                                            percentCrop,
                                        );
                                    setCrop(percentCrop);
                                }}
                                onComplete={(c) => {
                                    if (DEBUG_CROP)
                                        console.log(
                                            '[Uploader] crop onComplete (pixel):',
                                            c,
                                        );
                                    setCompletedCrop(c);
                                }}
                                aspect={lockAspect ? aspectRatio : undefined}
                            >
                                <img
                                    alt="Crop me"
                                    src={originalSrc || imgSrc}
                                    onLoad={onImageLoad}
                                    className="image-uploader__crop-image"
                                    style={{
                                        transform: `scale(${scale}) rotate(${rotate}deg)`,
                                        transformOrigin: 'center',
                                    }}
                                />
                            </ReactCrop>
                        </div>

                        {/* Переключатель свободной рамки */}
                        <div className="ml-3 mt-4 flex items-center gap-3">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={!lockAspect}
                                    onChange={(e) =>
                                        setLockAspect(!e.target.checked)
                                    }
                                />
                                Свободная рамка
                            </label>
                        </div>

                        {/* Управления масштабом/поворотом */}
                        <div className="image-uploader__controls mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="image-uploader__control-group">
                                <label className="image-uploader__control-label text-sm">
                                    Масштаб: {scale.toFixed(2)}x
                                </label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="3"
                                    step="0.05"
                                    value={scale}
                                    onChange={(e) =>
                                        setScale(Number(e.target.value))
                                    }
                                    className="image-uploader__control-slider w-full"
                                />
                            </div>
                            <div className="image-uploader__control-group">
                                <label className="image-uploader__control-label text-sm">
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
                                    className="image-uploader__control-slider w-full"
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

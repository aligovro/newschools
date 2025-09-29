import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactCrop, {
    centerCrop,
    Crop,
    makeAspectCrop,
    PixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageUploaderProps {
    onImageUpload: (file: File, croppedImage?: string) => void;
    onImageCrop: (croppedImage: string) => void;
    maxSize?: number;
    acceptedTypes?: string[];
    aspectRatio?: number;
    className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
    onImageUpload,
    onImageCrop,
    maxSize = 10 * 1024 * 1024, // 10MB
    acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    aspectRatio,
    className = '',
}) => {
    const [imgSrc, setImgSrc] = useState<string>('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [showCropModal, setShowCropModal] = useState(false);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (file) {
                if (file.size > maxSize) {
                    alert(
                        `Размер файла не должен превышать ${maxSize / (1024 * 1024)}MB`,
                    );
                    return;
                }

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
        },
        [maxSize, aspectRatio, onImageUpload],
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
                const croppedImageUrl = URL.createObjectURL(blob);
                onImageCrop(croppedImageUrl);
                setShowCropModal(false);
            }
        };
    }, [completedCrop, imgSrc, onImageCrop]);

    const handleCancelCrop = () => {
        setShowCropModal(false);
        setImgSrc('');
        setCrop(undefined);
        setCompletedCrop(undefined);
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
                    {isDragActive ? (
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

            {showCropModal && (
                <div className="image-uploader__modal">
                    <div className="image-uploader__modal-content">
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

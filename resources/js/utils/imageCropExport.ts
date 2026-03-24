/**
 * Правила экспорта после кропа: JPEG не хранит альфу — для PNG/WebP/GIF
 * сохраняем результат как PNG, чтобы не получить чёрный фон в прозрачных областях.
 */

export function inferImageMimeFromSrc(src: string): string {
    if (!src) return 'image/jpeg';
    const dataMatch = /^data:([^;,]+)/.exec(src);
    if (dataMatch?.[1]) return dataMatch[1];
    const path = src.split('?')[0].toLowerCase();
    if (path.endsWith('.png')) return 'image/png';
    if (path.endsWith('.webp')) return 'image/webp';
    if (path.endsWith('.gif')) return 'image/gif';
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
    return 'image/jpeg';
}

/** Исходник с альфой — кроп экспортируем в PNG (без потери прозрачности). */
export function sourceMimeHasAlphaChannel(sourceMime: string): boolean {
    return (
        sourceMime === 'image/png' ||
        sourceMime === 'image/webp' ||
        sourceMime === 'image/gif'
    );
}

export function getCroppedBlobAndFileMeta(
    sourceMime: string,
    opts?: { jpegQuality?: number },
): {
    blobMime: string;
    fileExtension: string;
    jpegQuality?: number;
} {
    if (sourceMimeHasAlphaChannel(sourceMime)) {
        return { blobMime: 'image/png', fileExtension: 'png' };
    }
    const jpegQuality = opts?.jpegQuality ?? 0.92;
    return { blobMime: 'image/jpeg', fileExtension: 'jpg', jpegQuality };
}

/** Пиксельная рамка относительно отрисованного img (как в react-image-crop). */
export interface PixelCropLike {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Переводит координаты кропа в натуральные пиксели. Поджимает к краям, если рамка
 * визуально «впритык» (off-by-one в библиотеке + Math.floor раньше съедали 1px по краям).
 */
export function pixelCropToNaturalRect(
    image: HTMLImageElement,
    crop: PixelCropLike,
): { sx: number; sy: number; sw: number; sh: number } {
    const nw = image.naturalWidth;
    const nh = image.naturalHeight;
    const dw = image.width;
    const dh = image.height;

    if (!dw || !dh || !nw || !nh) {
        return {
            sx: 0,
            sy: 0,
            sw: Math.max(1, nw),
            sh: Math.max(1, nh),
        };
    }

    const scaleX = nw / dw;
    const scaleY = nh / dh;

    let sx = crop.x * scaleX;
    let sy = crop.y * scaleY;
    let sw = crop.width * scaleX;
    let sh = crop.height * scaleY;

    const edgeTol = 1;
    if (crop.x <= edgeTol) {
        sx = 0;
    }
    if (crop.y <= edgeTol) {
        sy = 0;
    }
    if (crop.x + crop.width >= dw - edgeTol) {
        sw = nw - sx;
    }
    if (crop.y + crop.height >= dh - edgeTol) {
        sh = nh - sy;
    }

    let isx = Math.round(sx);
    let isy = Math.round(sy);
    let isw = Math.round(sw);
    let ish = Math.round(sh);

    isx = Math.max(0, Math.min(isx, nw - 1));
    isy = Math.max(0, Math.min(isy, nh - 1));
    isw = Math.max(1, Math.min(isw, nw - isx));
    ish = Math.max(1, Math.min(ish, nh - isy));

    return { sx: isx, sy: isy, sw: isw, sh: ish };
}

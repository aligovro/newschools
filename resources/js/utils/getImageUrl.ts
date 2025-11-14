/**
 * Утилита для получения URL изображения
 * @param imagePath - путь к изображению (бэкенд уже добавляет /storage/ префикс)
 * @returns URL изображения как есть (бэкенд уже форматирует URL)
 *
 * ВАЖНО: Префикс /storage/ добавляется на бэкенде в методе formatImageUrl,
 * поэтому здесь мы просто возвращаем URL как есть для обратной совместимости
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) return '';
    // Бэкенд уже добавил /storage/ префикс, просто возвращаем как есть
    return imagePath;
};

/**
 * Утилита для извлечения пути к файлу из полного URL
 * @param fullUrl - полный URL изображения
 * @returns только путь к файлу без домена
 */
export const extractImagePath = (
    fullUrl: string | null | undefined,
): string => {
    if (!fullUrl) return '';

    // Если это не полный URL, возвращаем как есть
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        return fullUrl;
    }

    // Извлекаем путь после /storage/
    const match = fullUrl.match(/\/storage\/(.+)$/);
    return match ? match[1] : '';
};

/**
 * Утилита для получения превью изображения
 * @param imagePath - путь к изображению
 * @param size - размер превью ('thumbnail', 'small', etc.)
 * @returns URL превью изображения
 */
export const getImageThumbnailUrl = (
    imagePath: string | null | undefined,
    size: string = 'thumbnail',
): string => {
    if (!imagePath) return '';

    // Если уже полный URL, возвращаем как есть
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Заменяем 'original' на размер превью в пути
    const thumbnailPath = imagePath.replace('/original_', `/${size}_`);

    return getImageUrl(thumbnailPath);
};

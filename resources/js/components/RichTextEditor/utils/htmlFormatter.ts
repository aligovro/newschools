/**
 * Утилиты для форматирования HTML
 * Вынесены в отдельный файл для переиспользования и тестирования
 */

/**
 * Форматирует HTML с отступами для читаемости
 * @param html - HTML строка для форматирования
 * @returns Отформатированная HTML строка
 */
export const formatHtml = (html: string): string => {
  let formatted = html;
  let indent = 0;
  const indentSize = 2;

  formatted = formatted
    .replace(/></g, '>\n<') // Переносы между тегами
    .replace(/\n\s*\n/g, '\n') // Убираем пустые строки
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';

      // Уменьшаем отступ для закрывающих тегов
      if (trimmed.startsWith('</')) {
        indent = Math.max(0, indent - indentSize);
      }

      const indentedLine = ' '.repeat(indent) + trimmed;

      // Увеличиваем отступ для открывающих тегов (кроме самозакрывающихся)
      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
        indent += indentSize;
      }

      return indentedLine;
    })
    .filter((line) => line.trim() !== '') // Убираем пустые строки
    .join('\n');

  return formatted;
};

/**
 * Очищает HTML контент от служебных элементов редактора
 * @param html - HTML строка для очистки
 * @returns Очищенная HTML строка
 */
export const cleanContentForOutput = (html: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Удаляем все элементы ресайза и иконку редактирования
  const elementsToRemove = tempDiv.querySelectorAll(
    '.resize-handle, .corner-handle, .image-settings-button',
  );
  elementsToRemove.forEach((element) => element.remove());

  // Удаляем класс resizable с изображений
  const images = tempDiv.querySelectorAll('img.resizable');
  images.forEach((img) => img.classList.remove('resizable'));

  return tempDiv.innerHTML;
};

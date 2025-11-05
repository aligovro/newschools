/**
 * Создает debounced версию функции с возможностью немедленного вызова (flush)
 * @param func Функция для debounce
 * @param delay Задержка в миллисекундах
 * @returns Debounced функция с методом flush
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) & { flush: () => void; cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debouncedFunc = function (...args: Parameters<T>) {
    lastArgs = args;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
      lastArgs = null;
    }, delay);
  };

  // Немедленный вызов с последними аргументами
  debouncedFunc.flush = function () {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (lastArgs) {
      func(...lastArgs);
      lastArgs = null;
    }
  };

  // Отмена отложенного вызова
  debouncedFunc.cancel = function () {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };

  return debouncedFunc as any;
}

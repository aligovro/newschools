/**
 * Утилиты для подсчета слов и символов в редакторе
 */

export interface WordCountResult {
  words: number;
  characters: number;
}

/**
 * Подсчитывает количество слов и символов в тексте
 * @param text - Текст для подсчета
 * @returns Объект с количеством слов и символов
 */
export const countWords = (text: string): WordCountResult => {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return { words: 0, characters: 0 };
  }

  const words = trimmedText.split(/\s+/).filter((word) => word.length > 0);

  return {
    words: words.length,
    characters: text.length,
  };
};

/**
 * Извлекает текст из HTML элемента и подсчитывает слова
 * @param element - HTML элемент
 * @returns Объект с количеством слов и символов
 */
export const countWordsFromElement = (element: HTMLElement | null): WordCountResult => {
  if (!element) {
    return { words: 0, characters: 0 };
  }

  const text = element.innerText || '';
  return countWords(text);
};

/**
 * Экспорт всех утилит RichTextEditor
 * Для удобного импорта: import { formatHtml, countWords } from './utils';
 */

export { formatHtml, cleanContentForOutput, removeImageCompletely } from './htmlFormatter';
export { countWords, countWordsFromElement } from './wordCounter';
export type { WordCountResult } from './wordCounter';

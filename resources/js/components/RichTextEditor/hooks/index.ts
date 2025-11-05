/**
 * Экспорт всех хуков RichTextEditor
 * Для удобного импорта: import { useImageResizing, useEditorContent } from './hooks';
 */

export { useImageResizing } from './useImageResizing';
export { useEditorCommands } from './useEditorCommands';
export { useEditorContent } from './useEditorContent';
export { useLinkInsertion } from './useLinkInsertion';
export { useButtonInsertion } from './useButtonInsertion';
export { useTableInsertion } from './useTableInsertion';
export { useVideoInsertion } from './useVideoInsertion';
export { useColorFormatting } from './useColorFormatting';
export { useHtmlMode } from './useHtmlMode';
export { useImageHandlers } from './useImageHandlers';

// Типы
export type { UseImageResizingReturn } from './useImageResizing';
export type { UseEditorCommandsReturn } from './useEditorCommands';
export type { UseEditorContentReturn } from './useEditorContent';
export type { UseLinkInsertionReturn } from './useLinkInsertion';
export type { UseButtonInsertionReturn } from './useButtonInsertion';
export type { UseTableInsertionReturn } from './useTableInsertion';
export type { UseVideoInsertionReturn } from './useVideoInsertion';
export type { UseColorFormattingReturn } from './useColorFormatting';
export type { UseHtmlModeReturn } from './useHtmlMode';

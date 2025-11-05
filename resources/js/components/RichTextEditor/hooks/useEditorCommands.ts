import { useCallback } from 'react';

interface UseEditorCommandsProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  isActive: boolean;
  onContentChange: () => void;
}

export interface UseEditorCommandsReturn {
  execCommand: (command: string, value?: string) => void;
}

/**
 * Хук для управления командами форматирования редактора
 * Выделен для изоляции логики команд и улучшения тестируемости
 */
export const useEditorCommands = ({
  editorRef,
  isActive,
  onContentChange,
}: UseEditorCommandsProps): UseEditorCommandsReturn => {
  const execCommand = useCallback(
    (command: string, value?: string) => {
      if (!isActive || !editorRef.current) return;

      // Специальная обработка для команды 'code'
      if (command === 'code') {
        const selection = window.getSelection();
        if (!selection || selection.toString().length === 0) {
          document.execCommand('insertHTML', false, '<code></code>');
        } else {
          const selectedText = selection.toString();
          const codeHtml = `<code>${selectedText}</code>`;
          document.execCommand('insertHTML', false, codeHtml);
        }
      }
      // Специальная обработка для команд списков
      else if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
        const selection = window.getSelection();
        const listTag = command === 'insertUnorderedList' ? 'ul' : 'ol';

        if (!selection || selection.toString().length === 0) {
          const listHtml = `<${listTag}><li></li></${listTag}>`;
          document.execCommand('insertHTML', false, listHtml);
        } else {
          const selectedText = selection.toString();
          const listHtml = `<${listTag}><li>${selectedText}</li></${listTag}>`;
          document.execCommand('insertHTML', false, listHtml);
        }
      }
      // Специальная обработка для команд выравнивания
      else if (
        command === 'justifyLeft' ||
        command === 'justifyCenter' ||
        command === 'justifyRight' ||
        command === 'justifyFull'
      ) {
        const selection = window.getSelection();

        if (selection && selection.anchorNode) {
          let node: Node | HTMLElement | null = selection.anchorNode;

          // Если это текстовый узел, берем родителя
          if (node.nodeType === Node.TEXT_NODE) {
            node = node.parentElement;
          }

          if (!node) return;

          // Ищем ближайший блочный элемент
          let blockElement = node as HTMLElement;
          while (blockElement && blockElement !== editorRef.current) {
            const tagName = blockElement.tagName?.toLowerCase();
            if (
              tagName === 'div' ||
              tagName === 'p' ||
              tagName === 'li' ||
              tagName === 'h1' ||
              tagName === 'h2' ||
              tagName === 'h3' ||
              tagName === 'h4' ||
              tagName === 'h5' ||
              tagName === 'h6' ||
              tagName === 'blockquote'
            ) {
              break;
            }
            blockElement = blockElement.parentElement as HTMLElement;
          }

          if (blockElement && blockElement !== editorRef.current) {
            // Применяем выравнивание напрямую через style
            const alignMap: Record<string, string> = {
              justifyLeft: 'left',
              justifyCenter: 'center',
              justifyRight: 'right',
              justifyFull: 'justify',
            };
            blockElement.style.textAlign = alignMap[command];
          } else {
            // Если не нашли блочный элемент, создаем div с выравниванием
            const alignMap: Record<string, string> = {
              justifyLeft: 'left',
              justifyCenter: 'center',
              justifyRight: 'right',
              justifyFull: 'justify',
            };

            // Оборачиваем текущее содержимое в div с выравниванием
            document.execCommand('formatBlock', false, 'div');

            // Применяем стиль к созданному div
            setTimeout(() => {
              const sel = window.getSelection();
              if (sel && sel.anchorNode) {
                let n: Node | HTMLElement | null = sel.anchorNode;
                if (n.nodeType === Node.TEXT_NODE) {
                  n = n.parentElement;
                }

                if (!n) return;

                let block = n as HTMLElement;
                while (block && block !== editorRef.current) {
                  if (block.tagName === 'DIV') {
                    block.style.textAlign = alignMap[command];
                    break;
                  }
                  block = block.parentElement as HTMLElement;
                }
              }
            }, 0);
          }
        }
      } else {
        document.execCommand(command, false, value);
      }

      editorRef.current?.focus();

      // Вызываем обновление контента
      onContentChange();
    },
    [isActive, editorRef, onContentChange],
  );

  return { execCommand };
};

import { useState, useCallback, useRef } from 'react';

interface UseButtonInsertionProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  isActive: boolean;
  isHtmlMode: boolean;
  onContentChange: () => void;
}

export interface UseButtonInsertionReturn {
  buttonDialogOpen: boolean;
  buttonUrl: string;
  buttonText: string;
  openInNewTab: boolean;
  savedRangeRef: React.RefObject<Range | null>;
  setButtonDialogOpen: (open: boolean) => void;
  setButtonUrl: (url: string) => void;
  setButtonText: (text: string) => void;
  setOpenInNewTab: (checked: boolean) => void;
  handleInsertButton: () => void;
  handleButtonSubmit: () => void;
}

/**
 * Хук для управления вставкой кнопок в редактор
 * Сохраняет позицию курсора и вставляет кнопки в правильное место
 */
export const useButtonInsertion = ({
  editorRef,
  isActive,
  isHtmlMode,
  onContentChange,
}: UseButtonInsertionProps): UseButtonInsertionReturn => {
  const [buttonDialogOpen, setButtonDialogOpen] = useState(false);
  const [buttonUrl, setButtonUrl] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(false);
  const savedRangeRef = useRef<Range | null>(null);

  // Открытие диалога вставки кнопки
  const handleInsertButton = useCallback(() => {
    if (!isActive) return;

    const selection = window.getSelection();
    const selectedText = selection?.toString() || '';
    
    let buttonUrl = '';
    let buttonText = selectedText;
    let openInNewTab = false;

    // Проверяем, является ли выделенный элемент ссылкой
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let node: Node | null = range.commonAncestorContainer;
      
      // Если это текстовый узел, берем родителя
      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentElement;
      }
      
      // Ищем ближайший элемент <a>
      while (node && node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.tagName?.toLowerCase() === 'a') {
          // Используем getAttribute для получения исходного значения href (относительного или абсолютного)
          buttonUrl = element.getAttribute('href') || '';
          buttonText = element.textContent || selectedText || '';
          openInNewTab = (element as HTMLAnchorElement).target === '_blank';
          break;
        }
        node = element.parentElement;
      }
      
      // Сохраняем позицию курсора перед открытием диалога
      savedRangeRef.current = range.cloneRange();
    }

    setButtonText(buttonText);
    setButtonUrl(buttonUrl);
    setOpenInNewTab(openInNewTab);
    setButtonDialogOpen(true);
  }, [isActive]);

  // Вставка кнопки
  const handleButtonSubmit = useCallback(() => {
    if (!buttonText.trim() || !editorRef.current) {
      return;
    }

    if (isHtmlMode) {
      // В HTML режиме добавляем HTML код кнопки
      const buttonHtml = buttonUrl
        ? `<a href="${buttonUrl}" class="editor-button">${buttonText}</a>`
        : `<button class="editor-button" type="button">${buttonText}</button>`;
      editorRef.current.innerText += buttonHtml;
    } else {
      // В WYSIWYG режиме создаем кнопку вручную
      editorRef.current.focus();

      const selection = window.getSelection();

      // Создаем кнопку
      let buttonElement: HTMLElement;
      
      if (buttonUrl) {
        // Если есть URL, создаем ссылку
        buttonElement = document.createElement('a');
        buttonElement.href = buttonUrl;
        if (openInNewTab) {
          buttonElement.target = '_blank';
          buttonElement.rel = 'noopener noreferrer';
        }
      } else {
        // Если нет URL, создаем обычную кнопку
        buttonElement = document.createElement('button');
        buttonElement.type = 'button';
      }

      buttonElement.textContent = buttonText;
      buttonElement.className = 'editor-button';
      buttonElement.setAttribute('contenteditable', 'false');

      if (selection && selection.rangeCount > 0 && selection.toString().length > 0) {
        // Если есть выделение с текстом, заменяем его на кнопку
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(buttonElement);

        // Устанавливаем курсор после кнопки
        range.setStartAfter(buttonElement);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else if (savedRangeRef.current && savedRangeRef.current.toString().length > 0) {
        // Если есть сохраненное выделение с текстом, заменяем его на кнопку
        const range = savedRangeRef.current.cloneRange();
        range.deleteContents();
        range.insertNode(buttonElement);

        // Устанавливаем курсор после кнопки
        range.setStartAfter(buttonElement);
        range.collapse(true);
        const newSelection = window.getSelection();
        newSelection?.removeAllRanges();
        newSelection?.addRange(range);
      } else {
        // Если нет выделения, вставляем кнопку в текущую позицию курсора
        if (savedRangeRef.current) {
          const range = savedRangeRef.current.cloneRange();
          range.collapse(true);
          range.insertNode(buttonElement);

          range.setStartAfter(buttonElement);
          range.collapse(true);
          const newSelection = window.getSelection();
          newSelection?.removeAllRanges();
          newSelection?.addRange(range);
        } else if (selection && selection.anchorNode) {
          const range = document.createRange();
          range.setStart(selection.anchorNode, selection.anchorOffset);
          range.collapse(true);
          range.insertNode(buttonElement);

          range.setStartAfter(buttonElement);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          // Если не можем найти позицию курсора, вставляем в конец
          editorRef.current.appendChild(buttonElement);

          const range = document.createRange();
          range.setStartAfter(buttonElement);
          range.collapse(true);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }
    }

    setButtonDialogOpen(false);
    onContentChange();
  }, [buttonUrl, buttonText, openInNewTab, isHtmlMode, editorRef, onContentChange]);

  return {
    buttonDialogOpen,
    buttonUrl,
    buttonText,
    openInNewTab,
    savedRangeRef,
    setButtonDialogOpen,
    setButtonUrl,
    setButtonText,
    setOpenInNewTab,
    handleInsertButton,
    handleButtonSubmit,
  };
};


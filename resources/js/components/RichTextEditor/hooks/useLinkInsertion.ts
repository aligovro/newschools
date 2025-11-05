import { useState, useCallback, useRef } from 'react';

interface UseLinkInsertionProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  isActive: boolean;
  isHtmlMode: boolean;
  onContentChange: () => void;
}

export interface UseLinkInsertionReturn {
  linkDialogOpen: boolean;
  linkUrl: string;
  linkText: string;
  openInNewTab: boolean;
  savedRangeRef: React.RefObject<Range | null>;
  setLinkDialogOpen: (open: boolean) => void;
  setLinkUrl: (url: string) => void;
  setLinkText: (text: string) => void;
  setOpenInNewTab: (checked: boolean) => void;
  handleInsertLink: () => void;
  handleLinkSubmit: () => void;
}

/**
 * Хук для управления вставкой ссылок в редактор
 * Сохраняет позицию курсора и вставляет ссылки в правильное место
 */
export const useLinkInsertion = ({
  editorRef,
  isActive,
  isHtmlMode,
  onContentChange,
}: UseLinkInsertionProps): UseLinkInsertionReturn => {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(false);
  const savedRangeRef = useRef<Range | null>(null);

  // Открытие диалога вставки ссылки
  const handleInsertLink = useCallback(() => {
    if (!isActive) return;

    const selection = window.getSelection();
    const selectedText = selection?.toString() || '';
    
    let linkUrl = '';
    let linkText = selectedText;
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
          linkUrl = element.getAttribute('href') || '';
          linkText = element.textContent || selectedText || '';
          openInNewTab = (element as HTMLAnchorElement).target === '_blank';
          break;
        }
        node = element.parentElement;
      }
      
      // Сохраняем позицию курсора перед открытием диалога
      savedRangeRef.current = range.cloneRange();
      console.log('💾 Saved cursor position:', {
        startContainer: savedRangeRef.current.startContainer,
        startOffset: savedRangeRef.current.startOffset,
        endContainer: savedRangeRef.current.endContainer,
        endOffset: savedRangeRef.current.endOffset,
      });
    }

    setLinkText(linkText);
    setLinkUrl(linkUrl);
    setOpenInNewTab(openInNewTab);
    setLinkDialogOpen(true);
  }, [isActive]);

  // Вставка ссылки
  const handleLinkSubmit = useCallback(() => {
    console.log('🔗 handleLinkSubmit called', {
      linkUrl,
      linkText,
      isHtmlMode,
      editorRef: !!editorRef.current,
    });

    if (!linkUrl || !editorRef.current) {
      console.log('❌ Early return: no linkUrl or editorRef');
      return;
    }

    if (isHtmlMode) {
      // В HTML режиме просто добавляем текст
      console.log('📝 HTML mode: adding markdown link');
      editorRef.current.innerText += `[${linkText || linkUrl}](${linkUrl})`;
    } else {
      // В WYSIWYG режиме создаем ссылку вручную
      console.log('🎨 WYSIWYG mode: creating link manually');
      editorRef.current.focus();

      const selection = window.getSelection();
      console.log('📋 Selection:', {
        hasSelection: !!selection,
        selectionText: selection?.toString(),
        rangeCount: selection?.rangeCount,
      });

      // Создаем ссылку
      const link = document.createElement('a');
      link.href = linkUrl;
      link.textContent = linkText || linkUrl;
      if (openInNewTab) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }

      console.log('🔗 Created link element:', link);

      if (selection && selection.rangeCount > 0 && selection.toString().length > 0) {
        // Если есть выделение с текстом, заменяем его на ссылку
        const range = selection.getRangeAt(0);
        console.log('📝 Replacing selection with link');
        range.deleteContents();
        range.insertNode(link);

        // Устанавливаем курсор после ссылки
        range.setStartAfter(link);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else if (savedRangeRef.current && savedRangeRef.current.toString().length > 0) {
        // Если есть сохраненное выделение с текстом, заменяем его на ссылку
        const range = savedRangeRef.current.cloneRange();
        console.log('📝 Replacing saved selection with link');
        range.deleteContents();
        range.insertNode(link);

        // Устанавливаем курсор после ссылки
        range.setStartAfter(link);
        range.collapse(true);
        const newSelection = window.getSelection();
        newSelection?.removeAllRanges();
        newSelection?.addRange(range);
      } else {
        // Если нет выделения, вставляем ссылку в текущую позицию курсора
        console.log('📝 Inserting link at cursor position');

        if (savedRangeRef.current) {
          console.log('📍 Using saved cursor position:', {
            startContainer: savedRangeRef.current.startContainer,
            startOffset: savedRangeRef.current.startOffset,
          });

          const range = savedRangeRef.current.cloneRange();
          range.collapse(true);
          range.insertNode(link);

          range.setStartAfter(link);
          range.collapse(true);
          const newSelection = window.getSelection();
          newSelection?.removeAllRanges();
          newSelection?.addRange(range);
        } else if (selection && selection.anchorNode) {
          console.log('📍 Using current cursor position:', {
            anchorNode: selection.anchorNode,
            anchorOffset: selection.anchorOffset,
            isEditor: selection.anchorNode === editorRef.current,
            isEditorChild: editorRef.current?.contains(selection.anchorNode),
          });

          const range = document.createRange();
          range.setStart(selection.anchorNode, selection.anchorOffset);
          range.collapse(true);
          range.insertNode(link);

          range.setStartAfter(link);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          // Если не можем найти позицию курсора, вставляем в конец
          console.log('📝 No cursor position found, inserting at end');
          editorRef.current.appendChild(link);

          const range = document.createRange();
          range.setStartAfter(link);
          range.collapse(true);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }

      console.log('✅ Link inserted successfully');
    }

    console.log('✅ Closing dialog and calling onContentChange');
    setLinkDialogOpen(false);
    onContentChange();
  }, [linkUrl, linkText, openInNewTab, isHtmlMode, editorRef, onContentChange]);

  return {
    linkDialogOpen,
    linkUrl,
    linkText,
    openInNewTab,
    savedRangeRef,
    setLinkDialogOpen,
    setLinkUrl,
    setLinkText,
    setOpenInNewTab,
    handleInsertLink,
    handleLinkSubmit,
  };
};

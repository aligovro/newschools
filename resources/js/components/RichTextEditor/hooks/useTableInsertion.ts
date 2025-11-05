import { useState, useCallback } from 'react';

interface UseTableInsertionProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  isActive: boolean;
  isHtmlMode: boolean;
  onContentChange: () => void;
}

export interface UseTableInsertionReturn {
  tableAnchorEl: HTMLElement | null;
  setTableAnchorEl: (el: HTMLElement | null) => void;
  handleInsertTable: (rows: number, cols: number) => void;
}

/**
 * Хук для управления вставкой таблиц в редактор
 */
export const useTableInsertion = ({
  editorRef,
  isActive,
  isHtmlMode,
  onContentChange,
}: UseTableInsertionProps): UseTableInsertionReturn => {
  const [tableAnchorEl, setTableAnchorEl] = useState<HTMLElement | null>(null);

  const handleInsertTable = useCallback(
    (rows: number, cols: number) => {
      if (!isActive || !editorRef.current) return;

      let tableHtml = '<table class="rte-table">';
      for (let i = 0; i < rows; i++) {
        tableHtml += '<tr>';
        for (let j = 0; j < cols; j++) {
          const isHeader = i === 0;
          const tag = isHeader ? 'th' : 'td';
          tableHtml += `<${tag}>Ячейка ${i + 1}-${j + 1}</${tag}>`;
        }
        tableHtml += '</tr>';
      }
      tableHtml += '</table>';

      if (isHtmlMode) {
        editorRef.current.innerText += tableHtml;
      } else {
        editorRef.current.innerHTML += tableHtml;
      }

      setTableAnchorEl(null);
      onContentChange();
    },
    [isActive, isHtmlMode, editorRef, onContentChange],
  );

  return {
    tableAnchorEl,
    setTableAnchorEl,
    handleInsertTable,
  };
};

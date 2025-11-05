import { useState, useCallback } from 'react';

interface UseColorFormattingProps {
  isActive: boolean;
  onContentChange: () => void;
}

export interface UseColorFormattingReturn {
  colorAnchorEl: HTMLElement | null;
  selectedColor: string;
  setColorAnchorEl: (el: HTMLElement | null) => void;
  setSelectedColor: (color: string) => void;
  handleColorChange: (color: string) => void;
}

/**
 * Хук для управления изменением цвета текста
 */
export const useColorFormatting = ({
  isActive,
  onContentChange,
}: UseColorFormattingProps): UseColorFormattingReturn => {
  const [colorAnchorEl, setColorAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedColor, setSelectedColor] = useState('#000000');

  const handleColorChange = useCallback(
    (color: string) => {
      if (!isActive) return;

      setSelectedColor(color);

      // Проверяем, что есть выделенный текст
      const selection = window.getSelection();
      if (!selection || selection.toString().length === 0) {
        alert('Выделите текст для изменения цвета');
        return;
      }

      const selectedText = selection.toString();

      // Получаем Range для более точной работы
      const range = selection.getRangeAt(0);

      // Создаем span элемент с цветом
      const span = document.createElement('span');
      span.style.color = color;
      span.textContent = selectedText;

      // Удаляем выделенный текст и вставляем цветной span
      range.deleteContents();
      range.insertNode(span);

      setColorAnchorEl(null);

      // Обновляем содержимое
      onContentChange();
    },
    [isActive, onContentChange],
  );

  return {
    colorAnchorEl,
    selectedColor,
    setColorAnchorEl,
    setSelectedColor,
    handleColorChange,
  };
};

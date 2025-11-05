import React, { useCallback } from 'react';

interface ImageTooltipProps {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const ImageTooltip: React.FC<ImageTooltipProps> = React.memo(
  ({ onMouseEnter, onMouseLeave }) => {
    const createTooltip = useCallback((img: HTMLImageElement) => {
      const tooltip = document.createElement('div');
      tooltip.className = 'image-tooltip';
      tooltip.innerHTML = `
      <div style="font-weight: 500; margin-bottom: 4px;">Изображение</div>
      <div style="font-size: 11px; opacity: 0.9;">• Клик для выбора</div>
      <div style="font-size: 11px; opacity: 0.9;">• Двойной клик для редактирования</div>
      <div style="font-size: 11px; opacity: 0.9;">• Перетащите маркеры для изменения размера</div>
    `;
      tooltip.style.cssText = `
      position: absolute;
      background: rgba(25, 118, 210, 0.95);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 12px;
      z-index: 10000;
      pointer-events: none;
      white-space: nowrap;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
      max-width: 200px;
    `;

      const rect = img.getBoundingClientRect();

      // Позиционируем подсказку выше изображения
      tooltip.style.left = `${rect.left + rect.width / 2}px`;
      tooltip.style.top = `${rect.top - 10}px`;
      tooltip.style.transform = 'translateX(-50%) translateY(-100%)';

      document.body.appendChild(tooltip);

      img.addEventListener(
        'mouseleave',
        () => {
          tooltip.remove();
        },
        { once: true },
      );

      return tooltip;
    }, []);

    // Экспортируем функцию для использования в родительском компоненте
    React.useImperativeHandle(React.createRef(), () => ({
      createTooltip,
    }));

    return null;
  },
);

ImageTooltip.displayName = 'ImageTooltip';

export default ImageTooltip;



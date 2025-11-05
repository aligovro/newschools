import { useCallback, useEffect, useRef } from 'react';

interface UseImageResizingProps {
  handleEditImage: (img: HTMLImageElement) => void;
}

export interface UseImageResizingReturn {
  createResizeHandles: (img: HTMLImageElement) => void;
  handleImageResize: (img: HTMLImageElement) => () => void;
  initializeImageResize: (img: HTMLImageElement) => void;
}

/**
 * Хук для управления изменением размера изображений в редакторе
 * Выделен в отдельный хук для улучшения читаемости и переиспользования
 */
export const useImageResizing = ({
  handleEditImage,
}: UseImageResizingProps): UseImageResizingReturn => {
  // Создание маркеров изменения размера
  const createResizeHandles = useCallback(
    (img: HTMLImageElement) => {
      if (!img || !img.src || img.complete === false) {
        return;
      }

      const handles = ['top', 'right', 'bottom', 'left'];
      const container: HTMLElement = (img.parentElement as HTMLElement) || img;

      // Удаляем существующие маркеры
      const existingHandles = container.querySelectorAll(
        '.resize-handle, .corner-handle, .image-settings-button',
      );
      existingHandles.forEach((handle) => handle.remove());

      // Создаем боковые маркеры
      handles.forEach((direction) => {
        const handle = document.createElement('div');
        handle.className = `resize-handle ${direction}`;
        handle.setAttribute('draggable', 'false');
        handle.setAttribute('contenteditable', 'false');

        Object.assign(handle.style, {
          position: 'absolute',
          background: '#1976d2',
          border: '2px solid white',
          borderRadius: '2px',
          zIndex: '1001',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          visibility: 'visible',
          opacity: '1',
          pointerEvents: 'auto',
        });

        // Позиционирование
        const positions: Record<string, Partial<CSSStyleDeclaration>> = {
          top: {
            top: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '24px',
            height: '8px',
            cursor: 'n-resize',
          },
          right: {
            top: '50%',
            right: '-6px',
            transform: 'translateY(-50%)',
            width: '8px',
            height: '24px',
            cursor: 'e-resize',
          },
          bottom: {
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '24px',
            height: '8px',
            cursor: 's-resize',
          },
          left: {
            top: '50%',
            left: '-6px',
            transform: 'translateY(-50%)',
            width: '8px',
            height: '24px',
            cursor: 'w-resize',
          },
        };

        Object.assign(handle.style, positions[direction]);
        container.appendChild(handle);
      });

      // Создаем угловые маркеры
      const cornerHandles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
      const cursorMap: Record<string, string> = {
        'top-left': 'nw-resize',
        'top-right': 'ne-resize',
        'bottom-left': 'sw-resize',
        'bottom-right': 'se-resize',
      };

      cornerHandles.forEach((corner) => {
        const handle = document.createElement('div');
        handle.className = `corner-handle ${corner}`;
        handle.setAttribute('draggable', 'false');
        handle.setAttribute('contenteditable', 'false');

        Object.assign(handle.style, {
          position: 'absolute',
          width: '16px',
          height: '16px',
          background: '#1976d2',
          border: '2px solid white',
          borderRadius: '50%',
          zIndex: '1001',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          display: 'block',
          visibility: 'visible',
          opacity: '1',
          pointerEvents: 'auto',
          cursor: cursorMap[corner] || 'se-resize',
        });

        const cornerPositions: Record<string, Partial<CSSStyleDeclaration>> = {
          'top-left': { top: '-8px', left: '-8px' },
          'top-right': { top: '-8px', right: '-8px' },
          'bottom-left': { bottom: '-8px', left: '-8px' },
          'bottom-right': { bottom: '-8px', right: '-8px' },
        };

        Object.assign(handle.style, cornerPositions[corner]);
        container.appendChild(handle);
      });

      // Кнопка настроек
      const settingsButton = document.createElement('button');
      settingsButton.className = 'image-settings-button';
      settingsButton.innerHTML = `
        <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ViewModuleIcon" style="width: 16px; height: 16px; fill: white;">
          <path d="M14.67 5v6.5H9.33V5zm1 6.5H21V5h-5.33zm-1 7.5v-6.5H9.33V19zm1-6.5V19H21v-6.5zm-7.34 0H3V19h5.33zm0-1V5H3v6.5z"></path>
        </svg>
      `;
      settingsButton.setAttribute('draggable', 'false');
      settingsButton.setAttribute('contenteditable', 'false');
      settingsButton.setAttribute('aria-label', 'Настройки изображения');

      Object.assign(settingsButton.style, {
        position: 'absolute',
        top: '-12px',
        left: '-12px',
        width: '28px',
        height: '28px',
        background: '#1976d2',
        border: '2px solid white',
        borderRadius: '50%',
        cursor: 'pointer',
        zIndex: '9999',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0',
        outline: 'none',
      });

      settingsButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleEditImage(img);
      });
      settingsButton.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      container.appendChild(settingsButton);
    },
    [handleEditImage],
  );

  // Обработчик изменения размера через перетаскивание
  const handleImageResize = useCallback((img: HTMLImageElement) => {
    let isResizing = false;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;
    let aspectRatio = 0;
    let resizeDirection = '';

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (
        !target.classList.contains('resize-handle') &&
        !target.classList.contains('corner-handle')
      ) {
        return;
      }

      if (e.cancelable) e.preventDefault();
      e.stopPropagation();

      const preventDrag = (ev: Event) => {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
      };
      document.addEventListener('dragstart', preventDrag, { capture: true });
      document.addEventListener('drag', preventDrag, { capture: true });
      document.addEventListener('dragend', preventDrag, { capture: true });
      document.addEventListener('drop', preventDrag, { capture: true });

      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = img.offsetWidth;
      startHeight = img.offsetHeight;
      aspectRatio = startHeight / startWidth;

      if (target.classList.contains('resize-handle')) {
        if (target.classList.contains('top')) resizeDirection = 'top';
        else if (target.classList.contains('right')) resizeDirection = 'right';
        else if (target.classList.contains('bottom')) resizeDirection = 'bottom';
        else if (target.classList.contains('left')) resizeDirection = 'left';
      } else if (target.classList.contains('corner-handle')) {
        if (target.classList.contains('top-left')) resizeDirection = 'top-left';
        else if (target.classList.contains('top-right')) resizeDirection = 'top-right';
        else if (target.classList.contains('bottom-left')) resizeDirection = 'bottom-left';
        else if (target.classList.contains('bottom-right')) resizeDirection = 'bottom-right';
      }

      img.style.cursor = `${resizeDirection}-resize`;
      img.setAttribute('draggable', 'false');
      document.body.style.userSelect = 'none';
      document.body.style.cursor = `${resizeDirection}-resize`;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (resizeDirection.includes('-')) {
        const deltaXAbs = Math.abs(deltaX);
        const deltaYAbs = Math.abs(deltaY);

        if (deltaXAbs > deltaYAbs) {
          if (resizeDirection.includes('right')) {
            newWidth = Math.max(50, startWidth + deltaX);
          } else if (resizeDirection.includes('left')) {
            newWidth = Math.max(50, startWidth - deltaX);
          }
          newHeight = Math.round(newWidth * aspectRatio);
        } else {
          if (resizeDirection.includes('bottom')) {
            newHeight = Math.max(50, startHeight + deltaY);
          } else if (resizeDirection.includes('top')) {
            newHeight = Math.max(50, startHeight - deltaY);
          }
          newWidth = Math.round(newHeight / aspectRatio);
        }
      } else {
        if (resizeDirection.includes('right')) {
          newWidth = Math.max(50, startWidth + deltaX);
        } else if (resizeDirection.includes('left')) {
          newWidth = Math.max(50, startWidth - deltaX);
        }

        if (resizeDirection.includes('bottom')) {
          newHeight = Math.max(50, startHeight + deltaY);
        } else if (resizeDirection.includes('top')) {
          newHeight = Math.max(50, startHeight - deltaY);
        }
      }

      img.style.width = `${newWidth}px`;
      img.style.height = `${newHeight}px`;
    };

    const handleMouseUp = () => {
      if (!isResizing) return;

      isResizing = false;
      img.style.cursor = '';
      img.setAttribute('draggable', 'false');
      document.body.style.userSelect = '';
      document.body.style.cursor = '';

      const preventDrag = (ev: Event) => {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
      };
      document.removeEventListener('dragstart', preventDrag, { capture: true } as any);
      document.removeEventListener('drag', preventDrag, { capture: true } as any);
      document.removeEventListener('dragend', preventDrag, { capture: true } as any);
      document.removeEventListener('drop', preventDrag, { capture: true } as any);
    };

    const container = (img.parentElement as HTMLElement) || img;
    const resizeHandles = container.querySelectorAll('.resize-handle, .corner-handle');

    resizeHandles.forEach((handle) => {
      handle.addEventListener('mousedown', handleMouseDown as EventListener, { passive: false });
    });

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp, { passive: false });

    return () => {
      resizeHandles.forEach((handle) => {
        handle.removeEventListener('mousedown', handleMouseDown as EventListener);
      });
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Инициализация ресайза для изображения
  const initializeImageResize = useCallback(
    (img: HTMLImageElement) => {
      createResizeHandles(img);

      setTimeout(() => {
        if (!(img as any).__cleanupResize) {
          const cleanupResize = handleImageResize(img);
          (img as any).__cleanupResize = cleanupResize;
        }
      }, 100);
    },
    [createResizeHandles, handleImageResize],
  );

  return {
    createResizeHandles,
    handleImageResize,
    initializeImageResize,
  };
};

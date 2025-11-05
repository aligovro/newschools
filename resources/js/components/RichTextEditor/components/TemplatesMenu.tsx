import React, { useMemo } from 'react';
import { AnchorMenu, AnchorMenuItem } from './AnchorMenu';

interface Template {
  name: string;
  content: string;
}

interface TemplatesMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onInsertTemplate: (template: string) => void;
}

export const TemplatesMenu: React.FC<TemplatesMenuProps> = React.memo(
  ({ anchorEl, open, onClose, onInsertTemplate }) => {
    const templates = useMemo(
      (): Template[] => [
        {
          name: 'Заголовок и текст',
          content: '<h2>Заголовок</h2><p>Ваш текст здесь...</p>',
        },
        {
          name: 'Два столбца',
          content:
            '<div style="display: flex; gap: 20px; margin: 16px 0;"><div style="flex: 1;"><h3>Левая колонка</h3><p>Содержимое левой колонки</p></div><div style="flex: 1;"><h3>Правая колонка</h3><p>Содержимое правой колонки</p></div></div>',
        },
        {
          name: 'Цитата',
          content:
            '<blockquote style="border-left: 4px solid #007bff; padding: 12px 16px; margin: 16px 0; background: #f8f9fa; font-style: italic;">Ваша цитата здесь...</blockquote>',
        },
        {
          name: 'Список с иконками',
          content:
            '<ul style="list-style: none; padding: 0;"><li style="margin: 8px 0; padding: 8px; background: #f8f9fa; border-radius: 4px;">✓ Первый пункт</li><li style="margin: 8px 0; padding: 8px; background: #f8f9fa; border-radius: 4px;">✓ Второй пункт</li></ul>',
        },
      ],
      [],
    );

    const handleInsert = (content: string) => {
      onInsertTemplate(content);
      onClose();
    };

    return (
      <AnchorMenu anchorEl={anchorEl} open={open} onClose={onClose}>
        {templates.map((template, index) => (
          <AnchorMenuItem key={index} onClick={() => handleInsert(template.content)}>
            {template.name}
          </AnchorMenuItem>
        ))}
      </AnchorMenu>
    );
  },
);

TemplatesMenu.displayName = 'TemplatesMenu';

export default TemplatesMenu;



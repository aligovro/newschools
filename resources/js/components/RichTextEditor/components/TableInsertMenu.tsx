import React from 'react';
import { AnchorMenu, AnchorMenuItem } from './AnchorMenu';

interface TableInsertMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onInsertTable: (rows: number, cols: number) => void;
}

export const TableInsertMenu: React.FC<TableInsertMenuProps> = React.memo(
  ({ anchorEl, open, onClose, onInsertTable }) => {
    const handleInsert = (rows: number, cols: number) => {
      onInsertTable(rows, cols);
      onClose();
    };

    return (
      <AnchorMenu anchorEl={anchorEl} open={open} onClose={onClose}>
        <AnchorMenuItem onClick={() => handleInsert(2, 2)}>2×2</AnchorMenuItem>
        <AnchorMenuItem onClick={() => handleInsert(3, 3)}>3×3</AnchorMenuItem>
        <AnchorMenuItem onClick={() => handleInsert(4, 4)}>4×4</AnchorMenuItem>
        <AnchorMenuItem onClick={() => handleInsert(2, 3)}>2×3</AnchorMenuItem>
        <AnchorMenuItem onClick={() => handleInsert(3, 2)}>3×2</AnchorMenuItem>
      </AnchorMenu>
    );
  },
);

TableInsertMenu.displayName = 'TableInsertMenu';

export default TableInsertMenu;



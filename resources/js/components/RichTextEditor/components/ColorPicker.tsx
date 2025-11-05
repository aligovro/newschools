import React, { useMemo } from 'react';
import { AnchorMenu } from './AnchorMenu';
import styles from '../RichTextEditor.module.scss';

interface ColorPickerProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onColorChange: (color: string) => void;
  selectedColor: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = React.memo(
  ({ anchorEl, open, onClose, onColorChange, selectedColor }) => {
    const colors = useMemo(
      () => [
        '#000000',
        '#333333',
        '#666666',
        '#999999',
        '#cccccc',
        '#ff0000',
        '#ff6600',
        '#ffcc00',
        '#00ff00',
        '#00ccff',
        '#0066ff',
        '#6600ff',
        '#ff00ff',
        '#ffffff',
        '#ffcccc',
        '#ccffcc',
        '#ccccff',
        '#ffffcc',
        '#ffccff',
        '#ccffff',
      ],
      [],
    );

    const handleColorSelect = (color: string) => {
      onColorChange(color);
      onClose();
    };

    return (
      <AnchorMenu anchorEl={anchorEl} open={open} onClose={onClose}>
        <div className={styles.colorPalette}>
          {colors.map((color) => (
            <button
              key={color}
              className={styles.colorButton}
              style={{ backgroundColor: color }}
              onClick={() => handleColorSelect(color)}
              title={color}
            />
          ))}
        </div>
      </AnchorMenu>
    );
  },
);

ColorPicker.displayName = 'ColorPicker';

export default ColorPicker;



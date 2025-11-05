import React from 'react';
import { AnchorMenu, AnchorMenuItem } from './AnchorMenu';

interface VideoInsertMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onInsertVideo: (url: string) => void;
}

export const VideoInsertMenu: React.FC<VideoInsertMenuProps> = React.memo(
  ({ anchorEl, open, onClose, onInsertVideo }) => {
    const handleVideoInsert = () => {
      const url = prompt('Введите URL видео (YouTube, Vimeo, Dailymotion и др.):');
      if (url) {
        onInsertVideo(url);
        onClose();
      }
    };

    return (
      <AnchorMenu anchorEl={anchorEl} open={open} onClose={onClose}>
        <AnchorMenuItem onClick={handleVideoInsert}>🔗 Вставить видео</AnchorMenuItem>
      </AnchorMenu>
    );
  },
);

VideoInsertMenu.displayName = 'VideoInsertMenu';

export default VideoInsertMenu;



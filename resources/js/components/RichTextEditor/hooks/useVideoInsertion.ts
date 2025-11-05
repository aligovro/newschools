import { useState, useCallback } from 'react';

interface UseVideoInsertionProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  isActive: boolean;
  onContentChange: () => void;
}

export interface UseVideoInsertionReturn {
  videoAnchorEl: HTMLElement | null;
  setVideoAnchorEl: (el: HTMLElement | null) => void;
  handleInsertVideo: (videoUrl: string) => void;
}

/**
 * Хук для управления вставкой видео в редактор
 * Поддерживает YouTube, Vimeo и обычные ссылки
 */
export const useVideoInsertion = ({
  editorRef,
  isActive,
  onContentChange,
}: UseVideoInsertionProps): UseVideoInsertionReturn => {
  const [videoAnchorEl, setVideoAnchorEl] = useState<HTMLElement | null>(null);

  const handleInsertVideo = useCallback(
    (videoUrl: string) => {
      if (!isActive || !editorRef.current) return;

      let embedHtml = '';

      // YouTube
      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        const videoId = videoUrl.includes('youtu.be')
          ? videoUrl.split('youtu.be/')[1]?.split('?')[0]
          : videoUrl.split('v=')[1]?.split('&')[0];

        if (videoId) {
          embedHtml = `<div class="rte-video">
            <iframe class="rte-video-iframe" width="560" height="315" 
                    src="https://www.youtube.com/embed/${videoId}"
                    frameborder="0" allowfullscreen>
            </iframe>
          </div>`;
        }
      }
      // Vimeo
      else if (videoUrl.includes('vimeo.com')) {
        const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
        if (videoId) {
          embedHtml = `<div class="rte-video">
            <iframe class="rte-video-iframe" width="560" height="315" 
                    src="https://player.vimeo.com/video/${videoId}"
                    frameborder="0" allowfullscreen>
            </iframe>
          </div>`;
        }
      }
      // Общая ссылка на видео
      else {
        embedHtml = `<div class="rte-video-box">
          <p class="rte-video-title"><strong>🎥 Видео:</strong></p>
          <a class="rte-video-link" href="${videoUrl}" target="_blank" rel="noopener noreferrer">
            ${videoUrl}
          </a>
        </div>`;
      }

      if (embedHtml) {
        editorRef.current.innerHTML += embedHtml;
        onContentChange();
      }

      setVideoAnchorEl(null);
    },
    [isActive, editorRef, onContentChange],
  );

  return {
    videoAnchorEl,
    setVideoAnchorEl,
    handleInsertVideo,
  };
};

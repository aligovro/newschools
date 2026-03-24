import { Dialog, DialogContent } from '@/components/ui/dialog';
import React from 'react';
import type { VideoLessonForSchool } from './useVideoLessonsSliderSchool';

interface Props {
    lesson: VideoLessonForSchool | null;
    onClose: () => void;
}

export const VideoPlayerModal: React.FC<Props> = ({ lesson, onClose }) => {
    if (!lesson) return null;

    const embedUrl = lesson.embed_url ?? null;

    return (
        <Dialog open={!!lesson} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="!w-[min(860px,95vw)] !max-w-[min(860px,95vw)] !bg-[#0f1117] !border-0 !rounded-3xl !p-6 video-player-modal__content">
                <div className="video-player-modal__title-row">
                    <span className="video-player-modal__title">{lesson.title}</span>
                </div>
                <div className="video-player-modal__player">
                    {embedUrl ? (
                        <iframe
                            src={embedUrl}
                            title={lesson.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="video-player-modal__iframe"
                        />
                    ) : (
                        <div className="video-player-modal__fallback">
                            <p>Встроенный просмотр недоступен для этой ссылки.</p>
                            <a
                                href={lesson.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="video-player-modal__fallback-link"
                            >
                                Открыть видео
                            </a>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

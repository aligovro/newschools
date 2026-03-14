import { Play } from 'lucide-react';
import React from 'react';
import {
    formatVideoLessonMeta,
    type VideoLessonForSchool,
} from './useVideoLessonsSliderSchool';

interface Props {
    lesson: VideoLessonForSchool;
}

export const VideoLessonsSliderSchoolCard: React.FC<Props> = ({ lesson }) => {
    const thumbUrl =
        lesson.thumbnail &&
        !String(lesson.thumbnail).startsWith('blob:') &&
        String(lesson.thumbnail).trim()
            ? lesson.thumbnail
            : null;

    const meta = formatVideoLessonMeta(lesson);

    return (
        <article className="video-lessons-slider-school__card">
            <a
                href={lesson.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="video-lessons-slider-school__card-link"
                aria-label={`Смотреть: ${lesson.title}`}
            >
                <div className="video-lessons-slider-school__card-image-wrap">
                    {thumbUrl ? (
                        <img
                            src={thumbUrl}
                            alt={lesson.title}
                            className="video-lessons-slider-school__card-image"
                            loading="lazy"
                        />
                    ) : (
                        <div className="video-lessons-slider-school__card-image-placeholder" />
                    )}
                    <div className="video-lessons-slider-school__card-play">
                        <Play size={24} strokeWidth={2} fill="white" />
                    </div>
                </div>
                {meta && (
                    <p className="video-lessons-slider-school__card-meta">
                        {meta}
                    </p>
                )}
                <h3 className="video-lessons-slider-school__card-title">
                    {lesson.title}
                </h3>
            </a>
        </article>
    );
};

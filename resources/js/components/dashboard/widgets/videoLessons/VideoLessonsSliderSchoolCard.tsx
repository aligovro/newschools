import React, { useState } from 'react';
import {
    formatVideoLessonMeta,
    type VideoLessonForSchool,
} from './useVideoLessonsSliderSchool';
import { VideoPlayerModal } from './VideoPlayerModal';

interface Props {
    lesson: VideoLessonForSchool;
}

export const VideoLessonsSliderSchoolCard: React.FC<Props> = ({ lesson }) => {
    const [modalOpen, setModalOpen] = useState(false);

    const thumbUrl =
        lesson.thumbnail &&
        !String(lesson.thumbnail).startsWith('blob:') &&
        String(lesson.thumbnail).trim()
            ? lesson.thumbnail
            : null;

    const meta = formatVideoLessonMeta(lesson);

    return (
        <>
            <article className="video-lessons-slider-school__card">
                <button
                    type="button"
                    className="video-lessons-slider-school__card-link"
                    aria-label={`Смотреть: ${lesson.title}`}
                    onClick={() => setModalOpen(true)}
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
                            <img
                                src="/icons/school-template/play.svg"
                                alt=""
                                width={24}
                                height={24}
                            />
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
                </button>
            </article>

            <VideoPlayerModal
                lesson={modalOpen ? lesson : null}
                onClose={() => setModalOpen(false)}
            />
        </>
    );
};

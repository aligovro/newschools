import { GalleryModal } from '@/components/main-site/GalleryModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/react';

interface Props {
    images: string[];
}

const ProjectGallerySchool: React.FC<Props> = ({ images }) => {
    const swiperRef = useRef<SwiperType | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isBeginning, setIsBeginning] = useState(true);
    const [isEnd, setIsEnd] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalIndex, setModalIndex] = useState(0);

    const handleSlideChange = useCallback((swiper: SwiperType) => {
        setActiveIndex(swiper.realIndex);
        setIsBeginning(swiper.isBeginning);
        setIsEnd(swiper.isEnd);
    }, []);

    const handleImageClick = useCallback((index: number) => {
        setModalIndex(index);
        setModalOpen(true);
    }, []);

    const handlePrev = useCallback(() => swiperRef.current?.slidePrev(), []);
    const handleNext = useCallback(() => swiperRef.current?.slideNext(), []);

    if (images.length === 0) return null;

    const showNav = images.length > 1;

    return (
        <section className="project-gallery-school">
            <h2 className="project-gallery-school__heading">Фотографии проекта</h2>

            <div className="project-gallery-school__slider-wrap">
                <Swiper
                    slidesPerView={images.length < 3 ? images.length : 2.2}
                    spaceBetween={2}
                    onSwiper={(s) => {
                        swiperRef.current = s;
                        setIsEnd(s.isEnd);
                    }}
                    onSlideChange={handleSlideChange}
                    className="project-gallery-school__swiper"
                >
                    {images.map((src, idx) => (
                        <SwiperSlide key={idx}>
                            <img
                                src={src}
                                alt={`Фото проекта ${idx + 1}`}
                                className="project-gallery-school__img"
                                loading="lazy"
                                onClick={() => handleImageClick(idx)}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {showNav && (
                    <>
                        <button
                            type="button"
                            className="project-gallery-school__nav project-gallery-school__nav--prev"
                            onClick={handlePrev}
                            disabled={isBeginning}
                            aria-label="Предыдущий слайд"
                        >
                            <ChevronLeft size={16} strokeWidth={1.5} />
                        </button>
                        <button
                            type="button"
                            className="project-gallery-school__nav project-gallery-school__nav--next"
                            onClick={handleNext}
                            disabled={isEnd}
                            aria-label="Следующий слайд"
                        >
                            <ChevronRight size={16} strokeWidth={1.5} />
                        </button>
                    </>
                )}
            </div>

            {showNav && (
                <div className="project-gallery-school__dots" role="tablist">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            role="tab"
                            aria-label={`Слайд ${i + 1}`}
                            aria-selected={i === activeIndex}
                            className={`project-gallery-school__dot${i === activeIndex ? ' project-gallery-school__dot--active' : ''}`}
                            onClick={() => swiperRef.current?.slideTo(i)}
                        />
                    ))}
                </div>
            )}

            <GalleryModal
                isOpen={modalOpen}
                images={images}
                initialIndex={modalIndex}
                onClose={() => setModalOpen(false)}
            />
        </section>
    );
};

export default React.memo(ProjectGallerySchool);

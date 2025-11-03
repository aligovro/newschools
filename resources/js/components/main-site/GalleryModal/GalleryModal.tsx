import React, { useEffect, useRef, useState } from 'react';
import { Navigation, Keyboard } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import './GalleryModal.css';

interface GalleryModalProps {
    isOpen: boolean;
    images: string[];
    initialIndex?: number;
    onClose: () => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
    isOpen,
    images,
    initialIndex = 0,
    onClose,
}) => {
    const swiperRef = useRef<SwiperType | null>(null);
    const navigationPrevRef = useRef<HTMLButtonElement>(null);
    const navigationNextRef = useRef<HTMLButtonElement>(null);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    useEffect(() => {
        if (isOpen && swiperRef.current && initialIndex >= 0) {
            swiperRef.current.slideTo(initialIndex);
            setCurrentIndex(initialIndex);
        }
    }, [isOpen, initialIndex]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !images || images.length === 0) {
        return null;
    }

    return (
        <div
            className="gallery-modal-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="gallery-modal-content">
                <button
                    className="gallery-modal-close"
                    onClick={onClose}
                    aria-label="Close gallery"
                >
                    <X />
                </button>

                <Swiper
                    modules={[Navigation, Keyboard]}
                    spaceBetween={20}
                    slidesPerView={1}
                    keyboard={{
                        enabled: true,
                    }}
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                        if (initialIndex >= 0) {
                            swiper.slideTo(initialIndex);
                        }
                    }}
                    onSlideChange={(swiper) => {
                        setCurrentIndex(swiper.activeIndex);
                    }}
                    navigation={{
                        prevEl: navigationPrevRef.current,
                        nextEl: navigationNextRef.current,
                    }}
                    onBeforeInit={(swiper) => {
                        if (swiper.params.navigation) {
                            (swiper.params.navigation as any).prevEl =
                                navigationPrevRef.current;
                            (swiper.params.navigation as any).nextEl =
                                navigationNextRef.current;
                        }
                    }}
                    className="gallery-modal-swiper"
                >
                    {images.map((image, index) => (
                        <SwiperSlide key={index} className="gallery-modal-slide">
                            <img
                                src={image}
                                alt={`Gallery image ${index + 1}`}
                                className="gallery-modal-image"
                                loading="eager"
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {images.length > 1 && (
                    <>
                        <button
                            ref={navigationPrevRef}
                            className="gallery-modal-nav-btn gallery-modal-nav-btn-prev"
                            aria-label="Previous image"
                        >
                            <ChevronLeft />
                        </button>
                        <button
                            ref={navigationNextRef}
                            className="gallery-modal-nav-btn gallery-modal-nav-btn-next"
                            aria-label="Next image"
                        >
                            <ChevronRight />
                        </button>
                    </>
                )}

                {images.length > 1 && (
                    <div className="gallery-modal-counter">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}
            </div>
        </div>
    );
};


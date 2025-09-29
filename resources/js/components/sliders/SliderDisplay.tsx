import SliderRenderer from './SliderRenderer';

interface Slider {
    id: number;
    name: string;
    type: string;
    settings: any;
    slides: any[];
    position: string;
    is_active: boolean;
    sort_order: number;
}

interface SliderDisplayProps {
    sliders: Slider[];
    position?: string;
    className?: string;
}

export default function SliderDisplay({
    sliders,
    position,
    className,
}: SliderDisplayProps) {
    // Фильтруем слайдеры по позиции, если указана
    const filteredSliders = position
        ? sliders.filter(
              (slider) => slider.position === position && slider.is_active,
          )
        : sliders.filter((slider) => slider.is_active);

    // Сортируем по sort_order
    const sortedSliders = filteredSliders.sort(
        (a, b) => a.sort_order - b.sort_order,
    );

    if (sortedSliders.length === 0) {
        return null;
    }

    return (
        <div className={className}>
            {sortedSliders.map((slider) => (
                <SliderRenderer
                    key={slider.id}
                    slider={slider}
                    className="mb-8"
                />
            ))}
        </div>
    );
}

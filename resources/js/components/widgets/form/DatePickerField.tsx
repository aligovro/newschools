import { format, parse } from 'date-fns';
import { ru } from 'date-fns/locale';
import React, { useRef, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useClickOutside } from '../../../hooks/useClickOutside';

interface DatePickerFieldProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    name?: string;
    style?: React.CSSProperties;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
    value,
    onChange,
    placeholder = 'Выберите дату',
    required = false,
    name = '',
    style = {},
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Парсим текущую дату из строки или используем null
    const currentDate = value
        ? parse(value, 'yyyy-MM-dd', new Date())
        : new Date();

    // Закрываем календарь при клике вне его
    useClickOutside(containerRef, () => setIsOpen(false));

    const handleDateChange = (date: Date | null) => {
        if (date) {
            const formattedDate = format(date, 'yyyy-MM-dd');
            onChange(formattedDate);
            setIsOpen(false);
        }
    };

    const displayValue = value
        ? format(parse(value, 'yyyy-MM-dd', new Date()), 'd MMMM yyyy', {
              locale: ru,
          })
        : '';

    return (
        <div className="date-picker-field" ref={containerRef}>
            <div className="date-picker-field__input-wrapper">
                <input
                    type="text"
                    name={name}
                    value={displayValue}
                    placeholder={placeholder}
                    required={required}
                    readOnly
                    onClick={() => setIsOpen(!isOpen)}
                    style={style}
                    className="date-picker-field__input"
                />
                <button
                    type="button"
                    className="date-picker-field__icon"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Открыть календарь"
                >
                    📅
                </button>
            </div>

            {isOpen && (
                <div className="date-picker-field__calendar-wrapper">
                    <Calendar
                        onChange={(value) =>
                            handleDateChange(value as Date | null)
                        }
                        value={currentDate}
                        locale="ru-RU"
                        formatDay={(locale, date) => format(date, 'd')}
                        formatMonthYear={(locale, date) =>
                            format(date, 'LLLL yyyy', { locale: ru })
                        }
                        formatShortWeekday={(locale, date) =>
                            format(date, 'EEEEE', { locale: ru })
                        }
                        nextLabel="›"
                        prevLabel="‹"
                        next2Label="»"
                        prev2Label="«"
                        minDetail="month"
                        showNeighboringMonth={false}
                    />
                </div>
            )}
        </div>
    );
};

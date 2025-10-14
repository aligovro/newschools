import React, { useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useClickOutside } from '../../hooks/useClickOutside';

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
    value,
    onChange,
    label,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useClickOutside(containerRef, () => setIsOpen(false));

    return (
        <div className="color-picker" ref={containerRef}>
            {label && <label className="color-picker__label">{label}</label>}
            <div className="color-picker__wrapper">
                <button
                    type="button"
                    className="color-picker__swatch"
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ backgroundColor: value }}
                    aria-label="Выбрать цвет"
                />
                <input
                    type="text"
                    className="color-picker__input"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#000000"
                />
            </div>

            {isOpen && (
                <div className="color-picker__popover">
                    <HexColorPicker color={value} onChange={onChange} />
                    <div className="color-picker__presets">
                        <button
                            type="button"
                            className="color-picker__preset"
                            style={{ backgroundColor: '#000000' }}
                            onClick={() => onChange('#000000')}
                            title="Черный"
                        />
                        <button
                            type="button"
                            className="color-picker__preset"
                            style={{ backgroundColor: '#ffffff' }}
                            onClick={() => onChange('#ffffff')}
                            title="Белый"
                        />
                        <button
                            type="button"
                            className="color-picker__preset"
                            style={{ backgroundColor: '#ef4444' }}
                            onClick={() => onChange('#ef4444')}
                            title="Красный"
                        />
                        <button
                            type="button"
                            className="color-picker__preset"
                            style={{ backgroundColor: '#3b82f6' }}
                            onClick={() => onChange('#3b82f6')}
                            title="Синий"
                        />
                        <button
                            type="button"
                            className="color-picker__preset"
                            style={{ backgroundColor: '#10b981' }}
                            onClick={() => onChange('#10b981')}
                            title="Зеленый"
                        />
                        <button
                            type="button"
                            className="color-picker__preset"
                            style={{ backgroundColor: '#f59e0b' }}
                            onClick={() => onChange('#f59e0b')}
                            title="Оранжевый"
                        />
                        <button
                            type="button"
                            className="color-picker__preset"
                            style={{ backgroundColor: '#8b5cf6' }}
                            onClick={() => onChange('#8b5cf6')}
                            title="Фиолетовый"
                        />
                        <button
                            type="button"
                            className="color-picker__preset"
                            style={{ backgroundColor: '#ec4899' }}
                            onClick={() => onChange('#ec4899')}
                            title="Розовый"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};


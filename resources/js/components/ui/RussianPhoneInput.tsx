import { forwardRef, useEffect, useMemo, useState } from 'react';

import { cn } from '@/lib/utils';

type BaseProps = Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'defaultValue' | 'onChange'
>;

export interface RussianPhoneInputProps extends BaseProps {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
}

const DIGITS_LIMIT = 10;

const sanitizeDigits = (value: string): string => {
    return value.replace(/\D/g, '').slice(0, DIGITS_LIMIT);
};

const digitsFromValue = (value?: string): string => {
    if (!value) {
        return '';
    }

    const digitsOnly = value.replace(/\D/g, '');

    if (value.startsWith('+7')) {
        return digitsOnly.slice(1, 1 + DIGITS_LIMIT);
    }

    return digitsOnly.slice(0, DIGITS_LIMIT);
};

const formatDigits = (digits: string): string => {
    const chunk1 = digits.slice(0, 3);
    const chunk2 = digits.slice(3, 6);
    const chunk3 = digits.slice(6, 8);
    const chunk4 = digits.slice(8, 10);

    let formatted = chunk1;
    if (chunk2) formatted = formatted ? `${formatted} ${chunk2}` : chunk2;
    if (chunk3) formatted = formatted ? `${formatted}-${chunk3}` : chunk3;
    if (chunk4) formatted = formatted ? `${formatted}-${chunk4}` : chunk4;

    return formatted;
};

const RussianPhoneInput = forwardRef<HTMLInputElement, RussianPhoneInputProps>(
    ({ value, defaultValue, onValueChange, className, ...inputProps }, ref) => {
        const isControlled = value !== undefined;

        const [internalDigits, setInternalDigits] = useState(() =>
            isControlled ? '' : digitsFromValue(defaultValue),
        );

        useEffect(() => {
            if (!isControlled) {
                setInternalDigits(digitsFromValue(defaultValue));
            }
        }, [defaultValue, isControlled]);

        const digits = useMemo(() => {
            return isControlled ? digitsFromValue(value) : internalDigits;
        }, [isControlled, value, internalDigits]);

        const displayValue = formatDigits(digits);

        const emitChange = (nextDigits: string) => {
            if (!isControlled) {
                setInternalDigits(nextDigits);
            }

            if (onValueChange) {
                onValueChange(nextDigits ? `+7${nextDigits}` : '');
            }
        };

        const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            emitChange(sanitizeDigits(event.target.value));
        };

        const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
            event.preventDefault();
            const text = event.clipboardData.getData('text');
            emitChange(sanitizeDigits(text));
        };

        return (
            <div className={cn('phone-input', className)}>
                <span className="phone-input__prefix">+7</span>
                <input
                    {...inputProps}
                    ref={ref}
                    type={inputProps.type ?? 'tel'}
                    inputMode={inputProps.inputMode ?? 'tel'}
                    value={displayValue}
                    onChange={handleInputChange}
                    onPaste={handlePaste}
                    placeholder={inputProps.placeholder ?? '900 123-45-67'}
                    className="phone-input__field"
                />
            </div>
        );
    },
);

RussianPhoneInput.displayName = 'RussianPhoneInput';

export default RussianPhoneInput;



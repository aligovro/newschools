import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/helpers';

export interface SelectOption {
    value: string | number;
    label: string;
    description?: string;
    disabled?: boolean;
}

export interface UniversalSelectProps {
    options: SelectOption[];
    value?: string | number | null;
    onChange: (value: string | number | null) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
    loading?: boolean;
    error?: string;
    className?: string;
    label?: string;
    required?: boolean;
    clearable?: boolean;
    searchable?: boolean;
    maxHeight?: number;
    emptyMessage?: string;
    // Пагинация
    hasMore?: boolean;
    onLoadMore?: () => void;
    loadingMore?: boolean;
    // Поиск
    onSearch?: (query: string) => void;
    searchValue?: string;
    onSearchChange?: (query: string) => void;
    // Кастомные опции
    renderOption?: (option: SelectOption) => React.ReactNode;
    renderSelected?: (option: SelectOption) => React.ReactNode;
    // Группировка
    groupBy?: string;
    // Фильтрация
    filterOptions?: (options: SelectOption[], query: string) => SelectOption[];
}

const UniversalSelect: React.FC<UniversalSelectProps> = ({
    options = [],
    value,
    onChange,
    placeholder = 'Выберите опцию',
    searchPlaceholder = 'Поиск...',
    disabled = false,
    loading = false,
    error,
    className,
    label,
    required = false,
    clearable = true,
    searchable = true,
    maxHeight = 300,
    emptyMessage = 'Нет доступных опций',
    hasMore = false,
    onLoadMore,
    loadingMore = false,
    onSearch,
    searchValue = '',
    onSearchChange,
    renderOption,
    renderSelected,
    groupBy,
    filterOptions,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalSearchValue, setInternalSearchValue] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Используем внешний searchValue или внутренний
    const currentSearchValue = searchValue !== undefined ? searchValue : internalSearchValue;
    const setCurrentSearchValue = onSearchChange || setInternalSearchValue;

    // Находим выбранную опцию
    const selectedOption = options.find(option => option.value === value);

    // Фильтрация опций
    const filteredOptions = React.useMemo(() => {
        let filtered = options;

        if (currentSearchValue && filterOptions) {
            filtered = filterOptions(options, currentSearchValue);
        } else if (currentSearchValue) {
            filtered = options.filter(option =>
                option.label.toLowerCase().includes(currentSearchValue.toLowerCase()) ||
                (option.description && option.description.toLowerCase().includes(currentSearchValue.toLowerCase()))
            );
        }

        return filtered;
    }, [options, currentSearchValue, filterOptions]);

    // Группировка опций
    const groupedOptions = React.useMemo(() => {
        if (!groupBy) return { '': filteredOptions };

        return filteredOptions.reduce((groups, option) => {
            const group = (option as any)[groupBy] || 'Другие';
            if (!groups[group]) groups[group] = [];
            groups[group].push(option);
            return groups;
        }, {} as Record<string, SelectOption[]>);
    }, [filteredOptions, groupBy]);

    // Обработчики событий
    const handleToggle = useCallback(() => {
        if (disabled || loading) return;
        setIsOpen(!isOpen);
        if (!isOpen && searchable) {
            setTimeout(() => searchInputRef.current?.focus(), 0);
        }
    }, [disabled, loading, isOpen, searchable]);

    const handleSelect = useCallback((option: SelectOption) => {
        if (option.disabled) return;

        onChange(option.value);
        setIsOpen(false);
        setCurrentSearchValue('');
        setHighlightedIndex(-1);
    }, [onChange, setCurrentSearchValue]);

    const handleClear = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        setCurrentSearchValue('');
    }, [onChange, setCurrentSearchValue]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setCurrentSearchValue(query);
        setHighlightedIndex(-1);

        if (onSearch) {
            onSearch(query);
        }
    }, [setCurrentSearchValue, onSearch]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                handleToggle();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredOptions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                    handleSelect(filteredOptions[highlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setCurrentSearchValue('');
                setHighlightedIndex(-1);
                break;
        }
    }, [isOpen, filteredOptions, highlightedIndex, handleSelect, handleToggle, setCurrentSearchValue]);

    const handleLoadMore = useCallback(() => {
        if (hasMore && onLoadMore && !loadingMore) {
            onLoadMore();
        }
    }, [hasMore, onLoadMore, loadingMore]);

    // Закрытие при клике вне компонента
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setHighlightedIndex(-1);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    // Прокрутка к выделенному элементу
    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
            if (highlightedElement) {
                highlightedElement.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth'
                });
            }
        }
    }, [highlightedIndex]);

    // Рендер опции
    const renderOptionItem = (option: SelectOption, index: number) => {
        const isHighlighted = index === highlightedIndex;
        const isSelected = option.value === value;

        return (
            <div
                key={option.value}
                className={cn(
                    'universal-select__option',
                    isSelected && 'universal-select__option--selected',
                    isHighlighted && 'universal-select__option--highlighted',
                    option.disabled && 'universal-select__option--disabled'
                )}
                onClick={() => handleSelect(option)}
            >
                {renderOption ? renderOption(option) : (
                    <div className="universal-select__option-content">
                        <div className="universal-select__option-label">
                            {option.label}
                        </div>
                        {option.description && (
                            <div className="universal-select__option-description">
                                {option.description}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Рендер выбранного значения
    const renderSelectedValue = () => {
        if (!selectedOption) {
            return <span className="universal-select__placeholder">{placeholder}</span>;
        }

        if (renderSelected) {
            return renderSelected(selectedOption);
        }

        return (
            <div className="universal-select__selected">
                <span className="universal-select__selected-label">
                    {selectedOption.label}
                </span>
                {selectedOption.description && (
                    <span className="universal-select__selected-description">
                        {selectedOption.description}
                    </span>
                )}
            </div>
        );
    };

    return (
        <div className={cn('universal-select', className)} ref={containerRef}>
            {label && (
                <label className="universal-select__label">
                    {label}
                    {required && <span className="universal-select__required">*</span>}
                </label>
            )}

            <div
                className={cn(
                    'universal-select__trigger',
                    isOpen && 'universal-select__trigger--open',
                    error && 'universal-select__trigger--error',
                    disabled && 'universal-select__trigger--disabled',
                    loading && 'universal-select__trigger--loading'
                )}
                onClick={handleToggle}
                onKeyDown={handleKeyDown}
                tabIndex={disabled ? -1 : 0}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <div className="universal-select__value">
                    {renderSelectedValue()}
                </div>

                <div className="universal-select__actions">
                    {clearable && selectedOption && !disabled && (
                        <button
                            type="button"
                            className="universal-select__clear"
                            onClick={handleClear}
                            aria-label="Очистить выбор"
                        >
                            <X className="universal-select__clear-icon" />
                        </button>
                    )}

                    {loading ? (
                        <Loader2 className="universal-select__loading-icon" />
                    ) : (
                        <ChevronDown className={cn(
                            'universal-select__chevron',
                            isOpen && 'universal-select__chevron--open'
                        )} />
                    )}
                </div>
            </div>

            {error && (
                <div className="universal-select__error">
                    {error}
                </div>
            )}

            {isOpen && (
                <div
                    className="universal-select__dropdown"
                    style={{ maxHeight: `${maxHeight}px` }}
                >
                    {searchable && (
                        <div className="universal-select__search">
                            <Search className="universal-select__search-icon" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder={searchPlaceholder}
                                value={currentSearchValue}
                                onChange={handleSearchChange}
                                className="universal-select__search-input"
                                autoComplete="off"
                            />
                        </div>
                    )}

                    <div
                        className="universal-select__list"
                        ref={listRef}
                        role="listbox"
                    >
                        {Object.keys(groupedOptions).length === 0 ? (
                            <div className="universal-select__empty">
                                {loading ? 'Загрузка...' : emptyMessage}
                            </div>
                        ) : (
                            Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                                <div key={groupName} className="universal-select__group">
                                    {groupName && (
                                        <div className="universal-select__group-header">
                                            {groupName}
                                        </div>
                                    )}
                                    {groupOptions.map((option, index) => {
                                        const globalIndex = filteredOptions.indexOf(option);
                                        return renderOptionItem(option, globalIndex);
                                    })}
                                </div>
                            ))
                        )}

                        {hasMore && (
                            <div className="universal-select__load-more">
                                <button
                                    type="button"
                                    className="universal-select__load-more-button"
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? (
                                        <>
                                            <Loader2 className="universal-select__load-more-icon" />
                                            Загрузка...
                                        </>
                                    ) : (
                                        'Загрузить еще'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UniversalSelect;

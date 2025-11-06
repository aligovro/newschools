interface Category {
    value: string;
    label: string;
}

interface CategoryFilterProps {
    value: string;
    onChange: (category: string) => void;
    categories: Category[];
}

export default function CategoryFilter({
    value,
    onChange,
    categories,
}: CategoryFilterProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
                const isActive = value === category.value;
                return (
                    <button
                        key={category.value}
                        type="button"
                        onClick={() => onChange(category.value)}
                        style={{
                            fontFamily: 'var(--font-family)',
                            fontWeight: 600,
                            fontSize: '10px',
                            lineHeight: '120%',
                            textAlign: 'center',
                            color: isActive ? '#fff' : '#1a1a1a',
                            border: '1px solid #e8ecf3',
                            borderRadius: '10px',
                            padding: '12px 16px',
                            height: '36px',
                            background: isActive ? '#1a1a1a' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.borderColor = '#1a1a1a';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.borderColor = '#e8ecf3';
                            }
                        }}
                    >
                        {category.label}
                    </button>
                );
            })}
        </div>
    );
}

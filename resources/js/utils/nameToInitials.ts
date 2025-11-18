export const nameToInitials = (name?: string | null): string => {
    if (!name) return '•';
    const trimmed = name.trim();
    if (!trimmed) return '•';
    const parts = trimmed.split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const second = parts[1]?.[0] ?? '';
    const initials = (first + second).toUpperCase();
    return initials || trimmed[0]?.toUpperCase() || '•';
};

import { organizationsApi } from '@/lib/api/organizations';
import { cn } from '@/lib/helpers';
import { AlertCircle, FileText, Loader2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

export interface DocumentFileInfo {
    name: string;
    ext: string;
    size: number;
}

export interface DocumentUploaderProps {
    /** Текущий сохранённый путь без домена (напр. /storage/documents/…) или пустая строка */
    value: string;
    /** Вызывается после успешной загрузки (path) или при очистке (пустая строка).
     *  fileInfo передаётся при загрузке, чтобы родитель мог авто-заполнить мета-строку. */
    onChange: (path: string, fileInfo?: DocumentFileInfo) => void;
    disabled?: boolean;
    className?: string;
}

const ACCEPTED = '.pdf,.doc,.docx,.xls,.xlsx';
const ACCEPTED_LABEL = 'PDF, Word, Excel (до 20 МБ)';

/** Форматирует размер файла: 132 500 → «132.5 kb», 1 200 000 → «1.2 MB» */
function formatSize(bytes: number): string {
    if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(1)} kb`;
}

export default function DocumentUploader({
    value,
    onChange,
    disabled = false,
    className,
}: DocumentUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        setError(null);
        setUploading(true);

        try {
            const result = await organizationsApi.uploadDocument(file);
            if (!result.success) {
                setError('Ошибка при загрузке файла');
                return;
            }
            onChange(result.path, {
                name: result.name,
                ext: result.ext,
                size: result.size,
            });
        } catch {
            setError('Ошибка при загрузке файла');
        } finally {
            setUploading(false);
        }
    };

    const handleClear = () => {
        setError(null);
        onChange('');
    };

    // Извлекаем имя файла из пути для отображения
    const displayName = value ? value.split('/').pop() : null;

    return (
        <div className={cn('flex flex-col gap-1', className)}>
            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED}
                onChange={handleFileChange}
                disabled={disabled || uploading}
                className="hidden"
            />

            {value ? (
                /* Файл загружен — показываем имя + кнопку замены и удаления */
                <div className="flex items-center gap-2 rounded-md border border-input bg-muted/40 px-3 py-2 text-sm">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate text-foreground" title={displayName ?? ''}>
                        {displayName}
                    </span>
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={disabled || uploading}
                        className="shrink-0 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        title="Заменить файл"
                    >
                        <Upload className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={handleClear}
                        disabled={disabled || uploading}
                        className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                        title="Удалить файл"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            ) : (
                /* Файл не выбран — кнопка загрузки */
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={disabled || uploading}
                    className={cn(
                        'flex items-center gap-2 rounded-md border border-dashed border-input px-3 py-2 text-sm text-muted-foreground transition-colors',
                        !disabled && !uploading && 'hover:border-ring hover:text-foreground',
                        (disabled || uploading) && 'cursor-not-allowed opacity-50',
                    )}
                >
                    {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    ) : (
                        <Upload className="h-4 w-4 shrink-0" />
                    )}
                    {uploading ? 'Загрузка…' : 'Загрузить файл'}
                    <span className="ml-auto text-xs opacity-60">{ACCEPTED_LABEL}</span>
                </button>
            )}

            {error && (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {error}
                </div>
            )}
        </div>
    );
}

import { AlertCircle, X } from 'lucide-react';
import { Button } from './button';

interface ValidationErrorsProps {
    errors: string[];
    onDismiss?: () => void;
}

export function ValidationErrors({ errors, onDismiss }: ValidationErrorsProps) {
    if (errors.length === 0) return null;

    return (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start">
                <AlertCircle className="mr-3 h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-800 mb-2">
                        Ошибки валидации
                    </h3>
                    <ul className="space-y-1">
                        {errors.map((error, index) => (
                            <li key={index} className="text-sm text-red-700">
                                • {error}
                            </li>
                        ))}
                    </ul>
                </div>
                {onDismiss && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDismiss}
                        className="ml-2 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

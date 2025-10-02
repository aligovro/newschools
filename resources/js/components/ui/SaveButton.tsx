import { Button } from '@/components/ui/button';
import React from 'react';

interface SaveButtonProps {
    onSave: () => void;
    isSaving: boolean;
    saveStatus: 'idle' | 'saving' | 'saved' | 'error';
    label?: string;
    savedLabel?: string;
    errorLabel?: string;
    savingLabel?: string;
    size?: 'sm' | 'default' | 'lg';
    className?: string;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
    onSave,
    isSaving,
    saveStatus,
    label = 'Сохранить',
    savedLabel = '✓ Сохранено',
    errorLabel = '✗ Ошибка',
    savingLabel = 'Сохранение...',
    size = 'default',
    className = '',
}) => {
    const getButtonContent = () => {
        if (isSaving) {
            return (
                <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {savingLabel}
                </>
            );
        }

        switch (saveStatus) {
            case 'saved':
                return savedLabel;
            case 'error':
                return errorLabel;
            default:
                return label;
        }
    };

    const getButtonClassName = () => {
        const baseClasses = className;
        const statusClasses = {
            saved: 'bg-green-500 hover:bg-green-600 text-white',
            error: 'bg-red-500 hover:bg-red-600 text-white',
            idle: '',
            saving: '',
        };

        return `${baseClasses} ${statusClasses[saveStatus]}`.trim();
    };

    return (
        <Button
            onClick={onSave}
            disabled={isSaving}
            size={size}
            className={getButtonClassName()}
        >
            {getButtonContent()}
        </Button>
    );
};

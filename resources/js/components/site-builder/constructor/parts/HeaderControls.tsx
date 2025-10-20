import { Button } from '@/components/ui/button';
import { PanelRight } from 'lucide-react';
import React from 'react';

interface HeaderControlsProps {
    isRightPanelOpen: boolean;
    onToggleRightPanel: () => void;
}

export const HeaderControls: React.FC<HeaderControlsProps> = ({
    isRightPanelOpen,
    onToggleRightPanel,
}) => {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={onToggleRightPanel}
            title={
                isRightPanelOpen
                    ? 'Скрыть панель виджетов'
                    : 'Показать панель виджетов'
            }
        >
            <PanelRight
                className={`h-4 w-4 ${!isRightPanelOpen ? 'rotate-180' : ''}`}
            />
            <span className="ml-2 hidden sm:inline">
                {isRightPanelOpen ? 'Скрыть виджеты' : 'Показать виджеты'}
            </span>
        </Button>
    );
};

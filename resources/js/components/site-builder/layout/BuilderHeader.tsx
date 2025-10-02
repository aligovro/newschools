import { Button } from '@/components/ui/button';
import { PanelRight } from 'lucide-react';
import React from 'react';

interface BuilderHeaderProps {
    isRightPanelOpen: boolean;
    onToggleRightPanel: () => void;
}

export const BuilderHeader: React.FC<BuilderHeaderProps> = React.memo(
    ({ isRightPanelOpen, onToggleRightPanel }) => {
        return (
            <div className="border-b border-gray-200 bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Конструктор сайта
                        </h2>
                    </div>

                    <div className="flex items-center space-x-2">
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
                                {isRightPanelOpen
                                    ? 'Скрыть виджеты'
                                    : 'Показать виджеты'}
                            </span>
                        </Button>
                    </div>
                </div>
            </div>
        );
    },
);

BuilderHeader.displayName = 'BuilderHeader';

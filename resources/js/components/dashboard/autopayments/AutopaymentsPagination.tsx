import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AutopaymentsPaginationProps {
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
}

export const AutopaymentsPagination: React.FC<AutopaymentsPaginationProps> = ({
    currentPage,
    lastPage,
    onPageChange,
}) => {
    if (lastPage <= 1) {
        return null;
    }

    return (
        <div className="flex items-center justify-center gap-2">
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                <ChevronLeft className="h-4 w-4" />
                Назад
            </Button>
            <span className="text-sm text-muted-foreground">
                {currentPage} / {lastPage}
            </span>
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= lastPage}
                onClick={() => onPageChange(currentPage + 1)}
            >
                Вперёд
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
};

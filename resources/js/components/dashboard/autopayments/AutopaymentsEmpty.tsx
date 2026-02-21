import React from 'react';

export const AutopaymentsEmpty: React.FC = () => {
    return (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <p className="text-lg font-medium">Нет автоплатежей</p>
            <p className="mt-2 text-sm">
                У организации пока нет активных регулярных подписок.
            </p>
        </div>
    );
};

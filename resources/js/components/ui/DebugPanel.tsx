import React from 'react';

interface DebugPanelProps {
    title: string;
    data: any;
    className?: string;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
    title,
    data,
    className = ''
}) => {
    return (
        <div className={`bg-gray-100 border border-gray-300 rounded-lg p-4 m-2 ${className}`}>
            <h3 className="font-bold text-lg mb-2 text-gray-800">{title}</h3>
            <pre className="text-xs text-gray-600 overflow-auto max-h-96 bg-white p-2 rounded border">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
};

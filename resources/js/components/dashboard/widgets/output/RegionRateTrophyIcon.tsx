import React from 'react';

/** Иконка кубка для строк топа. */
export const RegionRateTrophyIcon: React.FC<{ className?: string }> = ({
    className = 'region-item__trophy',
}) => (
    <svg
        className={className}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
    >
        <path
            d="M7 2h10v4.5c0 2.76-2.24 5-5 5s-5-2.24-5-5V2zm1.5 1.5v3c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5v-3h-7zM6 20v-2h2v-3H5a1 1 0 01-1-1v-1h16v1a1 1 0 01-1 1h-3v3h2v2H6zm12-9h-2V8h2v3zM4 11H2v1a1 1 0 001 1h2v-2z"
            fill="currentColor"
        />
    </svg>
);

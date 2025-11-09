<?php

namespace App\Enums;

enum ReportStatus: string
{
    case Draft = 'draft';
    case Scheduled = 'scheduled';
    case Ready = 'ready';
    case Archived = 'archived';

    /**
     * Get available statuses.
     *
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(
            static fn (self $status): string => $status->value,
            self::cases()
        );
    }
}



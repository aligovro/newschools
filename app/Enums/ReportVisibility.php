<?php

namespace App\Enums;

enum ReportVisibility: string
{
    case Private = 'private';
    case Organization = 'organization';
    case Public = 'public';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(
            static fn (self $visibility): string => $visibility->value,
            self::cases()
        );
    }
}



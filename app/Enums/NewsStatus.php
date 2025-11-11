<?php

namespace App\Enums;

enum NewsStatus: string
{
    case Draft = 'draft';
    case Scheduled = 'scheduled';
    case Published = 'published';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Черновик',
            self::Scheduled => 'Запланировано',
            self::Published => 'Опубликовано',
            self::Archived => 'Архивировано',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}


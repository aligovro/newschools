<?php

namespace App\Enums;

enum NewsVisibility: string
{
    case Public = 'public';
    case Organization = 'organization';
    case Private = 'private';

    public function label(): string
    {
        return match ($this) {
            self::Public => 'Публично',
            self::Organization => 'Для организации',
            self::Private => 'Приватно',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}


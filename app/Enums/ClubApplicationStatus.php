<?php

namespace App\Enums;

enum ClubApplicationStatus: string
{
    case Pending  = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Pending  => 'На рассмотрении',
            self::Approved => 'Одобрена',
            self::Rejected => 'Отклонена',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Pending  => 'yellow',
            self::Approved => 'green',
            self::Rejected => 'red',
        };
    }
}

<?php

namespace App\Http\Resources\Alumni;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

/**
 * @mixin \App\Models\Member
 */
class AlumniResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->formatName(),
            'photo' => $this->resolvePhoto($this->photo),
            'graduation' => $this->graduation_year ? $this->graduation_year . ' год' : null,
            'class' => $this->class_display ?? null,
            'profession' => $this->profession,
            'company' => $this->company,
        ];
    }

    private function formatName(): string
    {
        $parts = array_filter([
            $this->first_name,
            $this->middle_name,
            $this->last_name,
        ]);

        if (!empty($parts)) {
            return implode(' ', $parts);
        }

        return 'Выпускник';
    }

    private function resolvePhoto(?string $photo): ?string
    {
        if (!$photo || trim($photo) === '') {
            return null;
        }

        if (Str::startsWith($photo, ['http://', 'https://', '/'])) {
            return $photo;
        }

        return '/storage/' . ltrim($photo, '/');
    }
}



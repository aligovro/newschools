<?php

namespace App\Http\Resources\Sponsors;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

/**
 * @mixin \stdClass
 */
class SponsorResource extends JsonResource
{
    public function toArray($request): array
    {
        $totalAmount = (int) ($this->total_amount ?? 0);
        $latestDonationAt = $this->latest_donation_at
            ? Carbon::parse($this->latest_donation_at)->toIso8601String()
            : null;

        return [
            'id' => (string) $this->sponsor_key,
            'name' => $this->resolveName(),
            'avatar' => $this->resolveAvatar($this->photo ?? null),
            'total_amount' => $totalAmount,
            'total_amount_formatted' => $this->formatRubles($totalAmount),
            'latest_donation_at' => $latestDonationAt,
            'donations_count' => (int) ($this->donations_count ?? 0),
        ];
    }

    private function resolveName(): string
    {
        $candidates = [
            $this->display_name ?? null,
            $this->donor_name ?? null,
            $this->donor_email ?? null,
            $this->donor_phone ?? null,
        ];

        foreach ($candidates as $candidate) {
            if ($candidate && trim((string) $candidate) !== '') {
                return trim((string) $candidate);
            }
        }

        return 'Спонсор';
    }

    private function resolveAvatar(?string $photo): ?string
    {
        if (!$photo || trim($photo) === '') {
            return null;
        }

        if (Str::startsWith($photo, ['http://', 'https://', '/'])) {
            return $photo;
        }

        return '/storage/' . ltrim($photo, '/');
    }

    private function formatRubles(int $amountInKopecks): string
    {
        $rubles = $amountInKopecks / 100;

        return number_format($rubles, 0, '', ' ') . ' ₽';
    }
}


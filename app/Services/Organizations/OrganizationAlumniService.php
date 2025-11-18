<?php

namespace App\Services\Organizations;

use App\Models\Member;
use App\Models\Organization;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class OrganizationAlumniService
{
    public const DEFAULT_PER_PAGE = 6;
    public const MAX_PER_PAGE = 24;

    public function paginate(Organization $organization, int $perPage, int $page): LengthAwarePaginator
    {
        $perPage = $this->normalizePerPage($perPage);
        $page = max(1, $page);

        return Member::query()
            ->where('organization_id', $organization->id)
            ->where('is_public', true)
            ->orderByDesc('graduation_year')
            ->orderByDesc('created_at')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    private function normalizePerPage(int $perPage): int
    {
        return max(1, min($perPage, self::MAX_PER_PAGE));
    }
}



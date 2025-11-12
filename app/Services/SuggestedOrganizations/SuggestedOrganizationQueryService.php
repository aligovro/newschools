<?php

namespace App\Services\SuggestedOrganizations;

use App\Models\SuggestedOrganization;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class SuggestedOrganizationQueryService
{
    private const DEFAULT_PER_PAGE = 15;
    private const MAX_PER_PAGE = 100;

    public function baseQuery(): Builder
    {
        return SuggestedOrganization::query()
            ->with(['city:id,name', 'reviewer:id,name,email'])
            ->select([
                'id',
                'name',
                'city_name',
                'city_id',
                'address',
                'latitude',
                'longitude',
                'status',
                'admin_notes',
                'reviewed_by',
                'reviewed_at',
                'created_at',
                'updated_at',
            ]);
    }

    public function applyFilters(Builder $query, array $filters): Builder
    {
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function (Builder $builder) use ($search): void {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('city_name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['city_id'])) {
            $query->where('city_id', $filters['city_id']);
        }

        return $query;
    }

    public function applySorting(Builder $query, string $sortBy, string $direction): Builder
    {
        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';

        if (in_array($sortBy, SuggestedOrganization::SORTABLE_FIELDS, true)) {
            $query->orderBy($sortBy, $direction);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query;
    }

    public function paginate(Builder $query, ?int $perPage = null, ?int $page = null): LengthAwarePaginator
    {
        $perPage ??= self::DEFAULT_PER_PAGE;
        $perPage = max(1, min($perPage, self::MAX_PER_PAGE));

        $page = $page ?? 1;

        return $query->paginate($perPage, ['*'], 'page', $page);
    }
}



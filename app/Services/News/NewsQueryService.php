<?php

namespace App\Services\News;

use App\Enums\NewsStatus;
use App\Enums\NewsVisibility;
use App\Models\News;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class NewsQueryService
{
    private const DEFAULT_PER_PAGE = 15;
    private const MAX_PER_PAGE = 100;

    public function baseQuery(): Builder
    {
        return News::query()
            ->with(['organization:id,name,slug'])
            ->orderByDesc('published_at')
            ->orderByDesc('starts_at')
            ->orderByDesc('created_at');
    }

    public function applyPermissions(Builder $query, User $user): Builder
    {
        if ($user->isSuperAdmin()) {
            return $query;
        }

        return $query->whereIn('organization_id', $user->organizations()->select('organizations.id'));
    }

    public function applyFilters(Builder $query, Request $request): Builder
    {
        if ($request->filled('organization_id')) {
            $query->where('organization_id', $request->integer('organization_id'));
        }

        if ($request->filled('status') && in_array($request->status, NewsStatus::values(), true)) {
            $query->where('status', $request->status);
        }

        if ($request->filled('visibility') && in_array($request->visibility, NewsVisibility::values(), true)) {
            $query->where('visibility', $request->visibility);
        }

        if ($request->filled('type')) {
            $types = is_array($request->type) ? $request->type : [$request->type];
            $query->whereIn('type', $types);
        }

        if ($request->filled('featured')) {
            $query->where('is_featured', filter_var($request->featured, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('newsable_type') && $request->filled('newsable_id')) {
            $query->where('newsable_type', $request->newsable_type)
                ->where('newsable_id', $request->newsable_id);
        }

        if ($request->boolean('upcoming', false)) {
            $query->whereNotNull('starts_at')
                ->where('starts_at', '>=', now());
        }

        if ($request->boolean('past', false)) {
            $query->whereNotNull('starts_at')
                ->where('starts_at', '<', now());
        }

        if ($request->filled('starts_from')) {
            try {
                $query->where('starts_at', '>=', Carbon::parse($request->input('starts_from')));
            } catch (\Throwable $e) {
                // ignore invalid date
            }
        }

        if ($request->filled('starts_to')) {
            try {
                $query->where('starts_at', '<=', Carbon::parse($request->input('starts_to')));
            } catch (\Throwable $e) {
            }
        }

        if ($request->filled('published_from')) {
            try {
                $query->where('published_at', '>=', Carbon::parse($request->input('published_from')));
            } catch (\Throwable $e) {
            }
        }

        if ($request->filled('published_to')) {
            try {
                $query->where('published_at', '<=', Carbon::parse($request->input('published_to')));
            } catch (\Throwable $e) {
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function (Builder $q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('subtitle', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%")
                    ->orWhereJsonContains('tags', $search);
            });
        }

        return $query;
    }

    public function paginate(Builder $query, Request $request)
    {
        $perPage = (int) $request->get('per_page', self::DEFAULT_PER_PAGE);
        $perPage = max(1, min($perPage, self::MAX_PER_PAGE));

        return $query->paginate($perPage);
    }
}


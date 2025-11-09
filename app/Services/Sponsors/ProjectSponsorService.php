<?php

namespace App\Services\Sponsors;

use App\Enums\DonationStatus;
use App\Models\Project;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ProjectSponsorService
{
    public const DEFAULT_PER_PAGE = 6;
    public const MAX_PER_PAGE = 24;

    public function paginate(Project $project, string $sort, int $perPage, int $page): LengthAwarePaginator
    {
        $sort = $this->normalizeSort($sort);
        $perPage = $this->normalizePerPage($perPage);
        $page = max(1, $page);

        $query = $this->buildAggregatedQuery($project);

        if ($sort === 'recent') {
            $query->orderByDesc('latest_donation_at')
                ->orderByDesc('total_amount');
        } else {
            $query->orderByDesc('total_amount')
                ->orderByDesc('latest_donation_at');
        }

        $query->orderBy('display_name');

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    private function buildAggregatedQuery(Project $project)
    {
        $sponsorKeyExpression = $this->sponsorKeyExpression();

        $aggregated = DB::table('donations')
            ->leftJoin('users', 'users.id', '=', 'donations.donor_id')
            ->where('donations.project_id', $project->id)
            ->where('donations.status', DonationStatus::Completed->value)
            ->where(function ($query) {
                $query->whereNull('donations.is_anonymous')
                    ->orWhere('donations.is_anonymous', false);
            })
            ->groupBy(DB::raw($sponsorKeyExpression))
            ->selectRaw("
                {$sponsorKeyExpression} as sponsor_key,
                MAX(donations.donor_id) as donor_id,
                MAX(donations.donor_name) as donor_name,
                MAX(donations.donor_email) as donor_email,
                MAX(donations.donor_phone) as donor_phone,
                MAX(CASE WHEN users.name IS NOT NULL AND users.name != '' THEN users.name ELSE donations.donor_name END) as display_name,
                MAX(CASE WHEN users.photo IS NOT NULL AND users.photo != '' THEN users.photo ELSE NULL END) as photo,
                COALESCE(SUM(donations.amount), 0) as total_amount,
                MAX(donations.created_at) as latest_donation_at,
                COUNT(donations.id) as donations_count
            ")
            ->havingRaw('total_amount > 0');

        return DB::query()->fromSub($aggregated, 'sponsors');
    }

    private function normalizeSort(string $sort): string
    {
        return in_array($sort, ['top', 'recent'], true) ? $sort : 'top';
    }

    private function normalizePerPage(int $perPage): int
    {
        return max(1, min($perPage, self::MAX_PER_PAGE));
    }

    private function sponsorKeyExpression(): string
    {
        return "CASE
            WHEN donations.donor_id IS NOT NULL THEN CONCAT('user:', donations.donor_id)
            WHEN donations.donor_email IS NOT NULL AND donations.donor_email != '' THEN CONCAT('email:', LOWER(donations.donor_email))
            WHEN donations.donor_phone IS NOT NULL AND donations.donor_phone != '' THEN CONCAT('phone:', donations.donor_phone)
            WHEN donations.donor_name IS NOT NULL AND donations.donor_name != '' THEN CONCAT('name:', donations.donor_name)
            ELSE CONCAT('donation:', donations.id)
        END";
    }
}


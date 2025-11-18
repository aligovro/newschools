<?php

namespace App\Services\Sponsors;

use App\Enums\DonationStatus;
use App\Models\Organization;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class OrganizationSponsorService
{
    public const DEFAULT_PER_PAGE = 6;
    public const MAX_PER_PAGE = 24;

    public function paginate(Organization $organization, string $sort, int $perPage, int $page): LengthAwarePaginator
    {
        $sort = $this->normalizeSort($sort);
        $perPage = $this->normalizePerPage($perPage);
        $page = max(1, $page);

        $query = $this->buildAggregatedQuery($organization);

        if ($sort === 'recent') {
            $query->orderBy('priority')
                ->orderByDesc('latest_donation_at')
                ->orderByDesc('total_amount');
        } else {
            $query->orderBy('priority')
                ->orderByDesc('total_amount')
                ->orderByDesc('latest_donation_at');
        }

        $query->orderBy('display_name');

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    private function buildAggregatedQuery(Organization $organization): Builder
    {
        $members = $this->sponsorMembersSelect($organization);
        $legacy = $this->legacySponsorsSelect($organization);

        return DB::query()->fromSub($members->unionAll($legacy), 'sponsors');
    }

    private function sponsorMembersSelect(Organization $organization): Builder
    {
        $donationStats = $this->donationStatsSubquery($organization);

        return DB::table('organization_users')
            ->selectRaw("
                CONCAT('organization_user:', organization_users.id) as sponsor_key,
                users.id as donor_id,
                users.name as donor_name,
                users.email as donor_email,
                users.phone as donor_phone,
                COALESCE(NULLIF(users.name, ''), users.phone, users.email, 'Спонсор') as display_name,
                NULLIF(users.photo, '') as photo,
                COALESCE(donation_stats.total_amount, 0) as total_amount,
                COALESCE(donation_stats.latest_donation_at, organization_users.joined_at) as latest_donation_at,
                COALESCE(donation_stats.donations_count, 0) as donations_count,
                0 as priority
            ")
            ->join('users', 'organization_users.user_id', '=', 'users.id')
            ->leftJoinSub($donationStats, 'donation_stats', 'donation_stats.donor_id', '=', 'users.id')
            ->where('organization_users.organization_id', $organization->id)
            ->where('organization_users.role', 'sponsor');
    }

    private function legacySponsorsSelect(Organization $organization): Builder
    {
        $sponsorKeyExpression = $this->sponsorKeyExpression();

        return DB::table('donations')
            ->leftJoin('users', 'users.id', '=', 'donations.donor_id')
            ->where('donations.organization_id', $organization->id)
            ->where('donations.status', DonationStatus::Completed->value)
            ->where(function ($query) {
                $query->whereNull('donations.is_anonymous')
                    ->orWhere('donations.is_anonymous', false);
            })
            ->whereNotExists(function ($sub) use ($organization) {
                $sub->select(DB::raw(1))
                    ->from('organization_users')
                    ->whereColumn('organization_users.user_id', 'donations.donor_id')
                    ->where('organization_users.organization_id', $organization->id)
                    ->where('organization_users.role', 'sponsor');
            })
            ->groupBy(DB::raw($sponsorKeyExpression))
            ->selectRaw("
                {$sponsorKeyExpression} as sponsor_key,
                MAX(donations.donor_id) as donor_id,
                MAX(donations.donor_name) as donor_name,
                MAX(donations.donor_email) as donor_email,
                MAX(donations.donor_phone) as donor_phone,
                MAX(
                    CASE
                        WHEN users.name IS NOT NULL AND users.name != '' THEN users.name
                        ELSE donations.donor_name
                    END
                ) as display_name,
                MAX(
                    CASE
                        WHEN users.photo IS NOT NULL AND users.photo != '' THEN users.photo
                        ELSE NULL
                    END
                ) as photo,
                COALESCE(SUM(donations.amount), 0) as total_amount,
                MAX(donations.created_at) as latest_donation_at,
                COUNT(donations.id) as donations_count,
                1 as priority
            ")
            ->havingRaw('total_amount > 0');
    }

    private function donationStatsSubquery(Organization $organization): Builder
    {
        return DB::table('donations')
            ->selectRaw('
                donor_id,
                COALESCE(SUM(amount), 0) as total_amount,
                MAX(created_at) as latest_donation_at,
                COUNT(id) as donations_count
            ')
            ->where('organization_id', $organization->id)
            ->where('status', DonationStatus::Completed->value)
            ->whereNotNull('donor_id')
            ->groupBy('donor_id');
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

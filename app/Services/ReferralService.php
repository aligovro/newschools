<?php

namespace App\Services;

use App\Models\Donation;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ReferralService
{
    public function getOrganizationLeaderboard(int $organizationId, array $params = []): array
    {
        $perPage = max(1, (int)($params['per_page'] ?? 10));
        $sortBy = in_array(($params['sort_by'] ?? 'amount'), ['amount', 'invites'], true) ? $params['sort_by'] : 'amount';
        $sortOrder = strtolower($params['sort_order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        $cacheKey = sprintf('org:%d:referrals:leaderboard:%s', $organizationId, md5(json_encode([$perPage, $sortBy, $sortOrder])));

        return Cache::remember($cacheKey, now()->addMinutes(15), function () use ($organizationId, $perPage, $sortBy, $sortOrder) {
            // Aggregates: invites_count per referrer, total_amount per referrer
            $invitesSub = DB::table('users')
                ->select('referred_by_id as referrer_user_id', DB::raw('COUNT(*) as invites_count'), DB::raw('MIN(created_at) as first_invite_at'))
                ->whereNotNull('referred_by_id')
                ->groupBy('referred_by_id');

            $amountsSub = DB::table('donations')
                ->select('referrer_user_id', DB::raw('SUM(amount) as total_amount'))
                ->where('organization_id', $organizationId)
                ->where('status', 'completed')
                ->whereNotNull('referrer_user_id')
                ->groupBy('referrer_user_id');

            $query = DB::query()
                ->fromSub($invitesSub, 'i')
                ->leftJoinSub($amountsSub, 'a', 'a.referrer_user_id', '=', 'i.referrer_user_id')
                ->leftJoin('users as u', 'u.id', '=', 'i.referrer_user_id')
                ->select([
                    'i.referrer_user_id',
                    DB::raw('COALESCE(i.invites_count, 0) as invites_count'),
                    DB::raw('COALESCE(a.total_amount, 0) as total_amount'),
                    'u.name',
                    'u.created_at as user_created_at',
                ]);

            if ($sortBy === 'invites') {
                $query->orderBy('invites_count', $sortOrder)->orderBy('total_amount', 'desc');
            } else {
                $query->orderBy('total_amount', $sortOrder)->orderBy('invites_count', 'desc');
            }

            $rows = $query->limit($perPage)->get();

            $data = [];
            foreach ($rows as $index => $row) {
                $daysInSystem = 0;
                if (!empty($row->user_created_at)) {
                    $daysInSystem = now()->diffInDays(Carbon::parse($row->user_created_at));
                }

                $displayName = $row->name ?: ('Аноним #' . $row->referrer_user_id);

                $data[] = [
                    'position' => $index + 1,
                    'referrer_user_id' => (int)$row->referrer_user_id,
                    'name' => $displayName,
                    'days_in_system' => $daysInSystem,
                    'invites_count' => (int)$row->invites_count,
                    'total_amount' => (int)$row->total_amount,
                    'formatted_total_amount' => number_format((int)$row->total_amount, 0, ',', ' ') . ' ₽',
                ];
            }

            return [
                'data' => $data,
                'meta' => [
                    'page' => 1,
                    'per_page' => $perPage,
                    'has_more' => false,
                ],
            ];
        });
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReferralService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    private ReferralService $referralService;

    public function __construct(ReferralService $referralService)
    {
        $this->referralService = $referralService;
    }

    public function leaderboard(int $organization, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort_by' => 'nullable|string|in:amount,invites',
            'sort_order' => 'nullable|string|in:asc,desc',
        ]);

        $result = $this->referralService->getOrganizationLeaderboard((int)$organization, $validated);
        return response()->json($result);
    }
}

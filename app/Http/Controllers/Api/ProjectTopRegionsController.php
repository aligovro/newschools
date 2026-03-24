<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Support\Money;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProjectTopRegionsController extends Controller
{
    public function index(Request $request, Project $project): JsonResponse
    {
        $perPage = max(1, min((int) $request->get('per_page', 6), 50));
        $page    = max(1, (int) $request->get('page', 1));

        $subquery = DB::table('donations')
            ->select([
                'donations.region_id',
                DB::raw('COALESCE(SUM(donations.amount), 0) as total_amount'),
                DB::raw('COUNT(*) as donation_count'),
            ])
            ->where('donations.project_id', $project->id)
            ->where('donations.status', 'completed')
            ->whereNotNull('donations.region_id')
            ->groupBy('donations.region_id');

        $query = DB::table('regions')
            ->select([
                'regions.id',
                'regions.name',
                'regions.code',
                'regions.flag_image',
                DB::raw('COALESCE(ds.total_amount, 0) as total_amount'),
                DB::raw('COALESCE(ds.donation_count, 0) as donation_count'),
            ])
            ->joinSub($subquery, 'ds', 'regions.id', '=', 'ds.region_id')
            ->where('regions.is_active', true)
            ->orderByDesc('ds.total_amount')
            ->orderBy('regions.name');

        $total = $query->count();
        $items = $query->offset(($page - 1) * $perPage)->limit($perPage)->get();

        $data = $items->map(fn ($row) => [
            'id'              => $row->id,
            'name'            => $row->name,
            'code'            => $row->code,
            'flag_image_url'  => $row->flag_image ? asset('storage/' . $row->flag_image) : null,
            'donation_count'  => (int) $row->donation_count,
            'total_amount'    => (int) $row->total_amount,
            'formatted_amount' => Money::format((int) $row->total_amount),
        ])->values()->toArray();

        $lastPage = (int) ceil($total / $perPage);

        return response()->json([
            'data'     => $data,
            'has_more' => $page < $lastPage,
            'meta'     => [
                'page'     => $page,
                'per_page' => $perPage,
                'total'    => $total,
            ],
        ]);
    }
}

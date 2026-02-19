<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Organization;
use App\Services\ProjectDonations\ProjectDonationsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicOrganizationDonationsController extends Controller
{
    public function __construct(
        private readonly ProjectDonationsService $donationsService,
    ) {}

    /**
     * Топ поддержавших по организации (все проекты).
     * graduate_only=1 — только «Выпуск X г.» и «Друзья лицея».
     */
    public function topByDonor(Request $request, Organization $organization): JsonResponse
    {
        $period = $this->normalizePeriod($request->get('period'));
        $limit = min(max(1, (int) $request->get('limit', 20)), 50);
        $graduateOnly = $request->boolean('graduate_only');

        $data = $this->donationsService->topByDonorNameForOrganization($organization, $period, $limit, $graduateOnly);

        return response()->json([
            'success' => true,
            'period' => $period,
            'data' => $data,
        ]);
    }

    /**
     * Топ регулярно-поддерживающих по организации.
     * graduate_only=1 — только «Выпуск X г.» и «Друзья лицея».
     */
    public function topRecurring(Request $request, Organization $organization): JsonResponse
    {
        $period = $this->normalizePeriod($request->get('period'));
        $page = max(1, (int) $request->get('page', 1));
        $perPage = min(max(1, (int) $request->get('per_page', 20)), 50);
        $graduateOnly = $request->boolean('graduate_only');

        $result = $this->donationsService->topRecurringByDonorNameForOrganization($organization, $period, $page, $perPage, $graduateOnly);

        return response()->json([
            'success' => true,
            'period' => $period,
            'data' => $result['data'],
            'pagination' => $result['pagination'],
        ]);
    }

    /**
     * Все поступления по организации с пагинацией.
     * mask_donors=1 — в ответе все доноры отображаются как «Анонимное пожертвование».
     */
    public function allDonations(Request $request, Organization $organization): JsonResponse
    {
        $page = max(1, (int) $request->get('page', 1));
        $perPage = min(max(1, (int) $request->get('per_page', ProjectDonationsService::DEFAULT_PER_PAGE)), ProjectDonationsService::MAX_PER_PAGE);
        $maskDonors = $request->boolean('mask_donors');

        $paginator = $this->donationsService->allDonationsForOrganization($organization, $page, $perPage);

        $items = $paginator->getCollection()->map(function ($donation) use ($maskDonors) {
            $dt = $donation->paid_at ?? $donation->created_at;
            $dateLabel = $dt ? $this->formatDateLabel($dt) : '';
            $timeLabel = $dt ? $dt->format('H:i') : '';

            $donorName = $maskDonors
                ? 'Анонимное пожертвование'
                : ($donation->is_anonymous ? 'Анонимное пожертвование' : ($donation->donor_name ?? 'Анонимное пожертвование'));

            return [
                'id' => $donation->id,
                'donor_name' => $donorName,
                'amount' => $donation->amount,
                'amount_formatted' => number_format((int) $donation->amount / 100, 0, '', ' ') . ' ₽',
                'payment_method' => $donation->payment_method,
                'payment_method_label' => ProjectDonationsService::paymentMethodLabel($donation->payment_method),
                'paid_at' => $timeLabel,
                'date_label' => $dateLabel,
                'created_at' => $donation->created_at->toIso8601String(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $items,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    private function formatDateLabel(\DateTimeInterface $dt): string
    {
        $today = Carbon::today();
        $date = Carbon::parse($dt)->startOfDay();

        if ($date->isSameDay($today)) {
            return 'Сегодня';
        }
        if ($date->isSameDay($today->copy()->subDay())) {
            return 'Вчера';
        }

        return $date->format('d.m.Y');
    }

    private function normalizePeriod(?string $period): string
    {
        return in_array($period, [
            ProjectDonationsService::PERIOD_WEEK,
            ProjectDonationsService::PERIOD_MONTH,
            ProjectDonationsService::PERIOD_ALL,
        ], true) ? $period : ProjectDonationsService::PERIOD_ALL;
    }
}

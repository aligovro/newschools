<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\OrganizationUserProfile;
use App\Models\User;
use App\Services\ProjectDonations\ProjectDonationsService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * API личного кабинета на сайтах организаций (my-account).
 * Профиль пользователя по организации: user_type, edu_year, region.
 */
class SiteAccountController extends Controller
{
    public function __construct(
        private readonly ProjectDonationsService $donationsService,
    ) {
        $this->middleware('auth');
    }

    /**
     * Получить профиль пользователя для организации.
     * organization_id обязателен — из контекста сайта.
     */
    public function profile(Request $request): JsonResponse
    {
        $organizationId = (int) $request->input('organization_id');
        if ($organizationId <= 0) {
            return response()->json(['message' => 'organization_id required'], 422);
        }

        $user = $request->user();
        $profile = $user->profileForOrganization($organizationId);

        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'photo' => $user->photo,
        ];

        $profileData = $profile ? [
            'last_name' => $profile->last_name,
            'user_type' => $profile->user_type,
            'edu_year' => $profile->edu_year,
            'region_id' => $profile->region_id,
            'region' => $profile->region?->only(['id', 'name', 'slug']),
        ] : [
            'last_name' => null,
            'user_type' => null,
            'edu_year' => null,
            'region_id' => null,
            'region' => null,
        ];

        return response()->json([
            'user' => $userData,
            'profile' => $profileData,
            'user_type_labels' => OrganizationUserProfile::userTypeLabels(),
        ]);
    }

    /**
     * Обновить профиль пользователя для организации.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $organizationId = (int) $request->input('organization_id');
        if ($organizationId <= 0) {
            return response()->json(['message' => 'organization_id required'], 422);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($request->user()->id)],
            'last_name' => ['nullable', 'string', 'max:100'],
            'user_type' => ['nullable', 'string', Rule::in(array_keys(OrganizationUserProfile::userTypeLabels()))],
            'edu_year' => ['nullable', 'string', 'max:10'],
            'region_id' => ['nullable', 'integer', 'exists:regions,id'],
        ]);

        $user = $request->user();

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
            $user->save();
        }
        if (array_key_exists('email', $validated)) {
            $user->email = $validated['email'];
            $user->save();
        }

        $profileData = array_intersect_key($validated, array_flip(['last_name', 'user_type', 'edu_year', 'region_id']));
        if (!empty($profileData)) {
            OrganizationUserProfile::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'organization_id' => $organizationId,
                ],
                $profileData
            );
        }

        $profile = $user->profileForOrganization($organizationId);

        return response()->json([
            'user' => $user->only(['id', 'name', 'email', 'phone', 'photo']),
            'profile' => $profile ? [
                'last_name' => $profile->last_name,
                'user_type' => $profile->user_type,
                'edu_year' => $profile->edu_year,
                'region_id' => $profile->region_id,
                'region' => $profile->region?->only(['id', 'name', 'slug']),
            ] : null,
        ]);
    }

    /**
     * Моя помощь — пожертвования пользователя по организации.
     */
    public function payments(Request $request): JsonResponse
    {
        $organizationId = (int) $request->input('organization_id');
        if ($organizationId <= 0) {
            return response()->json(['message' => 'organization_id required'], 422);
        }

        $organization = Organization::find($organizationId);
        if (!$organization) {
            return response()->json(['message' => 'Organization not found'], 404);
        }

        $page = max(1, (int) $request->get('page', 1));
        $perPage = min(max(1, (int) $request->get('per_page', 20)), ProjectDonationsService::MAX_PER_PAGE);

        $paginator = $this->donationsService->myDonationsForOrganization(
            $request->user(),
            $organization,
            $page,
            $perPage
        );

        $items = $paginator->getCollection()->map(function ($donation) {
            $dt = $donation->paid_at ?? $donation->created_at;
            return [
                'id' => $donation->id,
                'amount' => $donation->amount,
                'amount_formatted' => number_format((int) $donation->amount / 100, 0, '', ' ') . ' ₽',
                'payment_method' => $donation->payment_method,
                'payment_method_label' => ProjectDonationsService::paymentMethodLabel($donation->payment_method),
                'paid_at' => $dt?->format('H:i'),
                'date_label' => $this->formatDateLabel($dt),
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

    /**
     * Автоплатежи — recurring donations пользователя.
     */
    public function autoPayments(Request $request): JsonResponse
    {
        $organizationId = (int) $request->input('organization_id');
        if ($organizationId <= 0) {
            return response()->json(['message' => 'organization_id required'], 422);
        }

        $organization = Organization::find($organizationId);
        if (!$organization) {
            return response()->json(['message' => 'Organization not found'], 404);
        }

        $page = max(1, (int) $request->get('page', 1));
        $perPage = min(max(1, (int) $request->get('per_page', 20)), ProjectDonationsService::MAX_PER_PAGE);

        $result = $this->donationsService->myRecurringDonationsForOrganization(
            $request->user(),
            $organization,
            $page,
            $perPage
        );

        return response()->json([
            'success' => true,
            'data' => $result['data'],
            'pagination' => $result['pagination'],
        ]);
    }

    /**
     * Мои карты — способы оплаты, использованные пользователем.
     */
    public function cards(Request $request): JsonResponse
    {
        $organizationId = (int) $request->input('organization_id');
        if ($organizationId <= 0) {
            return response()->json(['message' => 'organization_id required'], 422);
        }

        $organization = Organization::find($organizationId);
        if (!$organization) {
            return response()->json(['message' => 'Organization not found'], 404);
        }

        $methods = $this->donationsService->myPaymentMethodsForOrganization($request->user(), $organization);

        return response()->json([
            'success' => true,
            'data' => $methods,
        ]);
    }

    /**
     * Пригласить друга — referral link и статистика.
     */
    public function referral(Request $request): JsonResponse
    {
        $organizationId = (int) $request->input('organization_id');
        if ($organizationId <= 0) {
            return response()->json(['message' => 'organization_id required'], 422);
        }

        $user = $request->user();
        $baseUrl = $request->getSchemeAndHttpHost();
        $referralUrl = rtrim($baseUrl, '/') . '/?ref=' . $user->id;

        $referralsCount = User::where('referred_by_id', $user->id)->count();

        return response()->json([
            'success' => true,
            'referral_url' => $referralUrl,
            'referrals_count' => $referralsCount,
        ]);
    }

    private function formatDateLabel(?\DateTimeInterface $dt): string
    {
        if (!$dt) {
            return '';
        }
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
}

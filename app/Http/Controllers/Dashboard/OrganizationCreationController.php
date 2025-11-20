<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\Region;
use App\Models\Locality;
use App\Models\User;
use App\Services\Organizations\OrganizationCreationService;
use App\Services\Organizations\OrganizationSettingsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class OrganizationCreationController extends Controller
{
    protected OrganizationCreationService $creationService;
    protected OrganizationSettingsService $settingsService;

    public function __construct(
        OrganizationCreationService $creationService,
        OrganizationSettingsService $settingsService
    ) {
        $this->creationService = $creationService;
        $this->settingsService = $settingsService;
    }

    /**
     * Показать форму создания организации
     */
    public function create()
    {
        // Получаем только минимальные справочные данные
        $referenceData = [
            'organizationTypes' => $this->settingsService->getOrganizationTypes(),
            // Загружаем только первые 20 регионов для начального отображения
            'regions' => Region::select('id', 'name', 'code')
                ->orderBy('name')
                ->limit(20)
                ->get(),
            'availableUsers' => User::select('id', 'name', 'email')
                ->where('is_active', true)
                ->limit(20)
                ->get(),
        ];

        return Inertia::render('dashboard/organizations/CreateOrganization', [
            'referenceData' => $referenceData,
            'defaultPaymentSettings' => $this->settingsService->getDefaultPaymentSettings(),
        ]);
    }

    /**
     * Создать организацию
     */
    public function store(Request $request)
    {
        Log::info('[OrgCreate] Request meta', [
            'method' => $request->method(),
            'content_type' => $request->header('Content-Type'),
            'files_count' => count($request->allFiles()),
            'file_keys' => array_keys($request->allFiles()),
        ]);
        Log::info('[OrgCreate] Request all (raw)', $request->all());
        $validator = Validator::make($request->all(), [
            // Основные данные
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:organizations,slug',
            'description' => 'nullable|string|max:1000',
            'type' => 'required|string|in:school',
            'status' => 'nullable|string|in:active,inactive,pending',

            // Контактная информация
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',

            // Локация
            'region_id' => 'nullable|exists:regions,id',
            // locality_id трактуем как locality_id
            'locality_id' => 'nullable|exists:localities,id',
            'city_name' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',

            // Медиа
            'logo' => 'nullable|file|mimes:jpeg,png,jpg,webp,svg|max:5120', // 5MB для поддержки SVG
            'images' => 'nullable|array|max:10',
            'images.*' => 'file|image|mimes:jpeg,png,jpg,webp|max:2048',

            // Дополнительные данные
            'founded_at' => 'nullable|date',
            'is_public' => 'nullable|boolean',

            // Опционально: создание сайта
            'create_site' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            Log::warning('[OrgCreate] Validation failed', [
                'errors' => $validator->errors()->toArray(),
            ]);
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            // Получаем данные запроса
            $data = $request->except(['create_gallery', 'create_slider', 'create_site', 'site_template']);
            Log::info('[OrgCreate] Data after except (pre-files)', $data);

            // Обрабатываем загрузку логотипа
            if ($request->hasFile('logo')) {
                $logoPath = $request->file('logo')->store('organizations/logos', 'public');
                $data['logo'] = $logoPath;
            }

            // Обрабатываем загрузку изображений
            if ($request->hasFile('images')) {
                $imagePaths = [];
                foreach ($request->file('images') as $image) {
                    $imagePath = $image->store('organizations/images', 'public');
                    $imagePaths[] = $imagePath;
                }
                $data['images'] = $imagePaths;
            }
            Log::info('[OrgCreate] Data before create', $data);

            // Создаем организацию
            $organization = $this->creationService->createOrganization($data);
            Log::info('[OrgCreate] Organization created', [
                'organization_id' => $organization?->id,
            ]);

            // Сохраняем платежные настройки, если переданы
            $paymentSettingsRaw = $request->get('payment_settings');
            Log::info('[OrgCreate] payment_settings raw', ['value' => $paymentSettingsRaw]);
            if (!empty($paymentSettingsRaw)) {
                $paymentSettings = is_array($paymentSettingsRaw)
                    ? $paymentSettingsRaw
                    : (is_string($paymentSettingsRaw)
                        ? json_decode($paymentSettingsRaw, true)
                        : []);

                if (is_array($paymentSettings)) {
                    // Нормализуем легаси ключи к единому формату
                    if (isset($paymentSettings['enabled_methods']) && !isset($paymentSettings['enabled_gateways'])) {
                        $paymentSettings['enabled_gateways'] = $paymentSettings['enabled_methods'];
                        unset($paymentSettings['enabled_methods']);
                    }
                    if (isset($paymentSettings['min_amount']) && !isset($paymentSettings['donation_min_amount'])) {
                        $paymentSettings['donation_min_amount'] = (int) $paymentSettings['min_amount'];
                        unset($paymentSettings['min_amount']);
                    }
                    if (isset($paymentSettings['max_amount']) && !isset($paymentSettings['donation_max_amount'])) {
                        $paymentSettings['donation_max_amount'] = (int) $paymentSettings['max_amount'];
                        unset($paymentSettings['max_amount']);
                    }

                    Log::info('[OrgCreate] payment_settings normalized', $paymentSettings);
                    $this->settingsService->updateSettings($organization, [
                        'payment_settings' => $paymentSettings,
                    ]);
                    Log::info('[OrgCreate] payment_settings saved');
                }
            }

            // Создаем сайт если запрошено
            if ($request->boolean('create_site')) {
                $siteData = [
                    'title' => $organization->name,
                    'slug' => $organization->slug,
                    'is_primary' => true,
                    'is_published' => false,
                    'template' => $request->get('site_template', 'default'),
                ];

                $this->creationService->createOrganizationSite($organization, $siteData);
            }

            // Очищаем кеш справочных данных
            Cache::forget('organization_creation_reference_data');

            Log::info('[OrgCreate] Redirecting to organizations.edit', ['id' => $organization->id]);
            return redirect()
                ->route('organizations.edit', ['organization' => $organization->id])
                ->with('success', 'Организация успешно создана');
        } catch (\Exception $e) {
            Log::error('[OrgCreate] Exception', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return redirect()->back()
                ->withErrors(['general' => 'Ошибка создания организации: ' . $e->getMessage()])
                ->with('error', 'Ошибка создания организации: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Показать форму создания сайта для организации
     */
    public function createSite(Organization $organization)
    {
        // Проверяем, есть ли уже сайт у организации
        $existingSite = $organization->sites()
            ->where('site_type', 'organization')
            ->orderBy('created_at', 'asc')
            ->first();

        if ($existingSite) {
            // Если сайт уже существует, перенаправляем на редактирование
            return redirect()->route('organizations.sites.builder', [
                'organization' => $organization,
                'site' => $existingSite
            ]);
        }

        $templates = Cache::remember('site_templates', 3600, function () {
            return [
                'default' => [
                    'name' => 'Стандартный',
                    'description' => 'Классический макет с баннером и статистикой',
                    'preview' => '/images/templates/default.jpg',
                ]
            ];
        });

        return Inertia::render('dashboard/organizations/CreateSite', [
            'organization' => $organization->only(['id', 'name', 'slug', 'description']),
            'templates' => $templates,
        ]);
    }

    /**
     * Создать сайт для организации
     */
    public function storeSite(Request $request, Organization $organization): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'domain' => 'nullable|string|max:255',
            'template' => 'required|string|in:default,modern,classic',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $siteData = $request->all();

            $site = $this->creationService->createOrganizationSite($organization, $siteData);

            return response()->json([
                'message' => 'Сайт успешно создан',
                'site' => $site,
                'redirect_url' => route('organizations.sites.builder', [
                    'organization' => $organization,
                    'site' => $site
                ]),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка создания сайта: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Проверить доступность slug
     */
    public function checkSlug(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'slug' => 'required|string|max:255|regex:/^[a-z0-9\-]+$/',
            'organization_id' => 'nullable|exists:organizations,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'available' => false,
                'message' => 'Некорректный формат slug'
            ]);
        }

        $query = Organization::where('slug', $request->slug);

        if ($request->filled('organization_id')) {
            $query->where('id', '!=', $request->organization_id);
        }

        $available = !$query->exists();

        return response()->json([
            'available' => $available,
            'message' => $available ? 'Slug доступен' : 'Slug уже используется'
        ]);
    }

    /**
     * Получить регионы с поиском и пагинацией
     */
    public function getRegions(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'search' => 'nullable|string|max:255',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $search = $request->get('search', '');
        $perPage = $request->get('per_page', 20);

        $query = Region::select('id', 'name', 'code')
            ->orderBy('name');

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $regions = $query->paginate($perPage);

        return response()->json([
            'data' => $regions->items(),
            'current_page' => $regions->currentPage(),
            'last_page' => $regions->lastPage(),
            'per_page' => $regions->perPage(),
            'total' => $regions->total(),
        ]);
    }

    /**
     * Получить города по региону
     */
    public function getCitiesByRegion(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'region_id' => 'nullable|exists:regions,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Если region_id не передан, возвращаем пустой массив
        if (!$request->region_id) {
            return response()->json([]);
        }

        $localities = Cache::remember("cities_region_{$request->region_id}", 3600, function () use ($request) {
            return Locality::where('region_id', $request->region_id)
                ->select('id', 'name', 'region_id', 'latitude', 'longitude')
                ->orderBy('name')
                ->get();
        });

        return response()->json($localities);
    }



    /**
     * Загрузить логотип
     */
    public function uploadLogo(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'logo' => 'required|mimes:jpeg,png,jpg,webp,svg|max:5120', // 5MB для поддержки SVG
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $path = $request->file('logo')->store('organizations/logos', 'public');

            return response()->json([
                'message' => 'Логотип загружен',
                'url' => Storage::url($path),
                'path' => $path,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка загрузки логотипа: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Загрузить изображения
     */
    public function uploadImages(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'images' => 'required|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $uploadedImages = [];

            foreach ($request->file('images') as $image) {
                $path = $image->store('organizations/images', 'public');
                $uploadedImages[] = [
                    'url' => Storage::url($path),
                    'path' => $path,
                ];
            }

            return response()->json([
                'message' => 'Изображения загружены',
                'images' => $uploadedImages,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка загрузки изображений: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получить пользователей с поиском и пагинацией
     */
    public function getUsers(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'search' => 'nullable|string|max:255',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $search = $request->get('search', '');
        $perPage = $request->get('per_page', 20);

        $query = User::select('id', 'name', 'email')
            ->where('is_active', true)
            ->orderBy('name');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate($perPage);

        return response()->json([
            'data' => $users->items(),
            'current_page' => $users->currentPage(),
            'last_page' => $users->lastPage(),
            'per_page' => $users->perPage(),
            'total' => $users->total(),
        ]);
    }
}

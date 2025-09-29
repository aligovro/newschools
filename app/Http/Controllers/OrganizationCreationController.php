<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\User;
use App\Services\OrganizationCreationService;
use App\Services\OrganizationSettingsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
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
        // Получаем справочные данные через сервис настроек
        $referenceData = [
            'organizationTypes' => $this->settingsService->getOrganizationTypes(),
            'regions' => \App\Models\Region::select('id', 'name', 'code')->orderBy('name')->get(),
            'cities' => \App\Models\City::select('id', 'name', 'region_id')->orderBy('name')->get(),
            'settlements' => \App\Models\Settlement::select('id', 'name', 'city_id')->orderBy('name')->get(),
            'availableUsers' => User::select('id', 'name', 'email')->where('is_active', true)->get(),
        ];

        return Inertia::render('organizations/CreateOrganization', [
            'referenceData' => $referenceData,
        ]);
    }

    /**
     * Создать организацию
     */
    public function store(Request $request)
    {
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
            'city_id' => 'nullable|exists:cities,id',
            'settlement_id' => 'nullable|exists:settlements,id',
            'city_name' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',

            // Медиа
            'logo' => 'nullable|file|image|mimes:jpeg,png,jpg,webp|max:2048',
            'images' => 'nullable|array|max:10',
            'images.*' => 'file|image|mimes:jpeg,png,jpg,webp|max:2048',

            // Дополнительные данные
            'contacts' => 'nullable|array',
            'features' => 'nullable|array',
            'founded_at' => 'nullable|date',
            'is_public' => 'nullable|boolean',

            // Администратор
            'admin_user_id' => 'nullable|exists:users,id',

            // Настройки по умолчанию
            'create_gallery' => 'nullable|boolean',
            'create_slider' => 'nullable|boolean',
            'create_site' => 'nullable|boolean',
            'site_template' => 'nullable|string|in:default,modern,classic',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            // Получаем данные запроса
            $data = $request->except(['admin_user_id', 'create_gallery', 'create_slider', 'create_site', 'site_template']);

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
                $data['images'] = json_encode($imagePaths);
            }

            // Получаем пользователя-администратора
            $adminUser = null;
            if ($request->filled('admin_user_id')) {
                $adminUser = User::find($request->admin_user_id);
            }

            // Создаем организацию
            $organization = $this->creationService->createOrganization($data, $adminUser);

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

            return redirect()->route('organizations.show', $organization)
                ->with('success', 'Организация успешно создана');
        } catch (\Exception $e) {
            return redirect()->back()
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
        $existingSite = $organization->sites()->where('is_primary', true)->first();

        if ($existingSite) {
            // Если сайт уже существует, перенаправляем на редактирование
            return redirect()->route('organization.admin.sites.builder', [
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
                ],
                'modern' => [
                    'name' => 'Современный',
                    'description' => 'Современный дизайн с акцентом на визуал',
                    'preview' => '/images/templates/modern.jpg',
                ],
                'classic' => [
                    'name' => 'Классический',
                    'description' => 'Традиционный макет с четкой структурой',
                    'preview' => '/images/templates/classic.jpg',
                ],
            ];
        });

        return Inertia::render('organizations/CreateSite', [
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
                'redirect_url' => route('organization.admin.sites.builder', [
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

        $query = \App\Models\Region::select('id', 'name', 'code')
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
            'region_id' => 'required|exists:regions,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $cities = Cache::remember("cities_region_{$request->region_id}", 3600, function () use ($request) {
            return \App\Models\City::where('region_id', $request->region_id)
                ->select('id', 'name')
                ->orderBy('name')
                ->get();
        });

        return response()->json($cities);
    }

    /**
     * Получить населенные пункты по городу
     */
    public function getSettlementsByCity(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'city_id' => 'required|exists:cities,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $settlements = Cache::remember("settlements_city_{$request->city_id}", 3600, function () use ($request) {
            return \App\Models\Settlement::where('city_id', $request->city_id)
                ->select('id', 'name')
                ->orderBy('name')
                ->get();
        });

        return response()->json($settlements);
    }

    /**
     * Загрузить логотип
     */
    public function uploadLogo(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'logo' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048', // 2MB
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
}

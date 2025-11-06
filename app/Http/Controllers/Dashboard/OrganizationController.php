<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;

use App\Models\Organization;
use App\Models\User;
use App\Http\Resources\OrganizationResource;
use App\Support\InertiaResource;
use Illuminate\Http\Request;
use App\Http\Requests\Organization\StoreOrganizationRequest;
use App\Http\Requests\Organization\UpdateOrganizationRequest;
use App\Helpers\TransliterationHelper;
use Inertia\Inertia;
use App\Services\ImageProcessingService;
use App\Services\Organizations\OrganizationSettingsService;

class OrganizationController extends Controller
{
    public function index(Request $request)
    {
        $query = Organization::query()
            ->with([
                'region:id,name',
                'city:id,name',
                'settlement:id,name',
            ])
            ->withCount([
                'members as members_count',
                'donations as donations_count',
            ])
            ->withSum('donations', 'amount')
            ->select([
                'id',
                'name',
                'slug',
                'description',
                'type',
                'status',
                'is_public',
                'logo',
                'created_at',
                'updated_at',
                'region_id',
                'city_id',
                'settlement_id'
            ]);

        // Поиск
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Фильтрация по типу
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Фильтрация по статусу
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Фильтрация по региону
        if ($request->filled('region_id')) {
            $query->where('region_id', $request->region_id);
        }

        // Сортировка
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        // Разрешенные поля для сортировки
        $allowedSortFields = ['name', 'created_at', 'updated_at', 'status', 'type'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Пагинация
        $perPage = min($request->get('per_page', 15), 100); // Ограничиваем максимум 100
        $organizations = $query->paginate($perPage);

        // Получаем базовую терминологию
        /** @var \App\Services\GlobalSettingsService $settings */
        $settings = app(\App\Services\GlobalSettingsService::class);
        $baseTerminology = $settings->getTerminology();

        // Добавляем специфичные для страницы поля
        $terminology = array_merge($baseTerminology, [
            'page_title' => __t('organizations_page_title'),
            'page_description' => __t('organizations_page_description'),
            'create_button' => __t('create_organization'),
            'total_count' => __t('total_organizations'),
            'no_organizations' => __t('no_organizations'),
        ]);

        return Inertia::render('organizations/OrganizationManagementPage', [
            // Provide paginator payload serialized via Resource to ensure consistent structure in Inertia
            'organizations' => InertiaResource::paginate($organizations, OrganizationResource::class),
            'filters' => $request->only(['search', 'type', 'status', 'region_id', 'sort_by', 'sort_direction', 'per_page']),
            'terminology' => $terminology,
        ]);
    }

    public function show(Organization $organization)
    {
        $organization->load([
            'domains',
            'members',
            'statistics',
            'region',
            'city',
            'settlement',
            'primarySite',
            'sites' => function ($query) {
                $query->select('id', 'organization_id')->limit(1);
            },
            'director' => function ($query) {
                $query->whereNull('deleted_at');
            },
            'staff' => function ($query) {
                $query->where('position', '!=', \App\Models\OrganizationStaff::POSITION_DIRECTOR)
                    ->whereNull('deleted_at')
                    ->orderBy('position')
                    ->orderBy('last_name');
            },
            'projects' => function ($query) {
                $query->select('id', 'organization_id', 'target_amount', 'collected_amount');
            }
        ]);

        // Подсчитываем агрегаты
        $organization->loadCount([
            'members as members_count',
            'donations as donations_count',
        ]);
        $organization->loadSum('donations', 'amount');

        return Inertia::render('organizations/OrganizationShowPage', [
            'organization' => (new OrganizationResource($organization))->toArray(request()),
        ]);
    }

    public function edit(Organization $organization)
    {
        // Загружаем связи
        $organization->load([
            'region',
            'city',
            'settlement',
            'primarySite',
            'sites' => function ($query) {
                $query->select('id', 'organization_id')->limit(1);
            },
        ]);

        // Получаем справочные данные
        $referenceData = [
            'organizationTypes' => [
                ['value' => 'school', 'label' => 'Школа', 'description' => 'Общеобразовательное учреждение'],
                ['value' => 'university', 'label' => 'Университет', 'description' => 'Высшее учебное заведение'],
                ['value' => 'kindergarten', 'label' => 'Детский сад', 'description' => 'Дошкольное образовательное учреждение'],
                ['value' => 'other', 'label' => 'Другое', 'description' => 'Иной тип организации'],
            ],
            // Загружаем только первые 20 регионов для начальной загрузки (с координатами)
            'regions' => \App\Models\Region::select('id', 'name', 'code', 'latitude', 'longitude')->orderBy('name')->limit(20)->get(),
            'cities' => $organization->region ?
                \App\Models\City::where('region_id', $organization->region->id)->select('id', 'name', 'region_id', 'latitude', 'longitude')->orderBy('name')->get() :
                [],
            'settlements' => $organization->city ?
                \App\Models\Settlement::where('city_id', $organization->city->id)->select('id', 'name', 'city_id')->orderBy('name')->get() :
                [],
        ];

        // Готовим настройки организации (для предзаполнения платежных настроек и т.п.)
        $orgSettings = app(OrganizationSettingsService::class)->getSettings($organization);

        // Получаем данные организации через Resource
        $organizationData = (new OrganizationResource($organization))->toArray(request());

        // Получаем админа напрямую через метод модели
        $adminUser = $organization->adminUser();

        // Добавляем данные об админе в массив
        if ($adminUser) {
            $organizationData['admin_user'] = [
                'id' => $adminUser->id,
                'name' => $adminUser->name,
                'email' => $adminUser->email,
            ];
        } else {
            $organizationData['admin_user'] = null;
        }

        return Inertia::render('organizations/OrganizationEditPage', [
            'organization' => $organizationData,
            'referenceData' => $referenceData,
            'organizationSettings' => $orgSettings,
        ]);
    }

    public function store(StoreOrganizationRequest $request)
    {
        $data = $request->only([
            'name',
            'slug',
            'description',
            'type',
            'status',
        ]);

        // Если слаг не передан или пустой, генерируем его на основе типа и ID
        // Но ID еще нет, поэтому сначала создаем организацию, затем обновляем слаг
        $organization = Organization::create($data);

        // Генерируем слаг с ID, если он не был передан или был только префикс типа
        if (empty($data['slug'])) {
            // Если слаг не передан, генерируем на основе типа и ID
            $prefix = match ($organization->type) {
                'school' => 'school',
                'university' => 'university',
                'kindergarten' => 'kindergarten',
                default => 'organization',
            };
            $slug = "{$prefix}-{$organization->id}";
            
            // Проверяем уникальность и генерируем уникальный слаг если нужно
            $slug = TransliterationHelper::createUniqueSlug(
                $slug,
                'organizations',
                'slug',
                $organization->id
            );
            
            $organization->update(['slug' => $slug]);
        } elseif (in_array($data['slug'], ['school', 'university', 'kindergarten', 'organization'], true)) {
            // Если передан только префикс (без ID), добавляем ID
            $slug = "{$data['slug']}-{$organization->id}";
            
            // Проверяем уникальность
            $slug = TransliterationHelper::createUniqueSlug(
                $slug,
                'organizations',
                'slug',
                $organization->id
            );
            
            $organization->update(['slug' => $slug]);
        } else {
            // Если слаг был передан полностью (пользователь изменил его), проверяем уникальность
            $slug = $data['slug'];
            $uniqueSlug = TransliterationHelper::createUniqueSlug(
                $slug,
                'organizations',
                'slug',
                $organization->id
            );
            
            if ($uniqueSlug !== $slug) {
                $organization->update(['slug' => $uniqueSlug]);
            }
        }

        return redirect()->back()->with('success', 'Организация успешно создана');
    }

    public function update(UpdateOrganizationRequest $request, Organization $organization)
    {
        // Валидация логотипа только если это файл
        if ($request->hasFile('logo')) {
            $request->validate([
                'logo' => 'image|mimes:jpeg,png,jpg,gif,webp|max:10240', // 10MB
            ]);
        }

        // Обновляем данные организации
        $updateData = $request->only([
            'name',
            'slug',
            'description',
            'type',
            'status',
            'address',
            'phone',
            'email',
            'website',
            'region_id',
            'city_id',
            'founded_at',
            'is_public',
            'latitude',
            'longitude',
            'city_name'
        ]);

        // Обрабатываем логотип (может быть файлом или путем)
        if ($request->hasFile('logo')) {
            // Если это файл - обрабатываем через ImageProcessingService
            $imageService = app(ImageProcessingService::class);
            $logoResult = $imageService->processOrganizationLogo($request->file('logo'));
            $updateData['logo'] = $logoResult['original'];
        } elseif ($request->has('logo') && is_string($request->input('logo'))) {
            // Если это строка (путь к файлу) - сохраняем как есть
            $updateData['logo'] = $request->input('logo');
        }

        // Преобразуем is_public в boolean
        $updateData['is_public'] = $updateData['is_public'] === '1' || $updateData['is_public'] === true;

        // Преобразуем latitude и longitude в числа (если переданы)
        if (isset($updateData['latitude']) && $updateData['latitude'] !== null && $updateData['latitude'] !== '') {
            $updateData['latitude'] = (float) $updateData['latitude'];
        } else {
            $updateData['latitude'] = null;
        }
        if (isset($updateData['longitude']) && $updateData['longitude'] !== null && $updateData['longitude'] !== '') {
            $updateData['longitude'] = (float) $updateData['longitude'];
        } else {
            $updateData['longitude'] = null;
        }

        // Очищаем пустые строки для city_name
        if (isset($updateData['city_name']) && $updateData['city_name'] === '') {
            unset($updateData['city_name']);
        }

        $organization->update($updateData);

        // Обрабатываем галерею: сохраняем порядок существующих + добавляем новые
        $finalImages = [];
        $existingFromRequest = $request->input('existing_images', []);
        $hasExistingKey = $request->has('existing_images');

        if (is_array($existingFromRequest)) {
            $finalImages = array_map(function ($path) {
                return ltrim(str_replace('/storage/', '', $path), '/');
            }, $existingFromRequest);
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $finalImages[] = $image->store('organizations/images', 'public');
            }
        }

        if ($hasExistingKey || $request->hasFile('images')) {
            $organization->update(['images' => $finalImages]);
        }

        // Сохраняем платежные настройки, если пришли из формы организации
        $paymentSettingsRaw = $request->input('payment_settings');
        if ($paymentSettingsRaw) {
            // Если пришло как JSON строка (из FormData) - парсим
            if (is_string($paymentSettingsRaw)) {
                $paymentSettings = json_decode($paymentSettingsRaw, true);
            } else {
                $paymentSettings = $paymentSettingsRaw;
            }

            if (is_array($paymentSettings)) {
                // Нормализация легаси ключей к единому формату
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

                app(OrganizationSettingsService::class)->updateSettings($organization, [
                    'payment_settings' => $paymentSettings,
                ]);
            }
        }

        // Обрабатываем назначение админа организации
        $this->handleAdminAssignment($organization, $request->input('admin_user_id'));

        // Редирект обратно на страницу редактирования с сообщением об успехе
        return redirect()->route('organizations.edit', $organization)->with('success', 'Организация успешно обновлена');
    }

    /**
     * Обработка назначения администратора организации
     */
    private function handleAdminAssignment(Organization $organization, ?int $adminUserId): void
    {
        // Получаем текущего админа
        $currentAdmin = $organization->adminUser();

        // Если админ не изменился, ничего не делаем
        if ($currentAdmin && $currentAdmin->id === $adminUserId) {
            return;
        }

        // Если есть старый админ, удаляем его из organization_users с ролью organization_admin для этой организации
        if ($currentAdmin) {
            // Удаляем только связь с этой организацией, сохраняя роль пользователя
            $organization->users()
                ->wherePivot('role', 'organization_admin')
                ->where('users.id', $currentAdmin->id)
                ->detach();
        }

        // Если указан новый админ
        if ($adminUserId) {
            $newAdmin = User::find($adminUserId);
            if ($newAdmin) {
                // Назначаем роль organization_admin, если её нет
                if (!$newAdmin->hasRole('organization_admin')) {
                    $newAdmin->assignRole('organization_admin');
                }

                // Добавляем пользователя в organization_users с ролью organization_admin
                $organization->users()->syncWithoutDetaching([
                    $newAdmin->id => [
                        'role' => 'organization_admin',
                        'status' => 'active',
                        'permissions' => null,
                        'joined_at' => now(),
                        'last_active_at' => now(),
                    ],
                ]);
            }
        }
    }

    public function destroy(Organization $organization)
    {
        $organization->delete();
        return redirect()->back()->with('success', 'Организация успешно удалена');
    }
}

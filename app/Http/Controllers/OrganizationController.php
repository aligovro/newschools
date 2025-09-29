<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use Illuminate\Http\Request;
use Inertia\Inertia;

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

    return Inertia::render('organizations/OrganizationManagementPage', [
      'organizations' => $organizations,
      'filters' => $request->only(['search', 'type', 'status', 'region_id', 'sort_by', 'sort_direction', 'per_page']),
      'terminology' => [
        'page_title' => __t('organizations_page_title'),
        'page_description' => __t('organizations_page_description'),
        'create_button' => __t('create_organization'),
        'total_count' => __t('total_organizations'),
        'no_organizations' => __t('no_organizations'),
      ],
    ]);
  }

  public function show(Organization $organization)
  {
    $organization->load(['domains', 'members', 'statistics']);

    return Inertia::render('organizations/OrganizationShowPage', [
      'organization' => $organization,
    ]);
  }

  public function edit(Organization $organization)
  {
    $organization->load(['region', 'city', 'settlement']);

    // Получаем справочные данные
    $referenceData = [
      'organizationTypes' => [
        ['value' => 'school', 'label' => 'Школа', 'description' => 'Общеобразовательное учреждение'],
        ['value' => 'university', 'label' => 'Университет', 'description' => 'Высшее учебное заведение'],
        ['value' => 'kindergarten', 'label' => 'Детский сад', 'description' => 'Дошкольное образовательное учреждение'],
        ['value' => 'other', 'label' => 'Другое', 'description' => 'Иной тип организации'],
      ],
      // Загружаем только первые 20 регионов для начальной загрузки
      'regions' => \App\Models\Region::select('id', 'name', 'code')->orderBy('name')->limit(20)->get(),
      'cities' => $organization->region ?
        \App\Models\City::where('region_id', $organization->region->id)->select('id', 'name', 'region_id')->orderBy('name')->get() :
        [],
      'settlements' => $organization->city ?
        \App\Models\Settlement::where('city_id', $organization->city->id)->select('id', 'name', 'city_id')->orderBy('name')->get() :
        [],
    ];

    return Inertia::render('organizations/OrganizationEditPage', [
      'organization' => $organization,
      'referenceData' => $referenceData,
    ]);
  }

  public function store(Request $request)
  {
    $request->validate([
      'name' => 'required|string|max:255',
      'description' => 'nullable|string',
      'type' => 'required|string|in:school,university,kindergarten,other',
      'status' => 'required|string|in:active,inactive,pending',
    ]);

    $organization = Organization::create($request->all());

    return redirect()->back()->with('success', 'Организация успешно создана');
  }

  public function update(Request $request, Organization $organization)
  {
    // Отладочная информация (без файлов)
    \Illuminate\Support\Facades\Log::info('Update request data:', $request->except(['logo']));
    \Illuminate\Support\Facades\Log::info('Request method: ' . $request->method());
    \Illuminate\Support\Facades\Log::info('Content type: ' . $request->header('Content-Type'));
    \Illuminate\Support\Facades\Log::info('Request input: ', $request->input());
    \Illuminate\Support\Facades\Log::info('Request files count: ' . count($request->allFiles()));
    if ($request->hasFile('logo')) {
      \Illuminate\Support\Facades\Log::info('Logo file: ' . $request->file('logo')->getClientOriginalName());
    }

    $request->validate([
      'name' => 'required|string|max:255',
      'slug' => 'nullable|string|max:255',
      'description' => 'nullable|string',
      'type' => 'required|string|in:school,university,kindergarten,other',
      'status' => 'required|string|in:active,inactive,pending',
      'address' => 'nullable|string',
      'phone' => 'nullable|string',
      'email' => 'nullable|email',
      'website' => 'nullable|url',
      'region_id' => 'nullable|exists:regions,id',
      'city_id' => 'nullable|exists:cities,id',
      'settlement_id' => 'nullable|exists:settlements,id',
      'founded_at' => 'nullable|date',
      'is_public' => 'boolean',
    ]);

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
      'settlement_id',
      'founded_at',
      'is_public'
    ]);

    // Обрабатываем логотип (может быть файлом или путем)
    if ($request->hasFile('logo')) {
      // Если это файл - обрабатываем через ImageProcessingService
      $imageService = app(\App\Services\ImageProcessingService::class);
      $logoResult = $imageService->processOrganizationLogo($request->file('logo'));
      $updateData['logo'] = $logoResult['original'];
    } elseif ($request->has('logo') && is_string($request->input('logo'))) {
      // Если это строка (путь к файлу) - сохраняем как есть
      $updateData['logo'] = $request->input('logo');
    }

    // Преобразуем is_public в boolean
    $updateData['is_public'] = $updateData['is_public'] === '1' || $updateData['is_public'] === true;

    $organization->update($updateData);

    return redirect()->route('organizations.index')->with('success', 'Организация успешно обновлена');
  }

  public function destroy(Organization $organization)
  {
    $organization->delete();
    return redirect()->back()->with('success', 'Организация успешно удалена');
  }
}

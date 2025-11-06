<?php

namespace App\Http\Controllers\Dashboard;

use App\Models\Organization;
use App\Models\User;
use App\Http\Resources\OrganizationResource;
use App\Support\InertiaResource;
use Illuminate\Http\Request;
use App\Http\Requests\Organization\StoreOrganizationRequest;
use App\Http\Requests\Organization\UpdateOrganizationRequest;
use App\Services\Organizations\OrganizationQueryService;
use App\Services\ReferenceDataService;
use App\Services\Organizations\OrganizationMediaService;
use App\Services\ImageProcessingService;
use App\Services\Payment\PaymentSettingsNormalizer;
use App\Services\Organizations\OrganizationSettingsService;
use App\Services\GlobalSettingsService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class OrganizationController extends Controller
{
  public function __construct(
    private OrganizationQueryService $queryService,
    private ReferenceDataService $referenceDataService,
    private OrganizationMediaService $mediaService,
    private ImageProcessingService $imageService,
    private PaymentSettingsNormalizer $paymentNormalizer,
    private OrganizationSettingsService $settingsService,
    private GlobalSettingsService $globalSettings
  ) {}

  public function index(Request $request)
  {
    $query = $this->queryService->getFilteredQuery($request);
    $organizations = $this->queryService->paginate($query, $request);

    $baseTerminology = $this->globalSettings->getTerminology();
    $terminology = array_merge($baseTerminology, [
      'page_title' => __t('organizations_page_title'),
      'page_description' => __t('organizations_page_description'),
      'create_button' => __t('create_organization'),
      'total_count' => __t('total_organizations'),
      'no_organizations' => __t('no_organizations'),
    ]);

    return Inertia::render('organizations/OrganizationManagementPage', [
      'organizations' => InertiaResource::paginate($organizations, OrganizationResource::class),
      'filters' => $this->queryService->getFilters($request),
      'terminology' => $terminology,
    ]);
  }

  public function show(Organization $organization)
  {
    $organization->load(['domains', 'members', 'statistics']);

    return Inertia::render('organizations/OrganizationShowPage', [
      'organization' => (new OrganizationResource($organization))->toArray(request()),
    ]);
  }

  public function edit(Organization $organization)
  {
    // Загружаем связи
    $organization->load(['region', 'city', 'settlement']);

    $referenceData = $this->referenceDataService->getReferenceDataForEdit($organization);
    $orgSettings = $this->settingsService->getSettings($organization);

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
    $organization = Organization::create($request->only([
      'name',
      'description',
      'type',
      'status',
    ]));

    return redirect()->back()->with('success', 'Организация успешно создана');
  }

  public function update(UpdateOrganizationRequest $request, Organization $organization)
  {
    // Получаем валидированные данные для обновления
    $updateData = $request->getUpdateData();

    // Обрабатываем логотип
    if ($request->hasFile('logo')) {
      $logoResult = $this->imageService->processOrganizationLogo($request->file('logo'));
      $updateData['logo'] = $logoResult['original'];
    } elseif ($request->has('logo') && is_string($request->input('logo'))) {
      $updateData['logo'] = $request->input('logo');
    }

    // Обновляем данные организации
    $organization->update($updateData);

    // Обрабатываем галерею изображений
    $existingImages = $request->input('existing_images', []);
    $newImages = $request->hasFile('images') ? $request->file('images') : [];

    if ($request->has('existing_images') || $request->hasFile('images')) {
      $finalImages = $this->mediaService->updateGallery($organization, $existingImages, $newImages);
      $organization->update(['images' => $finalImages]);
    }

    // Сохраняем платежные настройки
    $paymentSettings = $this->paymentNormalizer->parse($request->input('payment_settings'));
    if ($paymentSettings !== null) {
      $this->settingsService->updateSettings($organization, [
        'payment_settings' => $paymentSettings,
      ]);
    }

    // Обрабатываем назначение админа организации
    $this->handleAdminAssignment($organization, $request->input('admin_user_id'));

    return redirect()
      ->route('organizations.edit', $organization)
      ->with('success', 'Организация успешно обновлена');
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

<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\OrganizationStaff;
use App\Http\Requests\Organization\StoreOrganizationStaffRequest;
use App\Http\Requests\Organization\UpdateOrganizationStaffRequest;
use App\Http\Resources\OrganizationStaffResource;
use App\Services\ImageProcessingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class OrganizationStaffController extends Controller
{
  public function __construct(
    private ImageProcessingService $imageService
  ) {}

  /**
   * Display a listing of the resource.
   */
  public function index(Request $request, Organization $organization): JsonResponse|InertiaResponse
  {
    if ($request->wantsJson()) {
      $query = $organization->staff()->orderBy('position')->orderBy('last_name');

      if ($request->filled('position')) {
        $query->where('position', $request->position);
      }

      if ($request->boolean('exclude_director', true)) {
        $query->where('position', '!=', OrganizationStaff::POSITION_DIRECTOR);
      }

      $perPage = min($request->get('per_page', 15), 100);
      $staff = $query->paginate($perPage);

      return response()->json([
        'data' => OrganizationStaffResource::collection($staff->items()),
        'pagination' => [
          'current_page' => $staff->currentPage(),
          'last_page' => $staff->lastPage(),
          'per_page' => $staff->perPage(),
          'total' => $staff->total(),
        ],
      ]);
    }

    $organization->load(['region:id,name', 'director' => fn ($q) => $q->whereNull('deleted_at')]);
    $staff = $organization->staff()
      ->where('position', '!=', OrganizationStaff::POSITION_DIRECTOR)
      ->whereNull('deleted_at')
      ->orderBy('position')
      ->orderBy('last_name')
      ->paginate(15);

    return Inertia::render('dashboard/organizations/OrganizationStaffPage', [
      'organization' => [
        'id' => $organization->id,
        'name' => $organization->name,
        'type' => $organization->type,
        'status' => $organization->status,
        'region' => $organization->region ? ['name' => $organization->region->name] : null,
        'director' => $organization->director
          ? (new OrganizationStaffResource($organization->director))->resolve()
          : null,
      ],
      'initialStaff' => OrganizationStaffResource::collection($staff->items())->resolve(),
      'hasMore' => $staff->currentPage() < $staff->lastPage(),
    ]);
  }

  /**
   * Store a newly created resource in storage.
   */
  public function store(StoreOrganizationStaffRequest $request, Organization $organization)
  {
    $data = $request->only([
      'last_name',
      'first_name',
      'middle_name',
      'position',
      'address',
      'email',
    ]);

    // Обрабатываем фотографию
    if ($request->hasFile('photo')) {
      $photoPath = $request->file('photo')->store('organization-staff/photos', 'public');
      $data['photo'] = $photoPath;
    }

    $staff = $organization->staff()->create($data);

    return response()->json([
      'message' => 'Персонал успешно создан',
      'data' => new OrganizationStaffResource($staff),
    ], 201);
  }

  /**
   * Display the specified resource.
   */
  public function show(Organization $organization, OrganizationStaff $staff)
  {
    // Проверяем что персонал принадлежит организации
    if ($staff->organization_id !== $organization->id) {
      abort(404);
    }

    return response()->json([
      'data' => new OrganizationStaffResource($staff),
    ]);
  }

  /**
   * Update the specified resource in storage.
   */
  public function update(UpdateOrganizationStaffRequest $request, Organization $organization, OrganizationStaff $staff)
  {
    // Проверяем что персонал принадлежит организации
    if ($staff->organization_id !== $organization->id) {
      abort(404);
    }

    $data = $request->only([
      'last_name',
      'first_name',
      'middle_name',
      'position',
      'address',
      'email',
    ]);

    // Обрабатываем фотографию
    if ($request->hasFile('photo')) {
      // Удаляем старое фото
      if ($staff->photo && Storage::disk('public')->exists($staff->photo)) {
        Storage::disk('public')->delete($staff->photo);
      }
      $photoPath = $request->file('photo')->store('organization-staff/photos', 'public');
      $data['photo'] = $photoPath;
    }

    $staff->update($data);

    return response()->json([
      'message' => 'Персонал успешно обновлен',
      'data' => new OrganizationStaffResource($staff->fresh()),
    ]);
  }

  /**
   * Remove the specified resource from storage.
   */
  public function destroy(Organization $organization, OrganizationStaff $staff)
  {
    // Проверяем что персонал принадлежит организации
    if ($staff->organization_id !== $organization->id) {
      abort(404);
    }

    // Удаляем фотографию
    if ($staff->photo && Storage::disk('public')->exists($staff->photo)) {
      Storage::disk('public')->delete($staff->photo);
    }

    $staff->delete();

    return response()->json([
      'message' => 'Персонал успешно удален',
    ]);
  }

  /**
   * Check if organization has director
   */
  public function checkDirector(Organization $organization)
  {
    $director = $organization->director;

    if ($director) {
      return response()->json([
        'has_director' => true,
        'director' => new OrganizationStaffResource($director),
      ]);
    }

    return response()->json([
      'has_director' => false,
      'director' => null,
    ]);
  }
}

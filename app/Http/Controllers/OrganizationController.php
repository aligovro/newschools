<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrganizationController extends Controller
{
  public function index(Request $request)
  {
    $query = Organization::query();

    // Поиск
    if ($request->filled('search')) {
      $search = $request->search;
      $query->where(function ($q) use ($search) {
        $q->where('name', 'like', "%{$search}%")
          ->orWhere('description', 'like', "%{$search}%");
      });
    }

    // Фильтрация по типу
    if ($request->filled('type')) {
      $query->where('type', $request->type);
    }

    // Сортировка
    $sortBy = $request->get('sort_by', 'created_at');
    $sortDirection = $request->get('sort_direction', 'desc');
    $query->orderBy($sortBy, $sortDirection);

    // Пагинация
    $perPage = $request->get('per_page', 15);
    $organizations = $query->paginate($perPage);

    return Inertia::render('organizations/OrganizationManagementPage', [
      'organizations' => $organizations,
      'filters' => $request->only(['search', 'type', 'sort_by', 'sort_direction', 'per_page']),
    ]);
  }

  public function show(Organization $organization)
  {
    $organization->load(['domains', 'members', 'statistics']);

    return Inertia::render('organizations/OrganizationShowPage', [
      'organization' => $organization,
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
    $request->validate([
      'name' => 'required|string|max:255',
      'description' => 'nullable|string',
      'type' => 'required|string|in:school,university,kindergarten,other',
      'status' => 'required|string|in:active,inactive,pending',
    ]);

    $organization->update($request->all());

    return redirect()->back()->with('success', 'Организация успешно обновлена');
  }

  public function destroy(Organization $organization)
  {
    $organization->delete();
    return redirect()->back()->with('success', 'Организация успешно удалена');
  }
}

<?php

namespace App\Http\Controllers;

use App\Models\OrganizationDomain;
use App\Models\Organization;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SiteController extends Controller
{
  public function index(Request $request)
  {
    $query = OrganizationDomain::with(['organization']);

    // Поиск
    if ($request->filled('search')) {
      $search = $request->search;
      $query->where(function ($q) use ($search) {
        $q->where('domain', 'like', "%{$search}%")
          ->orWhereHas('organization', function ($orgQuery) use ($search) {
            $orgQuery->where('name', 'like', "%{$search}%");
          });
      });
    }

    // Фильтрация по статусу
    if ($request->filled('status')) {
      $query->where('status', $request->status);
    }

    // Сортировка
    $sortBy = $request->get('sort_by', 'created_at');
    $sortDirection = $request->get('sort_direction', 'desc');
    $query->orderBy($sortBy, $sortDirection);

    // Пагинация
    $perPage = $request->get('per_page', 15);
    $sites = $query->paginate($perPage);

    return Inertia::render('sites/SiteManagementPage', [
      'sites' => $sites,
      'filters' => $request->only(['search', 'status', 'sort_by', 'sort_direction', 'per_page']),
    ]);
  }

  public function show(OrganizationDomain $site)
  {
    $site->load(['organization']);

    return Inertia::render('sites/SiteShowPage', [
      'site' => $site,
    ]);
  }

  public function store(Request $request)
  {
    $request->validate([
      'organization_id' => 'required|exists:organizations,id',
      'domain' => 'required|string|max:255|unique:organization_domains',
      'status' => 'required|string|in:active,inactive,pending',
    ]);

    $site = OrganizationDomain::create($request->all());

    return redirect()->back()->with('success', 'Сайт успешно создан');
  }

  public function update(Request $request, OrganizationDomain $site)
  {
    $request->validate([
      'domain' => 'required|string|max:255|unique:organization_domains,domain,' . $site->id,
      'status' => 'required|string|in:active,inactive,pending',
    ]);

    $site->update($request->all());

    return redirect()->back()->with('success', 'Сайт успешно обновлен');
  }

  public function destroy(OrganizationDomain $site)
  {
    $site->delete();
    return redirect()->back()->with('success', 'Сайт успешно удален');
  }
}

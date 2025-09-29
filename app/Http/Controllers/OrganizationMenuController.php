<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\OrganizationMenu;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class OrganizationMenuController extends Controller
{
  /**
   * Display a listing of the resource.
   */
  public function index(Organization $organization): JsonResponse
  {
    $menus = $organization->menus()
      ->with(['items' => function ($query) {
        $query->whereNull('parent_id')->orderBy('sort_order');
      }])
      ->get();

    return response()->json([
      'menus' => $menus,
      'locations' => OrganizationMenu::getAvailableLocations()
    ]);
  }

  /**
   * Store a newly created resource in storage.
   */
  public function store(Request $request, Organization $organization): JsonResponse
  {
    $validated = $request->validate([
      'name' => 'required|string|max:255',
      'location' => ['required', Rule::in(array_keys(OrganizationMenu::getAvailableLocations()))],
      'is_active' => 'boolean',
      'css_classes' => 'array',
      'description' => 'nullable|string|max:1000',
    ]);

    $menu = $organization->menus()->create($validated);

    return response()->json([
      'message' => 'Меню успешно создано',
      'menu' => $menu->load('items')
    ], 201);
  }

  /**
   * Display the specified resource.
   */
  public function show(Organization $organization, OrganizationMenu $menu): JsonResponse
  {
    $menu->load(['items' => function ($query) {
      $query->whereNull('parent_id')
        ->with('children')
        ->orderBy('sort_order');
    }]);

    return response()->json([
      'menu' => $menu,
      'locations' => OrganizationMenu::getAvailableLocations()
    ]);
  }

  /**
   * Update the specified resource in storage.
   */
  public function update(Request $request, Organization $organization, OrganizationMenu $menu): JsonResponse
  {
    $validated = $request->validate([
      'name' => 'required|string|max:255',
      'location' => ['required', Rule::in(array_keys(OrganizationMenu::getAvailableLocations()))],
      'is_active' => 'boolean',
      'css_classes' => 'array',
      'description' => 'nullable|string|max:1000',
    ]);

    $menu->update($validated);

    return response()->json([
      'message' => 'Меню успешно обновлено',
      'menu' => $menu->load('items')
    ]);
  }

  /**
   * Remove the specified resource from storage.
   */
  public function destroy(Organization $organization, OrganizationMenu $menu): JsonResponse
  {
    $menu->delete();

    return response()->json([
      'message' => 'Меню успешно удалено'
    ]);
  }

  /**
   * Получить меню по локации
   */
  public function getByLocation(Organization $organization, string $location): JsonResponse
  {
    $menu = $organization->menusByLocation($location)
      ->with(['items' => function ($query) {
        $query->whereNull('parent_id')
          ->with('children')
          ->orderBy('sort_order');
      }])
      ->first();

    return response()->json([
      'menu' => $menu,
      'location' => $location
    ]);
  }

  /**
   * Активировать/деактивировать меню
   */
  public function toggle(Organization $organization, OrganizationMenu $menu): JsonResponse
  {
    $menu->update(['is_active' => !$menu->is_active]);

    return response()->json([
      'message' => $menu->is_active ? 'Меню активировано' : 'Меню деактивировано',
      'menu' => $menu
    ]);
  }
}

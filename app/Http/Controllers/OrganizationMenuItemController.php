<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\OrganizationMenu;
use App\Models\OrganizationMenuItem;
use App\Models\OrganizationPage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class OrganizationMenuItemController extends Controller
{
  /**
   * Display a listing of the resource.
   */
  public function index(Organization $organization, OrganizationMenu $menu): JsonResponse
  {
    $items = $menu->allItems()
      ->with(['page', 'children' => function ($query) {
        $query->orderBy('sort_order');
      }])
      ->whereNull('parent_id')
      ->orderBy('sort_order')
      ->get();

    return response()->json([
      'items' => $items,
      'pages' => $organization->publishedPages()->select('id', 'title', 'slug')->get(),
      'types' => OrganizationMenuItem::getAvailableTypes()
    ]);
  }

  /**
   * Store a newly created resource in storage.
   */
  public function store(Request $request, Organization $organization, OrganizationMenu $menu): JsonResponse
  {
    $validated = $request->validate([
      'title' => 'required|string|max:255',
      'url' => 'nullable|string|max:500',
      'route_name' => 'nullable|string|max:255',
      'page_id' => 'nullable|exists:organization_pages,id',
      'external_url' => 'nullable|url|max:500',
      'icon' => 'nullable|string|max:100',
      'css_classes' => 'array',
      'parent_id' => 'nullable|exists:organization_menu_items,id',
      'sort_order' => 'integer|min:0',
      'is_active' => 'boolean',
      'open_in_new_tab' => 'boolean',
      'description' => 'nullable|string|max:1000',
      'meta_data' => 'array',
    ]);

    // Проверяем, что хотя бы один тип ссылки указан
    $linkTypes = array_filter([
      $validated['url'] ? 'url' : null,
      $validated['route_name'] ? 'route' : null,
      $validated['page_id'] ? 'page' : null,
      $validated['external_url'] ? 'external' : null,
    ]);

    if (count($linkTypes) === 0) {
      return response()->json([
        'message' => 'Необходимо указать хотя бы один тип ссылки'
      ], 422);
    }

    if (count($linkTypes) > 1) {
      return response()->json([
        'message' => 'Можно указать только один тип ссылки'
      ], 422);
    }

    $validated['menu_id'] = $menu->id;
    $item = OrganizationMenuItem::create($validated);

    return response()->json([
      'message' => 'Элемент меню успешно создан',
      'item' => $item->load(['page', 'children'])
    ], 201);
  }

  /**
   * Display the specified resource.
   */
  public function show(Organization $organization, OrganizationMenu $menu, OrganizationMenuItem $item): JsonResponse
  {
    $item->load(['page', 'children', 'parent']);

    return response()->json([
      'item' => $item,
      'pages' => $organization->publishedPages()->select('id', 'title', 'slug')->get(),
      'types' => OrganizationMenuItem::getAvailableTypes()
    ]);
  }

  /**
   * Update the specified resource in storage.
   */
  public function update(Request $request, Organization $organization, OrganizationMenu $menu, OrganizationMenuItem $item): JsonResponse
  {
    $validated = $request->validate([
      'title' => 'required|string|max:255',
      'url' => 'nullable|string|max:500',
      'route_name' => 'nullable|string|max:255',
      'page_id' => 'nullable|exists:organization_pages,id',
      'external_url' => 'nullable|url|max:500',
      'icon' => 'nullable|string|max:100',
      'css_classes' => 'array',
      'parent_id' => 'nullable|exists:organization_menu_items,id',
      'sort_order' => 'integer|min:0',
      'is_active' => 'boolean',
      'open_in_new_tab' => 'boolean',
      'description' => 'nullable|string|max:1000',
      'meta_data' => 'array',
    ]);

    // Проверяем, что хотя бы один тип ссылки указан
    $linkTypes = array_filter([
      $validated['url'] ? 'url' : null,
      $validated['route_name'] ? 'route' : null,
      $validated['page_id'] ? 'page' : null,
      $validated['external_url'] ? 'external' : null,
    ]);

    if (count($linkTypes) === 0) {
      return response()->json([
        'message' => 'Необходимо указать хотя бы один тип ссылки'
      ], 422);
    }

    if (count($linkTypes) > 1) {
      return response()->json([
        'message' => 'Можно указать только один тип ссылки'
      ], 422);
    }

    $item->update($validated);

    return response()->json([
      'message' => 'Элемент меню успешно обновлен',
      'item' => $item->load(['page', 'children'])
    ]);
  }

  /**
   * Remove the specified resource from storage.
   */
  public function destroy(Organization $organization, OrganizationMenu $menu, OrganizationMenuItem $item): JsonResponse
  {
    $item->delete();

    return response()->json([
      'message' => 'Элемент меню успешно удален'
    ]);
  }

  /**
   * Обновить порядок элементов меню
   */
  public function updateOrder(Request $request, Organization $organization, OrganizationMenu $menu): JsonResponse
  {
    $validated = $request->validate([
      'items' => 'required|array',
      'items.*.id' => 'required|exists:organization_menu_items,id',
      'items.*.sort_order' => 'required|integer|min:0',
      'items.*.parent_id' => 'nullable|exists:organization_menu_items,id',
    ]);

    foreach ($validated['items'] as $itemData) {
      OrganizationMenuItem::where('id', $itemData['id'])
        ->where('menu_id', $menu->id)
        ->update([
          'sort_order' => $itemData['sort_order'],
          'parent_id' => $itemData['parent_id'] ?? null,
        ]);
    }

    return response()->json([
      'message' => 'Порядок элементов меню обновлен'
    ]);
  }

  /**
   * Активировать/деактивировать элемент меню
   */
  public function toggle(Organization $organization, OrganizationMenu $menu, OrganizationMenuItem $item): JsonResponse
  {
    $item->update(['is_active' => !$item->is_active]);

    return response()->json([
      'message' => $item->is_active ? 'Элемент меню активирован' : 'Элемент меню деактивирован',
      'item' => $item
    ]);
  }
}

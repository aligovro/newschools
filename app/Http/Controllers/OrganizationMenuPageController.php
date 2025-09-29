<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrganizationMenuPageController extends Controller
{
  /**
   * Показать страницу управления меню организации
   */
  public function index(Organization $organization)
  {
    $menus = $organization->menus()
      ->with(['items' => function ($query) {
        $query->whereNull('parent_id')
          ->with('children')
          ->orderBy('sort_order');
      }])
      ->get();

    $pages = $organization->publishedPages()
      ->select('id', 'title', 'slug')
      ->get();

    return Inertia::render('OrganizationMenuPage', [
      'organization' => $organization,
      'menus' => $menus,
      'locations' => \App\Models\OrganizationMenu::getAvailableLocations(),
      'pages' => $pages,
      'types' => \App\Models\OrganizationMenuItem::getAvailableTypes(),
    ]);
  }
}

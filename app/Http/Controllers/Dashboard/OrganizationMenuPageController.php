<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;

use App\Models\Organization;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\OrganizationMenuResource;
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
            'organization' => (new OrganizationResource($organization))->toArray(request()),
            'menus' => OrganizationMenuResource::collection($menus)->toArray(request()),
            'pages' => $pages,
        ]);
    }
}

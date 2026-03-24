<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\FederalDistrict;
use App\Models\Region;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GeoRegionsController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Region::with('federalDistrict')->withCount('localities');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('capital', 'like', "%{$search}%");
            });
        }

        if ($request->filled('federal_district_id')) {
            $query->where('federal_district_id', $request->federal_district_id);
        }

        if ($request->filled('is_active') && $request->is_active !== '') {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $allowedSort = ['name', 'code', 'capital', 'population', 'is_active', 'created_at'];
        $sortBy  = in_array($request->get('sort_by'), $allowedSort, true) ? $request->get('sort_by') : 'name';
        $sortDir = $request->get('sort_direction', 'asc') === 'desc' ? 'desc' : 'asc';
        $query->orderBy($sortBy, $sortDir);

        $perPage = min((int) $request->get('per_page', 50), 100);
        $regions = $query->paginate($perPage)->withQueryString();

        $federalDistricts = FederalDistrict::orderBy('name')->get(['id', 'name', 'code']);

        return Inertia::render('dashboard/admin/GeoRegionsPage', [
            'regions' => $regions->through(fn (Region $r) => [
                'id'                  => $r->id,
                'federal_district_id' => $r->federal_district_id,
                'federal_district'    => $r->federalDistrict
                    ? ['id' => $r->federalDistrict->id, 'name' => $r->federalDistrict->name]
                    : null,
                'name'                => $r->name,
                'slug'                => $r->slug,
                'code'                => $r->code,
                'capital'             => $r->capital,
                'latitude'            => $r->latitude,
                'longitude'           => $r->longitude,
                'population'          => $r->population,
                'timezone'            => $r->timezone,
                'type'                => $r->type,
                'is_active'           => $r->is_active,
                'flag_image'          => $r->flag_image,
                'flag_image_url'      => $r->flag_image_url,
                'localities_count'    => $r->localities_count,
            ]),
            'federalDistricts' => $federalDistricts,
            'filters'          => $request->only([
                'search', 'federal_district_id', 'is_active',
                'sort_by', 'sort_direction', 'per_page',
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'federal_district_id' => 'required|exists:federal_districts,id',
            'name'                => 'required|string|max:255',
            'code'                => 'required|string|max:10|unique:regions,code',
            'capital'             => 'required|string|max:255',
            'latitude'            => 'nullable|numeric|between:-90,90',
            'longitude'           => 'nullable|numeric|between:-180,180',
            'population'          => 'nullable|integer|min:0',
            'timezone'            => 'nullable|string|max:50',
            'type'                => 'nullable|in:region,republic,krai,oblast,autonomous_okrug,autonomous_oblast,federal_city',
            'flag_image'          => 'nullable|string|max:500',
            'is_active'           => 'boolean',
        ]);

        $slugBase = Str::slug($validated['name']);
        $slug = $slugBase;
        $i = 1;
        while (Region::where('slug', $slug)->exists()) {
            $slug = $slugBase . '-' . $i++;
        }
        $validated['slug'] = $slug;

        Region::create($validated);

        return redirect()->back()->with('success', 'Регион успешно создан');
    }

    public function update(Request $request, Region $region): RedirectResponse
    {
        $validated = $request->validate([
            'federal_district_id' => 'sometimes|required|exists:federal_districts,id',
            'name'                => 'sometimes|required|string|max:255',
            'code'                => ['sometimes', 'required', 'string', 'max:10',
                Rule::unique('regions', 'code')->ignore($region->id)],
            'capital'             => 'sometimes|required|string|max:255',
            'latitude'            => 'nullable|numeric|between:-90,90',
            'longitude'           => 'nullable|numeric|between:-180,180',
            'population'          => 'nullable|integer|min:0',
            'timezone'            => 'nullable|string|max:50',
            'type'                => 'nullable|in:region,republic,krai,oblast,autonomous_okrug,autonomous_oblast,federal_city',
            'flag_image'          => 'nullable|string|max:500',
            'is_active'           => 'nullable|boolean',
        ]);

        // Удаляем старый флаг если заменяется на новый
        if (array_key_exists('flag_image', $validated)
            && $validated['flag_image'] !== $region->flag_image
            && $region->flag_image
        ) {
            Storage::disk('public')->delete($region->flag_image);
        }

        $region->update($validated);

        return redirect()->back()->with('success', 'Регион успешно обновлён');
    }

    public function destroy(Region $region): RedirectResponse
    {
        if ($region->localities()->exists()) {
            return redirect()->back()->with('error', 'Невозможно удалить регион: у него есть населённые пункты');
        }

        if ($region->flag_image) {
            Storage::disk('public')->delete($region->flag_image);
        }

        $region->delete();

        return redirect()->back()->with('success', 'Регион успешно удалён');
    }

    public function toggleActive(Region $region): RedirectResponse
    {
        $region->update(['is_active' => !$region->is_active]);

        return redirect()->back()->with('success', 'Статус активности обновлён');
    }
}

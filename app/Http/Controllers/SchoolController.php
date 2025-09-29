<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\Region;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;

class SchoolController extends Controller
{
  /**
   * Display a listing of schools.
   */
  public function index(Request $request): View|JsonResponse
  {
    $query = School::with(['region', 'primaryDomain'])
      ->active()
      ->public();

    // Фильтрация
    if ($request->filled('region')) {
      $query->byRegion($request->region);
    }

    if ($request->filled('city')) {
      $query->byCity($request->city);
    }

    if ($request->filled('type')) {
      $query->byType($request->type);
    }

    if ($request->filled('search')) {
      $search = $request->search;
      $query->where(function ($q) use ($search) {
        $q->where('name', 'like', "%{$search}%")
          ->orWhere('description', 'like', "%{$search}%")
          ->orWhere('city', 'like', "%{$search}%");
      });
    }

    // Сортировка
    $sortBy = $request->get('sort', 'name');
    $sortDirection = $request->get('direction', 'asc');

    switch ($sortBy) {
      case 'donations':
        $query->withSum('donations', 'amount')
          ->orderBy('donations_sum_amount', $sortDirection);
        break;
      case 'projects':
        $query->withCount('projects')
          ->orderBy('projects_count', $sortDirection);
        break;
      default:
        $query->orderBy($sortBy, $sortDirection);
    }

    $schools = $query->paginate(12);

    if ($request->expectsJson()) {
      return response()->json($schools);
    }

    $regions = Region::active()->orderBy('name')->get();

    return view('schools.index', compact('schools', 'regions'));
  }

  /**
   * Show the form for creating a new school.
   */
  public function create(): View
  {
    $regions = Region::active()->orderBy('name')->get();
    return view('schools.create', compact('regions'));
  }

  /**
   * Store a newly created school.
   */
  public function store(Request $request): RedirectResponse|JsonResponse
  {
    $validated = $request->validate([
      'name' => 'required|string|max:255',
      'description' => 'nullable|string',
      'address' => 'nullable|string|max:255',
      'phone' => 'nullable|string|max:20',
      'email' => 'nullable|email|max:255',
      'website' => 'nullable|url|max:255',
      'region_id' => 'nullable|exists:regions,id',
      'city' => 'nullable|string|max:100',
      'latitude' => 'nullable|numeric|between:-90,90',
      'longitude' => 'nullable|numeric|between:-180,180',
      'type' => 'required|in:school,gymnasium,lyceum,college',
      'founded_at' => 'nullable|date|before:today',
      'images' => 'nullable|array',
      'images.*' => 'image|max:2048',
      'contacts' => 'nullable|array',
    ]);

    $school = School::create($validated);

    // Обработка загрузки изображений
    if ($request->hasFile('images')) {
      $images = [];
      foreach ($request->file('images') as $image) {
        $path = $image->store('schools/images', 'public');
        $images[] = $path;
      }
      $school->update(['images' => $images]);
    }

    if ($request->expectsJson()) {
      return response()->json($school->load(['region', 'primaryDomain']), 201);
    }

    return redirect()->route('schools.show', $school)
      ->with('success', 'Школа успешно создана');
  }

  /**
   * Display the specified school.
   */
  public function show(School $school): View|JsonResponse
  {
    $school->load([
      'region',
      'domains',
      'projects' => function ($query) {
        $query->active()->latest()->take(6);
      },
      'alumni' => function ($query) {
        $query->where('is_public', true)->featured()->take(6);
      },
      'news' => function ($query) {
        $query->where('status', 'published')->latest()->take(6);
      },
      'donations' => function ($query) {
        $query->completed()->latest()->take(10);
      }
    ]);

    if (request()->expectsJson()) {
      return response()->json($school);
    }

    return view('schools.show', compact('school'));
  }

  /**
   * Show the form for editing the specified school.
   */
  public function edit(School $school): View
  {
    $regions = Region::active()->orderBy('name')->get();
    return view('schools.edit', compact('school', 'regions'));
  }

  /**
   * Update the specified school.
   */
  public function update(Request $request, School $school): RedirectResponse|JsonResponse
  {
    $validated = $request->validate([
      'name' => 'required|string|max:255',
      'description' => 'nullable|string',
      'address' => 'nullable|string|max:255',
      'phone' => 'nullable|string|max:20',
      'email' => 'nullable|email|max:255',
      'website' => 'nullable|url|max:255',
      'region_id' => 'nullable|exists:regions,id',
      'city' => 'nullable|string|max:100',
      'latitude' => 'nullable|numeric|between:-90,90',
      'longitude' => 'nullable|numeric|between:-180,180',
      'type' => 'required|in:school,gymnasium,lyceum,college',
      'status' => 'required|in:active,inactive,pending',
      'is_public' => 'boolean',
      'founded_at' => 'nullable|date|before:today',
      'images' => 'nullable|array',
      'images.*' => 'image|max:2048',
      'contacts' => 'nullable|array',
    ]);

    $school->update($validated);

    // Обработка загрузки новых изображений
    if ($request->hasFile('images')) {
      $existingImages = $school->images ?? [];
      $newImages = [];

      foreach ($request->file('images') as $image) {
        $path = $image->store('schools/images', 'public');
        $newImages[] = $path;
      }

      $school->update(['images' => array_merge($existingImages, $newImages)]);
    }

    if ($request->expectsJson()) {
      return response()->json($school->load(['region', 'primaryDomain']));
    }

    return redirect()->route('schools.show', $school)
      ->with('success', 'Школа успешно обновлена');
  }

  /**
   * Remove the specified school.
   */
  public function destroy(School $school): RedirectResponse|JsonResponse
  {
    $school->delete();

    if (request()->expectsJson()) {
      return response()->json(['message' => 'Школа успешно удалена']);
    }

    return redirect()->route('schools.index')
      ->with('success', 'Школа успешно удалена');
  }

  /**
   * Get school statistics.
   */
  public function statistics(School $school): JsonResponse
  {
    $statistics = [
      'total_donations' => $school->total_donations,
      'active_projects_count' => $school->active_projects_count,
      'alumni_count' => $school->alumni_count,
      'recent_donations' => $school->donations()
        ->completed()
        ->recent(30)
        ->sum('amount'),
      'projects_by_status' => $school->projects()
        ->selectRaw('status, COUNT(*) as count')
        ->groupBy('status')
        ->pluck('count', 'status'),
      'donations_by_month' => $school->donations()
        ->completed()
        ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(amount) as total')
        ->groupBy('month')
        ->orderBy('month')
        ->get(),
    ];

    return response()->json($statistics);
  }
}

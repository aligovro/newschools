<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\SchoolProject;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;

class SchoolProjectController extends Controller
{
  /**
   * Display a listing of school projects.
   */
  public function index(Request $request, School $school): View|JsonResponse
  {
    $query = $school->projects()->with(['media', 'donations']);

    // Фильтрация
    if ($request->filled('status')) {
      $query->byStatus($request->status);
    }

    if ($request->filled('category')) {
      $query->byCategory($request->category);
    }

    if ($request->filled('featured')) {
      $query->featured();
    }

    if ($request->filled('search')) {
      $search = $request->search;
      $query->where(function ($q) use ($search) {
        $q->where('title', 'like', "%{$search}%")
          ->orWhere('description', 'like', "%{$search}%");
      });
    }

    // Сортировка
    $sortBy = $request->get('sort', 'created_at');
    $sortDirection = $request->get('direction', 'desc');

    switch ($sortBy) {
      case 'collected':
        $query->orderBy('collected_amount', $sortDirection);
        break;
      case 'target':
        $query->orderBy('target_amount', $sortDirection);
        break;
      case 'progress':
        $query->orderByRaw('(collected_amount / NULLIF(target_amount, 0)) ' . $sortDirection);
        break;
      default:
        $query->orderBy($sortBy, $sortDirection);
    }

    $projects = $query->paginate(12);

    if ($request->expectsJson()) {
      return response()->json($projects);
    }

    return view('schools.projects.index', compact('school', 'projects'));
  }

  /**
   * Show the form for creating a new project.
   */
  public function create(School $school): View
  {
    return view('schools.projects.create', compact('school'));
  }

  /**
   * Store a newly created project.
   */
  public function store(Request $request, School $school): RedirectResponse|JsonResponse
  {
    $validated = $request->validate([
      'title' => 'required|string|max:255',
      'description' => 'required|string',
      'short_description' => 'nullable|string|max:500',
      'target_amount' => 'nullable|numeric|min:0',
      'category' => 'required|in:construction,equipment,sports,education,charity,events,other',
      'start_date' => 'nullable|date|after_or_equal:today',
      'end_date' => 'nullable|date|after:start_date',
      'tags' => 'nullable|array',
      'tags.*' => 'string|max:50',
      'beneficiaries' => 'nullable|array',
      'image' => 'nullable|image|max:2048',
      'gallery' => 'nullable|array',
      'gallery.*' => 'image|max:2048',
    ]);

    $validated['school_id'] = $school->id;
    $validated['status'] = 'draft';

    $project = SchoolProject::create($validated);

    // Обработка загрузки изображений
    if ($request->hasFile('image')) {
      $path = $request->file('image')->store('projects/images', 'public');
      $project->update(['image' => $path]);
    }

    if ($request->hasFile('gallery')) {
      $gallery = [];
      foreach ($request->file('gallery') as $image) {
        $path = $image->store('projects/gallery', 'public');
        $gallery[] = $path;
      }
      $project->update(['gallery' => $gallery]);
    }

    if ($request->expectsJson()) {
      return response()->json($project->load(['media', 'donations']), 201);
    }

    return redirect()->route('schools.projects.show', [$school, $project])
      ->with('success', 'Проект успешно создан');
  }

  /**
   * Display the specified project.
   */
  public function show(School $school, SchoolProject $project): View|JsonResponse
  {
    $project->load([
      'media',
      'donations' => function ($query) {
        $query->completed()->latest()->take(20);
      },
      'fundraisers' => function ($query) {
        $query->active();
      }
    ]);

    // Увеличиваем счетчик просмотров
    $project->increment('views_count');

    if (request()->expectsJson()) {
      return response()->json($project);
    }

    return view('schools.projects.show', compact('school', 'project'));
  }

  /**
   * Show the form for editing the specified project.
   */
  public function edit(School $school, SchoolProject $project): View
  {
    return view('schools.projects.edit', compact('school', 'project'));
  }

  /**
   * Update the specified project.
   */
  public function update(Request $request, School $school, SchoolProject $project): RedirectResponse|JsonResponse
  {
    $validated = $request->validate([
      'title' => 'required|string|max:255',
      'description' => 'required|string',
      'short_description' => 'nullable|string|max:500',
      'target_amount' => 'nullable|numeric|min:0',
      'category' => 'required|in:construction,equipment,sports,education,charity,events,other',
      'status' => 'required|in:draft,active,completed,cancelled,suspended',
      'featured' => 'boolean',
      'start_date' => 'nullable|date',
      'end_date' => 'nullable|date|after:start_date',
      'tags' => 'nullable|array',
      'tags.*' => 'string|max:50',
      'beneficiaries' => 'nullable|array',
      'image' => 'nullable|image|max:2048',
      'gallery' => 'nullable|array',
      'gallery.*' => 'image|max:2048',
    ]);

    $project->update($validated);

    // Обработка загрузки новых изображений
    if ($request->hasFile('image')) {
      $path = $request->file('image')->store('projects/images', 'public');
      $project->update(['image' => $path]);
    }

    if ($request->hasFile('gallery')) {
      $existingGallery = $project->gallery ?? [];
      $newGallery = [];

      foreach ($request->file('gallery') as $image) {
        $path = $image->store('projects/gallery', 'public');
        $newGallery[] = $path;
      }

      $project->update(['gallery' => array_merge($existingGallery, $newGallery)]);
    }

    if ($request->expectsJson()) {
      return response()->json($project->load(['media', 'donations']));
    }

    return redirect()->route('schools.projects.show', [$school, $project])
      ->with('success', 'Проект успешно обновлен');
  }

  /**
   * Remove the specified project.
   */
  public function destroy(School $school, SchoolProject $project): RedirectResponse|JsonResponse
  {
    $project->delete();

    if (request()->expectsJson()) {
      return response()->json(['message' => 'Проект успешно удален']);
    }

    return redirect()->route('schools.projects.index', $school)
      ->with('success', 'Проект успешно удален');
  }

  /**
   * Toggle featured status.
   */
  public function toggleFeatured(School $school, SchoolProject $project): JsonResponse
  {
    $project->update(['featured' => !$project->featured]);

    return response()->json([
      'featured' => $project->featured,
      'message' => $project->featured ? 'Проект добавлен в рекомендуемые' : 'Проект удален из рекомендуемых'
    ]);
  }

  /**
   * Get project statistics.
   */
  public function statistics(School $school, SchoolProject $project): JsonResponse
  {
    $statistics = [
      'total_donations' => $project->donations()->completed()->sum('amount'),
      'donations_count' => $project->donations()->completed()->count(),
      'progress_percentage' => $project->progress_percentage,
      'days_left' => $project->days_left,
      'recent_donations' => $project->donations()
        ->completed()
        ->recent(30)
        ->sum('amount'),
      'donations_by_month' => $project->donations()
        ->completed()
        ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(amount) as total')
        ->groupBy('month')
        ->orderBy('month')
        ->get(),
      'top_donors' => $project->donations()
        ->completed()
        ->public()
        ->selectRaw('donor_name, SUM(amount) as total')
        ->groupBy('donor_name')
        ->orderByDesc('total')
        ->limit(10)
        ->get(),
    ];

    return response()->json($statistics);
  }
}

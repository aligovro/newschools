<?php

namespace App\Http\Controllers;

use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Показать форму создания проекта
     */
    public function create(Organization $organization)
    {
        $categories = $organization->type_config['categories'] ?? [];

        return Inertia::render('projects/CreateProject', [
            'organization' => $organization->only(['id', 'name', 'slug', 'type_config']),
            'categories' => $categories,
        ]);
    }

    /**
     * Создать проект
     */
    public function store(StoreProjectRequest $request, Organization $organization)
    {

        try {
            $data = $request->except(['image', 'gallery', 'organization_id']);

            // Автоматически генерируем slug, если не указан
            if (empty($data['slug']) && !empty($data['title'])) {
                $data['slug'] = \Illuminate\Support\Str::slug($data['title']);
            }

            // Устанавливаем organization_id
            $data['organization_id'] = $organization->id;

            // Устанавливаем значения по умолчанию
            if (!isset($data['status'])) {
                $data['status'] = 'draft';
            }

            if (!isset($data['collected_amount'])) {
                $data['collected_amount'] = 0;
            }

            // Преобразуем target_amount в копейки
            // При создании с FormData данные приходят как строки в рублях
            if (isset($data['target_amount'])) {
                $amount = is_numeric($data['target_amount']) ? (float)$data['target_amount'] : 0;
                $data['target_amount'] = (int)($amount * 100);
            }

            // Нормализуем платежные настройки (если пришли)
            if (isset($data['payment_settings']) && is_array($data['payment_settings'])) {
                $payment = $data['payment_settings'];
                // Приведение типов
                if (array_key_exists('test_mode', $payment)) {
                    $payment['test_mode'] = filter_var($payment['test_mode'], FILTER_VALIDATE_BOOLEAN);
                }
                if (array_key_exists('donation_min_amount', $payment)) {
                    $payment['donation_min_amount'] = (int) $payment['donation_min_amount'];
                }
                if (array_key_exists('donation_max_amount', $payment)) {
                    $payment['donation_max_amount'] = (int) $payment['donation_max_amount'];
                }
                if (array_key_exists('currency', $payment) && is_string($payment['currency'])) {
                    $payment['currency'] = strtoupper(substr($payment['currency'], 0, 3));
                }
                $data['payment_settings'] = $payment;
            }

            // Создаем проект
            $project = Project::create($data);

            // Обрабатываем загрузку изображения
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('projects/images', 'public');
                $project->update(['image' => $imagePath]);
            }

            // Обрабатываем загрузку галереи
            if ($request->hasFile('gallery')) {
                $galleryPaths = [];
                foreach ($request->file('gallery') as $image) {
                    $galleryPaths[] = $image->store('projects/gallery', 'public');
                }
                $project->update(['gallery' => $galleryPaths]);
            }

            return redirect()->route('organizations.projects.index', $organization)
                ->with('success', 'Проект успешно создан');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Ошибка создания проекта: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Список всех проектов (для супер-админа)
     */
    public function all(Request $request)
    {
        // Оптимизация: используем eager loading
        $query = Project::select([
            'id',
            'organization_id',
            'title',
            'slug',
            'short_description',
            'category',
            'target_amount',
            'collected_amount',
            'status',
            'featured',
            'image',
            'views_count',
            'donations_count',
            'created_at',
            'updated_at'
        ])->with('organization:id,name,slug');

        // Фильтрация
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('featured')) {
            $query->where('featured', true);
        }

        if ($request->filled('organization_id')) {
            $query->where('organization_id', $request->organization_id);
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

        $perPage = $request->get('per_page', 12);
        $projects = $query->paginate($perPage);

        // Получаем список всех организаций для фильтра
        $organizations = Organization::select('id', 'name')->orderBy('name')->get();

        // Если запрос API, возвращаем JSON с ресурсами
        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'success' => true,
                'data' => ProjectResource::collection($projects->items()),
                'meta' => [
                    'current_page' => $projects->currentPage(),
                    'last_page' => $projects->lastPage(),
                    'per_page' => $projects->perPage(),
                    'total' => $projects->total(),
                ],
            ]);
        }

        return Inertia::render('projects/AllProjectsIndex', [
            'projects' => $projects,
            'organizations' => $organizations,
            'filters' => [
                'status' => $request->get('status'),
                'category' => $request->get('category'),
                'search' => $request->get('search'),
                'featured' => $request->get('featured'),
                'organization_id' => $request->get('organization_id'),
            ],
        ]);
    }

    /**
     * Показать список проектов организации
     */
    public function index(Request $request, Organization $organization)
    {
        // Оптимизация: используем eager loading для уменьшения количества запросов
        $query = $organization->projects()->select([
            'id',
            'organization_id',
            'title',
            'slug',
            'short_description',
            'category',
            'target_amount',
            'collected_amount',
            'status',
            'featured',
            'image',
            'views_count',
            'donations_count',
            'created_at',
            'updated_at'
        ]);

        // Фильтрация
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('featured')) {
            $query->where('featured', true);
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

        $perPage = $request->get('per_page', 12);
        $projects = $query->paginate($perPage);

        $categories = $organization->type_config['categories'] ?? [];

        // Если запрос API, возвращаем JSON с ресурсами
        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'success' => true,
                'data' => ProjectResource::collection($projects->items()),
                'meta' => [
                    'current_page' => $projects->currentPage(),
                    'last_page' => $projects->lastPage(),
                    'per_page' => $projects->perPage(),
                    'total' => $projects->total(),
                ],
            ]);
        }

        return Inertia::render('projects/ProjectsIndex', [
            'organization' => $organization->only(['id', 'name', 'slug', 'type_config']),
            'projects' => $projects,
            'categories' => $categories,
            'filters' => [
                'status' => $request->get('status'),
                'category' => $request->get('category'),
                'search' => $request->get('search'),
                'featured' => $request->get('featured'),
            ],
        ]);
    }

    /**
     * Показать проект
     */
    public function show(Organization $organization, Project $project)
    {
        // Оптимизация: загружаем только необходимые связанные данные
        $project->load([
            'organization:id,name,slug',
            'donations' => function ($query) {
                $query->select('id', 'project_id', 'amount', 'status', 'created_at')
                    ->latest()
                    ->limit(10);
            },
            'media' => function ($query) {
                $query->select('id', 'mediaable_id', 'type', 'file_path')
                    ->where('type', 'image');
            }
        ]);

        // Увеличиваем счетчик просмотров
        $project->increment('views_count');

        // Если запрос API, возвращаем JSON с ресурсом
        if (request()->expectsJson() || request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'data' => new ProjectResource($project),
            ]);
        }

        return Inertia::render('projects/ShowProject', [
            'organization' => $organization->only(['id', 'name', 'slug']),
            'project' => new ProjectResource($project),
        ]);
    }

    /**
     * Показать форму редактирования проекта
     */
    public function edit(Organization $organization, Project $project)
    {
        $categories = $organization->type_config['categories'] ?? [];

        return Inertia::render('projects/EditProject', [
            'organization' => $organization->only(['id', 'name', 'slug']),
            'project' => $project,
            'categories' => $categories,
        ]);
    }

    /**
     * Обновить проект
     */
    public function update(UpdateProjectRequest $request, Organization $organization, Project $project)
    {
        Log::info('Update request all data:', $request->all());

        try {
            $data = $request->except(['image', 'gallery', 'existing_gallery']);

            // Преобразуем target_amount в копейки, если изменился
            // При PUT запросе с FormData данные приходят как строки в рублях
            if (isset($data['target_amount'])) {
                $amount = is_numeric($data['target_amount']) ? (float)$data['target_amount'] : 0;
                $data['target_amount'] = (int)($amount * 100);
            }

            // Нормализуем платежные настройки и мерджим с существующими
            if ($request->has('payment_settings')) {
                $incoming = $request->input('payment_settings');
                if (is_array($incoming)) {
                    $payment = array_merge($project->payment_settings ?? [], $incoming);
                    if (array_key_exists('test_mode', $payment)) {
                        $payment['test_mode'] = filter_var($payment['test_mode'], FILTER_VALIDATE_BOOLEAN);
                    }
                    if (array_key_exists('donation_min_amount', $payment)) {
                        $payment['donation_min_amount'] = (int) $payment['donation_min_amount'];
                    }
                    if (array_key_exists('donation_max_amount', $payment)) {
                        $payment['donation_max_amount'] = (int) $payment['donation_max_amount'];
                    }
                    if (array_key_exists('currency', $payment) && is_string($payment['currency'])) {
                        $payment['currency'] = strtoupper(substr($payment['currency'], 0, 3));
                    }
                    $data['payment_settings'] = $payment;
                }
            }

            Log::info('Data to update:', $data);

            // Обновляем проект
            $project->update($data);

            // Обрабатываем загрузку нового изображения
            if ($request->hasFile('image')) {
                // Удаляем старое изображение
                if ($project->image && Storage::disk('public')->exists($project->image)) {
                    Storage::disk('public')->delete($project->image);
                }

                $imagePath = $request->file('image')->store('projects/images', 'public');
                $project->update(['image' => $imagePath]);
            }

            // Обновляем галерею: сохраняем порядок существующих + добавляем новые
            $finalGallery = [];
            $existingFromRequest = $request->input('existing_gallery', []);
            $hasExistingKey = $request->has('existing_gallery');

            if (is_array($existingFromRequest)) {
                $finalGallery = array_map(function ($path) {
                    return ltrim(str_replace('/storage/', '', $path), '/');
                }, $existingFromRequest);
            }

            if ($request->hasFile('gallery')) {
                foreach ($request->file('gallery') as $image) {
                    $finalGallery[] = $image->store('projects/gallery', 'public');
                }
            }

            // Если явно пришел ключ existing_gallery (даже пустой) или есть новые файлы — обновляем галерею
            if ($hasExistingKey || $request->hasFile('gallery')) {
                $project->update(['gallery' => $finalGallery]);
            }

            return redirect()->route('organizations.projects.index', $organization)
                ->with('success', 'Проект успешно обновлен');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Ошибка обновления проекта: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Удалить проект
     */
    public function destroy(Organization $organization, Project $project)
    {
        try {
            // Удаляем связанные файлы
            if ($project->image && Storage::disk('public')->exists($project->image)) {
                Storage::disk('public')->delete($project->image);
            }

            if ($project->gallery) {
                foreach ($project->gallery as $imagePath) {
                    if (Storage::disk('public')->exists($imagePath)) {
                        Storage::disk('public')->delete($imagePath);
                    }
                }
            }

            $project->delete();

            return redirect()->route('organizations.projects.index', $organization)
                ->with('success', 'Проект успешно удален');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Ошибка удаления проекта: ' . $e->getMessage());
        }
    }

    /**
     * Проверить доступность slug
     */
    public function checkSlug(Request $request): JsonResponse
    {
        $request->validate([
            'slug' => 'required|string|max:255|regex:/^[a-z0-9\-]+$/',
            'project_id' => 'nullable|exists:projects,id',
            'organization_id' => 'required|exists:organizations,id',
        ]);

        $query = Project::where('slug', $request->slug)
            ->where('organization_id', $request->organization_id);

        if ($request->filled('project_id')) {
            $query->where('id', '!=', $request->project_id);
        }

        $available = !$query->exists();

        return response()->json([
            'available' => $available,
            'message' => $available ? 'Slug доступен' : 'Slug уже используется'
        ]);
    }
}

<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;

use App\Models\SuggestedOrganization;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SuggestedOrganizationController extends Controller
{
    /**
     * Список предложенных школ
     */
    public function index(Request $request)
    {
        // Проверяем права доступа (только супер-админ)
        if (!Auth::user()->hasRole('super_admin')) {
            abort(403, 'Доступ запрещен');
        }

        $query = SuggestedOrganization::query()
            ->with(['city:id,name', 'reviewer:id,name,email'])
            ->select([
                'id',
                'name',
                'city_name',
                'city_id',
                'address',
                'latitude',
                'longitude',
                'status',
                'admin_notes',
                'reviewed_by',
                'reviewed_at',
                'created_at',
                'updated_at',
            ]);

        // Поиск
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('city_name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        // Фильтрация по статусу
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Сортировка
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        $allowedSortFields = ['name', 'created_at', 'updated_at', 'status'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Пагинация
        $perPage = min($request->get('per_page', 15), 100);
        $suggestedOrganizations = $query->paginate($perPage);

        return Inertia::render('suggested-schools/SuggestedOrganizationManagementPage', [
            'suggestedOrganizations' => [
                'data' => $suggestedOrganizations->items(),
                'current_page' => $suggestedOrganizations->currentPage(),
                'last_page' => $suggestedOrganizations->lastPage(),
                'per_page' => $suggestedOrganizations->perPage(),
                'total' => $suggestedOrganizations->total(),
            ],
            'filters' => $request->only(['search', 'status', 'sort_by', 'sort_direction', 'per_page']),
        ]);
    }

    /**
     * Обновление предложенной школы
     */
    public function update(Request $request, SuggestedOrganization $suggestedOrganization)
    {
        // Проверяем права доступа
        if (!Auth::user()->hasRole('super_admin')) {
            abort(403, 'Доступ запрещен');
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'city_id' => 'nullable|exists:cities,id',
            'city_name' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'status' => 'sometimes|required|in:pending,approved,rejected',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        try {
            // Если меняется статус, записываем кто и когда рассмотрел
            if (isset($validated['status']) && $validated['status'] !== $suggestedOrganization->status) {
                $validated['reviewed_by'] = Auth::id();
                $validated['reviewed_at'] = now();
            }

            $suggestedOrganization->update($validated);

            return redirect()->back()->with('success', 'Предложенная школа успешно обновлена');
        } catch (\Exception $e) {
            Log::error('Ошибка при обновлении предложенной школы', [
                'error' => $e->getMessage(),
                'suggested_organization_id' => $suggestedOrganization->id,
            ]);

            return redirect()->back()->with('error', 'Ошибка при обновлении предложенной школы');
        }
    }

    /**
     * Удаление предложенной школы
     */
    public function destroy(SuggestedOrganization $suggestedOrganization)
    {
        // Проверяем права доступа
        if (!Auth::user()->hasRole('super_admin')) {
            abort(403, 'Доступ запрещен');
        }

        try {
            $suggestedOrganization->delete();

            return redirect()->back()->with('success', 'Предложенная школа успешно удалена');
        } catch (\Exception $e) {
            Log::error('Ошибка при удалении предложенной школы', [
                'error' => $e->getMessage(),
                'suggested_organization_id' => $suggestedOrganization->id,
            ]);

            return redirect()->back()->with('error', 'Ошибка при удалении предложенной школы');
        }
    }
}

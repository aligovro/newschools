<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\OrganizationSlider;
use App\Models\OrganizationSliderSlide;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\OrganizationSliderResource;
use App\Support\InertiaResource;

class OrganizationSliderController extends Controller
{
  use AuthorizesRequests;
  public function index(Organization $organization)
  {
    $this->authorize('view', $organization);

    $sliders = $organization->sliders()
      ->with('slides')
      ->orderBy('sort_order')
      ->get();

    return Inertia::render('organization/admin/sliders/Index', [
      'organization' => (new OrganizationResource($organization))->toArray(request()),
      'sliders' => OrganizationSliderResource::collection($sliders)->toArray(request()),
      'sliderTypes' => config('sliders.types'),
      'positions' => config('sliders.positions'),
    ]);
  }

  public function create(Organization $organization)
  {
    $this->authorize('update', $organization);

    return Inertia::render('organization/admin/sliders/Create', [
      'organization' => (new OrganizationResource($organization))->toArray(request()),
      'sliderTypes' => config('sliders.types'),
      'positions' => config('sliders.positions'),
    ]);
  }

  public function store(Request $request, Organization $organization)
  {
    $this->authorize('update', $organization);

    $validated = $request->validate([
      'name' => 'required|string|max:255',
      'type' => ['required', Rule::in(array_keys(config('sliders.types')))],
      'position' => ['required', Rule::in(array_keys(config('sliders.positions')))],
      'settings' => 'nullable|array',
      'is_active' => 'boolean',
      'sort_order' => 'integer|min:0',
      'display_conditions' => 'nullable|array',
    ]);

    $slider = $organization->sliders()->create($validated);

    return redirect()
      ->route('organization.admin.sliders.edit', [$organization, $slider])
      ->with('success', 'Слайдер создан успешно');
  }

  public function edit(Organization $organization, OrganizationSlider $slider)
  {
    $this->authorize('update', $organization);

    $slider->load('slides');

    return Inertia::render('organization/admin/sliders/Edit', [
      'organization' => (new OrganizationResource($organization))->toArray(request()),
      'slider' => (new OrganizationSliderResource($slider))->toArray(request()),
      'sliderTypes' => config('sliders.types'),
      'positions' => config('sliders.positions'),
    ]);
  }

  public function update(Request $request, Organization $organization, OrganizationSlider $slider)
  {
    $this->authorize('update', $organization);

    $validated = $request->validate([
      'name' => 'required|string|max:255',
      'type' => ['required', Rule::in(array_keys(config('sliders.types')))],
      'position' => ['required', Rule::in(array_keys(config('sliders.positions')))],
      'settings' => 'nullable|array',
      'is_active' => 'boolean',
      'sort_order' => 'integer|min:0',
      'display_conditions' => 'nullable|array',
    ]);

    $slider->update($validated);

    return redirect()
      ->route('organization.admin.sliders.index', $organization)
      ->with('success', 'Слайдер обновлен успешно');
  }

  public function destroy(Organization $organization, OrganizationSlider $slider)
  {
    $this->authorize('update', $organization);

    $slider->delete();

    return redirect()
      ->route('organization.admin.sliders.index', $organization)
      ->with('success', 'Слайдер удален успешно');
  }

  public function reorder(Request $request, Organization $organization)
  {
    $this->authorize('update', $organization);

    $request->validate([
      'sliders' => 'required|array',
      'sliders.*.id' => 'required|exists:organization_sliders,id',
      'sliders.*.sort_order' => 'required|integer|min:0',
    ]);

    foreach ($request->sliders as $sliderData) {
      $slider = $organization->sliders()->find($sliderData['id']);
      if ($slider) {
        $slider->update(['sort_order' => $sliderData['sort_order']]);
      }
    }

    return response()->json(['success' => true]);
  }

  // Методы для слайдов
  public function storeSlide(Request $request, Organization $organization, OrganizationSlider $slider)
  {
    $this->authorize('update', $organization);

    $validated = $request->validate([
      'title' => 'nullable|string|max:255',
      'subtitle' => 'nullable|string|max:255',
      'description' => 'nullable|string',
      'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
      'background_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
      'button_text' => 'nullable|string|max:255',
      'button_url' => 'nullable|url',
      'button_style' => 'nullable|in:primary,secondary,outline',
      'content_type' => 'nullable|string',
      'content_data' => 'nullable|array',
      'is_active' => 'boolean',
      'sort_order' => 'integer|min:0',
      'display_from' => 'nullable|date',
      'display_until' => 'nullable|date|after:display_from',
    ]);

    // Обработка загрузки изображений
    if ($request->hasFile('image')) {
      $validated['image'] = $request->file('image')->store('sliders', 'public');
    }

    if ($request->hasFile('background_image')) {
      $validated['background_image'] = $request->file('background_image')->store('sliders', 'public');
    }

    $slide = $slider->slides()->create($validated);

    return response()->json([
      'success' => true,
      'slide' => $slide->load('slider')
    ]);
  }

  public function updateSlide(Request $request, Organization $organization, OrganizationSlider $slider, OrganizationSliderSlide $slide)
  {
    $this->authorize('update', $organization);

    $validated = $request->validate([
      'title' => 'nullable|string|max:255',
      'subtitle' => 'nullable|string|max:255',
      'description' => 'nullable|string',
      'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
      'background_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
      'button_text' => 'nullable|string|max:255',
      'button_url' => 'nullable|url',
      'button_style' => 'nullable|in:primary,secondary,outline',
      'content_type' => 'nullable|string',
      'content_data' => 'nullable|array',
      'is_active' => 'boolean',
      'sort_order' => 'integer|min:0',
      'display_from' => 'nullable|date',
      'display_until' => 'nullable|date|after:display_from',
    ]);

    // Обработка загрузки изображений
    if ($request->hasFile('image')) {
      // Удаляем старое изображение
      if ($slide->image) {
        Storage::disk('public')->delete($slide->image);
      }
      $validated['image'] = $request->file('image')->store('sliders', 'public');
    }

    if ($request->hasFile('background_image')) {
      // Удаляем старое изображение
      if ($slide->background_image) {
        Storage::disk('public')->delete($slide->background_image);
      }
      $validated['background_image'] = $request->file('background_image')->store('sliders', 'public');
    }

    $slide->update($validated);

    return response()->json([
      'success' => true,
      'slide' => $slide->load('slider')
    ]);
  }

  public function destroySlide(Organization $organization, OrganizationSlider $slider, OrganizationSliderSlide $slide)
  {
    $this->authorize('update', $organization);

    // Удаляем изображения
    if ($slide->image) {
      Storage::disk('public')->delete($slide->image);
    }
    if ($slide->background_image) {
      Storage::disk('public')->delete($slide->background_image);
    }

    $slide->delete();

    return response()->json(['success' => true]);
  }

  public function reorderSlides(Request $request, Organization $organization, OrganizationSlider $slider)
  {
    $this->authorize('update', $organization);

    $request->validate([
      'slides' => 'required|array',
      'slides.*.id' => 'required|exists:organization_slider_slides,id',
      'slides.*.sort_order' => 'required|integer|min:0',
    ]);

    foreach ($request->slides as $slideData) {
      $slide = $slider->slides()->find($slideData['id']);
      if ($slide) {
        $slide->update(['sort_order' => $slideData['sort_order']]);
      }
    }

    return response()->json(['success' => true]);
  }
}

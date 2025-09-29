<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\OrganizationSlider;
use App\Models\OrganizationSliderSlide;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SliderTest extends TestCase
{
  use RefreshDatabase;

  public function test_can_create_slider()
  {
    $user = User::factory()->create();
    $organization = Organization::factory()->create();

    $user->organizations()->attach($organization, ['role' => 'admin']);

    $this->actingAs($user);

    $response = $this->post(route('organization.admin.sliders.store', $organization), [
      'name' => 'Test Slider',
      'type' => 'hero',
      'position' => 'hero',
      'settings' => [
        'autoplay' => true,
        'autoplay_delay' => 5000,
      ],
      'is_active' => true,
      'sort_order' => 0,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('organization_sliders', [
      'name' => 'Test Slider',
      'type' => 'hero',
      'position' => 'hero',
      'organization_id' => $organization->id,
    ]);
  }

  public function test_can_create_slide()
  {
    $user = User::factory()->create();
    $organization = Organization::factory()->create();
    $slider = $organization->sliders()->create([
      'name' => 'Test Slider',
      'type' => 'hero',
      'position' => 'hero',
      'is_active' => true,
    ]);

    $user->organizations()->attach($organization, ['role' => 'admin']);

    $this->actingAs($user);

    $response = $this->post(route('organization.admin.sliders.store-slide', [$organization, $slider]), [
      'title' => 'Test Slide',
      'subtitle' => 'Test Subtitle',
      'description' => 'Test Description',
      'button_text' => 'Test Button',
      'button_url' => 'https://example.com',
      'button_style' => 'primary',
      'is_active' => true,
      'sort_order' => 0,
    ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('organization_slider_slides', [
      'title' => 'Test Slide',
      'subtitle' => 'Test Subtitle',
      'description' => 'Test Description',
      'slider_id' => $slider->id,
    ]);
  }

  public function test_can_view_sliders_index()
  {
    $user = User::factory()->create();
    $organization = Organization::factory()->create();

    $user->organizations()->attach($organization, ['role' => 'admin']);

    $this->actingAs($user);

    $response = $this->get(route('organization.admin.sliders.index', $organization));

    $response->assertStatus(200);
    $response->assertInertia(
      fn($page) => $page
        ->component('organization/admin/sliders/Index')
        ->has('organization')
        ->has('sliders')
    );
  }

  public function test_can_view_slider_edit()
  {
    $user = User::factory()->create();
    $organization = Organization::factory()->create();
    $slider = $organization->sliders()->create([
      'name' => 'Test Slider',
      'type' => 'hero',
      'position' => 'hero',
      'is_active' => true,
    ]);

    $user->organizations()->attach($organization, ['role' => 'admin']);

    $this->actingAs($user);

    $response = $this->get(route('organization.admin.sliders.edit', [$organization, $slider]));

    $response->assertStatus(200);
    $response->assertInertia(
      fn($page) => $page
        ->component('organization/admin/sliders/Edit')
        ->has('organization')
        ->has('slider')
    );
  }

  public function test_can_update_slider()
  {
    $user = User::factory()->create();
    $organization = Organization::factory()->create();
    $slider = $organization->sliders()->create([
      'name' => 'Test Slider',
      'type' => 'hero',
      'position' => 'hero',
      'is_active' => true,
    ]);

    $user->organizations()->attach($organization, ['role' => 'admin']);

    $this->actingAs($user);

    $response = $this->put(route('organization.admin.sliders.update', [$organization, $slider]), [
      'name' => 'Updated Slider',
      'type' => 'hero',
      'position' => 'hero',
      'settings' => [],
      'is_active' => true,
      'sort_order' => 0,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('organization_sliders', [
      'id' => $slider->id,
      'name' => 'Updated Slider',
    ]);
  }

  public function test_can_delete_slider()
  {
    $user = User::factory()->create();
    $organization = Organization::factory()->create();
    $slider = $organization->sliders()->create([
      'name' => 'Test Slider',
      'type' => 'hero',
      'position' => 'hero',
      'is_active' => true,
    ]);

    $user->organizations()->attach($organization, ['role' => 'admin']);

    $this->actingAs($user);

    $response = $this->delete(route('organization.admin.sliders.destroy', [$organization, $slider]));

    $response->assertRedirect();
    $this->assertSoftDeleted('organization_sliders', [
      'id' => $slider->id,
    ]);
  }
}

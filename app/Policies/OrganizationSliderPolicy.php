<?php

namespace App\Policies;

use App\Models\Organization;
use App\Models\OrganizationSlider;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class OrganizationSliderPolicy
{
  use HandlesAuthorization;

  /**
   * Determine whether the user can view any sliders.
   */
  public function viewAny(User $user, Organization $organization): bool
  {
    return $user->can('view', $organization);
  }

  /**
   * Determine whether the user can view the slider.
   */
  public function view(User $user, OrganizationSlider $slider, Organization $organization): bool
  {
    return $user->can('view', $organization);
  }

  /**
   * Determine whether the user can create sliders.
   */
  public function create(User $user, Organization $organization): bool
  {
    return $user->can('update', $organization);
  }

  /**
   * Determine whether the user can update the slider.
   */
  public function update(User $user, OrganizationSlider $slider, Organization $organization): bool
  {
    return $user->can('update', $organization);
  }

  /**
   * Determine whether the user can delete the slider.
   */
  public function delete(User $user, OrganizationSlider $slider, Organization $organization): bool
  {
    return $user->can('update', $organization);
  }

  /**
   * Determine whether the user can restore the slider.
   */
  public function restore(User $user, OrganizationSlider $slider, Organization $organization): bool
  {
    return $user->can('update', $organization);
  }

  /**
   * Determine whether the user can permanently delete the slider.
   */
  public function forceDelete(User $user, OrganizationSlider $slider, Organization $organization): bool
  {
    return $user->can('update', $organization);
  }
}

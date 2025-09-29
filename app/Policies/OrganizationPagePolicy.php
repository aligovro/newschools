<?php

namespace App\Policies;

use App\Models\Organization;
use App\Models\OrganizationPage;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class OrganizationPagePolicy
{
  use HandlesAuthorization;

  /**
   * Определить, может ли пользователь просматривать любые страницы организации
   */
  public function viewAny(User $user, Organization $organization): bool
  {
    return $user->canAccessOrganization($organization);
  }

  /**
   * Определить, может ли пользователь просматривать страницу
   */
  public function view(User $user, OrganizationPage $page, Organization $organization): bool
  {
    return $user->canAccessOrganization($organization);
  }

  /**
   * Определить, может ли пользователь создавать страницы
   */
  public function create(User $user, Organization $organization): bool
  {
    return $user->canAccessOrganization($organization) &&
      $user->hasPermissionInOrganization($organization, 'pages.create');
  }

  /**
   * Определить, может ли пользователь обновлять страницу
   */
  public function update(User $user, OrganizationPage $page, Organization $organization): bool
  {
    return $user->canAccessOrganization($organization) &&
      $user->hasPermissionInOrganization($organization, 'pages.update');
  }

  /**
   * Определить, может ли пользователь удалять страницу
   */
  public function delete(User $user, OrganizationPage $page, Organization $organization): bool
  {
    return $user->canAccessOrganization($organization) &&
      $user->hasPermissionInOrganization($organization, 'pages.delete');
  }

  /**
   * Определить, может ли пользователь публиковать страницы
   */
  public function publish(User $user, OrganizationPage $page, Organization $organization): bool
  {
    return $user->canAccessOrganization($organization) &&
      $user->hasPermissionInOrganization($organization, 'pages.publish');
  }

  /**
   * Определить, может ли пользователь управлять SEO страниц
   */
  public function manageSeo(User $user, OrganizationPage $page, Organization $organization): bool
  {
    return $user->canAccessOrganization($organization) &&
      $user->hasPermissionInOrganization($organization, 'pages.seo');
  }

  /**
   * Определить, может ли пользователь управлять структурой страниц
   */
  public function manageStructure(User $user, OrganizationPage $page, Organization $organization): bool
  {
    return $user->canAccessOrganization($organization) &&
      $user->hasPermissionInOrganization($organization, 'pages.structure');
  }
}

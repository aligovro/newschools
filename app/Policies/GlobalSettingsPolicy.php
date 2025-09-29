<?php

namespace App\Policies;

use App\Models\GlobalSettings;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class GlobalSettingsPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('super-admin');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, GlobalSettings $globalSettings): bool
    {
        return $user->hasRole('super-admin');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('super-admin');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, GlobalSettings $globalSettings): bool
    {
        return $user->hasRole('super-admin');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, GlobalSettings $globalSettings): bool
    {
        return false; // Запрещаем удаление глобальных настроек
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, GlobalSettings $globalSettings): bool
    {
        return $user->hasRole('super-admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, GlobalSettings $globalSettings): bool
    {
        return false; // Запрещаем полное удаление
    }

    /**
     * Determine whether the user can manage global settings.
     */
    public function manage(User $user): bool
    {
        return $user->hasRole('super-admin');
    }
}

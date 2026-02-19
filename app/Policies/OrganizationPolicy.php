<?php

namespace App\Policies;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class OrganizationPolicy
{
    use HandlesAuthorization;

    /**
     * Определить, может ли пользователь управлять организацией
     */
    public function manage(User $user, Organization $organization): bool
    {
        // Супер-администратор может управлять всеми организациями
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Проверяем, является ли пользователь владельцем организации
        if ($organization->user_id === $user->id) {
            return true;
        }

        // Проверяем, является ли пользователь администратором организации
        // Используем ту же логику, что и в OrganizationAdminMiddleware
        $isAdmin = $organization->users()
            ->where('user_id', $user->id)
            ->where('role', 'admin')
            ->exists();

        return $isAdmin;
    }
}

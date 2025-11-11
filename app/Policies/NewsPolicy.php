<?php

namespace App\Policies;

use App\Models\News;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class NewsPolicy
{
    use HandlesAuthorization;

    public function before(User $user, string $ability)
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->can('news.view') || $user->can('news.manage');
    }

    public function view(User $user, News $news): bool
    {
        if ($user->can('news.view') || $user->can('news.manage')) {
            return $user->belongsToOrganization($news->organization_id);
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->can('news.manage');
    }

    public function update(User $user, News $news): bool
    {
        if (!$user->can('news.manage')) {
            return false;
        }

        return $user->belongsToOrganization($news->organization_id);
    }

    public function delete(User $user, News $news): bool
    {
        if (!$user->can('news.manage')) {
            return false;
        }

        return $user->belongsToOrganization($news->organization_id);
    }
}


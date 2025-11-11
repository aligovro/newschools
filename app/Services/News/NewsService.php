<?php

namespace App\Services\News;

use App\Enums\NewsStatus;
use App\Models\News;
use App\Models\Organization;
use App\Models\Project;
use App\Models\Site;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class NewsService
{
    public function create(array $payload, ?array $newsable, User $user): News
    {
        return DB::transaction(function () use ($payload, $newsable, $user) {
            $isMainSite = (bool) ($payload['is_main_site'] ?? false);

            $organizationId = $this->resolveOrganizationId($payload['organization_id'] ?? null, $user, $isMainSite);
            $newsableData = $this->resolveNewsable($newsable, $organizationId, $isMainSite);

            unset($payload['organization_id'], $payload['is_main_site']);

            $news = new News($payload);
            $news->organization_id = $organizationId;

            if ($newsableData) {
                $news->newsable_type = $newsableData['type'];
                $news->newsable_id = $newsableData['id'];
            }

            if (empty($news->status)) {
                $news->status = NewsStatus::Draft;
            }

            $news->save();

            return $news->fresh(['organization', 'newsable']);
        });
    }

    public function update(News $news, array $payload, ?array $newsable, User $user): News
    {
        return DB::transaction(function () use ($news, $payload, $newsable, $user) {
            if (!$user->isSuperAdmin() && !$user->belongsToOrganization($news->organization_id)) {
                throw new AuthorizationException('Недостаточно прав для изменения записи.');
            }

            $isMainSite = array_key_exists('is_main_site', $payload)
                ? (bool) $payload['is_main_site']
                : ($news->organization_id === null);

            $newOrganizationId = array_key_exists('organization_id', $payload)
                ? $payload['organization_id']
                : $news->organization_id;

            $resolvedOrganizationId = $this->resolveOrganizationId($newOrganizationId, $user, $isMainSite);

            if (array_key_exists('is_main_site', $payload)) {
                unset($payload['is_main_site']);
            }

            if (array_key_exists('organization_id', $payload)) {
                unset($payload['organization_id']);
            }

            $news->organization_id = $resolvedOrganizationId;

            if ($newsable !== null) {
                if (empty($newsable)) {
                    $news->newsable_type = null;
                    $news->newsable_id = null;
                } else {
                    $newsableData = $this->resolveNewsable($newsable, $news->organization_id, $isMainSite);
                    $news->newsable_type = $newsableData['type'];
                    $news->newsable_id = $newsableData['id'];
                }
            }

            $news->fill($payload);
            $news->save();

            return $news->fresh(['organization', 'newsable']);
        });
    }

    public function delete(News $news, User $user): void
    {
        if (!$user->isSuperAdmin() && !$user->belongsToOrganization($news->organization_id)) {
            throw new AuthorizationException('Недостаточно прав для удаления записи.');
        }

        $news->delete();
    }

    private function resolveOrganizationId(?int $organizationId, User $user, bool $isMainSite): ?int
    {
        if ($isMainSite) {
            if (!$user->isSuperAdmin()) {
                throw new AuthorizationException('Только супер администратор может управлять материалами главного сайта.');
            }

            return null;
        }

        if ($user->isSuperAdmin()) {
            if (!$organizationId) {
                throw ValidationException::withMessages([
                    'organization_id' => 'Выберите организацию для материала.',
                ]);
            }

            $organization = Organization::find($organizationId);
            if (!$organization) {
                throw ValidationException::withMessages([
                    'organization_id' => 'Организация не найдена.',
                ]);
            }

            return $organization->id;
        }

        $availableOrganizations = $user->organizations()->pluck('organizations.id');

        if ($availableOrganizations->isEmpty()) {
            throw new AuthorizationException('Пользователь не привязан ни к одной организации.');
        }

        if ($organizationId) {
            if (!$availableOrganizations->contains($organizationId)) {
                throw new AuthorizationException('Нет доступа к выбранной организации.');
            }

            return $organizationId;
        }

        return (int) $availableOrganizations->first();
    }

    /**
     * @return array{type: class-string, id: int}|null
     */
    private function resolveNewsable(?array $newsable, ?int $organizationId, bool $isMainSite): ?array
    {
        if (!$newsable) {
            if ($isMainSite) {
                throw ValidationException::withMessages([
                    'target' => 'Необходимо выбрать главный сайт.',
                ]);
            }

            return null;
        }

        $type = $newsable['type'] ?? null;
        $id = $newsable['id'] ?? null;

        if (!$type || !$id) {
            throw ValidationException::withMessages([
                'target' => 'Необходимо выбрать сущность для привязки.',
            ]);
        }

        $model = match ($type) {
            Organization::class => Organization::find($id),
            Project::class => Project::find($id),
            Site::class => Site::find($id),
            default => null,
        };

        if (!$model) {
            throw ValidationException::withMessages([
                'target.id' => 'Выбранная сущность не найдена.',
            ]);
        }

        if ($isMainSite) {
            if (!$model instanceof Site || $model->site_type !== 'main') {
                throw ValidationException::withMessages([
                    'target.id' => 'Выберите главный сайт для привязки.',
                ]);
            }

            return [
                'type' => $type,
                'id' => (int) $model->getKey(),
            ];
        }

        if ($organizationId === null) {
            throw ValidationException::withMessages([
                'organization_id' => 'Укажите организацию для материала.',
            ]);
        }

        $modelOrganizationId = $model instanceof Organization
            ? $model->id
            : ($model->organization_id ?? null);

        if ($modelOrganizationId !== $organizationId) {
            throw ValidationException::withMessages([
                'target.id' => 'Сущность относится к другой организации.',
            ]);
        }

        return [
            'type' => $type,
            'id' => (int) $model->getKey(),
        ];
    }
}

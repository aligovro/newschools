<?php

namespace App\Services\Sponsors;

use App\Models\OrganizationUser;
use App\Models\Project;
use App\Models\ProjectSponsor;
use App\Models\User;
use App\Services\Auth\PhoneVerificationService;
use App\Services\CitySupportersService;
use Illuminate\Support\Facades\DB;

class ProjectSponsorshipManager
{
    public function __construct(
        private readonly PhoneVerificationService $phoneVerificationService
    ) {}

    public function attach(Project $project, User $user, array $attributes = []): ProjectSponsor
    {
        return DB::transaction(function () use ($project, $user, $attributes) {
            $this->phoneVerificationService->attachSponsorToOrganization(
                $user,
                $project->organization_id
            );

            /** @var OrganizationUser $organizationUser */
            $organizationUser = OrganizationUser::query()
                ->where('organization_id', $project->organization_id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            $projectSponsor = ProjectSponsor::query()->updateOrCreate(
                [
                    'project_id' => $project->id,
                    'organization_user_id' => $organizationUser->id,
                ],
                [
                    'status' => $attributes['status'] ?? 'active',
                    'source' => $attributes['source'] ?? 'manual',
                    'pledge_amount' => $attributes['pledge_amount'] ?? null,
                    'metadata' => $attributes['metadata'] ?? null,
                    'joined_at' => $attributes['joined_at'] ?? now(),
                ]
            );

            CitySupportersService::clearCacheForOrganization($project->organization_id);
            CitySupportersService::clearPublicCache();

            return $projectSponsor;
        });
    }
}

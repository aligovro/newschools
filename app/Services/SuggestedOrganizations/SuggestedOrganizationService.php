<?php

namespace App\Services\SuggestedOrganizations;

use App\Models\SuggestedOrganization;
use Illuminate\Support\Facades\Auth;

class SuggestedOrganizationService
{
    public function update(SuggestedOrganization $suggestedOrganization, array $payload): SuggestedOrganization
    {
        if (
            array_key_exists('status', $payload)
            && $payload['status'] !== null
            && $payload['status'] !== $suggestedOrganization->status
        ) {
            $payload['reviewed_by'] = Auth::id();
            $payload['reviewed_at'] = now();
        }

        $suggestedOrganization->fill($payload);
        $suggestedOrganization->save();

        return $suggestedOrganization->refresh()->loadMissing(['city:id,name', 'reviewer:id,name,email']);
    }

    public function delete(SuggestedOrganization $suggestedOrganization): void
    {
        $suggestedOrganization->delete();
    }
}



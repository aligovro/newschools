<?php

namespace App\BlagoqrMigrated;

use App\Models\Organization;
use Illuminate\Support\Facades\DB;

/**
 * Определяет, является ли организация перенесённой из blagoqr.
 * Используется для переключения на отдельную логику по выпускам/ролям и топам.
 */
final class BlagoqrMigratedOrgResolver
{
    public function isBlagoqrMigrated(Organization $organization): bool
    {
        return DB::table('blagoqr_import_site_mappings')
            ->where('organization_id', $organization->id)
            ->exists();
    }

    public function isBlagoqrMigratedById(int $organizationId): bool
    {
        return DB::table('blagoqr_import_site_mappings')
            ->where('organization_id', $organizationId)
            ->exists();
    }
}

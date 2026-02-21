<?php

namespace App\Migrated;

use App\Models\Organization;

/**
 * Определяет, является ли организация перенесённой из внешней системы (legacy migration).
 * Использует только колонку organizations.is_legacy_migrated, без обращения к промежуточным таблицам импорта.
 */
final class MigratedOrgResolver
{
    public function isLegacyMigrated(Organization $organization): bool
    {
        return (bool) $organization->is_legacy_migrated;
    }

    public function isLegacyMigratedById(int $organizationId): bool
    {
        return (bool) Organization::where('id', $organizationId)->value('is_legacy_migrated');
    }
}

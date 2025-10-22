<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    // Проверяем и исправляем внешние ключи только если они существуют
    $this->fixForeignKeyIfExists('domains', 'organization_domains_organization_id_foreign', 'organization_id', 'organizations', 'id');
    $this->fixForeignKeyIfExists('sites', 'organization_sites_domain_id_foreign', 'domain_id', 'domains', 'id');
    $this->fixForeignKeyIfExists('sites', 'organization_sites_organization_id_foreign', 'organization_id', 'organizations', 'id');
    $this->fixForeignKeyIfExists('site_pages', 'organization_site_pages_parent_id_foreign', 'parent_id', 'site_pages', 'id');
    $this->fixForeignKeyIfExists('site_pages', 'organization_site_pages_site_id_foreign', 'site_id', 'sites', 'id');

    // Добавляем недостающие индексы для site_page_seo (если их еще нет)
    $this->addIndexIfNotExists('site_page_seo', 'page_id', 'index');
    $this->addIndexIfNotExists('site_page_seo', 'page_id', 'unique');
  }

  private function fixForeignKeyIfExists($table, $oldConstraintName, $column, $referencedTable, $referencedColumn)
  {
    $constraints = DB::select("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?", [$table, $oldConstraintName]);

    if (!empty($constraints)) {
      DB::statement("ALTER TABLE {$table} DROP FOREIGN KEY {$oldConstraintName}");
      DB::statement("ALTER TABLE {$table} ADD CONSTRAINT {$table}_{$column}_foreign FOREIGN KEY ({$column}) REFERENCES {$referencedTable} ({$referencedColumn}) ON DELETE CASCADE");
    }
  }

  private function addIndexIfNotExists($table, $column, $type = 'index')
  {
    $indexName = $type === 'unique' ? "{$table}_{$column}_unique" : "{$table}_{$column}_index";
    $indexes = DB::select("SHOW INDEX FROM {$table} WHERE Key_name = ?", [$indexName]);

    if (empty($indexes)) {
      if ($type === 'unique') {
        DB::statement("ALTER TABLE {$table} ADD UNIQUE {$indexName} ({$column})");
      } else {
        DB::statement("ALTER TABLE {$table} ADD INDEX {$indexName} ({$column})");
      }
    }
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    // Удаляем добавленные индексы
    $this->dropIndexIfExists('site_page_seo', 'page_id', 'unique');
    $this->dropIndexIfExists('site_page_seo', 'page_id', 'index');

    // Восстанавливаем старые имена внешних ключей
    $this->restoreOldForeignKeyNames('site_pages', 'parent_id', 'organization_site_pages_parent_id_foreign');
    $this->restoreOldForeignKeyNames('site_pages', 'site_id', 'organization_site_pages_site_id_foreign');
    $this->restoreOldForeignKeyNames('sites', 'domain_id', 'organization_sites_domain_id_foreign');
    $this->restoreOldForeignKeyNames('sites', 'organization_id', 'organization_sites_organization_id_foreign');
    $this->restoreOldForeignKeyNames('domains', 'organization_id', 'organization_domains_organization_id_foreign');
  }

  private function dropIndexIfExists($table, $column, $type = 'index')
  {
    $indexName = $type === 'unique' ? "{$table}_{$column}_unique" : "{$table}_{$column}_index";
    $indexes = DB::select("SHOW INDEX FROM {$table} WHERE Key_name = ?", [$indexName]);

    if (!empty($indexes)) {
      if ($type === 'unique') {
        DB::statement("ALTER TABLE {$table} DROP INDEX {$indexName}");
      } else {
        DB::statement("ALTER TABLE {$table} DROP INDEX {$indexName}");
      }
    }
  }

  private function restoreOldForeignKeyNames($table, $column, $oldConstraintName)
  {
    $constraints = DB::select("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?", [$table, "{$table}_{$column}_foreign"]);

    if (!empty($constraints)) {
      DB::statement("ALTER TABLE {$table} DROP FOREIGN KEY {$table}_{$column}_foreign");
      DB::statement("ALTER TABLE {$table} ADD CONSTRAINT {$oldConstraintName} FOREIGN KEY ({$column}) REFERENCES {$this->getReferencedTable($table,$column)} ({$this->getReferencedColumn($table,$column)}) ON DELETE CASCADE");
    }
  }

  private function getReferencedTable($table, $column)
  {
    $mapping = [
      'domains' => ['organization_id' => 'organizations'],
      'sites' => ['domain_id' => 'domains', 'organization_id' => 'organizations'],
      'site_pages' => ['parent_id' => 'site_pages', 'site_id' => 'sites'],
    ];

    return $mapping[$table][$column] ?? 'organizations';
  }

  private function getReferencedColumn($table, $column)
  {
    return 'id';
  }
};

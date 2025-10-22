<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ClearSitesData extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'sites:clear-data {--force : Force the operation without confirmation}';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Clear all data from sites, site_pages, and site_widgets tables and reset their IDs';

  /**
   * Execute the console command.
   */
  public function handle()
  {
    if (!$this->option('force')) {
      if (!$this->confirm('This will permanently delete ALL data from sites, site_pages, and site_widgets tables. Are you sure?')) {
        $this->info('Operation cancelled.');
        return;
      }
    }

    $this->info('Starting data cleanup...');

    try {
      // Отключаем проверки внешних ключей
      DB::statement('SET FOREIGN_KEY_CHECKS=0;');

      // Очищаем таблицы в правильном порядке (сначала зависимые таблицы)
      $this->clearTable('site_widgets');
      $this->clearTable('site_pages');
      $this->clearTable('sites');

      // Сбрасываем AUTO_INCREMENT для всех таблиц
      $this->resetAutoIncrement('sites');
      $this->resetAutoIncrement('site_pages');
      $this->resetAutoIncrement('site_widgets');

      // Включаем обратно проверки внешних ключей
      DB::statement('SET FOREIGN_KEY_CHECKS=1;');

      $this->info('✅ Data cleanup completed successfully!');
      $this->info('All tables have been cleared and IDs reset.');
      $this->info('You can now create a main site with ID 1.');
    } catch (\Exception $e) {
      $this->error('❌ Error during cleanup: ' . $e->getMessage());
      return 1;
    }

    return 0;
  }

  /**
   * Clear all data from a table
   */
  private function clearTable(string $tableName): void
  {
    $this->info("Clearing table: {$tableName}");

    $count = DB::table($tableName)->count();
    if ($count > 0) {
      DB::table($tableName)->truncate();
      $this->info("  ✅ Cleared {$count} records from {$tableName}");
    } else {
      $this->info("  ℹ️  Table {$tableName} was already empty");
    }
  }

  /**
   * Reset AUTO_INCREMENT for a table
   */
  private function resetAutoIncrement(string $tableName): void
  {
    $this->info("Resetting AUTO_INCREMENT for: {$tableName}");

    try {
      DB::statement("ALTER TABLE {$tableName} AUTO_INCREMENT = 1");
      $this->info("  ✅ AUTO_INCREMENT reset for {$tableName}");
    } catch (\Exception $e) {
      $this->warn("  ⚠️  Could not reset AUTO_INCREMENT for {$tableName}: " . $e->getMessage());
    }
  }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    try {
      // Drop old unique index if exists
      Schema::table('widgets', function (Blueprint $table) {
        try {
          $table->dropUnique('widgets_slug_unique');
        } catch (\Throwable $e) {
        }
      });

      // Rename column slug -> widget_slug
      Schema::table('widgets', function (Blueprint $table) {
        if (Schema::hasColumn('widgets', 'slug') && !Schema::hasColumn('widgets', 'widget_slug')) {
          $table->renameColumn('slug', 'widget_slug');
        }
      });

      // Add unique index for widget_slug
      Schema::table('widgets', function (Blueprint $table) {
        try {
          $table->unique('widget_slug');
        } catch (\Throwable $e) {
        }
      });
    } catch (\Throwable $e) {
      // Ignore errors to keep migration idempotent
    }
  }

  public function down(): void
  {
    try {
      // Drop new unique index if exists
      Schema::table('widgets', function (Blueprint $table) {
        try {
          $table->dropUnique('widgets_widget_slug_unique');
        } catch (\Throwable $e) {
        }
      });

      // Rename column widget_slug -> slug
      Schema::table('widgets', function (Blueprint $table) {
        if (Schema::hasColumn('widgets', 'widget_slug') && !Schema::hasColumn('widgets', 'slug')) {
          $table->renameColumn('widget_slug', 'slug');
        }
      });

      // Restore unique index on slug
      Schema::table('widgets', function (Blueprint $table) {
        try {
          $table->unique('slug');
        } catch (\Throwable $e) {
        }
      });
    } catch (\Throwable $e) {
      // Ignore errors to keep migration idempotent
    }
  }
};

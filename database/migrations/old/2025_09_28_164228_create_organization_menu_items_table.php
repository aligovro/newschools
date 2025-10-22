<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    Schema::create('organization_menu_items', function (Blueprint $table) {
      $table->id();
      $table->foreignId('menu_id')->constrained('organization_menus')->onDelete('cascade');
      $table->foreignId('parent_id')->nullable()->constrained('organization_menu_items')->onDelete('cascade');
      $table->string('title');
      $table->string('url')->nullable();
      $table->string('route_name')->nullable();
      $table->foreignId('page_id')->nullable()->constrained('organization_pages')->onDelete('set null');
      $table->string('external_url')->nullable();
      $table->string('icon')->nullable();
      $table->json('css_classes')->nullable();
      $table->integer('sort_order')->default(0);
      $table->boolean('is_active')->default(true);
      $table->boolean('open_in_new_tab')->default(false);
      $table->text('description')->nullable();
      $table->json('meta_data')->nullable();
      $table->timestamps();

      $table->index(['menu_id', 'parent_id', 'sort_order']);
      $table->index(['menu_id', 'is_active']);
      $table->index(['parent_id', 'sort_order']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('organization_menu_items');
  }
};

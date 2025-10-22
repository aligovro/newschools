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
    Schema::create('organization_menus', function (Blueprint $table) {
      $table->id();
      $table->foreignId('organization_id')->constrained()->onDelete('cascade');
      $table->string('name');
      $table->enum('location', ['header', 'footer', 'sidebar', 'mobile'])->default('header');
      $table->boolean('is_active')->default(true);
      $table->json('css_classes')->nullable();
      $table->text('description')->nullable();
      $table->timestamps();

      $table->index(['organization_id', 'location']);
      $table->index(['organization_id', 'is_active']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('organization_menus');
  }
};

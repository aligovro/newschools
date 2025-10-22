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
    Schema::create('organization_sliders', function (Blueprint $table) {
      $table->id();
      $table->foreignId('organization_id')->constrained()->onDelete('cascade');
      $table->string('name');
      $table->string('type')->default('hero'); // hero, content, gallery, testimonials
      $table->json('settings')->nullable();
      $table->boolean('is_active')->default(true);
      $table->integer('sort_order')->default(0);
      $table->string('position')->default('hero'); // header, hero, content, sidebar, footer
      $table->json('display_conditions')->nullable();
      $table->timestamps();
      $table->softDeletes();

      $table->index(['organization_id', 'is_active', 'position']);
      $table->index(['organization_id', 'type']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('organization_sliders');
  }
};

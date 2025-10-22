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
    Schema::create('payment_methods', function (Blueprint $table) {
      $table->id();
      $table->string('name');
      $table->string('slug');
      $table->string('gateway')->nullable();
      $table->string('icon')->nullable();
      $table->text('description')->nullable();
      $table->json('settings')->nullable();
      $table->decimal('fee_percentage', 5, 2)->default(0.00);
      $table->integer('fee_fixed')->default(0);
      $table->integer('min_amount')->default(100);
      $table->integer('max_amount')->default(0);
      $table->boolean('is_active')->default(true);
      $table->boolean('is_test_mode')->default(false);
      $table->integer('sort_order')->default(0);
      $table->timestamps();

      // Индексы
      $table->index(['is_active', 'is_test_mode']);
      $table->index('is_active');
      $table->index('is_test_mode');
      $table->index('sort_order');
      $table->index('gateway');
      $table->unique('slug');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('payment_methods');
  }
};

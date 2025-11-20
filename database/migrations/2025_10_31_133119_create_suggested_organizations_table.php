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
    Schema::create('suggested_organizations', function (Blueprint $table) {
      $table->id();
      $table->string('name');
      $table->string('city_name')->nullable();
      $table->foreignId('locality_id')->nullable()->constrained('localities')->onDelete('set null');
      $table->string('address')->nullable();
      $table->decimal('latitude', 10, 8)->nullable();
      $table->decimal('longitude', 11, 8)->nullable();
      $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
      $table->text('admin_notes')->nullable();
      $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
      $table->timestamp('reviewed_at')->nullable();
      $table->timestamps();
      $table->softDeletes();

      // Индексы
      $table->index('status');
      $table->index('locality_id');
      $table->index('created_at');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('suggested_organizations');
  }
};

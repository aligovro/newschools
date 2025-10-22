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
    Schema::create('fundraisers', function (Blueprint $table) {
      $table->id();
      $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
      $table->foreignId('project_id')->nullable()->constrained('projects')->onDelete('set null');
      $table->string('title');
      $table->string('slug');
      $table->text('description');
      $table->text('short_description')->nullable();
      $table->string('image')->nullable();
      $table->json('gallery')->nullable();
      $table->bigInteger('target_amount');
      $table->bigInteger('collected_amount')->default(0);
      $table->enum('status', ['draft', 'active', 'completed', 'cancelled', 'suspended'])->default('draft');
      $table->enum('type', ['one_time', 'recurring', 'emergency'])->default('one_time');
      $table->enum('urgency', ['low', 'medium', 'high', 'critical'])->default('medium');
      $table->date('start_date')->nullable();
      $table->date('end_date')->nullable();
      $table->json('payment_methods')->nullable();
      $table->boolean('anonymous_donations')->default(true);
      $table->boolean('show_progress')->default(true);
      $table->boolean('show_donors')->default(true);
      $table->integer('min_donation')->default(100);
      $table->integer('max_donation')->nullable();
      $table->json('thank_you_message')->nullable();
      $table->json('seo_settings')->nullable();
      $table->softDeletes();
      $table->timestamps();

      // Индексы
      $table->index(['organization_id', 'status']);
      $table->index(['project_id', 'status']);
      $table->index(['status', 'type']);
      $table->index(['status', 'urgency']);
      $table->index(['status', 'created_at']);
      $table->index('status');
      $table->index('type');
      $table->index('urgency');
      $table->index('start_date');
      $table->index('end_date');
      $table->index('collected_amount');
      $table->unique('slug');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('fundraisers');
  }
};

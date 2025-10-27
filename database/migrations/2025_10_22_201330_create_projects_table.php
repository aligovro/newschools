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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->nullable()->constrained('organizations')->onDelete('set null');
            $table->string('title');
            $table->string('slug');
            $table->text('description');
            $table->text('short_description')->nullable();
            $table->string('image')->nullable();
            $table->json('gallery')->nullable();
            $table->bigInteger('target_amount')->nullable();
            $table->bigInteger('collected_amount')->default(0);
            $table->enum('status', ['draft', 'active', 'completed', 'cancelled', 'suspended'])->default('draft');
            $table->enum('category', ['construction', 'equipment', 'sports', 'education', 'charity', 'events', 'medical', 'social', 'environmental', 'other'])->default('other');
            $table->json('tags')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->json('beneficiaries')->nullable();
            $table->json('progress_updates')->nullable();
            $table->boolean('featured')->default(false);
            $table->integer('views_count')->default(0);
            $table->integer('donations_count')->default(0);
            $table->json('seo_settings')->nullable();
            $table->softDeletes();
            $table->timestamps();

            // Индексы
            $table->index(['organization_id', 'status']);
            $table->index(['status', 'featured']);
            $table->index(['category', 'status']);
            $table->index('status');
            $table->index('featured');
            $table->index('views_count');
            $table->index('donations_count');
            $table->unique('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};

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
        Schema::create('news', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
            $table->nullableMorphs('newsable');

            $table->string('title');
            $table->string('slug')->unique();
            $table->string('subtitle')->nullable();
            $table->string('excerpt', 500)->nullable();
            $table->longText('content')->nullable();

            $table->string('image')->nullable();
            $table->json('gallery')->nullable();

            $table->string('status', 32)->default('draft');
            $table->string('type', 32)->default('event');
            $table->string('visibility', 32)->default('public');
            $table->boolean('is_featured')->default(false);
            $table->json('tags')->nullable();

            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->string('timezone', 64)->nullable();

            $table->string('location_name')->nullable();
            $table->string('location_address')->nullable();
            $table->decimal('location_latitude', 10, 7)->nullable();
            $table->decimal('location_longitude', 10, 7)->nullable();

            $table->string('registration_url')->nullable();
            $table->boolean('registration_required')->default(false);

            $table->json('seo_settings')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamp('published_at')->nullable();
            $table->unsignedInteger('views_count')->default(0);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'status']);
            $table->index(['starts_at', 'ends_at']);
            $table->index(['visibility', 'is_featured']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('news');
    }
};

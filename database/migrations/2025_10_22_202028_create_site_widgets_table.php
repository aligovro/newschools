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
        Schema::create('site_widgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained('sites')->onDelete('cascade');
            $table->foreignId('widget_id')->constrained('widgets')->onDelete('cascade');
            $table->string('widget_slug', 100)->nullable();
            $table->foreignId('position_id')->nullable()->constrained('widget_positions')->onDelete('set null');
            $table->string('name');
            $table->string('position_name');
            $table->string('position_slug', 100)->nullable();
            $table->integer('sort_order')->default(0);
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_visible')->default(true);
            $table->string('wrapper_class')->nullable();
            $table->softDeletes();
            $table->timestamps();

            // Индексы
            $table->index(['site_id', 'is_active']);
            $table->index(['site_id', 'position_id']);
            $table->index(['widget_id', 'is_active']);
            $table->index(['position_id', 'sort_order']);
            $table->index(['position_id', 'order']);
            $table->index('is_active');
            $table->index('is_visible');
            $table->index('sort_order');
            $table->index('order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_widgets');
    }
};

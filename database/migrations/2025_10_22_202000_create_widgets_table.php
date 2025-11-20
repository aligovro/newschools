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
        Schema::create('widgets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('widget_slug');
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('category');
            $table->json('fields_config')->nullable();
            $table->json('settings_config')->nullable();
            $table->string('component_name')->nullable();
            $table->text('css_classes')->nullable();
            $table->text('js_script')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('allowed_site_types')->nullable()->comment('Типы сайтов, для которых доступен виджет: ["main"], ["organization"] или null для всех');
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            // Индексы
            $table->index(['category', 'is_active']);
            $table->index('is_active');
            $table->index('sort_order');
            $table->unique('widget_slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('widgets');
    }
};

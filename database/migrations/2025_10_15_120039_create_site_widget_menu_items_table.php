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
        Schema::create('site_widget_menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_widget_id')->constrained('site_widgets')->onDelete('cascade');
            $table->string('item_id', 100)->index();
            $table->string('title', 255);
            $table->string('url', 500);
            $table->enum('type', ['internal', 'external'])->default('internal');
            $table->boolean('open_in_new_tab')->default(false);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Индексы для быстрого поиска и сортировки
            $table->index(['site_widget_id', 'sort_order'], 'idx_widget_item_order');
            $table->index(['site_widget_id', 'is_active'], 'idx_widget_item_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_widget_menu_items');
    }
};

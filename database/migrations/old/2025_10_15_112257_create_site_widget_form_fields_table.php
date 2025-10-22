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
        Schema::create('site_widget_form_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_widget_id')->constrained('site_widgets')->onDelete('cascade');
            $table->string('field_name', 255);
            $table->enum('field_type', ['text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio'])->index();
            $table->string('field_label', 255)->nullable();
            $table->string('field_placeholder', 255)->nullable();
            $table->text('field_help_text')->nullable();
            $table->boolean('field_required')->default(false);
            $table->json('field_options')->nullable(); // для select, radio, checkbox
            $table->json('field_validation')->nullable(); // правила валидации
            $table->json('field_styling')->nullable(); // стили поля
            $table->integer('field_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Индексы для быстрого поиска и сортировки
            $table->index(['site_widget_id', 'field_order'], 'idx_field_order');
            $table->index(['site_widget_id', 'field_type'], 'idx_widget_field_type');
            $table->index('field_type', 'idx_field_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_widget_form_fields');
    }
};

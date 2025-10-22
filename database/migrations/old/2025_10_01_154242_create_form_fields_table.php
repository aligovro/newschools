<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('form_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_widget_id')->constrained('form_widgets')->onDelete('cascade');
            $table->string('name'); // Название поля (для идентификации)
            $table->string('label'); // Отображаемый лейбл
            $table->string('type'); // text, email, phone, textarea, select, radio, checkbox, file, etc.
            $table->text('placeholder')->nullable();
            $table->text('help_text')->nullable();
            $table->json('options')->nullable(); // Для select, radio, checkbox
            $table->json('validation')->nullable(); // Правила валидации
            $table->json('styling')->nullable(); // Стилизация поля
            $table->boolean('is_required')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_fields');
    }
};

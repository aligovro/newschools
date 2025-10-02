<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('form_widgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained('organization_sites')->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->json('settings')->nullable(); // Общие настройки формы
            $table->json('styling')->nullable(); // Стилизация формы
            $table->json('actions')->nullable(); // Настройки экшенов
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_widgets');
    }
};

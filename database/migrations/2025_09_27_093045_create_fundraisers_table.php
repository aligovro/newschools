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
      $table->foreignId('organization_id')->constrained()->onDelete('cascade');
      $table->foreignId('project_id')->nullable()->constrained('organization_projects')->onDelete('cascade'); // Связанный проект
      $table->string('title'); // Название сбора
      $table->string('slug')->unique(); // URL slug
      $table->text('description'); // Описание сбора
      $table->text('short_description')->nullable(); // Краткое описание
      $table->string('image')->nullable(); // Изображение сбора
      $table->json('gallery')->nullable(); // Галерея изображений
      $table->bigInteger('target_amount'); // Целевая сумма в копейках
      $table->bigInteger('collected_amount')->default(0); // Собранная сумма в копейках
      $table->enum('status', ['draft', 'active', 'completed', 'cancelled', 'suspended'])->default('draft');
      $table->enum('type', ['one_time', 'recurring', 'emergency'])->default('one_time'); // Тип сбора
      $table->enum('urgency', ['low', 'medium', 'high', 'critical'])->default('medium'); // Срочность
      $table->date('start_date')->nullable(); // Дата начала
      $table->date('end_date')->nullable(); // Дата окончания
      $table->json('payment_methods')->nullable(); // Доступные методы оплаты
      $table->boolean('anonymous_donations')->default(true); // Анонимные пожертвования
      $table->boolean('show_progress')->default(true); // Показывать прогресс
      $table->boolean('show_donors')->default(true); // Показывать доноров
      $table->integer('min_donation')->default(100); // Минимальная сумма пожертвования в копейках
      $table->integer('max_donation')->nullable(); // Максимальная сумма пожертвования в копейках
      $table->json('thank_you_message')->nullable(); // Сообщение благодарности
      $table->json('seo_settings')->nullable(); // SEO настройки
      $table->softDeletes(); // Soft delete
      $table->timestamps();

      // Индексы
      $table->index(['organization_id', 'status']);
      $table->index(['status', 'type']);
      $table->index(['start_date', 'end_date']);
      $table->index('created_at');
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

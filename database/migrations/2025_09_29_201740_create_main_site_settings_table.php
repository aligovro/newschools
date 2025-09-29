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
    Schema::create('main_site_settings', function (Blueprint $table) {
      $table->id();

      // Основные настройки сайта
      $table->string('site_name')->default('Платформа поддержки школ');
      $table->text('site_description')->nullable();
      $table->string('site_logo')->nullable();
      $table->string('site_favicon')->nullable();
      $table->string('site_theme')->default('default');
      $table->string('primary_color')->default('#3B82F6');
      $table->string('secondary_color')->default('#6B7280');
      $table->boolean('dark_mode')->default(false);

      // SEO настройки
      $table->string('meta_title')->nullable();
      $table->text('meta_description')->nullable();
      $table->text('meta_keywords')->nullable();
      $table->string('og_title')->nullable();
      $table->text('og_description')->nullable();
      $table->string('og_image')->nullable();
      $table->string('og_type')->default('website');
      $table->string('twitter_card')->default('summary_large_image');
      $table->string('twitter_title')->nullable();
      $table->text('twitter_description')->nullable();
      $table->string('twitter_image')->nullable();

      // Контактная информация
      $table->string('contact_email')->nullable();
      $table->string('contact_phone')->nullable();
      $table->text('contact_address')->nullable();
      $table->string('contact_telegram')->nullable();
      $table->string('contact_vk')->nullable();

      // Настройки социальных сетей
      $table->json('social_links')->nullable();

      // Настройки аналитики
      $table->string('google_analytics_id')->nullable();
      $table->string('yandex_metrika_id')->nullable();
      $table->text('custom_head_code')->nullable();
      $table->text('custom_body_code')->nullable();

      // Настройки платежей для главного сайта
      $table->json('payment_settings')->nullable();

      // Настройки уведомлений
      $table->json('notification_settings')->nullable();

      // Настройки интеграций
      $table->json('integration_settings')->nullable();

      // Метаданные
      $table->json('metadata')->nullable();
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('main_site_settings');
  }
};

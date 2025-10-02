<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('form_actions', function (Blueprint $table) {
      $table->id();
      $table->foreignId('form_widget_id')->constrained('form_widgets')->onDelete('cascade');
      $table->string('name');
      $table->string('type'); // email, webhook, database, telegram, etc.
      $table->json('config'); // Конфигурация экшена
      $table->boolean('is_active')->default(true);
      $table->integer('sort_order')->default(0);
      $table->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('form_actions');
  }
};

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
    Schema::create('members', function (Blueprint $table) {
      $table->id();
      $table->foreignId('organization_id')->constrained()->onDelete('cascade');
      $table->string('first_name'); // Имя
      $table->string('last_name'); // Фамилия
      $table->string('middle_name')->nullable(); // Отчество
      $table->string('photo')->nullable(); // Фото
      $table->integer('graduation_year')->nullable(); // Год выпуска (для школ)
      $table->string('class_letter')->nullable(); // Буква класса (для школ)
      $table->integer('class_number')->nullable(); // Номер класса (для школ)
      $table->string('profession')->nullable(); // Профессия
      $table->string('company')->nullable(); // Компания/место работы
      $table->string('position')->nullable(); // Должность
      $table->string('email')->nullable(); // Email
      $table->string('phone')->nullable(); // Телефон
      $table->json('social_links')->nullable(); // Социальные сети
      $table->text('biography')->nullable(); // Биография
      $table->text('achievements')->nullable(); // Достижения
      $table->enum('member_type', ['alumni', 'student', 'patient', 'beneficiary', 'volunteer', 'staff', 'other'])->default('other'); // Тип участника
      $table->boolean('is_featured')->default(false); // Известный участник
      $table->boolean('is_public')->default(true); // Публичный профиль
      $table->json('contact_permissions')->nullable(); // Разрешения на контакты
      $table->timestamp('last_contact_at')->nullable(); // Последний контакт
      $table->softDeletes(); // Soft delete
      $table->timestamps();

      // Индексы
      $table->index(['organization_id', 'member_type']);
      $table->index(['graduation_year', 'is_featured']);
      $table->index(['last_name', 'first_name']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('members');
  }
};

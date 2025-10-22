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
      $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
      $table->string('first_name');
      $table->string('last_name');
      $table->string('middle_name')->nullable();
      $table->string('photo')->nullable();
      $table->integer('graduation_year')->nullable();
      $table->string('class_letter')->nullable();
      $table->integer('class_number')->nullable();
      $table->string('profession')->nullable();
      $table->string('company')->nullable();
      $table->string('position')->nullable();
      $table->string('email')->nullable();
      $table->string('phone')->nullable();
      $table->json('social_links')->nullable();
      $table->text('biography')->nullable();
      $table->text('achievements')->nullable();
      $table->enum('member_type', ['alumni', 'student', 'patient', 'beneficiary', 'volunteer', 'staff', 'other'])->default('other');
      $table->boolean('is_featured')->default(false);
      $table->boolean('is_public')->default(true);
      $table->json('contact_permissions')->nullable();
      $table->timestamp('last_contact_at')->nullable();
      $table->softDeletes();
      $table->timestamps();

      // Индексы
      $table->index(['organization_id', 'member_type']);
      $table->index(['organization_id', 'is_public']);
      $table->index(['organization_id', 'is_featured']);
      $table->index(['member_type', 'is_public']);
      $table->index(['graduation_year', 'is_public']);
      $table->index('member_type');
      $table->index('is_featured');
      $table->index('is_public');
      $table->index('graduation_year');
      $table->index('email');
      $table->index('last_contact_at');
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

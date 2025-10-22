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
    Schema::create('organization_media', function (Blueprint $table) {
      $table->id();
      $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
      $table->string('mediaable_type');
      $table->unsignedBigInteger('mediaable_id');
      $table->string('filename');
      $table->string('original_name');
      $table->string('mime_type');
      $table->string('file_path');
      $table->string('file_url');
      $table->integer('file_size');
      $table->string('file_hash')->nullable();
      $table->enum('type', ['image', 'video', 'document', 'audio', 'archive'])->default('image');
      $table->json('metadata')->nullable();
      $table->string('alt_text')->nullable();
      $table->string('caption')->nullable();
      $table->text('description')->nullable();
      $table->integer('sort_order')->default(0);
      $table->boolean('is_public')->default(true);
      $table->timestamps();

      // Индексы
      $table->index(['organization_id', 'type']);
      $table->index(['mediaable_type', 'mediaable_id']);
      $table->index(['organization_id', 'is_public']);
      $table->index('type');
      $table->index('is_public');
      $table->index('sort_order');
      $table->index('file_hash');
      $table->index('created_at');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('organization_media');
  }
};

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
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->morphs('mediaable'); // Полиморфная связь (проект, новость, альбом и т.д.)
            $table->string('filename'); // Имя файла
            $table->string('original_name'); // Оригинальное имя файла
            $table->string('mime_type'); // MIME тип
            $table->string('file_path'); // Путь к файлу
            $table->string('file_url'); // URL файла
            $table->integer('file_size'); // Размер файла в байтах
            $table->string('file_hash')->nullable(); // Хеш файла для дедупликации
            $table->enum('type', ['image', 'video', 'document', 'audio', 'archive'])->default('image');
            $table->json('metadata')->nullable(); // Метаданные файла (размеры изображения, длительность видео и т.д.)
            $table->string('alt_text')->nullable(); // Alt текст для изображений
            $table->string('caption')->nullable(); // Подпись
            $table->text('description')->nullable(); // Описание
            $table->integer('sort_order')->default(0); // Порядок сортировки
            $table->boolean('is_public')->default(true); // Публичный файл
            $table->timestamps();
            
            // Индексы
            $table->index(['organization_id', 'type']);
            $table->index('file_hash');
            $table->index('sort_order');
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

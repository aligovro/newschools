<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    Schema::create('localities', function (Blueprint $table) {
      $table->id();
      $table->foreignId('region_id')->constrained('regions')->onDelete('cascade');

      // Базовые поля
      $table->string('name');
      $table->string('slug')->unique();

      // Тип населённого пункта (город, село и т.п.)
      // Тип населённого пункта.
      // Делаем простой и понятный набор, совместимый с текущими localities:
      // - city      — город
      // - town      — посёлок городского типа / городской посёлок
      // - village   — сёла, деревни
      // - settlement — прочие посёлки и мелкие населённые пункты
      $table->enum('type', [
        'city',
        'town',
        'village',
        'settlement',
      ])->default('city');

      // Доп. информация
      $table->string('code')->nullable();
      $table->enum('status', [
        'capital',
        'regional_center',
        'district_center',
        'ordinary',
      ])->default('ordinary');

      $table->decimal('latitude', 10, 8)->nullable();
      $table->decimal('longitude', 11, 8)->nullable();
      $table->integer('population')->nullable();
      $table->decimal('area', 10, 2)->nullable();
      $table->integer('founded_year')->nullable();
      $table->boolean('is_active')->default(true);

      $table->timestamps();

      // Индексы
      $table->index(['region_id', 'is_active']);
      $table->index(['type', 'is_active']);
      $table->index(['status', 'is_active']);
      $table->index('is_active');
    });

    // Мягкая миграция существующих городов в localities
    if (Schema::hasTable('localities')) {
      // Используем запрос без моделей, чтобы миграции не зависели от кода
      $localities = DB::table('localities')->orderBy('id')->get();

      foreach ($localities as $city) {
        // Готовим базовый slug. Если в localities есть slug — используем его.
        $baseSlug = $city->slug ?? Str::slug($city->name) ?: (string) $city->id;
        $slug = $baseSlug;
        $counter = 1;

        // Обеспечиваем уникальность slug внутри localities
        while (
          DB::table('localities')
          ->where('slug', $slug)
          ->exists()
        ) {
          $slug = $baseSlug . '-' . $counter++;
        }

        DB::table('localities')->insert([
          'region_id' => $city->region_id,
          'name' => $city->name,
          'slug' => $slug,
          'type' => in_array($city->type, ['city', 'town', 'village', 'settlement'], true)
            ? $city->type
            : 'city',
          'code' => $city->code,
          'status' => in_array($city->status, ['capital', 'regional_center', 'district_center', 'ordinary'], true)
            ? $city->status
            : 'ordinary',
          'latitude' => $city->latitude,
          'longitude' => $city->longitude,
          'population' => $city->population,
          'area' => $city->area,
          'founded_year' => $city->founded_year,
          'is_active' => (bool) $city->is_active,
          'created_at' => $city->created_at,
          'updated_at' => $city->updated_at,
        ]);
      }
    }
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('localities');
  }
};

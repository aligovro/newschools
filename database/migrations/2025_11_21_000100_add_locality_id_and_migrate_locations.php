<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    // 1. Добавляем locality_id в ключевые таблицы
    if (Schema::hasTable('organizations')) {
      Schema::table('organizations', function (Blueprint $table) {
        if (!Schema::hasColumn('organizations', 'locality_id')) {
          $table->foreignId('locality_id')
            ->nullable()
            ->after('settlement_id')
            ->constrained('localities')
            ->nullOnDelete();
          $table->index('locality_id');
        }
      });
    }

    if (Schema::hasTable('suggested_organizations')) {
      Schema::table('suggested_organizations', function (Blueprint $table) {
        if (!Schema::hasColumn('suggested_organizations', 'locality_id')) {
          $table->foreignId('locality_id')
            ->nullable()
            ->after('locality_id')
            ->constrained('localities')
            ->nullOnDelete();
          $table->index('locality_id');
        }
      });
    }

    if (Schema::hasTable('donations')) {
      Schema::table('donations', function (Blueprint $table) {
        if (!Schema::hasColumn('donations', 'locality_id')) {
          $table->foreignId('locality_id')
            ->nullable()
            ->after('locality_id')
            ->constrained('localities')
            ->nullOnDelete();
          $table->index('locality_id');
        }
      });
    }

    // 2. Догружаем в localities сёла/посёлки из settlements (если они есть)
    if (Schema::hasTable('settlements') && Schema::hasTable('localities')) {
      $settlements = DB::table('settlements')->orderBy('id')->get();

      foreach ($settlements as $settlement) {
        // Если в localities уже есть такой населённый пункт по региону+названию — не дублируем
        $existing = DB::table('localities')
          ->where('region_id', $settlement->region_id)
          ->where('name', $settlement->name)
          ->first();

        if ($existing) {
          continue;
        }

        // Маппим тип settlement -> type localities
        $type = 'settlement';
        switch ($settlement->type) {
          case 'village':
          case 'hamlet':
          case 'rural_settlement':
            $type = 'village';
            break;
          case 'urban_settlement':
            $type = 'town';
            break;
          case 'settlement':
          default:
            $type = 'settlement';
            break;
        }

        // Обеспечиваем уникальный slug
        $baseSlug = $settlement->slug ?: \Illuminate\Support\Str::slug($settlement->name) ?: (string) $settlement->id;
        $slug = $baseSlug;
        $counter = 1;

        while (
          DB::table('localities')
          ->where('slug', $slug)
          ->exists()
        ) {
          $slug = $baseSlug . '-' . $counter++;
        }

        DB::table('localities')->insert([
          'region_id' => $settlement->region_id,
          'name' => $settlement->name,
          'slug' => $slug,
          'type' => $type,
          'code' => null,
          'status' => 'ordinary',
          'latitude' => $settlement->latitude,
          'longitude' => $settlement->longitude,
          'population' => $settlement->population,
          'area' => $settlement->area,
          'founded_year' => null,
          'is_active' => (bool) $settlement->is_active,
          'created_at' => $settlement->created_at,
          'updated_at' => $settlement->updated_at,
        ]);
      }
    }

    // 3. Мапим locality_id / settlement_id -> locality_id
    if (Schema::hasTable('localities')) {
      // Карта городов: locality_id -> locality_id (по региону+названию)
      $cityMap = [];
      if (Schema::hasTable('localities')) {
        $rows = DB::table('localities')
          ->join('localities', function ($join) {
            $join->on('localities.region_id', '=', 'localities.region_id')
              ->on('localities.name', '=', 'localities.name');
          })
          ->select('localities.id as locality_id', 'localities.id as locality_id')
          ->get();

        foreach ($rows as $row) {
          $cityMap[(int) $row->locality_id] = (int) $row->locality_id;
        }
      }

      // Карта поселений: settlement_id -> locality_id (по региону+названию)
      $settlementMap = [];
      if (Schema::hasTable('settlements')) {
        $rows = DB::table('settlements')
          ->join('localities', function ($join) {
            $join->on('localities.region_id', '=', 'settlements.region_id')
              ->on('localities.name', '=', 'settlements.name');
          })
          ->select('settlements.id as settlement_id', 'localities.id as locality_id')
          ->get();

        foreach ($rows as $row) {
          $settlementMap[(int) $row->settlement_id] = (int) $row->locality_id;
        }
      }

      // Организации
      if (Schema::hasTable('organizations')) {
        $orgs = DB::table('organizations')
          ->select('id', 'locality_id', 'settlement_id')
          ->whereNull('locality_id')
          ->get();

        foreach ($orgs as $org) {
          $localityId = null;

          if ($org->settlement_id && isset($settlementMap[$org->settlement_id])) {
            $localityId = $settlementMap[$org->settlement_id];
          } elseif ($org->locality_id && isset($cityMap[$org->locality_id])) {
            $localityId = $cityMap[$org->locality_id];
          }

          if ($localityId) {
            DB::table('organizations')
              ->where('id', $org->id)
              ->update(['locality_id' => $localityId]);
          }
        }
      }

      // Предложенные организации
      if (Schema::hasTable('suggested_organizations') && !empty($cityMap)) {
        $items = DB::table('suggested_organizations')
          ->select('id', 'locality_id')
          ->whereNull('locality_id')
          ->whereNotNull('locality_id')
          ->get();

        foreach ($items as $item) {
          $localityId = $cityMap[$item->locality_id] ?? null;
          if ($localityId) {
            DB::table('suggested_organizations')
              ->where('id', $item->id)
              ->update(['locality_id' => $localityId]);
          }
        }
      }

      // Пожертвования
      if (Schema::hasTable('donations') && !empty($cityMap)) {
        $items = DB::table('donations')
          ->select('id', 'locality_id')
          ->whereNull('locality_id')
          ->whereNotNull('locality_id')
          ->get();

        foreach ($items as $item) {
          $localityId = $cityMap[$item->locality_id] ?? null;
          if ($localityId) {
            DB::table('donations')
              ->where('id', $item->id)
              ->update(['locality_id' => $localityId]);
          }
        }
      }
    }
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    if (Schema::hasTable('donations')) {
      Schema::table('donations', function (Blueprint $table) {
        if (Schema::hasColumn('donations', 'locality_id')) {
          $table->dropConstrainedForeignId('locality_id');
        }
      });
    }

    if (Schema::hasTable('suggested_organizations')) {
      Schema::table('suggested_organizations', function (Blueprint $table) {
        if (Schema::hasColumn('suggested_organizations', 'locality_id')) {
          $table->dropConstrainedForeignId('locality_id');
        }
      });
    }

    if (Schema::hasTable('organizations')) {
      Schema::table('organizations', function (Blueprint $table) {
        if (Schema::hasColumn('organizations', 'locality_id')) {
          $table->dropConstrainedForeignId('locality_id');
        }
      });
    }
  }
};

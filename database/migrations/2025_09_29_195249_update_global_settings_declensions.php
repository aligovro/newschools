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
    Schema::table('global_settings', function (Blueprint $table) {
      // Удаляем старые поля
      $table->dropColumn([
        'organization_singular',
        'organization_plural',
        'organization_genitive',
        'organization_dative',
        'organization_instrumental',
        'member_singular',
        'member_plural',
        'member_genitive',
      ]);

      // Добавляем новые поля для полной системы склонений
      // Организации (единственное число)
      $table->string('org_singular_nominative')->default('школа');
      $table->string('org_singular_genitive')->default('школы');
      $table->string('org_singular_dative')->default('школе');
      $table->string('org_singular_accusative')->default('школу');
      $table->string('org_singular_instrumental')->default('школой');
      $table->string('org_singular_prepositional')->default('школе');

      // Организации (множественное число)
      $table->string('org_plural_nominative')->default('школы');
      $table->string('org_plural_genitive')->default('школ');
      $table->string('org_plural_dative')->default('школам');
      $table->string('org_plural_accusative')->default('школы');
      $table->string('org_plural_instrumental')->default('школами');
      $table->string('org_plural_prepositional')->default('школах');

      // Участники (единственное число)
      $table->string('member_singular_nominative')->default('выпускник');
      $table->string('member_singular_genitive')->default('выпускника');
      $table->string('member_singular_dative')->default('выпускнику');
      $table->string('member_singular_accusative')->default('выпускника');
      $table->string('member_singular_instrumental')->default('выпускником');
      $table->string('member_singular_prepositional')->default('выпускнике');

      // Участники (множественное число)
      $table->string('member_plural_nominative')->default('выпускники');
      $table->string('member_plural_genitive')->default('выпускников');
      $table->string('member_plural_dative')->default('выпускникам');
      $table->string('member_plural_accusative')->default('выпускников');
      $table->string('member_plural_instrumental')->default('выпускниками');
      $table->string('member_plural_prepositional')->default('выпускниках');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('global_settings', function (Blueprint $table) {
      // Удаляем новые поля
      $table->dropColumn([
        'org_singular_nominative',
        'org_singular_genitive',
        'org_singular_dative',
        'org_singular_accusative',
        'org_singular_instrumental',
        'org_singular_prepositional',
        'org_plural_nominative',
        'org_plural_genitive',
        'org_plural_dative',
        'org_plural_accusative',
        'org_plural_instrumental',
        'org_plural_prepositional',
        'member_singular_nominative',
        'member_singular_genitive',
        'member_singular_dative',
        'member_singular_accusative',
        'member_singular_instrumental',
        'member_singular_prepositional',
        'member_plural_nominative',
        'member_plural_genitive',
        'member_plural_dative',
        'member_plural_accusative',
        'member_plural_instrumental',
        'member_plural_prepositional',
      ]);

      // Возвращаем старые поля
      $table->string('organization_singular')->default('школа');
      $table->string('organization_plural')->default('школы');
      $table->string('organization_genitive')->default('школ');
      $table->string('organization_dative')->default('школе');
      $table->string('organization_instrumental')->default('школой');
      $table->string('member_singular')->default('выпускник');
      $table->string('member_plural')->default('выпускники');
      $table->string('member_genitive')->default('выпускников');
    });
  }
};

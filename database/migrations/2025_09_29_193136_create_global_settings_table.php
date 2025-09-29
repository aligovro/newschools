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
        Schema::create('global_settings', function (Blueprint $table) {
            $table->id();

            // Терминология - полная система склонений
            // Организации (единственное число)
            $table->string('org_singular_nominative')->default('школа'); // Именительный: школа
            $table->string('org_singular_genitive')->default('школы'); // Родительный: школы
            $table->string('org_singular_dative')->default('школе'); // Дательный: школе
            $table->string('org_singular_accusative')->default('школу'); // Винительный: школу
            $table->string('org_singular_instrumental')->default('школой'); // Творительный: школой
            $table->string('org_singular_prepositional')->default('школе'); // Предложный: школе

            // Организации (множественное число)
            $table->string('org_plural_nominative')->default('школы'); // Именительный: школы
            $table->string('org_plural_genitive')->default('школ'); // Родительный: школ
            $table->string('org_plural_dative')->default('школам'); // Дательный: школам
            $table->string('org_plural_accusative')->default('школы'); // Винительный: школы
            $table->string('org_plural_instrumental')->default('школами'); // Творительный: школами
            $table->string('org_plural_prepositional')->default('школах'); // Предложный: школах

            // Участники (единственное число)
            $table->string('member_singular_nominative')->default('выпускник'); // Именительный: выпускник
            $table->string('member_singular_genitive')->default('выпускника'); // Родительный: выпускника
            $table->string('member_singular_dative')->default('выпускнику'); // Дательный: выпускнику
            $table->string('member_singular_accusative')->default('выпускника'); // Винительный: выпускника
            $table->string('member_singular_instrumental')->default('выпускником'); // Творительный: выпускником
            $table->string('member_singular_prepositional')->default('выпускнике'); // Предложный: выпускнике

            // Участники (множественное число)
            $table->string('member_plural_nominative')->default('выпускники'); // Именительный: выпускники
            $table->string('member_plural_genitive')->default('выпускников'); // Родительный: выпускников
            $table->string('member_plural_dative')->default('выпускникам'); // Дательный: выпускникам
            $table->string('member_plural_accusative')->default('выпускников'); // Винительный: выпускников
            $table->string('member_plural_instrumental')->default('выпускниками'); // Творительный: выпускниками
            $table->string('member_plural_prepositional')->default('выпускниках'); // Предложный: выпускниках

            // Действия
            $table->string('action_join')->default('поступить'); // поступить
            $table->string('action_leave')->default('выпуститься'); // выпуститься
            $table->string('action_support')->default('поддержать'); // поддержать

            // Общие настройки системы
            $table->string('system_name')->default('Система управления школами');
            $table->string('system_description')->default('Платформа для управления школами и выпускниками');
            $table->string('default_language')->default('ru');
            $table->string('default_timezone')->default('Europe/Moscow');
            $table->string('default_currency')->default('RUB');

            // Настройки по умолчанию для новых организаций
            $table->json('default_organization_settings')->nullable();
            $table->json('default_payment_settings')->nullable();
            $table->json('default_notification_settings')->nullable();

            // Настройки системы
            $table->json('system_settings')->nullable();
            $table->json('feature_flags')->nullable();
            $table->json('integration_settings')->nullable();

            // SEO настройки по умолчанию
            $table->json('default_seo_settings')->nullable();

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
        Schema::dropIfExists('global_settings');
    }
};

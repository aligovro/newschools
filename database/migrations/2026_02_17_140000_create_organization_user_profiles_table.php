<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Профиль пользователя по организации (ЛК на сайтах школ).
 * user_type, edu_year, region — как в blagoqr (Выпускник, Друг лицея, Родитель).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organization_user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('last_name', 100)->nullable();
            $table->string('user_type', 30)->nullable()->index(); // graduate|friend|parent
            $table->string('edu_year', 10)->nullable(); // год выпуска
            $table->foreignId('region_id')->nullable()->constrained('regions')->onDelete('set null');
            $table->timestamps();

            $table->unique(['user_id', 'organization_id'], 'org_user_profile_user_org_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organization_user_profiles');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Категории доноров организации (Выпуск X г., Друзья лицея и т.п.).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('organization_donor_categories')) {
            return;
        }
        Schema::create('organization_donor_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('key', 50)->index();
            $table->string('label', 100);
            $table->string('type', 20)->default('graduate')->index();
            $table->unsignedSmallInteger('display_order')->default(0);
            $table->timestamps();
            $table->unique(['organization_id', 'key'], 'org_donor_cat_org_key_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organization_donor_categories');
    }
};

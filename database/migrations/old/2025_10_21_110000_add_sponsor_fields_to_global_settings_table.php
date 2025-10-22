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
            $table->string('sponsor_singular_nominative')->default('спонсор')->after('metadata');
            $table->string('sponsor_singular_genitive')->default('спонсора')->after('sponsor_singular_nominative');
            $table->string('sponsor_singular_dative')->default('спонсору')->after('sponsor_singular_genitive');
            $table->string('sponsor_singular_accusative')->default('спонсора')->after('sponsor_singular_dative');
            $table->string('sponsor_singular_instrumental')->default('спонсором')->after('sponsor_singular_accusative');
            $table->string('sponsor_singular_prepositional')->default('спонсоре')->after('sponsor_singular_instrumental');
            $table->string('sponsor_plural_nominative')->default('спонсоры')->after('sponsor_singular_prepositional');
            $table->string('sponsor_plural_genitive')->default('спонсоров')->after('sponsor_plural_nominative');
            $table->string('sponsor_plural_dative')->default('спонсорам')->after('sponsor_plural_genitive');
            $table->string('sponsor_plural_accusative')->default('спонсоров')->after('sponsor_plural_dative');
            $table->string('sponsor_plural_instrumental')->default('спонсорами')->after('sponsor_plural_accusative');
            $table->string('sponsor_plural_prepositional')->default('спонсорах')->after('sponsor_plural_instrumental');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('global_settings', function (Blueprint $table) {
            $table->dropColumn([
                'sponsor_singular_nominative',
                'sponsor_singular_genitive',
                'sponsor_singular_dative',
                'sponsor_singular_accusative',
                'sponsor_singular_instrumental',
                'sponsor_singular_prepositional',
                'sponsor_plural_nominative',
                'sponsor_plural_genitive',
                'sponsor_plural_dative',
                'sponsor_plural_accusative',
                'sponsor_plural_instrumental',
                'sponsor_plural_prepositional',
            ]);
        });
    }
};

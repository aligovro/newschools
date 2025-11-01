<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('site_position_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained('sites')->onDelete('cascade');
            $table->foreignId('position_id')->nullable()->constrained('widget_positions')->onDelete('cascade');
            $table->string('position_slug')->index();
            $table->json('visibility_rules')->nullable();
            $table->json('layout_overrides')->nullable();
            $table->timestamps();

            $table->unique(['site_id', 'position_slug'], 'site_position_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_position_settings');
    }
};

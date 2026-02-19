<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_widget_top_recurring_donors_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_widget_id')->constrained('site_widgets')->onDelete('cascade');
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->unsignedSmallInteger('limit')->default(10);
            $table->string('title')->nullable();
            $table->timestamps();

            $table->unique('site_widget_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_widget_top_recurring_donors_settings');
    }
};

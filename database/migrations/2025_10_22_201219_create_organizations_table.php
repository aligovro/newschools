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
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->string('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->foreignId('region_id')->nullable()->constrained('regions')->onDelete('set null');
            $table->foreignId('city_id')->nullable()->constrained('cities')->onDelete('set null');
            $table->foreignId('settlement_id')->nullable()->constrained('settlements')->onDelete('set null');
            $table->string('city_name')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('logo')->nullable();
            $table->json('images')->nullable();
            $table->json('contacts')->nullable();
            $table->enum('type', ['school', 'gymnasium', 'lyceum', 'college', 'shelter', 'hospital', 'church', 'charity', 'foundation', 'ngo'])->default('school');
            $table->enum('status', ['active', 'inactive', 'pending'])->default('pending');
            $table->boolean('is_public')->default(true);
            $table->json('features')->nullable();
            $table->timestamp('founded_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            // Индексы
            $table->index(['region_id', 'status']);
            $table->index(['city_id', 'status']);
            $table->index(['settlement_id', 'status']);
            $table->index('status');
            $table->index('is_public');
            $table->index('type');
            $table->unique('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};

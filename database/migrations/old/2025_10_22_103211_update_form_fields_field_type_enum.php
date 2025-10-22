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
        // Обновляем enum для field_type, добавляя недостающие типы полей
        DB::statement("ALTER TABLE site_widget_form_fields MODIFY COLUMN field_type ENUM(
            'text',
            'email',
            'phone',
            'textarea',
            'select',
            'checkbox',
            'radio',
            'file',
            'image',
            'number',
            'date',
            'url',
            'hidden',
            'heading',
            'description'
        )");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Возвращаем к исходному enum
        DB::statement("ALTER TABLE site_widget_form_fields MODIFY COLUMN field_type ENUM(
            'text',
            'email',
            'phone',
            'textarea',
            'select',
            'checkbox',
            'radio'
        )");
    }
};

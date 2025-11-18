<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        // Берём все существующие шаблоны сайтов
        $templates = DB::table('site_templates')->get(['id']);
        if ($templates->isEmpty()) {
            return;
        }

        foreach ($templates as $template) {
            $exists = DB::table('widget_positions')
                ->where('template_id', $template->id)
                ->where('slug', 'content-bottom')
                ->exists();

            if ($exists) {
                continue;
            }

            DB::table('widget_positions')->insert([
                'template_id' => $template->id,
                'name' => 'Контент под основным блоком',
                'slug' => 'content-bottom',
                'description' => 'Широкая зона перед колонками футера',
                'area' => 'content-bottom',
                'order' => 5,
                'allowed_widgets' => json_encode([]), // все виджеты разрешены
                'layout_config' => json_encode([
                    'width' => 'full',
                    'alignment' => 'center',
                    'padding' => '40px 20px',
                    'margin' => '0',
                ]),
                'is_required' => false,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        DB::table('widget_positions')
            ->where('slug', 'content-bottom')
            ->delete();
    }
};

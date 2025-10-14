<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Widget;
use Illuminate\Support\Facades\DB;

class RemoveContactWidgetsSeeder extends Seeder
{
    /**
     * Удаляет все старые виджеты контактов и форм
     */
    public function run(): void
    {
        $oldSlugs = [
            'contact',
            'contacts',
            'footer-contacts',
            'header-menu',
            'hero-slider',
        ];

        // Сначала удаляем связанные записи из site_widgets
        DB::table('site_widgets')
            ->whereIn('widget_id', function ($query) use ($oldSlugs) {
                $query->select('id')
                    ->from('widgets')
                    ->whereIn('slug', $oldSlugs);
            })
            ->delete();

        // Затем удаляем сами виджеты
        $count = Widget::whereIn('slug', $oldSlugs)->delete();

        $this->command->info("✅ Удалено устаревших виджетов: {$count}");

        if ($count > 0) {
            $this->command->info('Удалены: ' . implode(', ', $oldSlugs));
        } else {
            $this->command->info('Устаревших виджетов не найдено');
        }
    }
}

<?php

namespace App\Console\Commands;

use App\Models\Donation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FillDonationsCityId extends Command
{
    protected $signature = 'donations:fill-city-id';
    protected $description = 'Заполнить region_id и city_id в существующих донатах на основе организации';

    public function handle()
    {
        $this->info('Начинаем заполнение region_id и city_id из организаций...');

        // Массовое обновление region_id через SQL
        $updatedRegion = DB::affectingStatement("
            UPDATE donations
            INNER JOIN organizations ON organizations.id = donations.organization_id
            SET donations.region_id = organizations.region_id
            WHERE donations.region_id IS NULL
                AND donations.organization_id IS NOT NULL
                AND organizations.region_id IS NOT NULL
        ");

        $this->info("Обновлено region_id из организаций: {$updatedRegion}");

        // Массовое обновление city_id через SQL
        $updatedCity = DB::affectingStatement("
            UPDATE donations
            INNER JOIN organizations ON organizations.id = donations.organization_id
            SET donations.city_id = organizations.city_id
            WHERE donations.city_id IS NULL
                AND donations.organization_id IS NOT NULL
                AND organizations.city_id IS NOT NULL
        ");

        $this->info("Обновлено city_id из организаций: {$updatedCity}");

        // Для оставшихся донатов (где у организации нет city_id) используем fallback по региону
        $count = DB::table('donations')
            ->whereNull('donations.city_id')
            ->whereNotNull('donations.organization_id')
            ->join('organizations', 'organizations.id', '=', 'donations.organization_id')
            ->whereNull('organizations.city_id')
            ->whereNotNull('donations.region_id')
            ->count();

        if ($count > 0) {
            $this->info("Заполняем оставшиеся {$count} донатов по региону...");

            $donations = Donation::whereNull('city_id')
                ->whereNotNull('region_id')
                ->whereNotNull('organization_id')
                ->get();

            $bar = $this->output->createProgressBar($donations->count());
            $bar->start();

            $updatedFallback = 0;
            foreach ($donations as $donation) {
                $cityId = Donation::findCityByRegion($donation->region_id);
                if ($cityId) {
                    $donation->update(['city_id' => $cityId]);
                    $updatedFallback++;
                }
                $bar->advance();
            }

            $bar->finish();
            $this->newLine();
            $this->info("Обновлено city_id по региону: {$updatedFallback}");
        }

        $this->info('Готово!');

        return Command::SUCCESS;
    }
}

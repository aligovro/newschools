<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\Region;
use App\Models\OrganizationProject;
use App\Models\Fundraiser;
use App\Models\Member;
use App\Models\Donation;
use Illuminate\Database\Seeder;

class OrganizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Получаем федеральные округа
        $cfd = \App\Models\FederalDistrict::where('code', 'CFD')->first();
        $nwfd = \App\Models\FederalDistrict::where('code', 'NWFD')->first();

        // Создаем регионы
        $moscowRegion = Region::firstOrCreate([
            'name' => 'Москва',
            'code' => '77',
        ], [
            'federal_district_id' => $cfd->id,
            'slug' => 'moscow',
            'capital' => 'Москва',
            'latitude' => 55.7558,
            'longitude' => 37.6176,
            'population' => 12678079,
            'area' => 2561.5,
            'type' => 'federal_city',
        ]);

        $spbRegion = Region::firstOrCreate([
            'name' => 'Санкт-Петербург',
            'code' => '78',
        ], [
            'federal_district_id' => $nwfd->id,
            'slug' => 'saint-petersburg',
            'capital' => 'Санкт-Петербург',
            'latitude' => 59.9311,
            'longitude' => 30.3609,
            'population' => 5398064,
            'area' => 1439,
            'type' => 'federal_city',
        ]);

        // Создаем организации разных типов
        $school = Organization::create([
            'name' => 'Средняя общеобразовательная школа №123',
            'slug' => 'school-123',
            'description' => 'Современная школа с углубленным изучением математики и физики',
            'address' => 'ул. Ленина, 15, Москва',
            'phone' => '+7 (495) 123-45-67',
            'email' => 'info@school123.ru',
            'website' => 'https://school123.ru',
            'region_id' => $moscowRegion->id,
            'city_name' => 'Москва',
            'latitude' => 55.7558,
            'longitude' => 37.6176,
            'type' => 'school',
            'status' => 'active',
            'is_public' => true,
            'founded_at' => '1990-09-01',
        ]);

        $shelter = Organization::create([
            'name' => 'Приют "Добрые сердца"',
            'slug' => 'shelter-dobrye-serdca',
            'description' => 'Приют для бездомных животных. Спасение, лечение и пристройство',
            'address' => 'ул. Милосердия, 42, Санкт-Петербург',
            'phone' => '+7 (812) 987-65-43',
            'email' => 'help@shelter.ru',
            'region_id' => $spbRegion->id,
            'city_name' => 'Санкт-Петербург',
            'latitude' => 59.9311,
            'longitude' => 30.3609,
            'type' => 'shelter',
            'status' => 'active',
            'is_public' => true,
            'founded_at' => '2015-03-15',
        ]);

        $hospital = Organization::create([
            'name' => 'Детская больница №1',
            'slug' => 'children-hospital-1',
            'description' => 'Современная детская больница с высокотехнологичным оборудованием',
            'address' => 'пр. Здоровья, 10, Москва',
            'phone' => '+7 (495) 555-12-34',
            'email' => 'info@children-hospital.ru',
            'region_id' => $moscowRegion->id,
            'city_name' => 'Москва',
            'latitude' => 55.7458,
            'longitude' => 37.6076,
            'type' => 'hospital',
            'status' => 'active',
            'is_public' => true,
            'founded_at' => '1985-01-01',
        ]);

        // Создаем проекты для школы
        $schoolProject = OrganizationProject::create([
            'organization_id' => $school->id,
            'title' => 'Ремонт спортивного зала',
            'slug' => 'sport-hall-renovation',
            'description' => 'Необходим капитальный ремонт спортивного зала: замена напольного покрытия, покраска стен, установка нового спортивного оборудования.',
            'short_description' => 'Капитальный ремонт спортивного зала',
            'target_amount' => 50000000, // 500,000 рублей в копейках
            'collected_amount' => 12500000, // 125,000 рублей в копейках
            'status' => 'active',
            'category' => 'construction',
            'start_date' => now(),
            'end_date' => now()->addMonths(3),
            'featured' => true,
        ]);

        // Создаем проект для приюта
        $shelterProject = OrganizationProject::create([
            'organization_id' => $shelter->id,
            'title' => 'Лечение больных животных',
            'slug' => 'animal-treatment',
            'description' => 'Сбор средств на лечение и реабилитацию животных, пострадавших от жестокого обращения.',
            'short_description' => 'Лечение и реабилитация животных',
            'target_amount' => 30000000, // 300,000 рублей в копейках
            'collected_amount' => 8500000, // 85,000 рублей в копейках
            'status' => 'active',
            'category' => 'medical',
            'start_date' => now(),
            'end_date' => now()->addMonths(6),
            'featured' => true,
        ]);

        // Создаем проект для больницы
        $hospitalProject = OrganizationProject::create([
            'organization_id' => $hospital->id,
            'title' => 'Закупка современного медицинского оборудования',
            'slug' => 'medical-equipment',
            'description' => 'Приобретение современного диагностического оборудования для улучшения качества лечения детей.',
            'short_description' => 'Современное медицинское оборудование',
            'target_amount' => 150000000, // 1,500,000 рублей в копейках
            'collected_amount' => 25000000, // 250,000 рублей в копейках
            'status' => 'active',
            'category' => 'medical',
            'start_date' => now(),
            'end_date' => now()->addYear(),
            'featured' => true,
        ]);

        // Создаем сборы средств
        Fundraiser::create([
            'organization_id' => $school->id,
            'project_id' => $schoolProject->id,
            'title' => 'Сбор на ремонт спортзала',
            'slug' => 'sport-hall-fundraiser',
            'description' => 'Срочный сбор средств на ремонт спортивного зала школы',
            'target_amount' => 50000000,
            'collected_amount' => 12500000,
            'status' => 'active',
            'type' => 'one_time',
            'urgency' => 'high',
            'min_donation' => 10000, // 100 рублей в копейках
        ]);

        // Создаем участников
        Member::create([
            'organization_id' => $school->id,
            'first_name' => 'Иван',
            'last_name' => 'Петров',
            'middle_name' => 'Сергеевич',
            'graduation_year' => 2020,
            'class_letter' => 'А',
            'class_number' => 11,
            'profession' => 'Программист',
            'company' => 'Яндекс',
            'position' => 'Senior Developer',
            'email' => 'ivan.petrov@example.com',
            'member_type' => 'alumni',
            'is_featured' => true,
            'is_public' => true,
            'achievements' => 'Золотая медаль, призер олимпиад по программированию',
        ]);

        Member::create([
            'organization_id' => $shelter->id,
            'first_name' => 'Анна',
            'last_name' => 'Смирнова',
            'profession' => 'Ветеринар',
            'company' => 'Приют "Добрые сердца"',
            'position' => 'Главный ветеринар',
            'email' => 'anna.smirnova@shelter.ru',
            'member_type' => 'staff',
            'is_featured' => true,
            'is_public' => true,
            'achievements' => 'Спасла более 500 животных',
        ]);

        // Создаем тестовые пожертвования
        Donation::create([
            'organization_id' => $school->id,
            'project_id' => $schoolProject->id,
            'amount' => 500000, // 5,000 рублей в копейках
            'status' => 'completed',
            'payment_method' => 'card',
            'payment_id' => 'test_payment_1',
            'is_anonymous' => false,
            'donor_name' => 'Александр Иванов',
            'donor_email' => 'alex.ivanov@example.com',
            'donor_message' => 'Желаю успехов школе!',
            'paid_at' => now()->subDays(5),
        ]);

        Donation::create([
            'organization_id' => $shelter->id,
            'project_id' => $shelterProject->id,
            'amount' => 100000, // 1,000 рублей в копейках
            'status' => 'completed',
            'payment_method' => 'sbp',
            'payment_id' => 'test_payment_2',
            'is_anonymous' => true,
            'donor_message' => 'Спасибо за вашу работу!',
            'paid_at' => now()->subDays(2),
        ]);

        $this->command->info('Тестовые данные созданы успешно!');
        $this->command->info('Создано организаций: ' . Organization::count());
        $this->command->info('Создано проектов: ' . OrganizationProject::count());
        $this->command->info('Создано участников: ' . Member::count());
        $this->command->info('Создано пожертвований: ' . Donation::count());
    }
}

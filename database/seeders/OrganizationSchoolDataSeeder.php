<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\OrganizationClub;
use App\Models\OrganizationStaff;
use App\Models\OrganizationVideoLesson;
use Illuminate\Database\Seeder;

class OrganizationSchoolDataSeeder extends Seeder
{
    /**
     * Тестовые данные для шаблона школы:
     * - Преподаватели (staff)
     * - Кружки с расписанием (clubs + schedule)
     * - Видео уроки (video_lessons)
     *
     * Запуск: php artisan db:seed --class=OrganizationSchoolDataSeeder
     * Для другой организации: передай ID через --organization=XX (если поддерживается конструктором)
     */
    public function run(): void
    {
        // ID организации по умолчанию (Гимназия №107 = 29)
        $organizationId = 29;

        $organization = Organization::find($organizationId);

        if (! $organization) {
            $this->command->warn("Организация #{$organizationId} не найдена. Пропускаем.");
            return;
        }

        $this->command->info("Заполняем тестовые данные для: {$organization->name} (#{$organizationId})");

        $this->seedStaff($organizationId);
        $this->seedClubs($organizationId);
        $this->seedVideoLessons($organizationId);

        $this->command->info('✅ Тестовые данные созданы!');
    }

    private function seedStaff(int $orgId): void
    {
        $staff = [
            [
                'last_name'   => 'Иванова',
                'first_name'  => 'Мария',
                'middle_name' => 'Петровна',
                'position'    => 'Директор',
            ],
            [
                'last_name'   => 'Петров',
                'first_name'  => 'Сергей',
                'middle_name' => 'Иванович',
                'position'    => 'Учитель математики',
            ],
            [
                'last_name'   => 'Смирнова',
                'first_name'  => 'Анна',
                'middle_name' => 'Владимировна',
                'position'    => 'Учитель русского языка и литературы',
            ],
            [
                'last_name'   => 'Козлов',
                'first_name'  => 'Дмитрий',
                'middle_name' => 'Александрович',
                'position'    => 'Учитель физики',
            ],
            [
                'last_name'   => 'Новикова',
                'first_name'  => 'Елена',
                'middle_name' => 'Сергеевна',
                'position'    => 'Учитель биологии и химии',
            ],
            [
                'last_name'   => 'Морозов',
                'first_name'  => 'Алексей',
                'middle_name' => 'Николаевич',
                'position'    => 'Учитель истории и обществознания',
            ],
            [
                'last_name'   => 'Федорова',
                'first_name'  => 'Татьяна',
                'middle_name' => 'Михайловна',
                'position'    => 'Учитель английского языка',
            ],
            [
                'last_name'   => 'Лебедев',
                'first_name'  => 'Виктор',
                'middle_name' => 'Павлович',
                'position'    => 'Учитель физической культуры',
            ],
        ];

        foreach ($staff as $data) {
            OrganizationStaff::firstOrCreate(
                [
                    'organization_id' => $orgId,
                    'last_name'       => $data['last_name'],
                    'first_name'      => $data['first_name'],
                ],
                array_merge($data, ['organization_id' => $orgId])
            );
        }

        $this->command->info('  👩‍🏫 Преподаватели: ' . count($staff));
    }

    private function seedClubs(int $orgId): void
    {
        $clubs = [
            [
                'name'        => 'Шахматный клуб',
                'description' => 'Развиваем логическое мышление и стратегическое планирование. Занятия ведёт мастер спорта. Подходит для всех уровней.',
                'sort_order'  => 1,
                'schedule'    => [
                    'mon' => '15:00–16:30',
                    'tue' => null,
                    'wed' => '15:00–16:30',
                    'thu' => null,
                    'fri' => '15:00–16:30',
                    'sat' => null,
                    'sun' => null,
                ],
            ],
            [
                'name'        => 'Футбольная секция',
                'description' => 'Командный вид спорта для развития выносливости, скорости и духа командной игры. Тренировки проходят на стадионе школы.',
                'sort_order'  => 2,
                'schedule'    => [
                    'mon' => '16:00–18:00',
                    'tue' => null,
                    'wed' => '16:00–18:00',
                    'thu' => null,
                    'fri' => null,
                    'sat' => '10:00–12:00',
                    'sun' => null,
                ],
            ],
            [
                'name'        => 'Кружок рисования',
                'description' => 'Изучаем основы изобразительного искусства: живопись, графика, акварель и скетчинг. Принимаем участие в городских выставках.',
                'sort_order'  => 3,
                'schedule'    => [
                    'mon' => null,
                    'tue' => '14:30–16:00',
                    'wed' => null,
                    'thu' => '14:30–16:00',
                    'fri' => null,
                    'sat' => '11:00–13:00',
                    'sun' => null,
                ],
            ],
            [
                'name'        => 'Театральная студия',
                'description' => 'Актёрское мастерство, сценическая речь и пластика. Ставим спектакли, участвуем в городских и региональных конкурсах.',
                'sort_order'  => 4,
                'schedule'    => [
                    'mon' => null,
                    'tue' => '16:00–18:00',
                    'wed' => null,
                    'thu' => '16:00–18:00',
                    'fri' => null,
                    'sat' => '14:00–17:00',
                    'sun' => null,
                ],
            ],
            [
                'name'        => 'Олимпиадная математика',
                'description' => 'Подготовка к математическим олимпиадам всех уровней. Нестандартные задачи и авторские методики решения.',
                'sort_order'  => 5,
                'schedule'    => [
                    'mon' => '15:30–17:00',
                    'tue' => null,
                    'wed' => null,
                    'thu' => '15:30–17:00',
                    'fri' => null,
                    'sat' => null,
                    'sun' => null,
                ],
            ],
            [
                'name'        => 'Робототехника',
                'description' => 'Проектируем и программируем роботов на базе Arduino и LEGO Mindstorms. Участвуем во всероссийских соревнованиях.',
                'sort_order'  => 6,
                'schedule'    => [
                    'mon' => null,
                    'tue' => '15:00–17:00',
                    'wed' => null,
                    'thu' => null,
                    'fri' => '15:00–17:00',
                    'sat' => '12:00–15:00',
                    'sun' => null,
                ],
            ],
            [
                'name'        => 'Волейбол',
                'description' => 'Динамичный командный спорт для развития координации и реакции. Школьная сборная — призёр районного первенства.',
                'sort_order'  => 7,
                'schedule'    => [
                    'mon' => null,
                    'tue' => '17:00–19:00',
                    'wed' => null,
                    'thu' => '17:00–19:00',
                    'fri' => null,
                    'sat' => null,
                    'sun' => '11:00–13:00',
                ],
            ],
        ];

        foreach ($clubs as $data) {
            OrganizationClub::firstOrCreate(
                [
                    'organization_id' => $orgId,
                    'name'            => $data['name'],
                ],
                array_merge($data, ['organization_id' => $orgId])
            );
        }

        $this->command->info('  🏀 Кружки: ' . count($clubs));
    }

    private function seedVideoLessons(int $orgId): void
    {
        $lessons = [
            [
                'title'       => 'Основы алгебры: уравнения и неравенства',
                'description' => 'Разбираем линейные и квадратные уравнения, методы решения систем неравенств. Понятно, с примерами.',
                'video_url'   => 'https://www.youtube.com/watch?v=NybHckSEQBI',
                'sort_order'  => 1,
            ],
            [
                'title'       => 'Физика: законы Ньютона простым языком',
                'description' => 'Три закона Ньютона с практическими примерами и задачами из реальной жизни.',
                'video_url'   => 'https://www.youtube.com/watch?v=kKKM8Y-u7ds',
                'sort_order'  => 2,
            ],
            [
                'title'       => 'История России: ключевые события XX века',
                'description' => 'Обзор важнейших событий советского периода для подготовки к ОГЭ и ЕГЭ.',
                'video_url'   => 'https://www.youtube.com/watch?v=Zg1FH_Orb2Y',
                'sort_order'  => 3,
            ],
            [
                'title'       => 'Русский язык: орфография и пунктуация',
                'description' => 'Правила написания сложных слов и расстановки знаков препинания в сложных предложениях.',
                'video_url'   => 'https://www.youtube.com/watch?v=XqZsoesa55w',
                'sort_order'  => 4,
            ],
            [
                'title'       => 'Биология: строение клетки',
                'description' => 'Детальный разбор органелл клетки, их функции и взаимодействие. Подготовка к ЕГЭ по биологии.',
                'video_url'   => 'https://www.youtube.com/watch?v=8IlzKri08kk',
                'sort_order'  => 5,
            ],
        ];

        foreach ($lessons as $data) {
            OrganizationVideoLesson::firstOrCreate(
                [
                    'organization_id' => $orgId,
                    'title'           => $data['title'],
                ],
                array_merge($data, ['organization_id' => $orgId])
            );
        }

        $this->command->info('  🎬 Видео уроки: ' . count($lessons));
    }
}

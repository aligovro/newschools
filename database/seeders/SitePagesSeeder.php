<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\SitePage;
use Illuminate\Database\Seeder;

class SitePagesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Получаем первую организацию для демонстрации
        $organization = Organization::first();

        if (!$organization) {
            $this->command->info('Организации не найдены. Сначала создайте организацию.');
            return;
        }

        // Создаем главную страницу
        $homepage = SitePage::create([
            'organization_id' => $organization->id,
            'title' => 'Главная страница',
            'slug' => 'home',
            'content' => 'Добро пожаловать на наш сайт! Здесь вы найдете всю необходимую информацию о нашей организации.',
            'excerpt' => 'Добро пожаловать на наш сайт!',
            'status' => 'published',
            'template' => 'default',
            'seo_title' => 'Главная страница - ' . $organization->name,
            'seo_description' => 'Добро пожаловать на официальный сайт ' . $organization->name . '. Здесь вы найдете всю необходимую информацию.',
            'seo_keywords' => 'главная, страница, ' . $organization->name,
            'is_homepage' => true,
            'published_at' => now(),
        ]);

        // Создаем страницу "О нас"
        $aboutPage = SitePage::create([
            'organization_id' => $organization->id,
            'title' => 'О нас',
            'slug' => 'about',
            'content' => 'Мы - команда профессионалов, которая работает над созданием качественных решений для наших клиентов. Наша организация была основана с целью предоставления лучших услуг в своей области.',
            'excerpt' => 'Узнайте больше о нашей организации и команде.',
            'status' => 'published',
            'template' => 'about',
            'seo_title' => 'О нас - ' . $organization->name,
            'seo_description' => 'Узнайте больше о нашей организации, истории и команде профессионалов.',
            'seo_keywords' => 'о нас, команда, история, ' . $organization->name,
            'is_homepage' => false,
            'published_at' => now(),
        ]);

        // Создаем страницу "Контакты"
        $contactPage = SitePage::create([
            'organization_id' => $organization->id,
            'title' => 'Контакты',
            'slug' => 'contact',
            'content' => 'Свяжитесь с нами любым удобным для вас способом. Мы всегда готовы ответить на ваши вопросы и помочь решить любые задачи.',
            'excerpt' => 'Наши контактные данные и способы связи.',
            'status' => 'published',
            'template' => 'contact',
            'seo_title' => 'Контакты - ' . $organization->name,
            'seo_description' => 'Свяжитесь с нами. Наши контактные данные и способы связи.',
            'seo_keywords' => 'контакты, связь, телефон, email, ' . $organization->name,
            'is_homepage' => false,
            'published_at' => now(),
        ]);

        // Создаем страницу блога
        $blogPage = SitePage::create([
            'organization_id' => $organization->id,
            'title' => 'Блог',
            'slug' => 'blog',
            'content' => 'Добро пожаловать в наш блог! Здесь мы публикуем интересные статьи, новости и полезную информацию.',
            'excerpt' => 'Интересные статьи и новости от нашей команды.',
            'status' => 'published',
            'template' => 'blog',
            'seo_title' => 'Блог - ' . $organization->name,
            'seo_description' => 'Читайте интересные статьи и новости от команды ' . $organization->name . '.',
            'seo_keywords' => 'блог, статьи, новости, ' . $organization->name,
            'is_homepage' => false,
            'published_at' => now(),
        ]);

        // Создаем подстраницы для блога
        $blogPost1 = SitePage::create([
            'organization_id' => $organization->id,
            'title' => 'Первая статья в блоге',
            'slug' => 'first-article',
            'content' => 'Это первая статья в нашем блоге. Здесь мы рассказываем о важных событиях и делимся полезной информацией с нашими читателями.',
            'excerpt' => 'Первая статья в нашем блоге.',
            'status' => 'published',
            'template' => 'default',
            'parent_id' => $blogPage->id,
            'seo_title' => 'Первая статья в блоге - ' . $organization->name,
            'seo_description' => 'Первая статья в блоге нашей организации.',
            'seo_keywords' => 'статья, блог, первая, ' . $organization->name,
            'is_homepage' => false,
            'published_at' => now()->subDays(5),
        ]);

        $blogPost2 = SitePage::create([
            'organization_id' => $organization->id,
            'title' => 'Новости компании',
            'slug' => 'company-news',
            'content' => 'Мы рады сообщить о важных изменениях в нашей компании. Мы продолжаем развиваться и улучшать наши услуги.',
            'excerpt' => 'Важные новости и обновления от нашей компании.',
            'status' => 'published',
            'template' => 'default',
            'parent_id' => $blogPage->id,
            'seo_title' => 'Новости компании - ' . $organization->name,
            'seo_description' => 'Последние новости и обновления от нашей компании.',
            'seo_keywords' => 'новости, компания, обновления, ' . $organization->name,
            'is_homepage' => false,
            'published_at' => now()->subDays(2),
        ]);

        // Создаем лендинг страницу
        $landingPage = SitePage::create([
            'organization_id' => $organization->id,
            'title' => 'Наши услуги',
            'slug' => 'services',
            'content' => 'Мы предлагаем широкий спектр услуг для наших клиентов. Наша команда профессионалов готова помочь вам в решении любых задач.',
            'excerpt' => 'Узнайте больше о наших услугах и возможностях.',
            'status' => 'published',
            'template' => 'landing',
            'seo_title' => 'Наши услуги - ' . $organization->name,
            'seo_description' => 'Полный спектр услуг от ' . $organization->name . '. Профессиональные решения для вашего бизнеса.',
            'seo_keywords' => 'услуги, решения, бизнес, ' . $organization->name,
            'is_homepage' => false,
            'published_at' => now(),
        ]);

        // Создаем черновик страницы
        $draftPage = SitePage::create([
            'organization_id' => $organization->id,
            'title' => 'Черновик страницы',
            'slug' => 'draft-page',
            'content' => 'Это страница находится в разработке. Скоро здесь появится интересный контент.',
            'excerpt' => 'Страница в разработке.',
            'status' => 'draft',
            'template' => 'default',
            'seo_title' => 'Черновик страницы - ' . $organization->name,
            'seo_description' => 'Страница в разработке.',
            'seo_keywords' => 'черновик, разработка',
            'is_homepage' => false,
        ]);

        $this->command->info('Создано ' . SitePage::count() . ' страниц для организации: ' . $organization->name);
    }
}

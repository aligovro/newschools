# Система слайдеров

Гибкая система слайдеров для отображения контента на сайтах организаций.

## Возможности

### Типы слайдеров

1. **Главный слайдер (hero)**
    - Большой слайдер на весь экран
    - Фоновые изображения
    - Заголовки, подзаголовки и описания
    - Кнопки с настраиваемыми стилями
    - Настройки автопроигрывания и анимации

2. **Контентный слайдер (content)**
    - Отображение записей из базы данных
    - Настраиваемое количество колонок
    - Поддержка различных типов контента (новости, проекты, участники, пожертвования)
    - Адаптивный дизайн для мобильных устройств

3. **Галерея (gallery)**
    - Слайдер для отображения изображений
    - Поддержка лайтбокса
    - Настраиваемое количество элементов в ряду

4. **Отзывы (testimonials)**
    - Слайдер для отображения отзывов
    - Поддержка аватаров и рейтингов
    - Настраиваемые поля

### Позиции размещения

- `header` - В шапке сайта
- `hero` - Главная область (заменяет стандартную Hero секцию)
- `content` - В контенте страницы
- `sidebar` - В боковой панели
- `footer` - В подвале

## Структура базы данных

### Таблица `organization_sliders`

- `id` - Уникальный идентификатор
- `organization_id` - ID организации
- `name` - Название слайдера
- `type` - Тип слайдера (hero, content, gallery, testimonials)
- `settings` - JSON с настройками слайдера
- `is_active` - Активен ли слайдер
- `sort_order` - Порядок сортировки
- `position` - Позиция на сайте
- `display_conditions` - Условия отображения (JSON)
- `created_at`, `updated_at`, `deleted_at` - Временные метки

### Таблица `organization_slider_slides`

- `id` - Уникальный идентификатор
- `slider_id` - ID слайдера
- `title` - Заголовок слайда
- `subtitle` - Подзаголовок
- `description` - Описание
- `image` - Изображение слайда
- `background_image` - Фоновое изображение
- `button_text` - Текст кнопки
- `button_url` - URL кнопки
- `button_style` - Стиль кнопки (primary, secondary, outline)
- `content_type` - Тип контента (для контентных слайдеров)
- `content_data` - Данные контента (JSON)
- `is_active` - Активен ли слайд
- `sort_order` - Порядок сортировки
- `display_from` - Показывать с даты
- `display_until` - Показывать до даты
- `created_at`, `updated_at`, `deleted_at` - Временные метки

## Использование

### В контроллерах

```php
use App\Services\SliderService;

$sliderService = new SliderService();

// Получить все слайдеры организации
$sliders = $sliderService->getAllSliders($organization);

// Получить слайдеры для конкретной позиции
$heroSliders = $sliderService->getSlidersByPosition($organization, 'hero');
```

### В React компонентах

```tsx
import SliderDisplay from '@/components/sliders/SliderDisplay';

// Отображение слайдеров
<SliderDisplay sliders={sliders} position="hero" className="mb-8" />;
```

### В шаблонах

```php
// В контроллере
$sliders = $sliderService->getSlidersByPosition($organization, 'hero');

// В Inertia
return Inertia::render('Page', [
    'sliders' => $sliders,
]);
```

## Админ-панель

### Управление слайдерами

- Создание и редактирование слайдеров
- Настройка параметров отображения
- Управление слайдами
- Drag & Drop для изменения порядка
- Предварительный просмотр

### Управление слайдами

- Добавление и редактирование слайдов
- Загрузка изображений
- Настройка кнопок и ссылок
- Управление видимостью
- Настройка времени показа

## API

### Маршруты

```
GET    /organization/{organization}/admin/sliders           - Список слайдеров
GET    /organization/{organization}/admin/sliders/create   - Создание слайдера
POST   /organization/{organization}/admin/sliders          - Сохранение слайдера
GET    /organization/{organization}/admin/sliders/{slider}/edit - Редактирование
PUT    /organization/{organization}/admin/sliders/{slider} - Обновление
DELETE /organization/{organization}/admin/sliders/{slider} - Удаление
PATCH  /organization/{organization}/admin/sliders/reorder  - Изменение порядка

POST   /organization/{organization}/admin/sliders/{slider}/slides - Добавление слайда
PUT    /organization/{organization}/admin/sliders/{slider}/slides/{slide} - Обновление слайда
DELETE /organization/{organization}/admin/sliders/{slider}/slides/{slide} - Удаление слайда
PATCH  /organization/{organization}/admin/sliders/{slider}/slides/reorder - Изменение порядка слайдов
```

## Настройки

### Конфигурация типов слайдеров

Файл `config/sliders.php` содержит настройки для всех типов слайдеров:

```php
'types' => [
    'hero' => [
        'name' => 'Главный слайдер',
        'description' => 'Большой слайдер на весь экран',
        'default_settings' => [
            'autoplay' => true,
            'autoplay_delay' => 5000,
            'show_arrows' => true,
            'show_dots' => true,
            'height' => '100vh',
            'overlay_opacity' => 0.4,
            'text_position' => 'center',
            'animation' => 'fade',
        ],
        'fields' => [
            'title' => ['type' => 'text', 'required' => true],
            'subtitle' => ['type' => 'text'],
            'description' => ['type' => 'textarea'],
            'background_image' => ['type' => 'image', 'required' => true],
            'button_text' => ['type' => 'text'],
            'button_url' => ['type' => 'url'],
            'button_style' => ['type' => 'select', 'options' => ['primary', 'secondary', 'outline']],
        ],
    ],
    // ... другие типы
],
```

## Примеры использования

### Создание главного слайдера

```php
$slider = $organization->sliders()->create([
    'name' => 'Главный слайдер',
    'type' => 'hero',
    'position' => 'hero',
    'settings' => [
        'autoplay' => true,
        'autoplay_delay' => 5000,
        'show_arrows' => true,
        'show_dots' => true,
        'height' => '100vh',
        'overlay_opacity' => 0.4,
        'text_position' => 'center',
        'animation' => 'fade',
    ],
    'is_active' => true,
    'sort_order' => 0,
]);
```

### Добавление слайда

```php
$slider->slides()->create([
    'title' => 'Добро пожаловать',
    'subtitle' => 'Поддерживай школы города',
    'description' => 'Присоединяйся к сообществу...',
    'background_image' => 'sliders/hero-bg-1.jpg',
    'button_text' => 'Начать поддержку',
    'button_url' => '/organizations',
    'button_style' => 'primary',
    'is_active' => true,
    'sort_order' => 0,
]);
```

### Отображение на странице

```tsx
// В React компоненте
{
    heroSliders.length > 0 && (
        <SliderDisplay sliders={heroSliders} position="hero" />
    );
}

{
    heroSliders.length === 0 && (
        <HeroSection currentTypeConfig={currentTypeConfig} />
    );
}
```

## Расширение системы

### Добавление нового типа слайдера

1. Добавьте конфигурацию в `config/sliders.php`
2. Обновите компонент `SliderRenderer` для поддержки нового типа
3. Добавьте соответствующие поля в админ-панели

### Добавление нового типа контента

1. Обновите метод `loadContentData` в `SliderService`
2. Добавьте соответствующие маршруты и контроллеры
3. Обновите интерфейсы TypeScript

## Тестирование

Запустите сидер для создания демонстрационных данных:

```bash
php artisan db:seed --class=SliderSeeder
```

## Безопасность

- Все операции с слайдерами защищены политиками доступа
- Загрузка изображений валидируется по типу и размеру
- Пользователи могут управлять только слайдерами своих организаций

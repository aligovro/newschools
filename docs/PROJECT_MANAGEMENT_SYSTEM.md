# Система управления проектами

## Обзор

Система управления проектами позволяет организациям создавать, редактировать и управлять своими проектами. Система интегрирована в панель администрирования организации и доступна для супер-админов и администраторов организаций.

## Возможности

- ✅ Создание и редактирование проектов
- ✅ Управление медиа (основное изображение + галерея)
- ✅ Установка целевой суммы сбора средств
- ✅ Категоризация проектов
- ✅ Статусы проектов (черновик, активен, завершен, отменен, приостановлен)
- ✅ Рекомендуемые проекты (featured)
- ✅ Даты начала и окончания проекта
- ✅ Автоматический подсчет прогресса сбора средств
- ✅ SEO настройки
- ✅ Теги и получатели помощи

## Структура

### Backend

#### Контроллер

- `app/Http/Controllers/ProjectController.php` - основной контроллер для управления проектами
- **Оптимизации:**
    - Eager loading для уменьшения количества SQL запросов
    - Select только необходимых полей для списка проектов
    - Ограничение загружаемых связанных данных

#### Request классы

- `app/Http/Requests/Project/StoreProjectRequest.php` - валидация при создании
- `app/Http/Requests/Project/UpdateProjectRequest.php` - валидация при обновлении

#### Модель

- `app/Models/Project.php` - Eloquent модель с отношениями и методами
- **Особенности:**
    - Работа с суммами в копейках (целевая и собранная сумма)
    - Автоматическая генерация slug из названия
    - Автоматическое обновление статуса при достижении цели
    - Связи с организацией, донатами, медиа

### Frontend

#### Страницы

- `resources/js/pages/projects/CreateProject.tsx` - форма создания проекта
- `resources/js/pages/projects/ProjectsIndex.tsx` - список проектов
- При необходимости: `EditProject.tsx`, `ShowProject.tsx`

#### Стили

- `resources/css/pages/projects/create-project.scss` - стили формы создания
- Переиспользуются стили из `create-organization.scss` для консистентности дизайна

## Маршруты

### Dashboard (доступно для всех авторизованных)

```
GET  /dashboard/organizations/{organization}/projects
POST /dashboard/organizations/{organization}/projects
GET  /dashboard/organizations/{organization}/projects/create
POST /dashboard/organizations/{organization}/projects
GET  /dashboard/organizations/{organization}/projects/{project}
GET  /dashboard/organizations/{organization}/projects/{project}/edit
PUT  /dashboard/organizations/{organization}/projects/{project}
DELETE /dashboard/organizations/{organization}/projects/{project}
```

### Organization Admin Panel

```
GET  /organization/{organization}/admin/projects
POST /organization/{organization}/admin/projects
...
```

(Те же маршруты, но через панель админа организации)

## Использование

### Создание проекта

1. **Доступ:**
    - Супер-админ: `/dashboard/organizations/{org}/projects/create`
    - Админ организации: `/organization/{org}/admin/projects/create`

2. **Обязательные поля:**
    - Название проекта
    - Категория
3. **Дополнительные настройки:**
    - Краткое и полное описание
    - Целевая сумма
    - Даты начала и окончания
    - Статус проекта
    - Основное изображение
    - Галерея (до 10 изображений)
    - Рекомендуемый проект (featured)
    - Теги и получатели помощи

### Поля модели Project

```php
- organization_id
- title
- slug (автоматически из title)
- short_description
- description
- image (основное изображение)
- gallery (массив путей к изображениям)
- target_amount (в копейках)
- collected_amount (в копейках)
- status (draft, active, completed, cancelled, suspended)
- category
- tags (массив)
- beneficiaries (массив)
- progress_updates (массив)
- featured (boolean)
- start_date, end_date
- views_count, donations_count
- seo_settings (массив)
```

### Автоматическая обработка

1. **Генерация slug:** Автоматически создается из названия при создании
2. **Конвертация сумм:** Целевая сумма сохраняется в копейках (рубли \* 100)
3. **Статус:** Автоматически меняется на "completed" при достижении цели
4. **Счетчики:** Автоматически увеличиваются при просмотре

### Методы модели

```php
// Получить сумму в рублях
$project->target_amount_rubles
$project->collected_amount_rubles

// Получить отформатированную сумму
$project->formatted_target_amount  // "1 000 000 ₽"
$project->formatted_collected_amount

// Получить процент прогресса
$project->progress_percentage

// Проверить статусы
$project->is_completed
$project->is_active

// Получить оставшиеся дни
$project->days_left

// Получить URL проекта
$project->url

// Получить название категории
$project->category_name
```

## API

### Проверка доступности slug

```
POST /organizations/{organization}/projects/check-slug
{
  "slug": "my-project",
  "organization_id": 1
}
```

## Оптимизации

### Backend

- ✅ Использование eager loading для связанных данных
- ✅ Select только необходимых полей в списке
- ✅ Ограничение количества загружаемых донатов (10 последних)
- ✅ Request классы для валидации

### Frontend

- ✅ Переиспользование стилей для консистентности
- ✅ Ленивая загрузка изображений
- ✅ Валидация на клиенте

## Категории проектов

Категории определяются в `config/organizations.php` для каждого типа организации:

```php
'school' => [
    'categories' => [
        'construction' => 'Строительство',
        'equipment' => 'Оборудование',
        'sports' => 'Спорт',
        'education' => 'Образование',
        'charity' => 'Благотворительность',
        'events' => 'Мероприятия',
        'maintenance' => 'Содержание',
        'technology' => 'Технологии',
        'library' => 'Библиотека',
        'canteen' => 'Столовая',
    ],
],
```

## Права доступа

- **Супер-админ:** Полный доступ ко всем проектам всех организаций
- **Админ организации:** Доступ к проектам своей организации
- **Middleware:** `organization.admin` для маршрутов в панели админа

## Следующие шаги

- [ ] Добавить страницу просмотра проекта (ShowProject)
- [ ] Добавить страницу редактирования проекта (EditProject)
- [ ] Интеграция с системой донатов
- [ ] Экспорт проектов в Excel/PDF
- [ ] Статистика по проектам
- [ ] Email уведомления при создании/обновлении проектов

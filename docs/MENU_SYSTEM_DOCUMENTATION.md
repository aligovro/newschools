# Система меню для организаций

## Обзор

Система меню позволяет каждой организации создавать и управлять собственными навигационными меню, которые могут отображаться в различных частях сайта: в шапке, подвале, боковой панели или мобильном меню.

## Основные возможности

### 1. Типы меню

- **Header Menu** - Меню в шапке сайта
- **Footer Menu** - Меню в подвале сайта
- **Sidebar Menu** - Боковое меню
- **Mobile Menu** - Мобильное меню

### 2. Типы ссылок в меню

- **Внутренние ссылки** - Прямые URL на страницы сайта
- **Внешние ссылки** - Ссылки на внешние ресурсы
- **Страницы сайта** - Привязка к существующим страницам организации
- **Маршруты приложения** - Ссылки на именованные маршруты

### 3. Иерархическая структура

- Поддержка многоуровневых меню (дочерние элементы)
- Настраиваемый порядок отображения
- Drag & Drop для изменения порядка

## Структура базы данных

### Таблица `organization_menus`

```sql
- id (bigint, primary key)
- organization_id (bigint, foreign key)
- name (varchar) - Название меню
- location (enum) - header, footer, sidebar, mobile
- is_active (boolean) - Активно ли меню
- css_classes (json) - CSS классы для стилизации
- description (text) - Описание меню
- created_at, updated_at (timestamps)
```

### Таблица `organization_menu_items`

```sql
- id (bigint, primary key)
- menu_id (bigint, foreign key)
- parent_id (bigint, nullable) - Родительский элемент
- title (varchar) - Название элемента
- url (varchar, nullable) - Прямой URL
- route_name (varchar, nullable) - Имя маршрута
- page_id (bigint, nullable) - ID страницы
- external_url (varchar, nullable) - Внешняя ссылка
- icon (varchar, nullable) - Иконка
- css_classes (json) - CSS классы
- sort_order (integer) - Порядок сортировки
- is_active (boolean) - Активен ли элемент
- open_in_new_tab (boolean) - Открывать в новой вкладке
- description (text) - Описание
- meta_data (json) - Дополнительные данные
- created_at, updated_at (timestamps)
```

## API Endpoints

### Управление меню

```
GET    /api/organizations/{organization}/menus              - Список меню
POST   /api/organizations/{organization}/menus              - Создать меню
GET    /api/organizations/{organization}/menus/{location}   - Меню по локации
GET    /api/organizations/{organization}/menus/menu/{menu}  - Детали меню
PUT    /api/organizations/{organization}/menus/menu/{menu}  - Обновить меню
DELETE /api/organizations/{organization}/menus/menu/{menu}  - Удалить меню
PATCH  /api/organizations/{organization}/menus/menu/{menu}/toggle - Активировать/деактивировать
```

### Управление элементами меню

```
GET    /api/organizations/{organization}/menus/menu/{menu}/items     - Список элементов
POST   /api/organizations/{organization}/menus/menu/{menu}/items     - Создать элемент
GET    /api/organizations/{organization}/menus/menu/{menu}/items/{item} - Детали элемента
PUT    /api/organizations/{organization}/menus/menu/{menu}/items/{item} - Обновить элемент
DELETE /api/organizations/{organization}/menus/menu/{menu}/items/{item} - Удалить элемент
PATCH  /api/organizations/{organization}/menus/menu/{menu}/items/{item}/toggle - Активировать/деактивировать
PUT    /api/organizations/{organization}/menus/menu/{menu}/items/order - Обновить порядок
```

## Frontend компоненты

### Основные компоненты

- `OrganizationMenu` - Базовый компонент отображения меню
- `MenuRenderer` - Компонент для рендеринга меню по локации
- `HeaderMenu` - Меню для шапки
- `FooterMenu` - Меню для подвала
- `SidebarMenu` - Боковое меню
- `MobileMenu` - Мобильное меню
- `MenuManager` - Админ-панель для управления меню

### Использование

#### Отображение меню на сайте

```tsx
import MenuDisplay from '@/components/OrganizationSite/MenuDisplay';

<MenuDisplay
    organizationId={organization.id}
    menus={menus}
    className="custom-menu-wrapper"
/>;
```

#### Управление меню в админке

```tsx
import MenuManager from '@/components/Menu/MenuManager';

<MenuManager
    organizationId={organization.id}
    menus={menus}
    locations={locations}
    pages={pages}
    types={types}
/>;
```

## Стилизация

CSS стили находятся в `resources/css/components/menu.scss` и включают:

- Стили для всех типов меню (header, footer, sidebar, mobile)
- Адаптивный дизайн
- Анимации и переходы
- Состояния hover и active
- Поддержка иконок и стрелок

## Установка и настройка

### 1. Запуск миграций

```bash
php artisan migrate
```

### 2. Запуск сидера (создание базовых меню)

```bash
php artisan db:seed --class=OrganizationMenuSeeder
```

### 3. Добавление стилей

Стили уже подключены в `resources/css/app.scss`

## Примеры использования

### Создание меню программно

```php
$organization = Organization::find(1);

$menu = $organization->menus()->create([
    'name' => 'Главное меню',
    'location' => 'header',
    'is_active' => true,
    'description' => 'Основное навигационное меню',
]);

$menu->allItems()->create([
    'title' => 'Главная',
    'route_name' => 'site.home',
    'sort_order' => 1,
    'is_active' => true,
]);
```

### Получение меню для отображения

```php
$headerMenu = $organization->menusByLocation('header')
    ->with(['items' => function($query) {
        $query->whereNull('parent_id')
            ->with('children')
            ->orderBy('sort_order');
    }])
    ->first();
```

## Особенности

1. **Автоматическое создание URL** - Система автоматически генерирует правильные URL для разных типов ссылок
2. **Активные состояния** - Автоматическое определение активного элемента меню
3. **Валидация** - Проверка корректности данных при создании/обновлении
4. **Кэширование** - Возможность кэширования меню для повышения производительности
5. **Мультиязычность** - Поддержка разных языков (при необходимости)

## Безопасность

- Все API endpoints защищены middleware аутентификации
- Валидация всех входящих данных
- Проверка прав доступа к организации
- Защита от XSS через экранирование данных

## Производительность

- Индексы в базе данных для быстрого поиска
- Eager loading для избежания N+1 запросов
- Возможность кэширования меню
- Оптимизированные SQL запросы

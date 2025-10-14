# Устаревшие сидеры (УДАЛЕНЫ)

Следующие сидеры были **УДАЛЕНЫ** и заменены на новые:

## Заменены на `AllWidgetsSeeder.php`:

- ❌ `WidgetSeeder.php` - создавал основные виджеты → УДАЛЕН
- ❌ `DefaultWidgetsSeeder.php` - создавал дефолтные виджеты → УДАЛЕН
- ❌ `FormWidgetSeeder.php` - создавал виджет формы → УДАЛЕН
- ❌ `DonationWidgetSeeder.php` - создавал виджет пожертвований → УДАЛЕН

## Разовые:

- ❌ `UpdateWidgetCategoriesSeeder.php` - обновлял категории → УДАЛЕН

## Актуальная структура:

```
database/seeders/
├── AllWidgetsSeeder.php          ✅ Все 9 виджетов в одном месте
├── WidgetPositionsSeeder.php     ✅ 5 позиций (header, hero, content, sidebar, footer)
├── DatabaseSeeder.php            ✅ Главный сидер
└── _DEPRECATED_README.md         📝 Этот файл
```

## Использование:

```bash
# Создать все виджеты
php artisan db:seed --class=AllWidgetsSeeder

# Создать 5 позиций
php artisan db:seed --class=WidgetPositionsSeeder

# Или запустить всё
php artisan db:seed
```

## 9 виджетов в AllWidgetsSeeder:

1. **Навигация**: menu (универсальное)
2. **Баннер**: hero (одиночный или слайдер)
3. **Контент**: text, projects, stats
4. **Формы**: form (универсальный конструктор)
5. **Медиа**: image, gallery
6. **Платежи**: donation

## 5 позиций в WidgetPositionsSeeder:

1. **Шапка сайта** (header) - меню, навигация
2. **Главный баннер** (hero) - hero секции, слайдеры
3. **Основной контент** (content) - все виджеты
4. **Боковая панель** (sidebar) - дополнительные виджеты
5. **Подвал сайта** (footer) - контакты, информация

В каждой позиции можно добавлять **неограниченное количество виджетов** и менять порядок!

# Отчёт сверки payments.json с миграцией (organization 29)

**Дата проверки:** 20.02.2026

## Исходные данные

| Источник | Записей | Сумма (руб) |
|----------|---------|-------------|
| **payments.json** | 5 735 | 5 631 291,00 |
| **Дашборд (donations)** | 2 580 | 1 768 481,00 |
| **blagoqr_import_payment_logs** | 7 431 всего / 2 580 succeeded | 1 768 481,00 (succeeded) |

## Выводы

### 1. Donations ↔ payment_logs — совпадение

**Дашборд полностью соответствует данным в `blagoqr_import_payment_logs`:**
- 2 580 успешных транзакций
- 1 768 481,00 ₽ выручки

Синхронизация в donations работает корректно: в donations попадают только записи со статусом `succeeded`.

### 2. payments.json vs payment_logs — расхождения

- **Все 5 735 id из payments.json есть в payment_logs** — потерь при импорте нет.
- **В payment_logs 1 696 записей отсутствуют в payments.json** — вероятно, другой источник (например, WP).
- **Статусы в payment_logs для id из JSON:**
  - succeeded: 2 014
  - canceled: 3 618
  - pending: 103

### 3. Суммы не совпадают

Для одних и тех же `wp_id` суммы в payments.json и в payment_logs различаются (например, wp_id=267: JSON 500 ₽, payment_logs 10 000 ₽). Это указывает на разные источники данных:
- **payments.json** — скорее всего экспорт из виджета/API
- **payment_logs** — данные из WP (таблица payment_logs)

### 4. Рекомендации

1. **Если источник истины — payments.json:**  
   Нужно уточнить, какие записи считаются успешными. В JSON нет поля статуса, а в payment_logs 3 618 из 5 735 помечены как `canceled`.

2. **Если источник истины — WP (payment_logs):**  
   Миграция выполнена корректно: 2 580 succeeded → 2 580 donations, сумма 1 768 481 ₽.

3. **Для повторной проверки** можно использовать скрипт:
   ```bash
   php verify_payments_import.php
   ```

# Требования к парсеру blagoqr (WP → blagoqr_import_*)

Парсер (модуль `blagoqr_import` или команда `blagoqr:run-full-migration`) заполняет промежуточные таблицы **только для импорта**.

**Важно:** Таблицы `blagoqr_import_*` — временные, используются **только во время парсинга**. После синхронизации все данные переносятся в нашу систему:
- `donations` (donor_name, amount и т.д.)
- `organization_top_one_time_snapshots`, `organization_top_recurring_snapshots`
- `organization_autopayments`
- `payment_transactions`

Виджеты и приложение работают **только с нашими таблицами**. К blagoqr_import_* после миграции не обращаются.

## 1. Автоплатежи (post_type=autopayments)

- **Таблица**: `blagoqr_import_autopayments`
- **Источник в WP**: `wp_XX_posts` где `post_type = 'autopayments'` — **импортировать ВСЕ автоплатежи** (все значения `post_status`: publish, draft, private, trash и т.д.), чтобы сохранить полную историю и корректно учитывать статусы при синхронизации.
- Для каждой записи сохранять:
  - `import_site_mapping_id`, `organization_id`, `wp_post_id` (= ID поста в WP)
  - `post_title`, `post_date`, **`post_status`** (обязательно — от этого зависит, будет ли платёж считаться активным рекуррентным в нашей системе), `post_author` и т.д.
  - **postmeta** (JSON): все ACF-поля автоплатежа, в т.ч.:
    - `amount` / `sum` — сумма
    - `pay_period` — период списаний (ten, thirty, hour, day, week, month — ACF Select)
    - `first_date_payment`, `next_pay` — даты
    - `payment_id` — ID способа оплаты YooKassa
    - `payment_method` / `payment_method_slug` / `payment_method_id` — способ оплаты (СБП, карта и т.д.)
    - любые поля, по которым в WP связывают автоплатеж с платежами (например список payment_log id)

Без парсинга автоплатежей в `blagoqr_import_autopayments` в нашей системе не будет отображаться привязка платежей к подпискам.

## 2. Платежи (payment_logs)

- **Таблица**: `blagoqr_import_payment_logs`
- **Источник в WP**: `wp_XX_payment_logs` (и при необходимости пост donator по `post_id`)

**Критично: без пропусков и дубликатов.** Парсер должен импортировать **каждый** успешный платёж из WP в `blagoqr_import_payment_logs`: по одной строке на каждый платёж (уникальная пара `import_site_mapping_id` + `wp_id`), со статусом `status = 'succeeded'` для успешных. Не пропускать платежи по внешнему id, телефону, сумме или дате — иначе в нашей БД будут пробелы. Дубликаты по (mapping_id, wp_id) недопустимы (в таблице должен быть уникальный ключ).

- Для каждой записи сохранять:
  - все текущие поля (wp_id, user_phone, post_id, request_time, request_data, status, transaction_id, payment_amount, is_recurring и т.д.)
  - **Связь с автоплатежом**: если в WP платёж относится к автоплатежу (post_type=autopayments), заполнять поле **`wp_autopayment_post_id`** (ID поста автоплатежа в WP).

Как в WP связаны payment_log и autopayment — зависит от реализации сайта. Возможные варианты:

- В мета автоплатежа хранится список ID платежей (payment_log) — при обходе payment_logs проверять, не входит ли текущий log в какой-то автоплатеж.
- В payment_log или в связанном donator есть meta `autopayment_id` / `autopayment_post_id` — при импорте копировать в `wp_autopayment_post_id`.
- Связь через донатора (donator привязан к автоплатежу) — при импорте payment_log по post_id донатора определить автоплатеж и записать его post ID в `wp_autopayment_post_id`.

Парсер должен реализовать эту связь так, как она устроена в WP, и записывать в `blagoqr_import_payment_logs.wp_autopayment_post_id` ID поста автоплатежа (или NULL, если платёж не автоплатежный).

## 3. Usermeta (для топа выпусков)

- **Таблица**: `blagoqr_import_usermeta`
- **Источник в WP**: `wp_usermeta` (общая для multisite, префикс `wp_` без номера блога)
- **Мета-ключи**: `user_phone`, `user_type`, `edu_year`

WP `get_rank_vipusk` связывает user → user_phone (usermeta) → donators (meta tel) → суммы. Без импорта usermeta виджеты «Топ поддержавших выпусков» и «Топ регулярно-поддерживающих» будут пустыми (donator.post_title часто «Анонимное пожертвование»).

**Фильтр по блогу:** Импортируем usermeta только для пользователей, чей `user_phone` встречается в `payment_logs` или донаторах **этого блога** (blog_id из --blog-id). Иначе тянем профили из других сайтов мультисайта.

## 4. После парсинга

1. Выполнить миграции Laravel (в т.ч. `wp_autopayment_post_id` в `blagoqr_import_payment_logs`, если ещё не применена).
2. Запустить синхронизацию в production:
   ```bash
   php artisan blagoqr:sync-payments-to-production --organization-id=29
   ```
   Или по маппингу:
   ```bash
   php artisan blagoqr:sync-payments-to-production --mapping-id=1
   ```
   Опция `--dry-run` — только подсчёт без создания записей.

Синхронизация создаёт `payment_transactions` и `donations`. В **основной системе** в `payment_details` используется только наш ключ подписки:

- **`saved_payment_method_id`** — для recurring-платежей (у которых в импорте заполнен `wp_autopayment_post_id`) записывать значение `legacy_{wp_autopayment_post_id}`. Так основное приложение не зависит от промежуточных полей; ключи `blagoqr_import_autopayment_id` и `blagoqr_import_payment_log_id` в нашей системе не используются (допустимы только внутри модуля blagoqr_import для отладки).
- `autopayment_status` — значение `post_status` автоплатежа из WP (для фильтрации в дашборде);
- `is_autopayment_active` — true только если автоплатеж в WP имел `post_status = 'publish'`;
- `is_recurring`, `recurring_period` — только для активных автоплатежей (`post_status = 'publish'`).

При создании/обновлении маппинга синхронизация должна выставлять у соответствующей организации **`organizations.is_legacy_migrated = true`**, чтобы основное приложение определяло мигрированную организацию без обращения к таблицам импорта.

Дубликаты не создаются: используется уникальный `transaction_id` вида `blagoqr_{mapping_id}_{wp_id}`.

Синхронизация также заполняет снапшоты `organization_top_one_time_snapshots` и `organization_top_recurring_snapshots` из `blagoqr_import_payment_logs` + `blagoqr_import_donators` + `blagoqr_import_usermeta` (donor_label по post_title, postmeta или usermeta по телефону).

-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Хост: MySQL-8.0
-- Время создания: Окт 22 2025 г., 23:08
-- Версия сервера: 8.0.41
-- Версия PHP: 8.1.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `newschools`
--

-- --------------------------------------------------------

--
-- Структура таблицы `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel_cache_global_settings', 'O:25:\"App\\Models\\GlobalSettings\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:15:\"global_settings\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:55:{s:2:\"id\";i:1;s:11:\"action_join\";s:18:\"поступить\";s:12:\"action_leave\";s:22:\"выпуститься\";s:14:\"action_support\";s:20:\"поддержать\";s:11:\"system_name\";s:50:\"Система управления школами\";s:18:\"system_description\";s:89:\"Платформа для управления школами и выпускниками\";s:16:\"default_language\";s:2:\"ru\";s:16:\"default_timezone\";s:13:\"Europe/Moscow\";s:16:\"default_currency\";s:3:\"RUB\";s:29:\"default_organization_settings\";s:149:\"{\"theme\": \"default\", \"dark_mode\": false, \"font_family\": \"Inter\", \"accent_color\": \"#10B981\", \"primary_color\": \"#3B82F6\", \"secondary_color\": \"#6B7280\"}\";s:24:\"default_payment_settings\";s:157:\"{\"currency\": \"RUB\", \"max_amount\": 100000000, \"min_amount\": 100, \"auto_approve\": true, \"enabled_methods\": [\"yookassa\", \"tinkoff\"], \"commission_percentage\": 0}\";s:29:\"default_notification_settings\";s:137:\"{\"email_notifications\": true, \"donation_notifications\": true, \"telegram_notifications\": false, \"member_registration_notifications\": true}\";s:15:\"system_settings\";s:135:\"{\"maintenance_mode\": false, \"registration_enabled\": true, \"default_city_fallback\": \"Казань\", \"auto_approve_organizations\": false}\";s:13:\"feature_flags\";s:149:\"{\"news_enabled\": true, \"slider_enabled\": true, \"gallery_enabled\": true, \"members_enabled\": true, \"projects_enabled\": true, \"donations_enabled\": true}\";s:20:\"integration_settings\";s:151:\"{\"yandex_map_apikey\": \"8905e1da-6efd-4fe1-8b0b-6108dba8d1f7\", \"yookassa_test_mode\": true, \"telegram_bot_enabled\": false, \"yandex_suggest_apikey\": null}\";s:20:\"default_seo_settings\";s:152:\"{\"robots_default\": \"index,follow\", \"sitemap_enabled\": true, \"meta_title_template\": \"{name} - {type_name}\", \"meta_description_template\": \"{description}\"}\";s:8:\"metadata\";s:65:\"{\"version\": \"1.0.0\", \"created_at\": \"2025-09-29T19:54:01.227098Z\"}\";s:27:\"sponsor_singular_nominative\";s:14:\"спонсор\";s:25:\"sponsor_singular_genitive\";s:16:\"спонсора\";s:23:\"sponsor_singular_dative\";s:16:\"спонсору\";s:27:\"sponsor_singular_accusative\";s:16:\"спонсора\";s:29:\"sponsor_singular_instrumental\";s:18:\"спонсором\";s:30:\"sponsor_singular_prepositional\";s:16:\"спонсоре\";s:25:\"sponsor_plural_nominative\";s:16:\"спонсоры\";s:23:\"sponsor_plural_genitive\";s:18:\"спонсоров\";s:21:\"sponsor_plural_dative\";s:18:\"спонсорам\";s:25:\"sponsor_plural_accusative\";s:18:\"спонсоров\";s:27:\"sponsor_plural_instrumental\";s:20:\"спонсорами\";s:28:\"sponsor_plural_prepositional\";s:18:\"спонсорах\";s:10:\"created_at\";s:19:\"2025-09-29 19:54:01\";s:10:\"updated_at\";s:19:\"2025-10-21 09:13:36\";s:23:\"org_singular_nominative\";s:10:\"школа\";s:21:\"org_singular_genitive\";s:10:\"школы\";s:19:\"org_singular_dative\";s:10:\"школе\";s:23:\"org_singular_accusative\";s:10:\"школу\";s:25:\"org_singular_instrumental\";s:12:\"школой\";s:26:\"org_singular_prepositional\";s:10:\"школе\";s:21:\"org_plural_nominative\";s:10:\"школы\";s:19:\"org_plural_genitive\";s:8:\"школ\";s:17:\"org_plural_dative\";s:12:\"школам\";s:21:\"org_plural_accusative\";s:10:\"школы\";s:23:\"org_plural_instrumental\";s:14:\"школами\";s:24:\"org_plural_prepositional\";s:12:\"школах\";s:26:\"member_singular_nominative\";s:18:\"выпускник\";s:24:\"member_singular_genitive\";s:20:\"выпускника\";s:22:\"member_singular_dative\";s:20:\"выпускнику\";s:26:\"member_singular_accusative\";s:20:\"выпускника\";s:28:\"member_singular_instrumental\";s:22:\"выпускником\";s:29:\"member_singular_prepositional\";s:20:\"выпускнике\";s:24:\"member_plural_nominative\";s:20:\"выпускники\";s:22:\"member_plural_genitive\";s:22:\"выпускников\";s:20:\"member_plural_dative\";s:22:\"выпускникам\";s:24:\"member_plural_accusative\";s:22:\"выпускников\";s:26:\"member_plural_instrumental\";s:24:\"выпускниками\";s:27:\"member_plural_prepositional\";s:22:\"выпускниках\";}s:11:\"\0*\0original\";a:55:{s:2:\"id\";i:1;s:11:\"action_join\";s:18:\"поступить\";s:12:\"action_leave\";s:22:\"выпуститься\";s:14:\"action_support\";s:20:\"поддержать\";s:11:\"system_name\";s:50:\"Система управления школами\";s:18:\"system_description\";s:89:\"Платформа для управления школами и выпускниками\";s:16:\"default_language\";s:2:\"ru\";s:16:\"default_timezone\";s:13:\"Europe/Moscow\";s:16:\"default_currency\";s:3:\"RUB\";s:29:\"default_organization_settings\";s:149:\"{\"theme\": \"default\", \"dark_mode\": false, \"font_family\": \"Inter\", \"accent_color\": \"#10B981\", \"primary_color\": \"#3B82F6\", \"secondary_color\": \"#6B7280\"}\";s:24:\"default_payment_settings\";s:157:\"{\"currency\": \"RUB\", \"max_amount\": 100000000, \"min_amount\": 100, \"auto_approve\": true, \"enabled_methods\": [\"yookassa\", \"tinkoff\"], \"commission_percentage\": 0}\";s:29:\"default_notification_settings\";s:137:\"{\"email_notifications\": true, \"donation_notifications\": true, \"telegram_notifications\": false, \"member_registration_notifications\": true}\";s:15:\"system_settings\";s:135:\"{\"maintenance_mode\": false, \"registration_enabled\": true, \"default_city_fallback\": \"Казань\", \"auto_approve_organizations\": false}\";s:13:\"feature_flags\";s:149:\"{\"news_enabled\": true, \"slider_enabled\": true, \"gallery_enabled\": true, \"members_enabled\": true, \"projects_enabled\": true, \"donations_enabled\": true}\";s:20:\"integration_settings\";s:151:\"{\"yandex_map_apikey\": \"8905e1da-6efd-4fe1-8b0b-6108dba8d1f7\", \"yookassa_test_mode\": true, \"telegram_bot_enabled\": false, \"yandex_suggest_apikey\": null}\";s:20:\"default_seo_settings\";s:152:\"{\"robots_default\": \"index,follow\", \"sitemap_enabled\": true, \"meta_title_template\": \"{name} - {type_name}\", \"meta_description_template\": \"{description}\"}\";s:8:\"metadata\";s:65:\"{\"version\": \"1.0.0\", \"created_at\": \"2025-09-29T19:54:01.227098Z\"}\";s:27:\"sponsor_singular_nominative\";s:14:\"спонсор\";s:25:\"sponsor_singular_genitive\";s:16:\"спонсора\";s:23:\"sponsor_singular_dative\";s:16:\"спонсору\";s:27:\"sponsor_singular_accusative\";s:16:\"спонсора\";s:29:\"sponsor_singular_instrumental\";s:18:\"спонсором\";s:30:\"sponsor_singular_prepositional\";s:16:\"спонсоре\";s:25:\"sponsor_plural_nominative\";s:16:\"спонсоры\";s:23:\"sponsor_plural_genitive\";s:18:\"спонсоров\";s:21:\"sponsor_plural_dative\";s:18:\"спонсорам\";s:25:\"sponsor_plural_accusative\";s:18:\"спонсоров\";s:27:\"sponsor_plural_instrumental\";s:20:\"спонсорами\";s:28:\"sponsor_plural_prepositional\";s:18:\"спонсорах\";s:10:\"created_at\";s:19:\"2025-09-29 19:54:01\";s:10:\"updated_at\";s:19:\"2025-10-21 09:13:36\";s:23:\"org_singular_nominative\";s:10:\"школа\";s:21:\"org_singular_genitive\";s:10:\"школы\";s:19:\"org_singular_dative\";s:10:\"школе\";s:23:\"org_singular_accusative\";s:10:\"школу\";s:25:\"org_singular_instrumental\";s:12:\"школой\";s:26:\"org_singular_prepositional\";s:10:\"школе\";s:21:\"org_plural_nominative\";s:10:\"школы\";s:19:\"org_plural_genitive\";s:8:\"школ\";s:17:\"org_plural_dative\";s:12:\"школам\";s:21:\"org_plural_accusative\";s:10:\"школы\";s:23:\"org_plural_instrumental\";s:14:\"школами\";s:24:\"org_plural_prepositional\";s:12:\"школах\";s:26:\"member_singular_nominative\";s:18:\"выпускник\";s:24:\"member_singular_genitive\";s:20:\"выпускника\";s:22:\"member_singular_dative\";s:20:\"выпускнику\";s:26:\"member_singular_accusative\";s:20:\"выпускника\";s:28:\"member_singular_instrumental\";s:22:\"выпускником\";s:29:\"member_singular_prepositional\";s:20:\"выпускнике\";s:24:\"member_plural_nominative\";s:20:\"выпускники\";s:22:\"member_plural_genitive\";s:22:\"выпускников\";s:20:\"member_plural_dative\";s:22:\"выпускникам\";s:24:\"member_plural_accusative\";s:22:\"выпускников\";s:26:\"member_plural_instrumental\";s:24:\"выпускниками\";s:27:\"member_plural_prepositional\";s:22:\"выпускниках\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:8:{s:29:\"default_organization_settings\";s:5:\"array\";s:24:\"default_payment_settings\";s:5:\"array\";s:29:\"default_notification_settings\";s:5:\"array\";s:15:\"system_settings\";s:5:\"array\";s:13:\"feature_flags\";s:5:\"array\";s:20:\"integration_settings\";s:5:\"array\";s:20:\"default_seo_settings\";s:5:\"array\";s:8:\"metadata\";s:5:\"array\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:52:{i:0;s:23:\"org_singular_nominative\";i:1;s:21:\"org_singular_genitive\";i:2;s:19:\"org_singular_dative\";i:3;s:23:\"org_singular_accusative\";i:4;s:25:\"org_singular_instrumental\";i:5;s:26:\"org_singular_prepositional\";i:6;s:21:\"org_plural_nominative\";i:7;s:19:\"org_plural_genitive\";i:8;s:17:\"org_plural_dative\";i:9;s:21:\"org_plural_accusative\";i:10;s:23:\"org_plural_instrumental\";i:11;s:24:\"org_plural_prepositional\";i:12;s:26:\"member_singular_nominative\";i:13;s:24:\"member_singular_genitive\";i:14;s:22:\"member_singular_dative\";i:15;s:26:\"member_singular_accusative\";i:16;s:28:\"member_singular_instrumental\";i:17;s:29:\"member_singular_prepositional\";i:18;s:24:\"member_plural_nominative\";i:19;s:22:\"member_plural_genitive\";i:20;s:20:\"member_plural_dative\";i:21;s:24:\"member_plural_accusative\";i:22;s:26:\"member_plural_instrumental\";i:23;s:27:\"member_plural_prepositional\";i:24;s:11:\"action_join\";i:25;s:12:\"action_leave\";i:26;s:14:\"action_support\";i:27;s:11:\"system_name\";i:28;s:18:\"system_description\";i:29;s:16:\"default_language\";i:30;s:16:\"default_timezone\";i:31;s:16:\"default_currency\";i:32;s:29:\"default_organization_settings\";i:33;s:24:\"default_payment_settings\";i:34;s:29:\"default_notification_settings\";i:35;s:15:\"system_settings\";i:36;s:13:\"feature_flags\";i:37;s:20:\"integration_settings\";i:38;s:20:\"default_seo_settings\";i:39;s:8:\"metadata\";i:40;s:27:\"sponsor_singular_nominative\";i:41;s:25:\"sponsor_singular_genitive\";i:42;s:23:\"sponsor_singular_dative\";i:43;s:27:\"sponsor_singular_accusative\";i:44;s:29:\"sponsor_singular_instrumental\";i:45;s:30:\"sponsor_singular_prepositional\";i:46;s:25:\"sponsor_plural_nominative\";i:47;s:23:\"sponsor_plural_genitive\";i:48;s:21:\"sponsor_plural_dative\";i:49;s:25:\"sponsor_plural_accusative\";i:50;s:27:\"sponsor_plural_instrumental\";i:51;s:28:\"sponsor_plural_prepositional\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}', 1761213606),
('laravel_cache_main_site_settings', 'O:26:\"App\\Models\\MainSiteSetting\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:18:\"main_site_settings\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:36:{s:2:\"id\";i:1;s:9:\"site_name\";s:46:\"Платформа поддержки школ\";s:16:\"site_description\";s:247:\"Поддерживай школы города — укрепляй будущее. Подписывайся на организации, поддерживай их финансирование, отслеживай прогресс сборов.\";s:9:\"site_logo\";N;s:12:\"site_favicon\";N;s:10:\"site_theme\";s:7:\"default\";s:13:\"primary_color\";s:7:\"#00ff00\";s:15:\"secondary_color\";s:7:\"#6B7280\";s:9:\"dark_mode\";i:0;s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:8:\"og_title\";N;s:14:\"og_description\";N;s:8:\"og_image\";N;s:7:\"og_type\";s:7:\"website\";s:12:\"twitter_card\";s:19:\"summary_large_image\";s:13:\"twitter_title\";N;s:19:\"twitter_description\";N;s:13:\"twitter_image\";N;s:13:\"contact_email\";N;s:13:\"contact_phone\";N;s:15:\"contact_address\";N;s:16:\"contact_telegram\";N;s:10:\"contact_vk\";N;s:12:\"social_links\";s:2:\"[]\";s:19:\"google_analytics_id\";N;s:17:\"yandex_metrika_id\";N;s:16:\"custom_head_code\";N;s:16:\"custom_body_code\";N;s:16:\"payment_settings\";s:129:\"{\"currency\": \"RUB\", \"max_amount\": 100000000, \"min_amount\": 100, \"auto_approve\": true, \"enabled_methods\": [\"yookassa\", \"tinkoff\"]}\";s:21:\"notification_settings\";s:94:\"{\"email_notifications\": true, \"donation_notifications\": true, \"telegram_notifications\": false}\";s:20:\"integration_settings\";s:59:\"{\"yookassa_test_mode\": true, \"telegram_bot_enabled\": false}\";s:8:\"metadata\";s:65:\"{\"version\": \"1.0.0\", \"created_at\": \"2025-10-14T15:10:55.226416Z\"}\";s:10:\"created_at\";s:19:\"2025-10-14 15:10:55\";s:10:\"updated_at\";s:19:\"2025-10-21 07:24:25\";}s:11:\"\0*\0original\";a:36:{s:2:\"id\";i:1;s:9:\"site_name\";s:46:\"Платформа поддержки школ\";s:16:\"site_description\";s:247:\"Поддерживай школы города — укрепляй будущее. Подписывайся на организации, поддерживай их финансирование, отслеживай прогресс сборов.\";s:9:\"site_logo\";N;s:12:\"site_favicon\";N;s:10:\"site_theme\";s:7:\"default\";s:13:\"primary_color\";s:7:\"#00ff00\";s:15:\"secondary_color\";s:7:\"#6B7280\";s:9:\"dark_mode\";i:0;s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:8:\"og_title\";N;s:14:\"og_description\";N;s:8:\"og_image\";N;s:7:\"og_type\";s:7:\"website\";s:12:\"twitter_card\";s:19:\"summary_large_image\";s:13:\"twitter_title\";N;s:19:\"twitter_description\";N;s:13:\"twitter_image\";N;s:13:\"contact_email\";N;s:13:\"contact_phone\";N;s:15:\"contact_address\";N;s:16:\"contact_telegram\";N;s:10:\"contact_vk\";N;s:12:\"social_links\";s:2:\"[]\";s:19:\"google_analytics_id\";N;s:17:\"yandex_metrika_id\";N;s:16:\"custom_head_code\";N;s:16:\"custom_body_code\";N;s:16:\"payment_settings\";s:129:\"{\"currency\": \"RUB\", \"max_amount\": 100000000, \"min_amount\": 100, \"auto_approve\": true, \"enabled_methods\": [\"yookassa\", \"tinkoff\"]}\";s:21:\"notification_settings\";s:94:\"{\"email_notifications\": true, \"donation_notifications\": true, \"telegram_notifications\": false}\";s:20:\"integration_settings\";s:59:\"{\"yookassa_test_mode\": true, \"telegram_bot_enabled\": false}\";s:8:\"metadata\";s:65:\"{\"version\": \"1.0.0\", \"created_at\": \"2025-10-14T15:10:55.226416Z\"}\";s:10:\"created_at\";s:19:\"2025-10-14 15:10:55\";s:10:\"updated_at\";s:19:\"2025-10-21 07:24:25\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:6:{s:9:\"dark_mode\";s:7:\"boolean\";s:12:\"social_links\";s:5:\"array\";s:16:\"payment_settings\";s:5:\"array\";s:21:\"notification_settings\";s:5:\"array\";s:20:\"integration_settings\";s:5:\"array\";s:8:\"metadata\";s:5:\"array\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:33:{i:0;s:9:\"site_name\";i:1;s:16:\"site_description\";i:2;s:9:\"site_logo\";i:3;s:12:\"site_favicon\";i:4;s:10:\"site_theme\";i:5;s:13:\"primary_color\";i:6;s:15:\"secondary_color\";i:7;s:9:\"dark_mode\";i:8;s:10:\"meta_title\";i:9;s:16:\"meta_description\";i:10;s:13:\"meta_keywords\";i:11;s:8:\"og_title\";i:12;s:14:\"og_description\";i:13;s:8:\"og_image\";i:14;s:7:\"og_type\";i:15;s:12:\"twitter_card\";i:16;s:13:\"twitter_title\";i:17;s:19:\"twitter_description\";i:18;s:13:\"twitter_image\";i:19;s:13:\"contact_email\";i:20;s:13:\"contact_phone\";i:21;s:15:\"contact_address\";i:22;s:16:\"contact_telegram\";i:23;s:10:\"contact_vk\";i:24;s:12:\"social_links\";i:25;s:19:\"google_analytics_id\";i:26;s:17:\"yandex_metrika_id\";i:27;s:16:\"custom_head_code\";i:28;s:16:\"custom_body_code\";i:29;s:16:\"payment_settings\";i:30;s:21:\"notification_settings\";i:31;s:20:\"integration_settings\";i:32;s:8:\"metadata\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}', 1761213626),
('laravel_cache_org:1:referrals:leaderboard:0bed83944acac72eed1214760ba90c27', 'a:2:{s:4:\"data\";a:3:{i:0;a:7:{s:8:\"position\";i:1;s:16:\"referrer_user_id\";i:4;s:4:\"name\";s:10:\"Referrer 2\";s:14:\"days_in_system\";d:-7.9533468716087965;s:13:\"invites_count\";i:4;s:12:\"total_amount\";i:157063;s:22:\"formatted_total_amount\";s:11:\"157 063 ₽\";}i:1;a:7:{s:8:\"position\";i:2;s:16:\"referrer_user_id\";i:3;s:4:\"name\";s:10:\"Referrer 1\";s:14:\"days_in_system\";d:-7.953346872905093;s:13:\"invites_count\";i:4;s:12:\"total_amount\";i:151352;s:22:\"formatted_total_amount\";s:11:\"151 352 ₽\";}i:2;a:7:{s:8:\"position\";i:3;s:16:\"referrer_user_id\";i:5;s:4:\"name\";s:10:\"Referrer 3\";s:14:\"days_in_system\";d:-7.9533468734606485;s:13:\"invites_count\";i:4;s:12:\"total_amount\";i:122252;s:22:\"formatted_total_amount\";s:11:\"122 252 ₽\";}}s:4:\"meta\";a:3:{s:4:\"page\";i:1;s:8:\"per_page\";i:11;s:8:\"has_more\";b:0;}}', 1761133276),
('laravel_cache_org:1:referrals:leaderboard:1231cd35c185f87aaf11b19e975f622e', 'a:2:{s:4:\"data\";a:3:{i:0;a:7:{s:8:\"position\";i:1;s:16:\"referrer_user_id\";i:4;s:4:\"name\";s:10:\"Referrer 2\";s:14:\"days_in_system\";d:-7.9532196933449075;s:13:\"invites_count\";i:4;s:12:\"total_amount\";i:157063;s:22:\"formatted_total_amount\";s:11:\"157 063 ₽\";}i:1;a:7:{s:8:\"position\";i:2;s:16:\"referrer_user_id\";i:3;s:4:\"name\";s:10:\"Referrer 1\";s:14:\"days_in_system\";d:-7.953219857256944;s:13:\"invites_count\";i:4;s:12:\"total_amount\";i:151352;s:22:\"formatted_total_amount\";s:11:\"151 352 ₽\";}i:2;a:7:{s:8:\"position\";i:3;s:16:\"referrer_user_id\";i:5;s:4:\"name\";s:10:\"Referrer 3\";s:14:\"days_in_system\";d:-7.953219857893519;s:13:\"invites_count\";i:4;s:12:\"total_amount\";i:122252;s:22:\"formatted_total_amount\";s:11:\"122 252 ₽\";}}s:4:\"meta\";a:3:{s:4:\"page\";i:1;s:8:\"per_page\";i:10;s:8:\"has_more\";b:0;}}', 1761133265),
('laravel_cache_org:1:referrals:leaderboard:224f36ad24c8a2e09ee9405dd0f7664d', 'a:2:{s:4:\"data\";a:3:{i:0;a:7:{s:8:\"position\";i:1;s:16:\"referrer_user_id\";i:5;s:4:\"name\";s:10:\"Referrer 3\";s:14:\"days_in_system\";d:-8.12660389931713;s:13:\"invites_count\";i:4;s:12:\"total_amount\";i:122252;s:22:\"formatted_total_amount\";s:11:\"122 252 ₽\";}i:1;a:7:{s:8:\"position\";i:2;s:16:\"referrer_user_id\";i:3;s:4:\"name\";s:10:\"Referrer 1\";s:14:\"days_in_system\";d:-8.126603900844907;s:13:\"invites_count\";i:4;s:12:\"total_amount\";i:151352;s:22:\"formatted_total_amount\";s:11:\"151 352 ₽\";}i:2;a:7:{s:8:\"position\";i:3;s:16:\"referrer_user_id\";i:4;s:4:\"name\";s:10:\"Referrer 2\";s:14:\"days_in_system\";d:-8.12660390142361;s:13:\"invites_count\";i:4;s:12:\"total_amount\";i:157063;s:22:\"formatted_total_amount\";s:11:\"157 063 ₽\";}}s:4:\"meta\";a:3:{s:4:\"page\";i:1;s:8:\"per_page\";i:11;s:8:\"has_more\";b:0;}}', 1761148245),
('laravel_cache_spatie.permission.cache', 'a:3:{s:5:\"alias\";a:4:{s:1:\"a\";s:2:\"id\";s:1:\"b\";s:4:\"name\";s:1:\"c\";s:10:\"guard_name\";s:1:\"r\";s:5:\"roles\";}s:11:\"permissions\";a:33:{i:0;a:4:{s:1:\"a\";i:1;s:1:\"b\";s:10:\"users.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:1;a:4:{s:1:\"a\";i:2;s:1:\"b\";s:12:\"users.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:2;a:4:{s:1:\"a\";i:3;s:1:\"b\";s:10:\"users.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:3;a:4:{s:1:\"a\";i:4;s:1:\"b\";s:12:\"users.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:4;a:4:{s:1:\"a\";i:5;s:1:\"b\";s:18:\"users.manage_roles\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:5;a:4:{s:1:\"a\";i:6;s:1:\"b\";s:18:\"organizations.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;}}i:6;a:4:{s:1:\"a\";i:7;s:1:\"b\";s:20:\"organizations.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:7;a:4:{s:1:\"a\";i:8;s:1:\"b\";s:18:\"organizations.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:8;a:4:{s:1:\"a\";i:9;s:1:\"b\";s:20:\"organizations.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:9;a:4:{s:1:\"a\";i:10;s:1:\"b\";s:28:\"organizations.manage_members\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:10;a:4:{s:1:\"a\";i:11;s:1:\"b\";s:10:\"sites.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:6:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:5;i:5;i:6;}}i:11;a:4:{s:1:\"a\";i:12;s:1:\"b\";s:12:\"sites.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:12;a:4:{s:1:\"a\";i:13;s:1:\"b\";s:10:\"sites.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:5:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:5;}}i:13;a:4:{s:1:\"a\";i:14;s:1:\"b\";s:12:\"sites.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:14;a:4:{s:1:\"a\";i:15;s:1:\"b\";s:13:\"sites.publish\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:15;a:4:{s:1:\"a\";i:16;s:1:\"b\";s:13:\"projects.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:6:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:5;i:5;i:6;}}i:16;a:4:{s:1:\"a\";i:17;s:1:\"b\";s:15:\"projects.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:5;}}i:17;a:4:{s:1:\"a\";i:18;s:1:\"b\";s:13:\"projects.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:5:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:5;}}i:18;a:4:{s:1:\"a\";i:19;s:1:\"b\";s:15:\"projects.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:19;a:4:{s:1:\"a\";i:20;s:1:\"b\";s:25:\"projects.manage_donations\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:20;a:4:{s:1:\"a\";i:21;s:1:\"b\";s:13:\"payments.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;}}i:21;a:4:{s:1:\"a\";i:22;s:1:\"b\";s:15:\"payments.manage\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:22;a:4:{s:1:\"a\";i:23;s:1:\"b\";s:15:\"payments.refund\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:23;a:4:{s:1:\"a\";i:24;s:1:\"b\";s:15:\"statistics.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;}}i:24;a:4:{s:1:\"a\";i:25;s:1:\"b\";s:17:\"statistics.export\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:25;a:4:{s:1:\"a\";i:26;s:1:\"b\";s:13:\"settings.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:26;a:4:{s:1:\"a\";i:27;s:1:\"b\";s:13:\"settings.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:27;a:4:{s:1:\"a\";i:28;s:1:\"b\";s:22:\"settings.manage_system\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:28;a:4:{s:1:\"a\";i:29;s:1:\"b\";s:10:\"roles.view\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:29;a:4:{s:1:\"a\";i:30;s:1:\"b\";s:12:\"roles.create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:30;a:4:{s:1:\"a\";i:31;s:1:\"b\";s:10:\"roles.edit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:31;a:4:{s:1:\"a\";i:32;s:1:\"b\";s:12:\"roles.delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:32;a:4:{s:1:\"a\";i:33;s:1:\"b\";s:18:\"permissions.manage\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}}s:5:\"roles\";a:6:{i:0;a:3:{s:1:\"a\";i:1;s:1:\"b\";s:11:\"super_admin\";s:1:\"c\";s:3:\"web\";}i:1;a:3:{s:1:\"a\";i:2;s:1:\"b\";s:5:\"admin\";s:1:\"c\";s:3:\"web\";}i:2;a:3:{s:1:\"a\";i:4;s:1:\"b\";s:9:\"moderator\";s:1:\"c\";s:3:\"web\";}i:3;a:3:{s:1:\"a\";i:3;s:1:\"b\";s:18:\"organization_admin\";s:1:\"c\";s:3:\"web\";}i:4;a:3:{s:1:\"a\";i:5;s:1:\"b\";s:6:\"editor\";s:1:\"c\";s:3:\"web\";}i:5;a:3:{s:1:\"a\";i:6;s:1:\"b\";s:4:\"user\";s:1:\"c\";s:3:\"web\";}}}', 1761213606),
('laravel_cache_terminology:org:1', 'a:4:{s:12:\"organization\";a:12:{s:19:\"singular_nominative\";s:10:\"школа\";s:17:\"singular_genitive\";s:10:\"школы\";s:15:\"singular_dative\";s:10:\"школе\";s:19:\"singular_accusative\";s:10:\"школу\";s:21:\"singular_instrumental\";s:12:\"школой\";s:22:\"singular_prepositional\";s:10:\"школе\";s:17:\"plural_nominative\";s:10:\"школы\";s:15:\"plural_genitive\";s:8:\"школ\";s:13:\"plural_dative\";s:12:\"школам\";s:17:\"plural_accusative\";s:10:\"школы\";s:19:\"plural_instrumental\";s:14:\"школами\";s:20:\"plural_prepositional\";s:12:\"школах\";}s:6:\"member\";a:12:{s:19:\"singular_nominative\";s:18:\"выпускник\";s:17:\"singular_genitive\";s:20:\"выпускника\";s:15:\"singular_dative\";s:20:\"выпускнику\";s:19:\"singular_accusative\";s:20:\"выпускника\";s:21:\"singular_instrumental\";s:22:\"выпускником\";s:22:\"singular_prepositional\";s:20:\"выпускнике\";s:17:\"plural_nominative\";s:20:\"выпускники\";s:15:\"plural_genitive\";s:22:\"выпускников\";s:13:\"plural_dative\";s:22:\"выпускникам\";s:17:\"plural_accusative\";s:22:\"выпускников\";s:19:\"plural_instrumental\";s:24:\"выпускниками\";s:20:\"plural_prepositional\";s:22:\"выпускниках\";}s:7:\"sponsor\";a:12:{s:19:\"singular_nominative\";s:14:\"спонсор\";s:17:\"singular_genitive\";s:16:\"спонсора\";s:15:\"singular_dative\";s:16:\"спонсору\";s:19:\"singular_accusative\";s:16:\"спонсора\";s:21:\"singular_instrumental\";s:18:\"спонсором\";s:22:\"singular_prepositional\";s:16:\"спонсоре\";s:17:\"plural_nominative\";s:16:\"спонсоры\";s:15:\"plural_genitive\";s:18:\"спонсоров\";s:13:\"plural_dative\";s:18:\"спонсорам\";s:17:\"plural_accusative\";s:18:\"спонсоров\";s:19:\"plural_instrumental\";s:20:\"спонсорами\";s:20:\"plural_prepositional\";s:18:\"спонсорах\";}s:7:\"actions\";a:3:{s:4:\"join\";s:18:\"поступить\";s:5:\"leave\";s:22:\"выпуститься\";s:7:\"support\";s:20:\"поддержать\";}}', 1761148242),
('laravel_cache_terminology:org:4', 'a:4:{s:12:\"organization\";a:12:{s:19:\"singular_nominative\";s:10:\"школа\";s:17:\"singular_genitive\";s:10:\"школы\";s:15:\"singular_dative\";s:10:\"школе\";s:19:\"singular_accusative\";s:10:\"школу\";s:21:\"singular_instrumental\";s:12:\"школой\";s:22:\"singular_prepositional\";s:10:\"школе\";s:17:\"plural_nominative\";s:10:\"школы\";s:15:\"plural_genitive\";s:8:\"школ\";s:13:\"plural_dative\";s:12:\"школам\";s:17:\"plural_accusative\";s:10:\"школы\";s:19:\"plural_instrumental\";s:14:\"школами\";s:20:\"plural_prepositional\";s:12:\"школах\";}s:6:\"member\";a:12:{s:19:\"singular_nominative\";s:18:\"выпускник\";s:17:\"singular_genitive\";s:20:\"выпускника\";s:15:\"singular_dative\";s:20:\"выпускнику\";s:19:\"singular_accusative\";s:20:\"выпускника\";s:21:\"singular_instrumental\";s:22:\"выпускником\";s:22:\"singular_prepositional\";s:20:\"выпускнике\";s:17:\"plural_nominative\";s:20:\"выпускники\";s:15:\"plural_genitive\";s:22:\"выпускников\";s:13:\"plural_dative\";s:22:\"выпускникам\";s:17:\"plural_accusative\";s:22:\"выпускников\";s:19:\"plural_instrumental\";s:24:\"выпускниками\";s:20:\"plural_prepositional\";s:22:\"выпускниках\";}s:7:\"sponsor\";a:12:{s:19:\"singular_nominative\";s:14:\"спонсор\";s:17:\"singular_genitive\";s:16:\"спонсора\";s:15:\"singular_dative\";s:16:\"спонсору\";s:19:\"singular_accusative\";s:16:\"спонсора\";s:21:\"singular_instrumental\";s:18:\"спонсором\";s:22:\"singular_prepositional\";s:16:\"спонсоре\";s:17:\"plural_nominative\";s:16:\"спонсоры\";s:15:\"plural_genitive\";s:18:\"спонсоров\";s:13:\"plural_dative\";s:18:\"спонсорам\";s:17:\"plural_accusative\";s:18:\"спонсоров\";s:19:\"plural_instrumental\";s:20:\"спонсорами\";s:20:\"plural_prepositional\";s:18:\"спонсорах\";}s:7:\"actions\";a:3:{s:4:\"join\";s:18:\"поступить\";s:5:\"leave\";s:22:\"выпуститься\";s:7:\"support\";s:20:\"поддержать\";}}', 1761074090);

-- --------------------------------------------------------

--
-- Структура таблицы `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `cities`
--

CREATE TABLE `cities` (
  `id` bigint UNSIGNED NOT NULL,
  `region_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('city','town','village','settlement') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'city',
  `status` enum('capital','regional_center','district_center','ordinary') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ordinary',
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `population` int DEFAULT NULL,
  `area` decimal(10,2) DEFAULT NULL,
  `founded_year` int DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `cities`
--

INSERT INTO `cities` (`id`, `region_id`, `name`, `slug`, `code`, `type`, `status`, `latitude`, `longitude`, `population`, `area`, `founded_year`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Москва', 'moskva', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:07:43', '2025-09-27 07:16:55'),
(2, 2, 'Подольск', 'podolsk', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:07:43', '2025-09-27 07:07:43'),
(3, 2, 'Химки', 'ximki', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:07:43', '2025-09-27 07:07:43'),
(4, 2, 'Королёв', 'korolev', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:07:43', '2025-09-27 07:07:43'),
(5, 3, 'Белгород', 'belgorod', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:07:43', '2025-09-27 07:07:43'),
(6, 3, 'Старый Оскол', 'staryi-oskol', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:07:43', '2025-09-27 07:07:43'),
(7, 4, 'Брянск', 'briansk', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:07:43', '2025-09-27 07:07:43'),
(8, 4, 'Клинцы', 'klincy', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:07:43', '2025-09-27 07:07:43'),
(9, 5, 'Санкт-Петербург', 'sankt-peterburg', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:07:43', '2025-09-27 07:16:55'),
(10, 6, 'Гатчина', 'gatcina', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:07:43', '2025-09-27 07:07:43'),
(11, 6, 'Выборг', 'vyborg', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:07:43', '2025-09-27 07:07:43'),
(12, 6, 'Тихвин', 'tixvin', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:07:43', '2025-09-27 07:07:43'),
(13, 7, 'Архангельск', 'arxangelsk', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:07:43', '2025-09-27 07:07:43'),
(14, 7, 'Северодвинск', 'severodvinsk', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:07:43', '2025-09-27 07:07:43'),
(15, 8, 'Вологда', 'vologda', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:07:43', '2025-09-27 07:07:43'),
(16, 8, 'Череповец', 'cerepovec', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:07:43', '2025-09-27 07:07:43'),
(17, 9, 'Калининград', 'kaliningrad', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:07:43', '2025-09-27 07:07:43'),
(18, 9, 'Советск', 'sovetsk', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:07:43', '2025-09-27 07:07:43'),
(19, 10, 'Казань', 'kazan', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(20, 11, 'Уфа', 'ufa', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(21, 12, 'Благовещенск', 'blagoveshhensk', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(22, 13, 'Владивосток', 'vladivostok', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(23, 14, 'Салехард', 'salexard', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(24, 15, 'Екатеринбург', 'ekaterinburg', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(25, 16, 'Чита', 'cita', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(26, 17, 'Саранск', 'saransk', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(27, 18, 'Астрахань', 'astraxan', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(28, 19, 'Ханты-Мансийск', 'xanty-mansiisk', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(29, 20, 'Тюмень', 'tiumen', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(30, 21, 'Йошкар-Ола', 'ioskar-ola', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(31, 22, 'Горно-Алтайск', 'gorno-altaisk', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(32, 23, 'Красноярск', 'krasnoiarsk', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(33, 24, 'Саратов', 'saratov', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(34, 25, 'Нальчик', 'nalcik', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(35, 2, 'Москва', 'moskva', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(36, 26, 'Оренбург', 'orenburg', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(37, 27, 'Петропавловск-Камчатский', 'petropavlovsk-kamcatskii', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(38, 28, 'Черкесск', 'cerkessk', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(39, 29, 'Сыктывкар', 'syktyvkar', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(40, 30, 'Улан-Удэ', 'ulan-ude', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(41, 31, 'Южно-Сахалинск', 'iuzno-saxalinsk', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(42, 32, 'Калуга', 'kaluga', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(43, 33, 'Кызыл', 'kyzyl', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(44, 34, 'Ярославль', 'iaroslavl', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(45, 35, 'Нижний Новгород', 'niznii-novgorod', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(46, 36, 'Иркутск', 'irkutsk', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(47, 37, 'Барнаул', 'barnaul', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(48, 38, 'Ульяновск', 'ulianovsk', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(49, 39, 'Липецк', 'lipeck', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(51, 41, 'Магас', 'magas', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(52, 42, 'Нарьян-Мар', 'narian-mar', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:17:50', '2025-09-27 07:17:50'),
(53, 43, 'Краснодар', 'krasnodar', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:17:50', '2025-09-27 07:17:50'),
(54, 44, 'Биробиджан', 'birobidzan', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:17:50', '2025-09-27 07:17:50'),
(55, 45, 'Ставрополь', 'stavropol', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:17:50', '2025-09-27 07:17:50'),
(56, 46, 'Кострома', 'kostroma', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:17:50', '2025-09-27 07:17:50'),
(57, 47, 'Майкоп', 'maikop', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:17:50', '2025-09-27 07:17:50'),
(58, 48, 'Якутск', 'iakutsk', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:17:50', '2025-09-27 07:17:50'),
(59, 49, 'Великий Новгород', 'velikii-novgorod', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:17:50', '2025-09-27 07:17:50'),
(60, 50, 'Мурманск', 'murmansk', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:17:50', '2025-09-27 07:17:50'),
(61, 51, 'Ростов-на-Дону', 'rostov-na-donu', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:17:50', '2025-09-27 07:17:50'),
(62, 52, 'Челябинск', 'celiabinsk', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:17:50', '2025-09-27 07:17:50'),
(63, 53, 'Новосибирск', 'novosibirsk', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:17:50', '2025-09-27 07:17:50'),
(64, 54, 'Волгоград', 'volgograd', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:17:50', '2025-09-27 07:17:50'),
(65, 55, 'Пенза', 'penza', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:17:50', '2025-09-27 07:17:50'),
(66, 56, 'Ижевск', 'izevsk', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:17:50', '2025-09-27 07:17:50'),
(67, 58, 'Киров', 'kirov', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:18:19', '2025-09-27 07:18:19'),
(68, 59, 'Самара', 'samara', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:18:19', '2025-09-27 07:18:19'),
(69, 60, 'Пермь', 'perm', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:18:19', '2025-09-27 07:18:19'),
(71, 62, 'Омск', 'omsk', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:18:19', '2025-09-27 07:18:19'),
(72, 63, 'Махачкала', 'maxackala', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:52:23', '2025-09-27 07:52:23'),
(73, 63, 'Дербент', 'derbent', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:52:23', '2025-09-27 07:52:23'),
(74, 63, 'Каспийск', 'kaspiisk', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:52:23', '2025-09-27 07:52:23'),
(75, 63, 'Хасавюрт', 'xasaviurt', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:52:23', '2025-09-27 07:52:23'),
(76, 63, 'Кизляр', 'kizliar', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:52:23', '2025-09-27 07:52:23'),
(77, 63, 'Буйнакск', 'buinaksk', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:52:23', '2025-09-27 07:52:23'),
(78, 64, 'Элиста', 'elista', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:52:23', '2025-09-27 07:52:23'),
(79, 64, 'Лагань', 'lagan', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:52:23', '2025-09-27 07:52:23'),
(80, 64, 'Городовиковск', 'gorodovikovsk', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:52:23', '2025-09-27 07:52:23'),
(81, 65, 'Владикавказ', 'vladikavkaz', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:52:23', '2025-09-27 07:52:23'),
(82, 65, 'Моздок', 'mozdok', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:52:23', '2025-09-27 07:52:23'),
(83, 65, 'Беслан', 'beslan', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:52:23', '2025-09-27 07:52:23'),
(84, 65, 'Алагир', 'alagir', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:52:23', '2025-09-27 07:52:23'),
(85, 66, 'Грозный', 'groznyi', NULL, 'city', 'regional_center', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:52:23', '2025-09-27 07:52:23'),
(86, 66, 'Урус-Мартан', 'urus-martan', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:52:23', '2025-09-27 07:52:23'),
(87, 66, 'Гудермес', 'gudermes', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:52:23', '2025-09-27 07:52:23'),
(88, 66, 'Шали', 'sali', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:52:23', '2025-09-27 07:52:23'),
(89, 66, 'Аргун', 'argun', NULL, 'city', 'ordinary', NULL, NULL, NULL, NULL, NULL, 1, '2025-09-27 07:52:23', '2025-09-27 07:52:23');

-- --------------------------------------------------------

--
-- Структура таблицы `domains`
--

CREATE TABLE `domains` (
  `id` bigint UNSIGNED NOT NULL,
  `organization_id` bigint UNSIGNED NOT NULL,
  `domain` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `custom_domain` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subdomain` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `is_ssl_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `status` enum('active','inactive','pending','suspended') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `verified_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `ssl_config` json DEFAULT NULL,
  `dns_records` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `domains`
--

INSERT INTO `domains` (`id`, `organization_id`, `domain`, `custom_domain`, `subdomain`, `is_primary`, `is_ssl_enabled`, `status`, `verified_at`, `expires_at`, `ssl_config`, `dns_records`, `created_at`, `updated_at`) VALUES
(1, 1, 'school-123.localhost', NULL, NULL, 1, 0, 'active', NULL, NULL, NULL, NULL, '2025-09-30 04:41:40', '2025-09-30 04:41:40'),
(2, 7, 'main-1761163146', NULL, 'main-1761163146', 1, 1, 'active', '2025-10-22 16:59:06', '2026-10-22 16:59:06', '{\"auto_renewal\": true, \"certificate_type\": \"letsencrypt\"}', '{\"A\": {\"ttl\": 3600, \"name\": \"@\", \"value\": \"http://localhost\"}, \"CNAME\": {\"ttl\": 3600, \"name\": \"www\", \"value\": \"http://localhost\"}}', '2025-10-22 16:59:06', '2025-10-22 16:59:06');

-- --------------------------------------------------------

--
-- Структура таблицы `donations`
--

CREATE TABLE `donations` (
  `id` bigint UNSIGNED NOT NULL,
  `payment_transaction_id` bigint UNSIGNED DEFAULT NULL,
  `organization_id` bigint UNSIGNED NOT NULL,
  `region_id` bigint UNSIGNED DEFAULT NULL,
  `fundraiser_id` bigint UNSIGNED DEFAULT NULL,
  `project_id` bigint UNSIGNED DEFAULT NULL,
  `donor_id` bigint UNSIGNED DEFAULT NULL,
  `referrer_user_id` bigint UNSIGNED DEFAULT NULL,
  `amount` bigint NOT NULL,
  `currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'RUB',
  `status` enum('pending','completed','failed','cancelled','refunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `payment_method` enum('card','sbp','yoomoney','qiwi','webmoney','bank_transfer','cash') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_anonymous` tinyint(1) NOT NULL DEFAULT '0',
  `donor_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `donor_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `donor_phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `donor_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `send_receipt` tinyint(1) NOT NULL DEFAULT '1',
  `receipt_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_details` json DEFAULT NULL,
  `webhook_data` json DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `refunded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `donations`
--

INSERT INTO `donations` (`id`, `payment_transaction_id`, `organization_id`, `region_id`, `fundraiser_id`, `project_id`, `donor_id`, `referrer_user_id`, `amount`, `currency`, `status`, `payment_method`, `payment_id`, `transaction_id`, `is_anonymous`, `donor_name`, `donor_email`, `donor_phone`, `donor_message`, `send_receipt`, `receipt_email`, `payment_details`, `webhook_data`, `paid_at`, `refunded_at`, `created_at`, `updated_at`) VALUES
(1, NULL, 1, NULL, NULL, 1, NULL, NULL, 500000, 'RUB', 'completed', 'card', 'test_payment_1', NULL, 0, 'Александр Иванов', 'alex.ivanov@example.com', NULL, 'Желаю успехов школе!', 1, NULL, NULL, NULL, '2025-09-22 08:58:26', NULL, '2025-09-27 08:58:26', '2025-09-27 08:58:26'),
(2, NULL, 2, NULL, NULL, 2, NULL, NULL, 100000, 'RUB', 'completed', 'sbp', 'test_payment_2', NULL, 1, NULL, NULL, NULL, 'Спасибо за вашу работу!', 1, NULL, NULL, NULL, '2025-09-25 08:58:26', NULL, '2025-09-27 08:58:26', '2025-09-27 08:58:26'),
(3, NULL, 1, NULL, NULL, NULL, 6, 3, 44164, 'RUB', 'completed', 'card', NULL, 'TEST-68ee4317b5f94', 0, 'Referred 3-1', 'referred_3_1@example.com', NULL, NULL, 0, NULL, '[]', '[]', '2025-09-23 09:33:27', NULL, '2025-10-14 09:33:27', '2025-10-14 09:33:27'),
(4, NULL, 1, NULL, NULL, NULL, 7, 3, 34521, 'RUB', 'completed', 'card', NULL, 'TEST-68ee4317e24c0', 0, 'Referred 3-2', 'referred_3_2@example.com', NULL, NULL, 0, NULL, '[]', '[]', '2025-09-28 09:33:27', NULL, '2025-10-14 09:33:27', '2025-10-14 09:33:27'),
(5, NULL, 1, NULL, NULL, NULL, 8, 3, 4718, 'RUB', 'completed', 'card', NULL, 'TEST-68ee43181a550', 0, 'Referred 3-3', 'referred_3_3@example.com', NULL, NULL, 0, NULL, '[]', '[]', '2025-09-18 09:33:28', NULL, '2025-10-14 09:33:28', '2025-10-14 09:33:28'),
(6, NULL, 1, NULL, NULL, NULL, 8, 3, 41563, 'RUB', 'completed', 'card', NULL, 'TEST-68ee43181aa2b', 0, 'Referred 3-3', 'referred_3_3@example.com', NULL, NULL, 0, NULL, '[]', '[]', '2025-09-17 09:33:28', NULL, '2025-10-14 09:33:28', '2025-10-14 09:33:28'),
(7, NULL, 1, NULL, NULL, NULL, 9, 3, 11721, 'RUB', 'completed', 'card', NULL, 'TEST-68ee431846d65', 0, 'Referred 3-4', 'referred_3_4@example.com', NULL, NULL, 0, NULL, '[]', '[]', '2025-10-04 09:33:28', NULL, '2025-10-14 09:33:28', '2025-10-14 09:33:28'),
(8, NULL, 1, NULL, NULL, NULL, 9, 3, 14665, 'RUB', 'completed', 'card', NULL, 'TEST-68ee431847187', 0, 'Referred 3-4', 'referred_3_4@example.com', NULL, NULL, 0, NULL, '[]', '[]', '2025-09-28 09:33:28', NULL, '2025-10-14 09:33:28', '2025-10-14 09:33:28'),
(9, NULL, 1, NULL, NULL, NULL, 10, 4, 27202, 'RUB', 'completed', 'card', NULL, 'TEST-68ee4318744d4', 0, 'Referred 4-1', 'referred_4_1@example.com', NULL, NULL, 0, NULL, '[]', '[]', '2025-09-23 09:33:28', NULL, '2025-10-14 09:33:28', '2025-10-14 09:33:28'),
(10, NULL, 1, NULL, NULL, NULL, 11, 4, 37568, 'RUB', 'completed', 'card', NULL, 'TEST-68ee4318a0c24', 0, 'Referred 4-2', 'referred_4_2@example.com', NULL, NULL, 0, NULL, '[]', '[]', '2025-09-18 09:33:28', NULL, '2025-10-14 09:33:28', '2025-10-14 09:33:28'),
(11, NULL, 1, NULL, NULL, NULL, 11, 4, 34224, 'RUB', 'completed', 'card', NULL, 'TEST-68ee4318a108a', 0, 'Referred 4-2', 'referred_4_2@example.com', NULL, NULL, 0, NULL, '[]', '[]', '2025-09-29 09:33:28', NULL, '2025-10-14 09:33:28', '2025-10-14 09:33:28'),
(12, NULL, 1, NULL, NULL, NULL, 12, 4, 13420, 'RUB', 'completed', 'card', NULL, 'TEST-68ee4318cd6d0', 0, 'Referred 4-3', 'referred_4_3@example.com', NULL, NULL, 0, NULL, '[]', '[]', '2025-09-19 09:33:28', NULL, '2025-10-14 09:33:28', '2025-10-14 09:33:28'),
(13, NULL, 1, NULL, NULL, NULL, 12, 4, 25918, 'RUB', 'completed', 'card', NULL, 'TEST-68ee4318cdb9c', 0, 'Referred 4-3', 'referred_4_3@example.com', NULL, NULL, 0, NULL, '[]', '[]', '2025-10-03 09:33:28', NULL, '2025-10-14 09:33:28', '2025-10-14 09:33:28'),
(14, NULL, 1, NULL, NULL, NULL, 13, 4, 2754, 'RUB', 'completed', 'card', NULL, 'TEST-68ee431905e60', 0, 'Referred 4-4', 'referred_4_4@example.com', NULL, NULL, 0, NULL, '[]', '[]', '2025-09-30 09:33:29', NULL, '2025-10-14 09:33:29', '2025-10-14 09:33:29'),
(15, NULL, 1, NULL, NULL, NULL, 13, 4, 15977, 'RUB', 'completed', 'card', NULL, 'TEST-68ee4319062aa', 0, 'Referred 4-4', 'referred_4_4@example.com', NULL, NULL, 0, NULL, '[]', '[]', '2025-09-21 09:33:29', NULL, '2025-10-14 09:33:29', '2025-10-14 09:33:29'),
(16, NULL, 1, NULL, NULL, NULL, 14, 5, 14136, 'RUB', 'completed', 'card', NULL, 'TEST-68ee431933c50', 0, 'Referred 5-1', 'referred_5_1@example.com', NULL, NULL, 0, NULL, '[]', '[]', '2025-09-19 09:33:29', NULL, '2025-10-14 09:33:29', '2025-10-14 09:33:29'),
(17, NULL, 1, NULL, NULL, NULL, 15, 5, 32933, 'RUB', 'completed', 'card', NULL, 'TEST-68ee4319608e8', 0, 'Referred 5-2', 'referred_5_2@example.com', NULL, NULL, 0, NULL, '[]', '[]', '2025-09-22 09:33:29', NULL, '2025-10-14 09:33:29', '2025-10-14 09:33:29'),
(18, NULL, 1, NULL, NULL, NULL, 16, 5, 17475, 'RUB', 'completed', 'card', NULL, 'TEST-68ee43198eace', 0, 'Referred 5-3', 'referred_5_3@example.com', NULL, NULL, 0, NULL, '[]', '[]', '2025-09-25 09:33:29', NULL, '2025-10-14 09:33:29', '2025-10-14 09:33:29'),
(19, NULL, 1, NULL, NULL, NULL, 16, 5, 34205, 'RUB', 'completed', 'card', NULL, 'TEST-68ee43198ef13', 0, 'Referred 5-3', 'referred_5_3@example.com', NULL, NULL, 0, NULL, '[]', '[]', '2025-09-17 09:33:29', NULL, '2025-10-14 09:33:29', '2025-10-14 09:33:29'),
(20, NULL, 1, NULL, NULL, NULL, 17, 5, 7131, 'RUB', 'completed', 'card', NULL, 'TEST-68ee4319bcc3b', 0, 'Referred 5-4', 'referred_5_4@example.com', NULL, NULL, 0, NULL, '[]', '[]', '2025-10-05 09:33:29', NULL, '2025-10-14 09:33:29', '2025-10-14 09:33:29'),
(21, NULL, 1, NULL, NULL, NULL, 17, 5, 16372, 'RUB', 'completed', 'card', NULL, 'TEST-68ee4319bd097', 0, 'Referred 5-4', 'referred_5_4@example.com', NULL, NULL, 0, NULL, '[]', '[]', '2025-09-25 09:33:29', NULL, '2025-10-14 09:33:29', '2025-10-14 09:33:29');

-- --------------------------------------------------------

--
-- Структура таблицы `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `federal_districts`
--

CREATE TABLE `federal_districts` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `center` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `area` bigint DEFAULT NULL,
  `population` bigint DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `federal_districts`
--

INSERT INTO `federal_districts` (`id`, `name`, `slug`, `code`, `center`, `latitude`, `longitude`, `area`, `population`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Центральный федеральный округ', 'central-federal-district', 'CFD', 'Москва', 55.75580000, 37.61760000, 652800, 39170000, 1, '2025-09-27 07:05:49', '2025-09-27 07:05:49'),
(2, 'Северо-Западный федеральный округ', 'northwest-federal-district', 'NWFD', 'Санкт-Петербург', 59.93110000, 30.36090000, 1687000, 13800000, 1, '2025-09-27 07:05:49', '2025-09-27 07:05:49'),
(3, 'Южный федеральный округ', 'south-federal-district', 'SFD', 'Ростов-на-Дону', 47.23570000, 39.70150000, 447900, 16400000, 1, '2025-09-27 07:05:49', '2025-09-27 07:05:49'),
(4, 'Северо-Кавказский федеральный округ', 'north-caucasus-federal-district', 'NCFD', 'Пятигорск', 44.04860000, 43.05940000, 172360, 9700000, 1, '2025-09-27 07:05:49', '2025-09-27 07:05:49'),
(5, 'Приволжский федеральный округ', 'volga-federal-district', 'PFD', 'Нижний Новгород', 56.29650000, 43.93610000, 1038000, 29700000, 1, '2025-09-27 07:05:49', '2025-09-27 07:05:49'),
(6, 'Уральский федеральный округ', 'ural-federal-district', 'UFD', 'Екатеринбург', 56.84310000, 60.64540000, 1818800, 12200000, 1, '2025-09-27 07:05:49', '2025-09-27 07:05:49'),
(7, 'Сибирский федеральный округ', 'siberian-federal-district', 'SibFD', 'Новосибирск', 55.00840000, 82.93570000, 5114800, 17200000, 1, '2025-09-27 07:05:49', '2025-09-27 07:05:49'),
(8, 'Дальневосточный федеральный округ', 'far-eastern-federal-district', 'FEFD', 'Владивосток', 43.10560000, 131.87350000, 6169300, 8100000, 1, '2025-09-27 07:05:49', '2025-09-27 07:05:49');

-- --------------------------------------------------------

--
-- Структура таблицы `form_actions`
--

CREATE TABLE `form_actions` (
  `id` bigint UNSIGNED NOT NULL,
  `form_widget_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `config` json NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `form_fields`
--

CREATE TABLE `form_fields` (
  `id` bigint UNSIGNED NOT NULL,
  `form_widget_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `placeholder` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `help_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `options` json DEFAULT NULL,
  `validation` json DEFAULT NULL,
  `styling` json DEFAULT NULL,
  `is_required` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `form_submissions`
--

CREATE TABLE `form_submissions` (
  `id` bigint UNSIGNED NOT NULL,
  `form_widget_id` bigint UNSIGNED NOT NULL,
  `data` json NOT NULL,
  `ip_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referer` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','processed','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `actions_log` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `form_submissions_data`
--

CREATE TABLE `form_submissions_data` (
  `id` bigint UNSIGNED NOT NULL,
  `form_submission_id` bigint UNSIGNED NOT NULL,
  `form_widget_id` bigint UNSIGNED NOT NULL,
  `data` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `form_widgets`
--

CREATE TABLE `form_widgets` (
  `id` bigint UNSIGNED NOT NULL,
  `site_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `settings` json DEFAULT NULL,
  `styling` json DEFAULT NULL,
  `actions` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `fundraisers`
--

CREATE TABLE `fundraisers` (
  `id` bigint UNSIGNED NOT NULL,
  `organization_id` bigint UNSIGNED NOT NULL,
  `project_id` bigint UNSIGNED DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gallery` json DEFAULT NULL,
  `target_amount` bigint NOT NULL,
  `collected_amount` bigint NOT NULL DEFAULT '0',
  `status` enum('draft','active','completed','cancelled','suspended') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `type` enum('one_time','recurring','emergency') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'one_time',
  `urgency` enum('low','medium','high','critical') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `payment_methods` json DEFAULT NULL,
  `anonymous_donations` tinyint(1) NOT NULL DEFAULT '1',
  `show_progress` tinyint(1) NOT NULL DEFAULT '1',
  `show_donors` tinyint(1) NOT NULL DEFAULT '1',
  `min_donation` int NOT NULL DEFAULT '100',
  `max_donation` int DEFAULT NULL,
  `thank_you_message` json DEFAULT NULL,
  `seo_settings` json DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `fundraisers`
--

INSERT INTO `fundraisers` (`id`, `organization_id`, `project_id`, `title`, `slug`, `description`, `short_description`, `image`, `gallery`, `target_amount`, `collected_amount`, `status`, `type`, `urgency`, `start_date`, `end_date`, `payment_methods`, `anonymous_donations`, `show_progress`, `show_donors`, `min_donation`, `max_donation`, `thank_you_message`, `seo_settings`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Сбор на ремонт спортзала', 'sport-hall-fundraiser', 'Срочный сбор средств на ремонт спортивного зала школы', NULL, NULL, NULL, 50000000, 12500000, 'active', 'one_time', 'high', NULL, NULL, NULL, 1, 1, 1, 10000, NULL, NULL, NULL, NULL, '2025-09-27 08:58:26', '2025-09-27 08:58:26');

-- --------------------------------------------------------

--
-- Структура таблицы `global_settings`
--

CREATE TABLE `global_settings` (
  `id` bigint UNSIGNED NOT NULL,
  `action_join` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'поступить',
  `action_leave` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'выпуститься',
  `action_support` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'поддержать',
  `system_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Система управления школами',
  `system_description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Платформа для управления школами и выпускниками',
  `default_language` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ru',
  `default_timezone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Europe/Moscow',
  `default_currency` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'RUB',
  `default_organization_settings` json DEFAULT NULL,
  `default_payment_settings` json DEFAULT NULL,
  `default_notification_settings` json DEFAULT NULL,
  `system_settings` json DEFAULT NULL,
  `feature_flags` json DEFAULT NULL,
  `integration_settings` json DEFAULT NULL,
  `default_seo_settings` json DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `sponsor_singular_nominative` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'спонсор',
  `sponsor_singular_genitive` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'спонсора',
  `sponsor_singular_dative` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'спонсору',
  `sponsor_singular_accusative` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'спонсора',
  `sponsor_singular_instrumental` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'спонсором',
  `sponsor_singular_prepositional` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'спонсоре',
  `sponsor_plural_nominative` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'спонсоры',
  `sponsor_plural_genitive` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'спонсоров',
  `sponsor_plural_dative` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'спонсорам',
  `sponsor_plural_accusative` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'спонсоров',
  `sponsor_plural_instrumental` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'спонсорами',
  `sponsor_plural_prepositional` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'спонсорах',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `org_singular_nominative` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'школа',
  `org_singular_genitive` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'школы',
  `org_singular_dative` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'школе',
  `org_singular_accusative` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'школу',
  `org_singular_instrumental` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'школой',
  `org_singular_prepositional` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'школе',
  `org_plural_nominative` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'школы',
  `org_plural_genitive` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'школ',
  `org_plural_dative` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'школам',
  `org_plural_accusative` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'школы',
  `org_plural_instrumental` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'школами',
  `org_plural_prepositional` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'школах',
  `member_singular_nominative` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'выпускник',
  `member_singular_genitive` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'выпускника',
  `member_singular_dative` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'выпускнику',
  `member_singular_accusative` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'выпускника',
  `member_singular_instrumental` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'выпускником',
  `member_singular_prepositional` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'выпускнике',
  `member_plural_nominative` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'выпускники',
  `member_plural_genitive` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'выпускников',
  `member_plural_dative` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'выпускникам',
  `member_plural_accusative` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'выпускников',
  `member_plural_instrumental` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'выпускниками',
  `member_plural_prepositional` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'выпускниках'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `global_settings`
--

INSERT INTO `global_settings` (`id`, `action_join`, `action_leave`, `action_support`, `system_name`, `system_description`, `default_language`, `default_timezone`, `default_currency`, `default_organization_settings`, `default_payment_settings`, `default_notification_settings`, `system_settings`, `feature_flags`, `integration_settings`, `default_seo_settings`, `metadata`, `sponsor_singular_nominative`, `sponsor_singular_genitive`, `sponsor_singular_dative`, `sponsor_singular_accusative`, `sponsor_singular_instrumental`, `sponsor_singular_prepositional`, `sponsor_plural_nominative`, `sponsor_plural_genitive`, `sponsor_plural_dative`, `sponsor_plural_accusative`, `sponsor_plural_instrumental`, `sponsor_plural_prepositional`, `created_at`, `updated_at`, `org_singular_nominative`, `org_singular_genitive`, `org_singular_dative`, `org_singular_accusative`, `org_singular_instrumental`, `org_singular_prepositional`, `org_plural_nominative`, `org_plural_genitive`, `org_plural_dative`, `org_plural_accusative`, `org_plural_instrumental`, `org_plural_prepositional`, `member_singular_nominative`, `member_singular_genitive`, `member_singular_dative`, `member_singular_accusative`, `member_singular_instrumental`, `member_singular_prepositional`, `member_plural_nominative`, `member_plural_genitive`, `member_plural_dative`, `member_plural_accusative`, `member_plural_instrumental`, `member_plural_prepositional`) VALUES
(1, 'поступить', 'выпуститься', 'поддержать', 'Система управления школами', 'Платформа для управления школами и выпускниками', 'ru', 'Europe/Moscow', 'RUB', '{\"theme\": \"default\", \"dark_mode\": false, \"font_family\": \"Inter\", \"accent_color\": \"#10B981\", \"primary_color\": \"#3B82F6\", \"secondary_color\": \"#6B7280\"}', '{\"currency\": \"RUB\", \"max_amount\": 100000000, \"min_amount\": 100, \"auto_approve\": true, \"enabled_methods\": [\"yookassa\", \"tinkoff\"], \"commission_percentage\": 0}', '{\"email_notifications\": true, \"donation_notifications\": true, \"telegram_notifications\": false, \"member_registration_notifications\": true}', '{\"maintenance_mode\": false, \"registration_enabled\": true, \"default_city_fallback\": \"Казань\", \"auto_approve_organizations\": false}', '{\"news_enabled\": true, \"slider_enabled\": true, \"gallery_enabled\": true, \"members_enabled\": true, \"projects_enabled\": true, \"donations_enabled\": true}', '{\"yandex_map_apikey\": \"8905e1da-6efd-4fe1-8b0b-6108dba8d1f7\", \"yookassa_test_mode\": true, \"telegram_bot_enabled\": false, \"yandex_suggest_apikey\": null}', '{\"robots_default\": \"index,follow\", \"sitemap_enabled\": true, \"meta_title_template\": \"{name} - {type_name}\", \"meta_description_template\": \"{description}\"}', '{\"version\": \"1.0.0\", \"created_at\": \"2025-09-29T19:54:01.227098Z\"}', 'спонсор', 'спонсора', 'спонсору', 'спонсора', 'спонсором', 'спонсоре', 'спонсоры', 'спонсоров', 'спонсорам', 'спонсоров', 'спонсорами', 'спонсорах', '2025-09-29 16:54:01', '2025-10-21 06:13:36', 'школа', 'школы', 'школе', 'школу', 'школой', 'школе', 'школы', 'школ', 'школам', 'школы', 'школами', 'школах', 'выпускник', 'выпускника', 'выпускнику', 'выпускника', 'выпускником', 'выпускнике', 'выпускники', 'выпускников', 'выпускникам', 'выпускников', 'выпускниками', 'выпускниках');

-- --------------------------------------------------------

--
-- Структура таблицы `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `members`
--

CREATE TABLE `members` (
  `id` bigint UNSIGNED NOT NULL,
  `organization_id` bigint UNSIGNED NOT NULL,
  `first_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `middle_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `graduation_year` int DEFAULT NULL,
  `class_letter` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `class_number` int DEFAULT NULL,
  `profession` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `social_links` json DEFAULT NULL,
  `biography` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `achievements` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `member_type` enum('alumni','student','patient','beneficiary','volunteer','staff','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'other',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `is_public` tinyint(1) NOT NULL DEFAULT '1',
  `contact_permissions` json DEFAULT NULL,
  `last_contact_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `members`
--

INSERT INTO `members` (`id`, `organization_id`, `first_name`, `last_name`, `middle_name`, `photo`, `graduation_year`, `class_letter`, `class_number`, `profession`, `company`, `position`, `email`, `phone`, `social_links`, `biography`, `achievements`, `member_type`, `is_featured`, `is_public`, `contact_permissions`, `last_contact_at`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'Иван', 'Петров', 'Сергеевич', NULL, 2020, 'А', 11, 'Программист', 'Яндекс', 'Senior Developer', 'ivan.petrov@example.com', NULL, NULL, NULL, 'Золотая медаль, призер олимпиад по программированию', 'alumni', 1, 1, NULL, NULL, NULL, '2025-09-27 08:58:26', '2025-09-27 08:58:26'),
(2, 2, 'Анна', 'Смирнова', NULL, NULL, NULL, NULL, NULL, 'Ветеринар', 'Приют \"Добрые сердца\"', 'Главный ветеринар', 'anna.smirnova@shelter.ru', NULL, NULL, NULL, 'Спасла более 500 животных', 'staff', 1, 1, NULL, NULL, NULL, '2025-09-27 08:58:26', '2025-09-27 08:58:26');

-- --------------------------------------------------------

--
-- Структура таблицы `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_08_26_100418_add_two_factor_columns_to_users_table', 1),
(5, '2025_09_27_090999_create_federal_districts_table', 1),
(6, '2025_09_27_091000_create_regions_table', 1),
(7, '2025_09_27_091001_create_cities_table', 1),
(8, '2025_09_27_091002_create_settlements_table', 1),
(9, '2025_09_27_093034_create_organizations_table', 1),
(10, '2025_09_27_093035_create_organization_domains_table', 1),
(11, '2025_09_27_093036_create_organization_settings_table', 1),
(12, '2025_09_27_093038_create_organization_seo_table', 1),
(13, '2025_09_27_093039_create_organization_projects_table', 1),
(14, '2025_09_27_093045_create_fundraisers_table', 1),
(15, '2025_09_27_093047_create_members_table', 1),
(16, '2025_09_27_093203_create_donations_table', 1),
(17, '2025_09_27_093204_create_organization_news_table', 1),
(21, '2025_09_27_101732_update_regions_type_enum', 2),
(22, '2025_09_27_093205_create_organization_media_table', 3),
(23, '2025_09_27_093207_create_organization_users_table', 3),
(24, '2025_09_27_093208_create_organization_statistics_table', 3),
(25, '2025_09_27_093210_create_payment_methods_table', 3),
(26, '2025_09_27_093211_create_payment_transactions_table', 3),
(27, '2025_09_27_093212_create_payment_logs_table', 3),
(28, '2025_09_27_093213_update_donations_table_for_payments', 3),
(29, '2025_09_27_234707_create_organization_pages_table', 4),
(30, '2025_09_28_081136_create_permission_tables', 5),
(31, '2025_09_28_084706_create_personal_access_tokens_table', 6),
(32, '2025_09_28_085033_create_oauth_auth_codes_table', 7),
(33, '2025_09_28_085034_create_oauth_access_tokens_table', 7),
(34, '2025_09_28_085035_create_oauth_refresh_tokens_table', 7),
(35, '2025_09_28_085036_create_oauth_clients_table', 7),
(36, '2025_09_28_085037_create_oauth_device_codes_table', 7),
(37, '2025_09_28_164226_create_organization_menus_table', 8),
(38, '2025_09_28_164228_create_organization_menu_items_table', 9),
(39, '2025_09_28_172157_create_organization_sliders_table', 10),
(40, '2025_09_28_172159_create_organization_slider_slides_table', 10),
(41, '2025_09_28_173830_create_organization_sites_table', 10),
(42, '2025_09_28_173923_create_organization_site_pages_table', 10),
(43, '2025_09_29_133327_add_advanced_settings_to_organization_settings_table', 10),
(44, '2025_09_29_143713_create_site_templates_table', 10),
(45, '2025_09_29_143717_create_widgets_table', 10),
(46, '2025_09_29_143722_create_widget_positions_table', 10),
(47, '2025_09_29_143732_create_site_widgets_table', 10),
(48, '2025_09_29_155020_add_deleted_at_to_organization_sites_table', 11),
(49, '2025_09_29_155117_add_deleted_at_to_site_widgets_table', 12),
(50, '2025_09_29_191559_create_organization_types_table', 13),
(51, '2025_09_29_193136_create_global_settings_table', 14),
(52, '2025_09_29_195249_update_global_settings_declensions', 15),
(53, '2025_09_29_201740_create_main_site_settings_table', 16),
(54, '2025_09_30_070027_make_domain_id_nullable_in_organization_sites_table', 17),
(55, '2025_09_30_074211_add_deleted_at_to_organization_site_pages_table', 18),
(56, '2025_09_30_084743_remove_is_premium_from_widgets_table', 19),
(57, '2025_09_30_110152_add_widgets_config_to_organization_sites_table', 20),
(58, '2025_10_01_153509_remove_location_from_organization_menus_table', 21),
(59, '2025_10_01_154238_create_form_widgets_table', 22),
(60, '2025_10_01_154242_create_form_fields_table', 22),
(61, '2025_10_01_154246_create_form_submissions_table', 22),
(62, '2025_10_01_154250_create_form_actions_table', 22),
(63, '2025_10_01_174942_create_form_submissions_data_table', 23),
(64, '2024_01_15_000001_add_region_id_to_donations_table', 24),
(65, '2025_10_14_000000_add_referrer_user_id_to_donations_table', 25),
(66, '2025_10_14_000001_add_referred_by_id_to_users_table', 25),
(67, '2025_10_14_225643_add_is_active_to_users_table', 26),
(69, '2025_10_15_112253_create_site_widget_hero_slides_table', 27),
(70, '2025_10_15_112257_create_site_widget_form_fields_table', 27),
(71, '2025_10_15_120039_create_site_widget_menu_items_table', 28),
(72, '2025_10_15_120046_create_site_widget_gallery_images_table', 28),
(73, '2025_10_15_120050_create_site_widget_donation_settings_table', 28),
(74, '2025_10_15_120055_create_site_widget_region_rating_settings_table', 28),
(75, '2025_10_15_120103_create_site_widget_donations_list_settings_table', 28),
(76, '2025_10_15_120110_create_site_widget_referral_leaderboard_settings_table', 28),
(77, '2025_10_15_120115_create_site_widget_image_settings_table', 28),
(78, '2025_10_15_121520_remove_widgets_config_from_organization_sites_table', 29),
(79, '2025_10_15_153853_remove_redundant_widget_tables', 30),
(80, '2025_10_15_153858_remove_config_fields_from_site_widgets', 30),
(81, '2025_10_15_153858_create_site_widget_configs_table', 31),
(82, '2025_10_15_212014_rename_slide_order_to_sort_order_in_hero_slides_table', 32),
(83, '2025_10_15_212213_rename_field_order_to_sort_order_in_form_fields_table', 33),
(84, '2025_10_16_000001_add_indexes_and_checks', 34),
(85, '2025_10_16_000002_rename_widgets_slug_to_widget_slug', 35),
(86, '2025_10_20_151106_add_slider_widget_to_widgets_table', 36),
(87, '2025_10_20_151204_create_site_widget_slider_slides_table', 36),
(88, '2025_10_21_100001_create_organization_page_seo_table', 37),
(89, '2025_10_21_110000_add_sponsor_fields_to_global_settings_table', 38),
(90, '2025_10_21_121000_add_org_site_to_users_table', 39),
(92, '2025_10_21_122000_add_header_footer_positions', 40),
(93, '2025_10_22_103211_update_form_fields_field_type_enum', 41),
(94, '2025_10_22_130000_rename_organization_sites_to_sites', 42),
(95, '2025_10_22_130100_rename_organization_site_pages_to_site_pages', 42),
(96, '2025_10_22_130200_alter_sites_add_site_type', 42),
(97, '2025_10_22_130300_drop_main_site_settings', 42),
(98, '2025_10_22_182715_rename_organization_domains_to_domains', 42),
(99, '2025_10_22_183135_rename_organization_projects_to_projects', 42),
(100, '2025_10_22_183140_make_organization_id_nullable_in_projects_table', 42),
(101, '2025_10_22_183920_rename_organization_page_seo_to_page_seo', 42),
(103, '2025_10_22_200254_create_site_page_seo_table', 43),
(104, '2025_10_22_200634_fix_foreign_key_constraint_names', 43);

-- --------------------------------------------------------

--
-- Структура таблицы `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(1, 'App\\Models\\User', 1);

-- --------------------------------------------------------

--
-- Структура таблицы `organizations`
--

CREATE TABLE `organizations` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `region_id` bigint UNSIGNED DEFAULT NULL,
  `city_id` bigint UNSIGNED DEFAULT NULL,
  `settlement_id` bigint UNSIGNED DEFAULT NULL,
  `city_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `images` json DEFAULT NULL,
  `contacts` json DEFAULT NULL,
  `type` enum('school','gymnasium','lyceum','college','shelter','hospital','church','charity','foundation','ngo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'school',
  `status` enum('active','inactive','pending') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `is_public` tinyint(1) NOT NULL DEFAULT '1',
  `features` json DEFAULT NULL,
  `founded_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `organizations`
--

INSERT INTO `organizations` (`id`, `name`, `slug`, `description`, `address`, `phone`, `email`, `website`, `region_id`, `city_id`, `settlement_id`, `city_name`, `latitude`, `longitude`, `logo`, `images`, `contacts`, `type`, `status`, `is_public`, `features`, `founded_at`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 'Средняя общеобразовательная школа №123', 'school-123', 'Современная школа с углубленным изучением математики и физики', 'ул. Ленина, 15, Москва', '+7 (495) 123-45-67', 'info@school123.ru', 'https://school123.ru', 4, NULL, NULL, NULL, NULL, NULL, 'organizations/logos/original_izobrazenie-whatsapp-2025-05-23-v-191645-39a449fd_1759186030.jpg', '[]', NULL, 'school', 'active', 1, NULL, '1990-08-31 21:00:00', NULL, '2025-09-27 08:58:26', '2025-09-29 19:47:14'),
(2, 'Приют \"Добрые сердца\"', 'shelter-dobrye-serdca', 'Приют для бездомных животных. Спасение, лечение и пристройство', 'ул. Милосердия, 42, Санкт-Петербург', '+7 (812) 987-65-43', 'help@shelter.ru', NULL, 5, NULL, NULL, 'Санкт-Петербург', 59.93110000, 30.36090000, NULL, NULL, NULL, 'shelter', 'active', 1, NULL, '2015-03-14 21:00:00', '2025-10-14 19:52:35', '2025-09-27 08:58:26', '2025-10-14 19:52:35'),
(3, 'Детская больница №1', 'children-hospital-1', 'Современная детская больница с высокотехнологичным оборудованием', 'пр. Здоровья, 10, Москва', '+7 (495) 555-12-34', 'info@children-hospital.ru', NULL, 1, NULL, NULL, 'Москва', 55.74580000, 37.60760000, NULL, NULL, NULL, 'hospital', 'active', 1, NULL, '1984-12-31 21:00:00', '2025-10-14 19:52:39', '2025-09-27 08:58:26', '2025-10-14 19:52:39'),
(4, 'Средняя общеобразовательная школа №123', 'srednyaya-obscheobrazovatelnaya-shkola-no123', 'Современная школа с углубленным изучением математики и физики', 'ул. Ленина, 15, Москва', '+7 (495) 123-45-67', 'info@school123.ru', 'https://school123.ru', 1, NULL, NULL, 'Москва', 55.75580000, 37.61760000, NULL, NULL, NULL, 'school', 'active', 1, NULL, '1990-08-31 21:00:00', NULL, '2025-10-13 05:04:57', '2025-10-13 05:04:57'),
(5, 'Приют \"Добрые сердца\"', 'priyut-dobrye-serdtsa', 'Приют для бездомных животных. Спасение, лечение и пристройство', 'ул. Милосердия, 42, Санкт-Петербург', '+7 (812) 987-65-43', 'help@shelter.ru', NULL, 5, NULL, NULL, 'Санкт-Петербург', 59.93110000, 30.36090000, NULL, NULL, NULL, 'shelter', 'active', 1, NULL, '2015-03-14 21:00:00', '2025-10-14 19:52:26', '2025-10-13 05:04:57', '2025-10-14 19:52:26'),
(6, 'Детская больница №1', 'detskaya-bolnitsa-no1', 'Современная детская больница с высокотехнологичным оборудованием', 'пр. Здоровья, 10, Москва', '+7 (495) 555-12-34', 'info@children-hospital.ru', NULL, 1, NULL, NULL, 'Москва', 55.74580000, 37.60760000, NULL, NULL, NULL, 'hospital', 'active', 1, NULL, '1984-12-31 21:00:00', '2025-10-14 19:52:02', '2025-10-13 05:04:57', '2025-10-14 19:52:02'),
(7, 'Главный сайт', 'glavnyy-sayt', 'Специальная организация для главного сайта системы', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'foundation', 'active', 1, NULL, NULL, NULL, '2025-10-22 16:59:06', '2025-10-22 16:59:06');

-- --------------------------------------------------------

--
-- Структура таблицы `organization_media`
--

CREATE TABLE `organization_media` (
  `id` bigint UNSIGNED NOT NULL,
  `organization_id` bigint UNSIGNED NOT NULL,
  `mediaable_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mediaable_id` bigint UNSIGNED NOT NULL,
  `filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int NOT NULL,
  `file_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('image','video','document','audio','archive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'image',
  `metadata` json DEFAULT NULL,
  `alt_text` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `caption` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_public` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `organization_news`
--

CREATE TABLE `organization_news` (
  `id` bigint UNSIGNED NOT NULL,
  `organization_id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `excerpt` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `featured_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gallery` json DEFAULT NULL,
  `status` enum('draft','published','archived') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `category` enum('news','events','achievements','announcements','projects','medical','social') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'news',
  `tags` json DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `allow_comments` tinyint(1) NOT NULL DEFAULT '1',
  `seo_settings` json DEFAULT NULL,
  `published_at` timestamp NULL DEFAULT NULL,
  `views_count` int NOT NULL DEFAULT '0',
  `likes_count` int NOT NULL DEFAULT '0',
  `shares_count` int NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `organization_seo`
--

CREATE TABLE `organization_seo` (
  `id` bigint UNSIGNED NOT NULL,
  `organization_id` bigint UNSIGNED NOT NULL,
  `meta_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `meta_keywords` json DEFAULT NULL,
  `og_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `og_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `og_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `twitter_card` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'summary_large_image',
  `twitter_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `twitter_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `twitter_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `canonical_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `schema_markup` json DEFAULT NULL,
  `robots_meta` json DEFAULT NULL,
  `custom_meta_tags` json DEFAULT NULL,
  `sitemap_config` json DEFAULT NULL,
  `sitemap_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `last_seo_audit` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `organization_seo`
--

INSERT INTO `organization_seo` (`id`, `organization_id`, `meta_title`, `meta_description`, `meta_keywords`, `og_title`, `og_description`, `og_image`, `twitter_card`, `twitter_title`, `twitter_description`, `twitter_image`, `canonical_url`, `schema_markup`, `robots_meta`, `custom_meta_tags`, `sitemap_config`, `sitemap_enabled`, `last_seo_audit`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, NULL, NULL, NULL, NULL, NULL, 'summary_large_image', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, '2025-09-27 08:58:26', '2025-09-27 08:58:26'),
(2, 2, NULL, NULL, NULL, NULL, NULL, NULL, 'summary_large_image', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, '2025-09-27 08:58:26', '2025-09-27 08:58:26'),
(3, 3, NULL, NULL, NULL, NULL, NULL, NULL, 'summary_large_image', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, '2025-09-27 08:58:26', '2025-09-27 08:58:26'),
(4, 4, NULL, NULL, NULL, NULL, NULL, NULL, 'summary_large_image', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, '2025-10-13 05:04:57', '2025-10-13 05:04:57'),
(5, 5, NULL, NULL, NULL, NULL, NULL, NULL, 'summary_large_image', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, '2025-10-13 05:04:57', '2025-10-13 05:04:57'),
(6, 6, NULL, NULL, NULL, NULL, NULL, NULL, 'summary_large_image', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, '2025-10-13 05:04:57', '2025-10-13 05:04:57'),
(7, 7, NULL, NULL, NULL, NULL, NULL, NULL, 'summary_large_image', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, '2025-10-22 16:59:06', '2025-10-22 16:59:06');

-- --------------------------------------------------------

--
-- Структура таблицы `organization_settings`
--

CREATE TABLE `organization_settings` (
  `id` bigint UNSIGNED NOT NULL,
  `organization_id` bigint UNSIGNED NOT NULL,
  `theme` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default',
  `primary_color` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#007bff',
  `secondary_color` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#6c757d',
  `accent_color` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#28a745',
  `font_family` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Inter',
  `dark_mode` tinyint(1) NOT NULL DEFAULT '0',
  `custom_css` json DEFAULT NULL,
  `layout_config` json DEFAULT NULL,
  `advanced_layout_config` json DEFAULT NULL,
  `seo_settings` json DEFAULT NULL,
  `social_media_settings` json DEFAULT NULL,
  `analytics_settings` json DEFAULT NULL,
  `security_settings` json DEFAULT NULL,
  `backup_settings` json DEFAULT NULL,
  `external_integrations` json DEFAULT NULL,
  `advanced_notification_settings` json DEFAULT NULL,
  `theme_settings` json DEFAULT NULL,
  `performance_settings` json DEFAULT NULL,
  `settings_metadata` json DEFAULT NULL,
  `feature_flags` json DEFAULT NULL,
  `integration_settings` json DEFAULT NULL,
  `payment_settings` json DEFAULT NULL,
  `notification_settings` json DEFAULT NULL,
  `maintenance_mode` tinyint(1) NOT NULL DEFAULT '0',
  `maintenance_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `organization_settings`
--

INSERT INTO `organization_settings` (`id`, `organization_id`, `theme`, `primary_color`, `secondary_color`, `accent_color`, `font_family`, `dark_mode`, `custom_css`, `layout_config`, `advanced_layout_config`, `seo_settings`, `social_media_settings`, `analytics_settings`, `security_settings`, `backup_settings`, `external_integrations`, `advanced_notification_settings`, `theme_settings`, `performance_settings`, `settings_metadata`, `feature_flags`, `integration_settings`, `payment_settings`, `notification_settings`, `maintenance_mode`, `maintenance_message`, `created_at`, `updated_at`) VALUES
(1, 1, 'default', '#007bff', '#6c757d', '#28a745', 'Inter', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-09-27 08:58:26', '2025-09-27 08:58:26'),
(2, 2, 'default', '#007bff', '#6c757d', '#28a745', 'Inter', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-09-27 08:58:26', '2025-09-27 08:58:26'),
(3, 3, 'default', '#007bff', '#6c757d', '#28a745', 'Inter', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-09-27 08:58:26', '2025-09-27 08:58:26'),
(4, 4, 'default', '#007bff', '#6c757d', '#28a745', 'Inter', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-10-13 05:04:57', '2025-10-13 05:04:57'),
(5, 5, 'default', '#007bff', '#6c757d', '#28a745', 'Inter', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-10-13 05:04:57', '2025-10-13 05:04:57'),
(6, 6, 'default', '#007bff', '#6c757d', '#28a745', 'Inter', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-10-13 05:04:57', '2025-10-13 05:04:57'),
(7, 7, 'default', '#007bff', '#6c757d', '#28a745', 'Inter', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-10-22 16:59:06', '2025-10-22 16:59:06');

-- --------------------------------------------------------

--
-- Структура таблицы `organization_sliders`
--

CREATE TABLE `organization_sliders` (
  `id` bigint UNSIGNED NOT NULL,
  `organization_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hero',
  `settings` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `position` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hero',
  `display_conditions` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `organization_slider_slides`
--

CREATE TABLE `organization_slider_slides` (
  `id` bigint UNSIGNED NOT NULL,
  `slider_id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtitle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `background_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `button_text` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `button_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `button_style` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'primary',
  `content_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content_data` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `display_from` timestamp NULL DEFAULT NULL,
  `display_until` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `organization_statistics`
--

CREATE TABLE `organization_statistics` (
  `id` bigint UNSIGNED NOT NULL,
  `organization_id` bigint UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `page_views` int NOT NULL DEFAULT '0',
  `unique_visitors` int NOT NULL DEFAULT '0',
  `new_donations` int NOT NULL DEFAULT '0',
  `donation_amount` bigint NOT NULL DEFAULT '0',
  `new_projects` int NOT NULL DEFAULT '0',
  `new_members` int NOT NULL DEFAULT '0',
  `new_news` int NOT NULL DEFAULT '0',
  `traffic_sources` json DEFAULT NULL,
  `popular_pages` json DEFAULT NULL,
  `device_stats` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `organization_types`
--

CREATE TABLE `organization_types` (
  `id` bigint UNSIGNED NOT NULL,
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `plural` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `member_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `member_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `member_plural` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `domain_prefix` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `features` json DEFAULT NULL,
  `categories` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `organization_types`
--

INSERT INTO `organization_types` (`id`, `key`, `name`, `plural`, `member_type`, `member_name`, `member_plural`, `domain_prefix`, `features`, `categories`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'school', 'Школа', 'Школы', 'alumni', 'Выпускник', 'Выпускники', 'schools', '[\"graduation_years\", \"classes\", \"alumni_directory\", \"achievements\", \"projects\", \"donations\", \"news\", \"gallery\", \"events\"]', '{\"events\": \"Мероприятия\", \"sports\": \"Спорт\", \"canteen\": \"Столовая\", \"charity\": \"Благотворительность\", \"library\": \"Библиотека\", \"education\": \"Образование\", \"equipment\": \"Оборудование\", \"technology\": \"Технологии\", \"maintenance\": \"Содержание\", \"construction\": \"Строительство\"}', 1, '2025-09-29 16:24:35', '2025-09-29 16:24:35');

-- --------------------------------------------------------

--
-- Структура таблицы `organization_users`
--

CREATE TABLE `organization_users` (
  `id` bigint UNSIGNED NOT NULL,
  `organization_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `role` enum('admin','editor','moderator','viewer') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'viewer',
  `status` enum('active','inactive','pending','suspended') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `permissions` json DEFAULT NULL,
  `joined_at` timestamp NULL DEFAULT NULL,
  `last_active_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `payment_logs`
--

CREATE TABLE `payment_logs` (
  `id` bigint UNSIGNED NOT NULL,
  `payment_transaction_id` bigint UNSIGNED NOT NULL,
  `action` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'info',
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `context` json DEFAULT NULL,
  `ip_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `payment_methods`
--

CREATE TABLE `payment_methods` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `gateway` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `settings` json DEFAULT NULL,
  `fee_percentage` decimal(5,2) NOT NULL DEFAULT '0.00',
  `fee_fixed` int NOT NULL DEFAULT '0',
  `min_amount` int NOT NULL DEFAULT '100',
  `max_amount` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_test_mode` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `payment_methods`
--

INSERT INTO `payment_methods` (`id`, `name`, `slug`, `gateway`, `icon`, `description`, `settings`, `fee_percentage`, `fee_fixed`, `min_amount`, `max_amount`, `is_active`, `is_test_mode`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Система быстрых платежей (СБП)', 'sbp', 'App\\Services\\Payment\\SBPGateway', 'sbp.svg', 'Оплата через СБП - быстро, безопасно и удобно', '{\"secret_key\": \"\", \"merchant_id\": \"\"}', 0.00, 0, 100, 0, 1, 1, 1, '2025-09-27 08:55:05', '2025-10-13 05:04:57'),
(2, 'Банковская карта', 'bankcard', 'App\\Services\\Payment\\YooKassaGateway', 'bankcard.svg', 'Оплата банковской картой Visa, Mastercard, МИР', '{\"shop_id\": \"\", \"secret_key\": \"\"}', 2.90, 0, 100, 0, 1, 1, 2, '2025-09-27 08:55:05', '2025-09-27 08:55:05'),
(3, 'Сбербанк', 'sberpay', 'App\\Services\\Payment\\YooKassaGateway', 'sberpay.svg', 'Оплата через Сбербанк Онлайн', '{\"shop_id\": \"\", \"secret_key\": \"\"}', 2.90, 0, 100, 0, 1, 1, 3, '2025-09-27 08:55:05', '2025-09-27 08:55:05'),
(4, 'Тинькофф', 'tinkoff', 'App\\Services\\Payment\\TinkoffGateway', 'tinkoff.svg', 'Оплата через Тинькофф Банк', '{\"password\": \"\", \"terminal_key\": \"\"}', 2.75, 0, 100, 0, 1, 1, 4, '2025-09-27 08:55:05', '2025-10-13 05:04:57'),
(5, 'Наличные', 'cash', NULL, 'cash.svg', 'Оплата наличными в офисе организации', '[]', 0.00, 0, 100, 0, 1, 0, 5, '2025-09-27 08:55:05', '2025-09-27 08:55:05');

-- --------------------------------------------------------

--
-- Структура таблицы `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `id` bigint UNSIGNED NOT NULL,
  `organization_id` bigint UNSIGNED NOT NULL,
  `fundraiser_id` bigint UNSIGNED DEFAULT NULL,
  `project_id` bigint UNSIGNED DEFAULT NULL,
  `payment_method_id` bigint UNSIGNED NOT NULL,
  `transaction_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `external_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` bigint NOT NULL,
  `currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'RUB',
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_method_slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_details` json DEFAULT NULL,
  `gateway_response` json DEFAULT NULL,
  `webhook_data` json DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `return_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `callback_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `success_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `failure_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `failed_at` timestamp NULL DEFAULT NULL,
  `refunded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'users.view', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(2, 'users.create', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(3, 'users.edit', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(4, 'users.delete', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(5, 'users.manage_roles', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(6, 'organizations.view', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(7, 'organizations.create', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(8, 'organizations.edit', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(9, 'organizations.delete', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(10, 'organizations.manage_members', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(11, 'sites.view', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(12, 'sites.create', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(13, 'sites.edit', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(14, 'sites.delete', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(15, 'sites.publish', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(16, 'projects.view', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(17, 'projects.create', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(18, 'projects.edit', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(19, 'projects.delete', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(20, 'projects.manage_donations', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(21, 'payments.view', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(22, 'payments.manage', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(23, 'payments.refund', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(24, 'statistics.view', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(25, 'statistics.export', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(26, 'settings.view', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(27, 'settings.edit', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(28, 'settings.manage_system', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(29, 'roles.view', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(30, 'roles.create', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(31, 'roles.edit', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(32, 'roles.delete', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(33, 'permissions.manage', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11');

-- --------------------------------------------------------

--
-- Структура таблицы `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `projects`
--

CREATE TABLE `projects` (
  `id` bigint UNSIGNED NOT NULL,
  `organization_id` bigint UNSIGNED DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gallery` json DEFAULT NULL,
  `target_amount` bigint DEFAULT NULL,
  `collected_amount` bigint NOT NULL DEFAULT '0',
  `status` enum('draft','active','completed','cancelled','suspended') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `category` enum('construction','equipment','sports','education','charity','events','medical','social','environmental','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'other',
  `tags` json DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `beneficiaries` json DEFAULT NULL,
  `progress_updates` json DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `views_count` int NOT NULL DEFAULT '0',
  `donations_count` int NOT NULL DEFAULT '0',
  `seo_settings` json DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `projects`
--

INSERT INTO `projects` (`id`, `organization_id`, `title`, `slug`, `description`, `short_description`, `image`, `gallery`, `target_amount`, `collected_amount`, `status`, `category`, `tags`, `start_date`, `end_date`, `beneficiaries`, `progress_updates`, `featured`, `views_count`, `donations_count`, `seo_settings`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'Ремонт спортивного зала', 'sport-hall-renovation', 'Необходим капитальный ремонт спортивного зала: замена напольного покрытия, покраска стен, установка нового спортивного оборудования.', 'Капитальный ремонт спортивного зала', NULL, NULL, 50000000, 12500000, 'active', 'construction', NULL, '2025-09-27', '2025-12-27', NULL, NULL, 1, 0, 0, NULL, NULL, '2025-09-27 08:58:26', '2025-09-27 08:58:26'),
(2, 2, 'Лечение больных животных', 'animal-treatment', 'Сбор средств на лечение и реабилитацию животных, пострадавших от жестокого обращения.', 'Лечение и реабилитация животных', NULL, NULL, 30000000, 8500000, 'active', 'medical', NULL, '2025-09-27', '2026-03-27', NULL, NULL, 1, 0, 0, NULL, NULL, '2025-09-27 08:58:26', '2025-09-27 08:58:26'),
(3, 3, 'Закупка современного медицинского оборудования', 'medical-equipment', 'Приобретение современного диагностического оборудования для улучшения качества лечения детей.', 'Современное медицинское оборудование', NULL, NULL, 150000000, 25000000, 'active', 'medical', NULL, '2025-09-27', '2026-09-27', NULL, NULL, 1, 0, 0, NULL, NULL, '2025-09-27 08:58:26', '2025-09-27 08:58:26');

-- --------------------------------------------------------

--
-- Структура таблицы `regions`
--

CREATE TABLE `regions` (
  `id` bigint UNSIGNED NOT NULL,
  `federal_district_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `capital` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `population` bigint DEFAULT NULL,
  `area` bigint DEFAULT NULL,
  `timezone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Europe/Moscow',
  `type` enum('region','republic','krai','oblast','autonomous_okrug','autonomous_oblast','federal_city') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'region',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `regions`
--

INSERT INTO `regions` (`id`, `federal_district_id`, `name`, `slug`, `code`, `capital`, `latitude`, `longitude`, `population`, `area`, `timezone`, `type`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Москва', 'moskva', '77', 'Москва', 55.75580000, 37.61760000, 12678079, 2561, 'Europe/Moscow', 'federal_city', 1, '2025-09-27 07:05:49', '2025-09-27 07:16:55'),
(2, 1, 'Московская область', 'moskovskaia-oblast', '50', 'Москва', 55.75580000, 37.61760000, 7500000, 44300, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:05:49', '2025-09-27 07:16:55'),
(3, 1, 'Белгородская область', 'belgorod-oblast', '31', 'Белгород', 50.59580000, 36.58730000, 1540000, 27100, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:05:49', '2025-09-27 07:05:49'),
(4, 1, 'Брянская область', 'bryansk-oblast', '32', 'Брянск', 53.24340000, 34.36540000, 1200000, 34900, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:07:43', '2025-09-27 07:07:43'),
(5, 2, 'Санкт-Петербург', 'sankt-peterburg', '78', 'Санкт-Петербург', 59.93110000, 30.36090000, 5398064, 1439, 'Europe/Moscow', 'federal_city', 1, '2025-09-27 07:07:43', '2025-09-27 07:16:55'),
(6, 2, 'Ленинградская область', 'leningrad-oblast', '47', 'Гатчина', 59.56540000, 30.12840000, 1850000, 83900, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:07:43', '2025-09-27 07:07:43'),
(7, 2, 'Архангельская область', 'arkhangelsk-oblast', '29', 'Архангельск', 64.54010000, 40.54330000, 1120000, 413100, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:07:43', '2025-09-27 07:07:43'),
(8, 2, 'Вологодская область', 'vologda-oblast', '35', 'Вологда', 59.21810000, 39.88860000, 1180000, 144500, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:07:43', '2025-09-27 07:07:43'),
(9, 2, 'Калининградская область', 'kaliningrad-oblast', '39', 'Калининград', 54.70650000, 20.51100000, 1010000, 15100, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:07:43', '2025-09-27 07:07:43'),
(10, 5, 'Республика Татарстан', 'respublika-tatarstan', '16', 'Казань', NULL, NULL, 3900000, 67847, 'Europe/Moscow', 'republic', 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(11, 5, 'Республика Башкортостан', 'respublika-baskortostan', '2', 'Уфа', NULL, NULL, 4000000, 142947, 'Europe/Moscow', 'republic', 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(12, 8, 'Амурская область', 'amurskaia-oblast', '28', 'Благовещенск', NULL, NULL, 790000, 361900, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(13, 8, 'Приморский край', 'primorskii-krai', '25', 'Владивосток', NULL, NULL, 1900000, 164700, 'Europe/Moscow', 'krai', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(14, 6, 'Ямало-Ненецкий автономный округ', 'iamalo-neneckii-avtonomnyi-okrug', '89', 'Салехард', NULL, NULL, 550000, 769300, 'Europe/Moscow', 'autonomous_okrug', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(15, 6, 'Свердловская область', 'sverdlovskaia-oblast', '66', 'Екатеринбург', NULL, NULL, 4300000, 194307, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:16:55', '2025-09-27 07:16:55'),
(16, 7, 'Забайкальский край', 'zabaikalskii-krai', '75', 'Чита', NULL, NULL, 1100000, 431900, 'Europe/Moscow', 'krai', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(17, 5, 'Республика Мордовия', 'respublika-mordoviia', '13', 'Саранск', NULL, NULL, 800000, 26100, 'Europe/Moscow', 'republic', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(18, 3, 'Астраханская область', 'astraxanskaia-oblast', '30', 'Астрахань', NULL, NULL, 1000000, 49100, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:16:55', '2025-09-27 08:35:21'),
(19, 5, 'Ханты-Мансийский автономный округ — Югра', 'xanty-mansiiskii-avtonomnyi-okrug-iugra', '86', 'Ханты-Мансийск', NULL, NULL, 1700000, 534800, 'Europe/Moscow', 'autonomous_okrug', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(20, 6, 'Тюменская область', 'tiumenskaia-oblast', '72', 'Тюмень', NULL, NULL, 3700000, 160100, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(21, 5, 'Республика Марий Эл', 'respublika-marii-el', '12', 'Йошкар-Ола', NULL, NULL, 680000, 23300, 'Europe/Moscow', 'republic', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(22, 8, 'Республика Алтай', 'respublika-altai', '4', 'Горно-Алтайск', NULL, NULL, 220000, 92900, 'Europe/Moscow', 'republic', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(23, 8, 'Красноярский край', 'krasnoiarskii-krai', '27', 'Красноярск', NULL, NULL, 2800000, 2366800, 'Europe/Moscow', 'krai', 1, '2025-09-27 07:16:55', '2025-09-27 08:35:21'),
(24, 5, 'Саратовская область', 'saratovskaia-oblast', '64', 'Саратов', NULL, NULL, 2400000, 101200, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(25, 4, 'Республика Кабардино-Балкария', 'respublika-kabardino-balkariia', '07', 'Нальчик', NULL, NULL, 870000, 12470, 'Europe/Moscow', 'republic', 1, '2025-09-27 07:16:55', '2025-09-27 08:30:14'),
(26, 5, 'Оренбургская область', 'orenburgskaia-oblast', '56', 'Оренбург', NULL, NULL, 1900000, 123700, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(27, 8, 'Камчатский край', 'kamcatskii-krai', '41', 'Петропавловск-Камчатский', NULL, NULL, 310000, 464300, 'Europe/Moscow', 'krai', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(28, 3, 'Республика Карачаево-Черкесия', 'respublika-karacaevo-cerkesiia', '9', 'Черкесск', NULL, NULL, 470000, 14200, 'Europe/Moscow', 'republic', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(29, 2, 'Республика Коми', 'respublika-komi', '11', 'Сыктывкар', NULL, NULL, 820000, 416800, 'Europe/Moscow', 'republic', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(30, 7, 'Республика Бурятия', 'respublika-buriatiia', '5', 'Улан-Удэ', NULL, NULL, 980000, 351300, 'Europe/Moscow', 'republic', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(31, 5, 'Сахалинская область', 'saxalinskaia-oblast', '63', 'Южно-Сахалинск', NULL, NULL, 490000, 87100, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(32, 1, 'Калужская область', 'kaluzskaia-oblast', '40', 'Калуга', NULL, NULL, 1000000, 29800, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(33, 2, 'Республика Тыва', 'respublika-tyva', '17', 'Кызыл', NULL, NULL, 330000, 168600, 'Europe/Moscow', 'republic', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(34, 1, 'Ярославская область', 'iaroslavskaia-oblast', '76', 'Ярославль', NULL, NULL, 1200000, 36100, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(35, 5, 'Нижегородская область', 'nizegorodskaia-oblast', '52', 'Нижний Новгород', NULL, NULL, 3200000, 76600, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(36, 7, 'Иркутская область', 'irkutskaia-oblast', '38', 'Иркутск', NULL, NULL, 2400000, 774800, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(37, 7, 'Алтайский край', 'altaiskii-krai', '22', 'Барнаул', NULL, NULL, 2300000, 167800, 'Europe/Moscow', 'krai', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(38, 5, 'Ульяновская область', 'ulianovskaia-oblast', '73', 'Ульяновск', NULL, NULL, 1200000, 37100, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(39, 1, 'Липецкая область', 'lipeckaia-oblast', '48', 'Липецк', NULL, NULL, 1100000, 24100, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(41, 4, 'Республика Ингушетия', 'respublika-ingusetiia', '06', 'Магас', NULL, NULL, 500000, 3123, 'Europe/Moscow', 'republic', 1, '2025-09-27 07:16:55', '2025-09-27 08:34:56'),
(42, 2, 'Ненецкий автономный округ', 'neneckii-avtonomnyi-okrug', '83', 'Нарьян-Мар', NULL, NULL, 45000, 176800, 'Europe/Moscow', 'autonomous_okrug', 1, '2025-09-27 07:17:50', '2025-09-27 08:34:56'),
(43, 3, 'Краснодарский край', 'krasnodarskii-krai', '23', 'Краснодар', NULL, NULL, 5600000, 75400, 'Europe/Moscow', 'krai', 1, '2025-09-27 07:17:50', '2025-09-27 08:34:56'),
(44, 8, 'Еврейская автономная область', 'evreiskaia-avtonomnaia-oblast', '79', 'Биробиджан', NULL, NULL, 160000, 36200, 'Europe/Moscow', 'autonomous_oblast', 1, '2025-09-27 07:17:50', '2025-09-27 08:34:56'),
(45, 4, 'Ставропольский край', 'stavropolskii-krai', '26', 'Ставрополь', NULL, NULL, 2800000, 66160, 'Europe/Moscow', 'krai', 1, '2025-09-27 07:17:50', '2025-09-27 08:34:56'),
(46, 1, 'Костромская область', 'kostromskaia-oblast', '44', 'Кострома', NULL, NULL, 630000, 60200, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:17:50', '2025-09-27 08:34:56'),
(47, 3, 'Республика Адыгея', 'respublika-adygeia', '01', 'Майкоп', NULL, NULL, 460000, 7792, 'Europe/Moscow', 'republic', 1, '2025-09-27 07:17:50', '2025-09-27 08:34:56'),
(48, 8, 'Республика Саха (Якутия)', 'respublika-saxa-iakutiia', '14', 'Якутск', NULL, NULL, 980000, 3084000, 'Europe/Moscow', 'republic', 1, '2025-09-27 07:17:50', '2025-09-27 08:34:56'),
(49, 2, 'Новгородская область', 'novgorodskaia-oblast', '53', 'Великий Новгород', NULL, NULL, 600000, 54500, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:17:50', '2025-09-27 08:34:56'),
(50, 2, 'Мурманская область', 'murmanskaia-oblast', '51', 'Мурманск', NULL, NULL, 750000, 144900, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:17:50', '2025-09-27 08:34:56'),
(51, 3, 'Ростовская область', 'rostovskaia-oblast', '61', 'Ростов-на-Дону', NULL, NULL, 4200000, 100967, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:17:50', '2025-09-27 07:17:50'),
(52, 6, 'Челябинская область', 'celiabinskaia-oblast', '74', 'Челябинск', NULL, NULL, 3500000, 88529, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:17:50', '2025-09-27 07:17:50'),
(53, 7, 'Новосибирская область', 'novosibirskaia-oblast', '54', 'Новосибирск', NULL, NULL, 2700000, 177756, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:17:50', '2025-09-27 07:17:50'),
(54, 3, 'Волгоградская область', 'volgogradskaia-oblast', '34', 'Волгоград', NULL, NULL, 2500000, 112900, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:17:50', '2025-09-27 08:34:56'),
(55, 5, 'Пензенская область', 'penzenskaia-oblast', '58', 'Пенза', NULL, NULL, 1300000, 43300, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:17:50', '2025-09-27 08:35:21'),
(56, 5, 'Удмуртская Республика', 'udmurtskaia-respublika', '18', 'Ижевск', NULL, NULL, 1500000, 42100, 'Europe/Moscow', 'republic', 1, '2025-09-27 07:17:50', '2025-09-27 08:35:21'),
(58, 5, 'Кировская область', 'kirovskaia-oblast', '43', 'Киров', NULL, NULL, 1200000, 120400, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:18:19', '2025-09-27 08:34:56'),
(59, 5, 'Самарская область', 'samarskaia-oblast', '65', 'Самара', NULL, NULL, 3200000, 53600, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:18:19', '2025-09-27 08:34:56'),
(60, 6, 'Пермский край', 'permskii-krai', '59', 'Пермь', NULL, NULL, 2600000, 160200, 'Europe/Moscow', 'krai', 1, '2025-09-27 07:18:19', '2025-09-27 08:34:56'),
(62, 7, 'Омская область', 'omskaia-oblast', '55', 'Омск', NULL, NULL, 1900000, 141100, 'Europe/Moscow', 'oblast', 1, '2025-09-27 07:18:19', '2025-09-27 08:34:56'),
(63, 4, 'Республика Дагестан', 'respublika-dagestan', '05', 'Махачкала', NULL, NULL, 3100000, 50270, 'Europe/Moscow', 'republic', 1, '2025-09-27 07:52:22', '2025-09-27 07:52:22'),
(64, 4, 'Республика Калмыкия', 'respublika-kalmykiia', '08', 'Элиста', NULL, NULL, 270000, 74731, 'Europe/Moscow', 'republic', 1, '2025-09-27 07:52:23', '2025-09-27 07:52:23'),
(65, 4, 'Республика Северная Осетия — Алания', 'respublika-severnaia-osetiia-alaniia', '15', 'Владикавказ', NULL, NULL, 700000, 7987, 'Europe/Moscow', 'republic', 1, '2025-09-27 07:52:23', '2025-09-27 07:52:23'),
(66, 4, 'Чеченская Республика', 'cecenskaia-respublika', '20', 'Грозный', NULL, NULL, 1500000, 16165, 'Europe/Moscow', 'republic', 1, '2025-09-27 07:52:23', '2025-09-27 07:52:23');

-- --------------------------------------------------------

--
-- Структура таблицы `roles`
--

CREATE TABLE `roles` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `roles`
--

INSERT INTO `roles` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'super_admin', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(2, 'admin', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(3, 'organization_admin', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(4, 'moderator', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(5, 'editor', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11'),
(6, 'user', 'web', '2025-09-28 05:35:11', '2025-09-28 05:35:11');

-- --------------------------------------------------------

--
-- Структура таблицы `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint UNSIGNED NOT NULL,
  `role_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `role_has_permissions`
--

INSERT INTO `role_has_permissions` (`permission_id`, `role_id`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(5, 1),
(6, 1),
(7, 1),
(8, 1),
(9, 1),
(10, 1),
(11, 1),
(12, 1),
(13, 1),
(14, 1),
(15, 1),
(16, 1),
(17, 1),
(18, 1),
(19, 1),
(20, 1),
(21, 1),
(22, 1),
(23, 1),
(24, 1),
(25, 1),
(26, 1),
(27, 1),
(28, 1),
(29, 1),
(30, 1),
(31, 1),
(32, 1),
(33, 1),
(1, 2),
(2, 2),
(3, 2),
(6, 2),
(7, 2),
(8, 2),
(10, 2),
(11, 2),
(12, 2),
(13, 2),
(15, 2),
(16, 2),
(17, 2),
(18, 2),
(20, 2),
(21, 2),
(22, 2),
(24, 2),
(25, 2),
(26, 2),
(27, 2),
(6, 3),
(8, 3),
(10, 3),
(11, 3),
(12, 3),
(13, 3),
(15, 3),
(16, 3),
(17, 3),
(18, 3),
(20, 3),
(21, 3),
(24, 3),
(1, 4),
(6, 4),
(11, 4),
(13, 4),
(16, 4),
(18, 4),
(21, 4),
(24, 4),
(11, 5),
(13, 5),
(16, 5),
(17, 5),
(18, 5),
(11, 6),
(16, 6);

-- --------------------------------------------------------

--
-- Структура таблицы `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('FujyVqrzmcq51smqxAx7IHof0rVmsvc7DsYJxK5c', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiVnJVNTZjS1RzUnhub29qU0R0NmhaWkViNDhFRjBkcGZtZHI3cEs2dCI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czo4MToiaHR0cDovL2xvY2FsaG9zdDo4MDAwL2Rhc2hib2FyZC9vcmdhbml6YXRpb24vMS9hZG1pbi9zaXRlcy84L2J1aWxkZXI/dGFiPXNldHRpbmdzIjt9czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9kYXNoYm9hcmQvb3JnYW5pemF0aW9uLzEvYWRtaW4vc2l0ZXMvOC9idWlsZGVyP3RhYj1zZXR0aW5ncyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1761143658),
('ihZRK2FPw61igPntTkNncVNpc9ST4b0zrokyjm60', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiUVV2WlVRQVEzWkVCVFRPVkR3SUFzeGNwOWZqQ1FtOHhteTB1VFE4NSI7czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTtzOjk6Il9wcmV2aW91cyI7YToxOntzOjM6InVybCI7czoyMToiaHR0cDovL2xvY2FsaG9zdDo4MDAwIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1761163240),
('iU7r3Fd2T0r0mXJDncPDLruhbS6xGlhnurJidLUc', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiaXYwSk1RZzA0R0NtdFhNWGJKUHhyenhJZGs0eUZCNlphaHNUSWRxOSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9sb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1761127394),
('NsnmYtwUzmPHJpkmQ4ZRPwBWsc4TE85i0eCfUlpZ', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiaFpxZUxKc2YwWVNsdzBVU2JDTzY0YWdDcGN0djBrTlczNWgxZml4VSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9sb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1761143658),
('uPZ79YhUKnpfeEE4wFvg6mec8DhykXgMSE5F3obJ', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicWJhdGpxcTQ3NEpQcjNqRktZSHZXZ09yam9zUGdXOHQ2clFJWmxVcCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9sb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1761130333),
('XqdF9CQlsywZCQTJD1hpqXqmnv9eexLkR0QDsI2r', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiR25sdzlRUzNVbkFYMlVPREpkbUtPTnlsWmg3Ylp0WlhMc1dlTzJlViI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czo4MDoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL2Rhc2hib2FyZC9vcmdhbml6YXRpb24vMS9hZG1pbi9zaXRlcy84L2J1aWxkZXI/dGFiPWJ1aWxkZXIiO31zOjk6Il9wcmV2aW91cyI7YToxOntzOjM6InVybCI7czo4MDoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL2Rhc2hib2FyZC9vcmdhbml6YXRpb24vMS9hZG1pbi9zaXRlcy84L2J1aWxkZXI/dGFiPWJ1aWxkZXIiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1761146557),
('zuM9PypGfnoq6YowR1FQ4mvsml0ZGrWl5MTWaVsU', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoieXJWcUg1YTBYSTZjcHR4OUdiU1gwcmdCWjU4WVNuaU1Bck9xTlQwMyI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czo4MDoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL2Rhc2hib2FyZC9vcmdhbml6YXRpb24vMS9hZG1pbi9zaXRlcy84L2J1aWxkZXI/dGFiPXByZXZpZXciO31zOjk6Il9wcmV2aW91cyI7YToxOntzOjM6InVybCI7czo4MDoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL2Rhc2hib2FyZC9vcmdhbml6YXRpb24vMS9hZG1pbi9zaXRlcy84L2J1aWxkZXI/dGFiPXByZXZpZXciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1761128809);

-- --------------------------------------------------------

--
-- Структура таблицы `settlements`
--

CREATE TABLE `settlements` (
  `id` bigint UNSIGNED NOT NULL,
  `region_id` bigint UNSIGNED NOT NULL,
  `city_id` bigint UNSIGNED DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('village','hamlet','settlement','rural_settlement','urban_settlement') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'village',
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `population` int DEFAULT NULL,
  `area` decimal(8,2) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `sites`
--

CREATE TABLE `sites` (
  `id` bigint UNSIGNED NOT NULL,
  `organization_id` bigint UNSIGNED DEFAULT NULL,
  `domain_id` bigint UNSIGNED DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `template` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default',
  `site_type` enum('organization','main') NOT NULL DEFAULT 'organization',
  `layout_config` json DEFAULT NULL,
  `theme_config` json DEFAULT NULL,
  `content_blocks` json DEFAULT NULL,
  `navigation_config` json DEFAULT NULL,
  `seo_config` json DEFAULT NULL,
  `custom_settings` json DEFAULT NULL,
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `favicon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `is_public` tinyint(1) NOT NULL DEFAULT '0',
  `is_maintenance_mode` tinyint(1) NOT NULL DEFAULT '0',
  `maintenance_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `published_at` timestamp NULL DEFAULT NULL,
  `last_updated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `sites`
--

INSERT INTO `sites` (`id`, `organization_id`, `domain_id`, `name`, `slug`, `description`, `template`, `site_type`, `layout_config`, `theme_config`, `content_blocks`, `navigation_config`, `seo_config`, `custom_settings`, `logo`, `favicon`, `status`, `is_public`, `is_maintenance_mode`, `maintenance_message`, `published_at`, `last_updated_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, NULL, NULL, 'Главный сайт', 'main-site-1761163146', 'Главный сайт системы управления образовательными организациями', 'main-template-default', 'main', '{\"footer\": {\"type\": \"main\", \"show_legal\": true, \"show_links\": true, \"show_social\": true, \"show_contact\": true, \"show_newsletter\": true}, \"header\": {\"type\": \"fixed\", \"show_logo\": true, \"background\": \"white\", \"show_search\": true, \"show_user_menu\": true, \"show_navigation\": true}, \"sidebar\": {\"enabled\": false, \"position\": \"right\"}, \"breadcrumbs\": {\"enabled\": true, \"show_home\": true}}', '{\"layout\": \"wide\", \"font_size\": \"medium\", \"box_shadow\": \"0 1px 3px 0 rgba(0, 0, 0, 0.1)\", \"text_color\": \"#1F2937\", \"font_family\": \"roboto\", \"line_height\": \"1.6\", \"accent_color\": \"#F59E0B\", \"color_scheme\": \"blue\", \"border_radius\": \"8px\", \"primary_color\": \"#3B82F6\", \"secondary_color\": \"#6B7280\", \"background_color\": \"#FFFFFF\"}', '[{\"type\": \"hero\", \"title\": \"Добро пожаловать на главный сайт\", \"subtitle\": \"Система управления образовательными организациями\", \"button_url\": \"/organizations\", \"button_text\": \"Начать работу\", \"description\": \"Платформа для создания и управления сайтами школ, гимназий, лицеев и других образовательных учреждений\", \"button_style\": \"primary\", \"background_image\": null}, {\"type\": \"text\", \"content\": \"<h2>О системе</h2><p>Наша платформа предоставляет все необходимые инструменты для создания современных сайтов образовательных организаций. Вы можете легко настроить дизайн, добавить контент и управлять всеми аспектами вашего сайта.</p>\", \"text_align\": \"left\", \"text_color\": \"#1F2937\", \"background_color\": \"#F8FAFC\"}, {\"type\": \"projects\", \"limit\": 6, \"title\": \"Последние проекты\", \"columns\": 3, \"show_image\": true, \"show_progress\": true, \"show_description\": true}, {\"type\": \"news\", \"limit\": 6, \"title\": \"Новости\", \"columns\": 3, \"show_date\": true, \"show_image\": true, \"show_excerpt\": true}]', '{\"main_menu\": [{\"url\": \"/\", \"icon\": \"home\", \"title\": \"Главная\", \"children\": []}, {\"url\": \"/organizations\", \"icon\": \"building\", \"title\": \"Организации\", \"children\": [{\"url\": \"/organizations\", \"title\": \"Все организации\"}, {\"url\": \"/organizations?type=school\", \"title\": \"Школы\"}, {\"url\": \"/organizations?type=gymnasium\", \"title\": \"Гимназии\"}, {\"url\": \"/organizations?type=lyceum\", \"title\": \"Лицеи\"}]}, {\"url\": \"/projects\", \"icon\": \"project\", \"title\": \"Проекты\", \"children\": []}, {\"url\": \"/news\", \"icon\": \"news\", \"title\": \"Новости\", \"children\": []}, {\"url\": \"/contact\", \"icon\": \"contact\", \"title\": \"Контакты\", \"children\": []}], \"footer_menu\": [{\"url\": \"/about\", \"title\": \"О системе\"}, {\"url\": \"/help\", \"title\": \"Помощь\"}, {\"url\": \"/docs\", \"title\": \"Документация\"}, {\"url\": \"/api/docs\", \"title\": \"API\"}]}', '{\"robots\": \"index,follow\", \"og_image\": null, \"og_title\": \"Главный сайт - Система управления образовательными организациями\", \"meta_title\": \"Главный сайт - Система управления образовательными организациями\", \"canonical_url\": \"http://localhost\", \"meta_keywords\": \"образование, школы, гимназии, лицеи, сайты, управление, платформа\", \"schema_markup\": {\"url\": \"http://localhost\", \"name\": \"Главный сайт\", \"type\": \"WebSite\", \"description\": \"Система управления образовательными организациями\"}, \"og_description\": \"Платформа для создания и управления сайтами образовательных организаций\", \"meta_description\": \"Платформа для создания и управления сайтами школ, гимназий, лицеев и других образовательных учреждений. Современные инструменты для образовательных организаций.\"}', '{\"social_links\": {\"vk\": null, \"twitter\": null, \"youtube\": null, \"facebook\": null, \"telegram\": null, \"instagram\": null}, \"contact_email\": \"admin@example.com\", \"contact_phone\": \"+7 (000) 000-00-00\", \"enable_search\": true, \"enable_comments\": true, \"enable_analytics\": true, \"maintenance_mode\": false, \"enable_newsletter\": true, \"enable_registration\": true, \"maintenance_message\": \"Сайт временно недоступен. Ведутся технические работы.\", \"enable_cookies_notice\": true, \"enable_social_sharing\": true}', NULL, NULL, 'published', 1, 0, 'Сайт временно недоступен. Ведутся технические работы.', '2025-10-22 16:59:06', '2025-10-22 17:00:28', '2025-10-22 16:59:06', '2025-10-22 17:00:28', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `site_pages`
--

CREATE TABLE `site_pages` (
  `id` bigint UNSIGNED NOT NULL,
  `site_id` bigint UNSIGNED NOT NULL,
  `parent_id` bigint UNSIGNED DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `excerpt` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `template` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default',
  `layout_config` json DEFAULT NULL,
  `content_blocks` json DEFAULT NULL,
  `seo_config` json DEFAULT NULL,
  `featured_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `is_homepage` tinyint(1) NOT NULL DEFAULT '0',
  `is_public` tinyint(1) NOT NULL DEFAULT '0',
  `show_in_navigation` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `published_at` timestamp NULL DEFAULT NULL,
  `last_updated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `site_page_seo`
--

CREATE TABLE `site_page_seo` (
  `id` bigint UNSIGNED NOT NULL,
  `page_id` bigint UNSIGNED NOT NULL,
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text COLLATE utf8mb4_unicode_ci,
  `meta_keywords` json DEFAULT NULL,
  `og_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `og_description` text COLLATE utf8mb4_unicode_ci,
  `og_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `twitter_card` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `twitter_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `twitter_description` text COLLATE utf8mb4_unicode_ci,
  `twitter_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `canonical_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `schema_markup` json DEFAULT NULL,
  `robots_meta` json DEFAULT NULL,
  `custom_meta_tags` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `site_templates`
--

CREATE TABLE `site_templates` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `preview_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `layout_config` json DEFAULT NULL,
  `theme_config` json DEFAULT NULL,
  `available_blocks` json DEFAULT NULL,
  `default_positions` json DEFAULT NULL,
  `custom_settings` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_premium` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `site_templates`
--

INSERT INTO `site_templates` (`id`, `name`, `slug`, `description`, `preview_image`, `layout_config`, `theme_config`, `available_blocks`, `default_positions`, `custom_settings`, `is_active`, `is_premium`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Стандартный', 'default', 'Базовый шаблон с простым дизайном', 'templates/default-preview.jpg', '{\"footer\": {\"type\": \"default\", \"show_links\": true, \"show_social\": true, \"show_contact\": true}, \"header\": {\"type\": \"fixed\", \"show_logo\": true, \"background\": \"white\", \"show_search\": false, \"show_navigation\": true}, \"sidebar\": {\"enabled\": false, \"position\": \"right\"}}', '{\"font_size\": \"16px\", \"text_color\": \"#1F2937\", \"font_family\": \"Inter\", \"accent_color\": \"#F59E0B\", \"primary_color\": \"#3B82F6\", \"secondary_color\": \"#6B7280\", \"background_color\": \"#FFFFFF\"}', '[\"hero\", \"text\", \"image\", \"gallery\", \"slider\", \"testimonials\", \"contact_form\", \"news\", \"projects\"]', NULL, NULL, 1, 0, 1, '2025-09-29 11:54:07', '2025-09-29 11:54:07');

-- --------------------------------------------------------

--
-- Структура таблицы `site_widgets`
--

CREATE TABLE `site_widgets` (
  `id` bigint UNSIGNED NOT NULL,
  `site_id` bigint UNSIGNED NOT NULL,
  `widget_id` bigint UNSIGNED NOT NULL,
  `widget_slug` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position_id` bigint UNSIGNED DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `position_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `position_slug` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_visible` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `site_widget_configs`
--

CREATE TABLE `site_widget_configs` (
  `id` bigint UNSIGNED NOT NULL,
  `site_widget_id` bigint UNSIGNED NOT NULL,
  `config_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `config_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `config_type` enum('string','number','boolean','json','text') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `site_widget_configs`
--

INSERT INTO `site_widget_configs` (`id`, `site_widget_id`, `config_key`, `config_value`, `config_type`, `created_at`, `updated_at`) VALUES
(966, 174, 'show_progress', '0', 'boolean', '2025-10-16 06:29:08', '2025-10-16 06:29:08'),
(1007, 157, 'title', '', 'string', '2025-10-16 06:57:06', '2025-10-16 06:57:06'),
(1008, 157, 'orientation', 'row', 'string', '2025-10-16 06:57:06', '2025-10-16 06:57:06'),
(1009, 157, 'alignment', 'start', 'string', '2025-10-16 06:57:06', '2025-10-16 06:57:06'),
(1010, 157, 'fontSize', '16px', 'string', '2025-10-16 06:57:06', '2025-10-16 06:57:06'),
(1011, 157, 'uppercase', '0', 'boolean', '2025-10-16 06:57:06', '2025-10-16 06:57:06'),
(1012, 157, 'gap', '12', 'number', '2025-10-16 06:57:06', '2025-10-16 06:57:06'),
(1013, 157, 'css_class', '', 'string', '2025-10-16 06:57:06', '2025-10-16 06:57:06'),
(1014, 157, 'styling', '{\"backgroundColor\":\"#b6a6a6\",\"textColor\":\"#ffffff\",\"padding\":\"15px\"}', 'json', '2025-10-16 06:57:06', '2025-10-16 06:57:06'),
(1024, 180, 'type', 'slider', 'string', '2025-10-20 04:27:05', '2025-10-20 04:27:05'),
(1025, 180, 'height', '400px', 'string', '2025-10-20 04:27:05', '2025-10-20 04:27:05'),
(1026, 180, 'animation', 'fade', 'string', '2025-10-20 04:27:05', '2025-10-20 04:27:05'),
(1027, 180, 'autoplay', '1', 'boolean', '2025-10-20 04:27:05', '2025-10-20 04:27:05'),
(1028, 180, 'autoplayDelay', '5000', 'number', '2025-10-20 04:27:05', '2025-10-20 04:27:05'),
(1029, 180, 'showDots', '1', 'boolean', '2025-10-20 04:27:05', '2025-10-20 04:27:05'),
(1030, 180, 'showArrows', '1', 'boolean', '2025-10-20 04:27:05', '2025-10-20 04:27:05'),
(1031, 180, 'singleSlide', '', 'string', '2025-10-20 04:27:05', '2025-10-20 04:27:05'),
(1032, 180, 'css_class', '', 'string', '2025-10-20 04:27:05', '2025-10-20 04:27:05'),
(2997, 194, 'altText', 'Ибо да', 'string', '2025-10-21 16:01:45', '2025-10-21 16:01:45'),
(2998, 194, 'caption', 'Ибо подпись', 'string', '2025-10-21 16:01:45', '2025-10-21 16:01:45'),
(2999, 194, 'image', 'http://localhost:8000/storage/widgets/image/original_logo_1761073302.svg', 'string', '2025-10-21 16:01:45', '2025-10-21 16:01:45'),
(3000, 194, 'linkUrl', 'http://localhost:8000/dashboard/organization/1/admin/sites/8/builder?tab=builder', 'string', '2025-10-21 16:01:45', '2025-10-21 16:01:45'),
(3001, 194, 'openInNewTab', '1', 'boolean', '2025-10-21 16:01:45', '2025-10-21 16:01:45'),
(3002, 194, 'styling', '{\"backgroundColor\":\"#b82828\"}', 'json', '2025-10-21 16:01:45', '2025-10-21 16:01:45'),
(3024, 193, 'styling', '{\"backgroundColor\":\"#ffffff\"}', 'json', '2025-10-21 16:07:38', '2025-10-21 16:07:38'),
(3121, 202, 'title', 'Заголовок', 'string', '2025-10-21 17:30:09', '2025-10-21 17:30:09'),
(3122, 202, 'htmlContent', '<p>прпрпрпрпр</P>', 'string', '2025-10-21 17:30:09', '2025-10-21 17:30:09'),
(3123, 202, 'enableScripts', '1', 'boolean', '2025-10-21 17:30:09', '2025-10-21 17:30:09'),
(3124, 202, 'enableStyles', '1', 'boolean', '2025-10-21 17:30:09', '2025-10-21 17:30:09'),
(3125, 202, 'width', '', 'string', '2025-10-21 17:30:09', '2025-10-21 17:30:09'),
(3126, 202, 'height', '', 'string', '2025-10-21 17:30:09', '2025-10-21 17:30:09'),
(3127, 202, 'backgroundColor', '', 'string', '2025-10-21 17:30:09', '2025-10-21 17:30:09'),
(3128, 202, 'padding', '', 'string', '2025-10-21 17:30:09', '2025-10-21 17:30:09'),
(3129, 202, 'margin', '', 'string', '2025-10-21 17:30:09', '2025-10-21 17:30:09'),
(3130, 202, 'borderRadius', '', 'string', '2025-10-21 17:30:09', '2025-10-21 17:30:09'),
(3131, 202, 'borderWidth', '', 'string', '2025-10-21 17:30:09', '2025-10-21 17:30:09'),
(3132, 202, 'borderColor', '', 'string', '2025-10-21 17:30:09', '2025-10-21 17:30:09'),
(3259, 182, 'alignment', 'start', 'string', '2025-10-22 07:18:33', '2025-10-22 07:18:33'),
(3260, 182, 'css_class', '', 'string', '2025-10-22 07:18:33', '2025-10-22 07:18:33'),
(3261, 182, 'fontSize', '16px', 'string', '2025-10-22 07:18:33', '2025-10-22 07:18:33'),
(3262, 182, 'gap', '12', 'number', '2025-10-22 07:18:33', '2025-10-22 07:18:33'),
(3263, 182, 'orientation', 'row', 'string', '2025-10-22 07:18:33', '2025-10-22 07:18:33'),
(3264, 182, 'styling', '{\"backgroundColor\":\"#cb3838\",\"borderRadius\":\"14px\"}', 'json', '2025-10-22 07:18:33', '2025-10-22 07:18:33'),
(3265, 182, 'title', '', 'string', '2025-10-22 07:18:33', '2025-10-22 07:18:33'),
(3266, 182, 'uppercase', '0', 'boolean', '2025-10-22 07:18:33', '2025-10-22 07:18:33'),
(3270, 205, 'allow_recurring', '0', 'boolean', '2025-10-22 08:10:15', '2025-10-22 08:10:15'),
(3271, 205, 'min_amount', '500', 'number', '2025-10-22 08:10:15', '2025-10-22 08:10:15'),
(3272, 205, 'show_progress', '0', 'boolean', '2025-10-22 08:10:15', '2025-10-22 08:10:15'),
(3277, 206, 'show_regions_count', '0', 'boolean', '2025-10-22 08:16:32', '2025-10-22 08:16:32'),
(3278, 206, 'layout', 'grid', 'string', '2025-10-22 08:16:32', '2025-10-22 08:16:32'),
(3279, 206, 'card_style', 'default', 'string', '2025-10-22 08:16:32', '2025-10-22 08:16:32'),
(3280, 206, 'items_per_page', '13', 'number', '2025-10-22 08:16:32', '2025-10-22 08:16:32'),
(3290, 208, 'items_per_page', '16', 'number', '2025-10-22 08:22:58', '2025-10-22 08:22:58'),
(3291, 208, 'layout', 'grid', 'string', '2025-10-22 08:22:58', '2025-10-22 08:22:58'),
(3292, 208, 'show_amount', '1', 'boolean', '2025-10-22 08:22:58', '2025-10-22 08:22:58'),
(3297, 209, 'items_per_page', '11', 'number', '2025-10-22 08:26:59', '2025-10-22 08:26:59'),
(3298, 209, 'sort_order', 'asc', 'string', '2025-10-22 08:26:59', '2025-10-22 08:26:59'),
(3380, 210, 'type', 'slider', 'string', '2025-10-22 08:36:31', '2025-10-22 08:36:31'),
(3381, 210, 'height', '400px', 'string', '2025-10-22 08:36:31', '2025-10-22 08:36:31'),
(3382, 210, 'animation', 'fade', 'string', '2025-10-22 08:36:31', '2025-10-22 08:36:31'),
(3383, 210, 'autoplay', '1', 'boolean', '2025-10-22 08:36:31', '2025-10-22 08:36:31'),
(3384, 210, 'autoplayDelay', '5000', 'number', '2025-10-22 08:36:31', '2025-10-22 08:36:31'),
(3385, 210, 'showDots', '1', 'boolean', '2025-10-22 08:36:31', '2025-10-22 08:36:31'),
(3386, 210, 'showArrows', '1', 'boolean', '2025-10-22 08:36:31', '2025-10-22 08:36:31'),
(3387, 210, 'singleSlide', '', 'string', '2025-10-22 08:36:31', '2025-10-22 08:36:31'),
(3388, 210, 'css_class', '', 'string', '2025-10-22 08:36:31', '2025-10-22 08:36:31'),
(3476, 190, 'type', 'slider', 'string', '2025-10-22 10:23:23', '2025-10-22 10:23:23'),
(3477, 190, 'height', '400px', 'string', '2025-10-22 10:23:23', '2025-10-22 10:23:23'),
(3478, 190, 'animation', 'fade', 'string', '2025-10-22 10:23:23', '2025-10-22 10:23:23'),
(3479, 190, 'autoplay', '0', 'boolean', '2025-10-22 10:23:23', '2025-10-22 10:23:23'),
(3480, 190, 'autoplayDelay', '5000', 'number', '2025-10-22 10:23:23', '2025-10-22 10:23:23'),
(3481, 190, 'showDots', '1', 'boolean', '2025-10-22 10:23:23', '2025-10-22 10:23:23'),
(3482, 190, 'showArrows', '1', 'boolean', '2025-10-22 10:23:23', '2025-10-22 10:23:23'),
(3483, 190, 'singleSlide', '', 'string', '2025-10-22 10:23:23', '2025-10-22 10:23:23'),
(3484, 190, 'css_class', '', 'string', '2025-10-22 10:23:23', '2025-10-22 10:23:23'),
(3500, 188, 'type', 'carousel', 'string', '2025-10-22 10:23:36', '2025-10-22 10:23:36'),
(3501, 188, 'layout', 'grid', 'string', '2025-10-22 10:23:36', '2025-10-22 10:23:36'),
(3502, 188, 'slidesPerView', '3', 'number', '2025-10-22 10:23:36', '2025-10-22 10:23:36'),
(3503, 188, 'height', '400px', 'string', '2025-10-22 10:23:36', '2025-10-22 10:23:36'),
(3504, 188, 'animation', 'cube', 'string', '2025-10-22 10:23:36', '2025-10-22 10:23:36'),
(3505, 188, 'autoplay', '0', 'boolean', '2025-10-22 10:23:36', '2025-10-22 10:23:36'),
(3506, 188, 'autoplayDelay', '5000', 'number', '2025-10-22 10:23:36', '2025-10-22 10:23:36'),
(3507, 188, 'loop', '1', 'number', '2025-10-22 10:23:36', '2025-10-22 10:23:36'),
(3508, 188, 'showDots', '1', 'number', '2025-10-22 10:23:36', '2025-10-22 10:23:36'),
(3509, 188, 'showArrows', '1', 'number', '2025-10-22 10:23:36', '2025-10-22 10:23:36'),
(3510, 188, 'showProgress', '1', 'number', '2025-10-22 10:23:36', '2025-10-22 10:23:36'),
(3511, 188, 'spaceBetween', '0', 'number', '2025-10-22 10:23:36', '2025-10-22 10:23:36'),
(3512, 188, 'breakpoints', '[]', 'json', '2025-10-22 10:23:36', '2025-10-22 10:23:36'),
(3513, 188, 'slides', '[{\"id\":\"1761133006877\",\"title\":\"\\u0421\\u043b\\u0430\\u0439\\u0434 6\",\"subtitle\":null,\"description\":null,\"buttonText\":null,\"buttonLink\":\"#\",\"buttonLinkType\":\"internal\",\"buttonOpenInNewTab\":false,\"backgroundImage\":\"http:\\/\\/localhost:8000\\/storage\\/widgets\\/slider-widget\\/original_cropped-image_1761133014.jpg\",\"overlayOpacity\":50,\"overlayColor\":\"#000000\",\"overlayGradient\":\"none\",\"overlayGradientIntensity\":50,\"order\":6},{\"id\":\"1760982963899\",\"title\":\"\\u0421\\u043b\\u0430\\u0439\\u0434 5\",\"subtitle\":null,\"description\":null,\"buttonText\":null,\"buttonLink\":\"#\",\"buttonLinkType\":\"internal\",\"buttonOpenInNewTab\":false,\"backgroundImage\":\"http:\\/\\/localhost:8000\\/storage\\/widgets\\/slider-widget\\/original_cropped-image_1760982986.jpg\",\"overlayOpacity\":50,\"overlayColor\":\"#000000\",\"overlayGradient\":\"none\",\"overlayGradientIntensity\":50,\"order\":5},{\"id\":\"1760982840658\",\"title\":\"\\u0421\\u043b\\u0430\\u0439\\u0434 4\",\"subtitle\":null,\"description\":null,\"buttonText\":null,\"buttonLink\":\"#\",\"buttonLinkType\":\"internal\",\"buttonOpenInNewTab\":false,\"backgroundImage\":\"http:\\/\\/localhost:8000\\/storage\\/widgets\\/slider-widget\\/original_cropped-image_1760982885.jpg\",\"overlayOpacity\":50,\"overlayColor\":\"#000000\",\"overlayGradient\":\"none\",\"overlayGradientIntensity\":50,\"order\":4},{\"id\":\"1760982732287\",\"title\":\"\\u0421\\u043b\\u0430\\u0439\\u0434 3\",\"subtitle\":null,\"description\":null,\"buttonText\":null,\"buttonLink\":\"#\",\"buttonLinkType\":\"internal\",\"buttonOpenInNewTab\":false,\"backgroundImage\":\"http:\\/\\/localhost:8000\\/storage\\/widgets\\/slider-widget\\/original_cropped-image_1760982740.jpg\",\"overlayOpacity\":50,\"overlayColor\":\"#000000\",\"overlayGradient\":\"none\",\"overlayGradientIntensity\":50,\"order\":3},{\"id\":\"1760982693542\",\"title\":\"\\u0421\\u043b\\u0430\\u0439\\u0434 2\",\"subtitle\":null,\"description\":null,\"buttonText\":null,\"buttonLink\":\"#\",\"buttonLinkType\":\"internal\",\"buttonOpenInNewTab\":false,\"backgroundImage\":\"http:\\/\\/localhost:8000\\/storage\\/widgets\\/slider-widget\\/original_cropped-image_1760982727.jpg\",\"overlayOpacity\":50,\"overlayColor\":\"#000000\",\"overlayGradient\":\"none\",\"overlayGradientIntensity\":50,\"order\":2},{\"id\":\"1760982679257\",\"title\":\"\\u0421\\u043b\\u0430\\u0439\\u0434 1\",\"subtitle\":null,\"description\":null,\"buttonText\":null,\"buttonLink\":\"#\",\"buttonLinkType\":\"internal\",\"buttonOpenInNewTab\":false,\"backgroundImage\":\"http:\\/\\/localhost:8000\\/storage\\/widgets\\/slider-widget\\/original_cropped-image_1760982690.jpg\",\"overlayOpacity\":50,\"overlayColor\":\"#000000\",\"overlayGradient\":\"none\",\"overlayGradientIntensity\":50,\"order\":1}]', 'json', '2025-10-22 10:23:36', '2025-10-22 10:23:36'),
(3514, 188, 'css_class', '', 'string', '2025-10-22 10:23:36', '2025-10-22 10:23:36'),
(3548, 191, 'type', 'slider', 'string', '2025-10-22 10:24:29', '2025-10-22 10:24:29'),
(3549, 191, 'height', '400px', 'string', '2025-10-22 10:24:29', '2025-10-22 10:24:29'),
(3550, 191, 'animation', 'fade', 'string', '2025-10-22 10:24:29', '2025-10-22 10:24:29'),
(3551, 191, 'autoplay', '1', 'boolean', '2025-10-22 10:24:29', '2025-10-22 10:24:29'),
(3552, 191, 'autoplayDelay', '5000', 'number', '2025-10-22 10:24:29', '2025-10-22 10:24:29'),
(3553, 191, 'showDots', '1', 'boolean', '2025-10-22 10:24:29', '2025-10-22 10:24:29'),
(3554, 191, 'showArrows', '1', 'boolean', '2025-10-22 10:24:29', '2025-10-22 10:24:29'),
(3555, 191, 'slides', '[{\"id\":\"415\",\"title\":\"\\u0421\\u043b\\u0430\\u0439\\u0434 2\",\"subtitle\":null,\"description\":null,\"buttonText\":null,\"buttonLink\":\"#\",\"buttonLinkType\":\"internal\",\"buttonOpenInNewTab\":false,\"backgroundImage\":\"\\/storage\\/widgets\\/hero-slider\\/original_cropped-image_1761132960.jpg\",\"overlayColor\":\"#000000\",\"overlayOpacity\":50,\"overlayGradient\":\"none\",\"overlayGradientIntensity\":50,\"sortOrder\":1,\"isActive\":null},{\"id\":\"416\",\"title\":\"\\u041f\\u0435\\u0440\\u0432\\u044b\\u0439 \\u0441\\u043b\\u0430\\u0439\\u0434\",\"subtitle\":\"\\u041f\\u043e\\u0434\\u0437\\u0430\\u0433\\u043e\\u043b\\u043e\\u0432\\u043e\\u043a\",\"description\":\"\\u041e\\u043f\\u0438\\u0441\\u0430\\u043d\\u0438\\u0435 \\u0441\\u043b\\u0430\\u0439\\u0434\\u0430\",\"buttonText\":\"\\u041a\\u043d\\u043e\\u043f\\u043a\\u0430\",\"buttonLink\":\"#\",\"buttonLinkType\":\"internal\",\"buttonOpenInNewTab\":false,\"backgroundImage\":null,\"overlayColor\":\"#000000\",\"overlayOpacity\":50,\"overlayGradient\":\"none\",\"overlayGradientIntensity\":50,\"sortOrder\":1,\"isActive\":null}]', 'json', '2025-10-22 10:24:29', '2025-10-22 10:24:29'),
(3556, 191, 'singleSlide', '', 'string', '2025-10-22 10:24:29', '2025-10-22 10:24:29'),
(3557, 191, 'css_class', '', 'string', '2025-10-22 10:24:29', '2025-10-22 10:24:29'),
(3558, 191, 'allow_recurring', '0', 'boolean', '2025-10-22 10:24:29', '2025-10-22 10:24:29'),
(3775, 214, 'backgroundColor', '', 'string', '2025-10-22 12:43:36', '2025-10-22 12:43:36'),
(3776, 214, 'borderColor', '', 'string', '2025-10-22 12:43:36', '2025-10-22 12:43:36'),
(3777, 214, 'borderRadius', '', 'string', '2025-10-22 12:43:36', '2025-10-22 12:43:36'),
(3778, 214, 'borderWidth', '', 'string', '2025-10-22 12:43:36', '2025-10-22 12:43:36'),
(3779, 214, 'content', '<p class=\"mb-2\"><a href=\"http://localhost:8000/dashboard/organization/1/admin/sites/8/builder?tab=builder\" rel=\"noreferrer\" class=\"text-blue-600 underline\"><i><b><strong class=\"font-semibold italic\" style=\"white-space: pre-wrap;\">авпвапва </strong></b></i></a><span style=\"white-space: pre-wrap;\">вапва пва п</span></p>', 'text', '2025-10-22 12:43:36', '2025-10-22 12:43:36'),
(3780, 214, 'enableColors', '0', 'boolean', '2025-10-22 12:43:36', '2025-10-22 12:43:36'),
(3781, 214, 'enableFormatting', '0', 'boolean', '2025-10-22 12:43:36', '2025-10-22 12:43:36'),
(3782, 214, 'fontSize', 'medium', 'string', '2025-10-22 12:43:36', '2025-10-22 12:43:36'),
(3783, 214, 'margin', '', 'string', '2025-10-22 12:43:36', '2025-10-22 12:43:36'),
(3784, 214, 'padding', '', 'string', '2025-10-22 12:43:36', '2025-10-22 12:43:36'),
(3785, 214, 'textAlign', 'left', 'string', '2025-10-22 12:43:36', '2025-10-22 12:43:36'),
(3786, 214, 'textColor', '#af1e1e', 'string', '2025-10-22 12:43:36', '2025-10-22 12:43:36'),
(3787, 214, 'title', '', 'string', '2025-10-22 12:43:36', '2025-10-22 12:43:36'),
(3788, 214, 'titleColor', '', 'string', '2025-10-22 12:43:36', '2025-10-22 12:43:36');

-- --------------------------------------------------------

--
-- Структура таблицы `site_widget_donations_list_settings`
--

CREATE TABLE `site_widget_donations_list_settings` (
  `id` bigint UNSIGNED NOT NULL,
  `site_widget_id` bigint UNSIGNED NOT NULL,
  `items_per_page` int NOT NULL DEFAULT '10',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `sort_by` enum('amount','created_at','name') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'created_at',
  `sort_direction` enum('asc','desc') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'desc',
  `show_amount` tinyint(1) NOT NULL DEFAULT '1',
  `show_donor_name` tinyint(1) NOT NULL DEFAULT '1',
  `show_date` tinyint(1) NOT NULL DEFAULT '1',
  `show_message` tinyint(1) NOT NULL DEFAULT '0',
  `show_anonymous` tinyint(1) NOT NULL DEFAULT '1',
  `display_options` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `site_widget_donation_settings`
--

CREATE TABLE `site_widget_donation_settings` (
  `id` bigint UNSIGNED NOT NULL,
  `site_widget_id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `min_amount` decimal(10,2) DEFAULT NULL,
  `max_amount` decimal(10,2) DEFAULT NULL,
  `suggested_amounts` json DEFAULT NULL,
  `currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'RUB',
  `show_amount_input` tinyint(1) NOT NULL DEFAULT '1',
  `show_anonymous_option` tinyint(1) NOT NULL DEFAULT '1',
  `button_text` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Пожертвовать',
  `success_message` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_methods` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `site_widget_form_fields`
--

CREATE TABLE `site_widget_form_fields` (
  `id` bigint UNSIGNED NOT NULL,
  `site_widget_id` bigint UNSIGNED NOT NULL,
  `field_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `field_type` enum('text','email','phone','textarea','select','checkbox','radio','file','image','number','date','url','hidden','heading','description') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `field_label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `field_placeholder` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `field_help_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `field_required` tinyint(1) NOT NULL DEFAULT '0',
  `field_options` json DEFAULT NULL,
  `field_validation` json DEFAULT NULL,
  `field_styling` json DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `site_widget_form_fields`
--

INSERT INTO `site_widget_form_fields` (`id`, `site_widget_id`, `field_name`, `field_type`, `field_label`, `field_placeholder`, `field_help_text`, `field_required`, `field_options`, `field_validation`, `field_styling`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(74, 204, 'field_1761130568061', 'email', 'Новое поле', '', '', 0, '[]', '[]', '[]', 2, 1, '2025-10-22 10:25:03', '2025-10-22 10:25:03'),
(75, 204, 'field_1761130938412', 'text', 'Новое поле', '', '', 0, '[]', '[]', '[]', 2, 1, '2025-10-22 10:25:03', '2025-10-22 10:25:03'),
(76, 204, 'field_1761130939684', 'email', 'Новое поле', '', '', 0, '[]', '[]', '[]', 3, 1, '2025-10-22 10:25:03', '2025-10-22 10:25:03'),
(77, 204, 'field_1761130940906', 'phone', 'Новое поле', '', '', 0, '[]', '[]', '[]', 4, 1, '2025-10-22 10:25:03', '2025-10-22 10:25:03'),
(78, 204, 'field_1761130942026', 'textarea', 'Новое поле', '', '', 0, '[]', '[]', '[]', 5, 1, '2025-10-22 10:25:03', '2025-10-22 10:25:03'),
(79, 204, 'field_1761130943461', 'select', 'Новое поле', '', '', 0, '[]', '[]', '[]', 6, 1, '2025-10-22 10:25:03', '2025-10-22 10:25:03'),
(80, 204, 'field_1761139489414', 'heading', 'Новое поле', '', '', 0, '[]', '[]', '[]', 7, 1, '2025-10-22 10:25:03', '2025-10-22 10:25:03');

-- --------------------------------------------------------

--
-- Структура таблицы `site_widget_gallery_images`
--

CREATE TABLE `site_widget_gallery_images` (
  `id` bigint UNSIGNED NOT NULL,
  `site_widget_id` bigint UNSIGNED NOT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt_text` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `site_widget_hero_slides`
--

CREATE TABLE `site_widget_hero_slides` (
  `id` bigint UNSIGNED NOT NULL,
  `site_widget_id` bigint UNSIGNED NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtitle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `button_text` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `button_link` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `button_link_type` enum('internal','external') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'internal',
  `button_open_in_new_tab` tinyint(1) NOT NULL DEFAULT '0',
  `background_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `overlay_color` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `overlay_opacity` int NOT NULL DEFAULT '50',
  `overlay_gradient` enum('none','left','right','top','bottom','center') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'none',
  `overlay_gradient_intensity` int NOT NULL DEFAULT '50',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `site_widget_hero_slides`
--

INSERT INTO `site_widget_hero_slides` (`id`, `site_widget_id`, `sort_order`, `title`, `subtitle`, `description`, `button_text`, `button_link`, `button_link_type`, `button_open_in_new_tab`, `background_image`, `overlay_color`, `overlay_opacity`, `overlay_gradient`, `overlay_gradient_intensity`, `created_at`, `updated_at`) VALUES
(415, 210, 1, 'Слайд 2', '', '', '', '#', 'internal', 0, 'widgets/hero-slider/original_cropped-image_1761132960.jpg', '#000000', 50, 'none', 50, '2025-10-22 08:36:31', '2025-10-22 08:36:31'),
(416, 210, 1, 'Первый слайд', 'Подзаголовок', 'Описание слайда', 'Кнопка', '#', 'internal', 0, '', '#000000', 50, 'none', 50, '2025-10-22 08:36:31', '2025-10-22 08:36:31'),
(429, 190, 1, 'Первый слайд', 'Подзаголовок', 'Описание слайда', 'Кнопка', '#', 'internal', 0, 'widgets/hero-slider/original_cropped-image_1760991650.jpg', '#000000', 50, 'none', 50, '2025-10-22 10:23:23', '2025-10-22 10:23:23'),
(430, 190, 1, 'Слайд 2', '', '', '', '#', 'internal', 0, 'widgets/hero-slider/original_cropped-image_1761128056.jpg', '#000000', 50, 'none', 50, '2025-10-22 10:23:23', '2025-10-22 10:23:23'),
(431, 190, 1, 'Слайд 5', '', '', '', '#', 'internal', 0, '', '#000000', 50, 'none', 50, '2025-10-22 10:23:23', '2025-10-22 10:23:23'),
(432, 190, 1, 'Слайд 4', '', '', '', '#', 'internal', 0, '', '#000000', 50, 'none', 50, '2025-10-22 10:23:23', '2025-10-22 10:23:23');

-- --------------------------------------------------------

--
-- Структура таблицы `site_widget_image_settings`
--

CREATE TABLE `site_widget_image_settings` (
  `id` bigint UNSIGNED NOT NULL,
  `site_widget_id` bigint UNSIGNED NOT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt_text` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `link_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link_type` enum('internal','external') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'internal',
  `open_in_new_tab` tinyint(1) NOT NULL DEFAULT '0',
  `alignment` enum('left','center','right') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'center',
  `width` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `height` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `styling` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `site_widget_menu_items`
--

CREATE TABLE `site_widget_menu_items` (
  `id` bigint UNSIGNED NOT NULL,
  `site_widget_id` bigint UNSIGNED NOT NULL,
  `item_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('internal','external') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'internal',
  `open_in_new_tab` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `site_widget_menu_items`
--

INSERT INTO `site_widget_menu_items` (`id`, `site_widget_id`, `item_id`, `title`, `url`, `type`, `open_in_new_tab`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(183, 157, 'm1', 'Главная', '/', 'internal', 0, 1, 1, '2025-10-16 06:57:06', '2025-10-16 06:57:06'),
(184, 157, 'm2', 'О нас', '/about', 'internal', 0, 1, 1, '2025-10-16 06:57:06', '2025-10-16 06:57:06'),
(185, 157, 'm1760608621533', 'Новый пункт', '/', 'internal', 0, 1, 1, '2025-10-16 06:57:06', '2025-10-16 06:57:06'),
(186, 157, 'm1760608624323', 'Новый пункт', '/', 'internal', 0, 1, 1, '2025-10-16 06:57:06', '2025-10-16 06:57:06'),
(281, 182, 'm1', 'Главная', '/', 'internal', 0, 1, 1, '2025-10-22 07:18:33', '2025-10-22 07:18:33'),
(282, 182, 'm2', 'О нас', '/about', 'internal', 0, 1, 1, '2025-10-22 07:18:33', '2025-10-22 07:18:33'),
(283, 182, 'm1760958263941', 'Новый пункт', '/', 'internal', 0, 1, 1, '2025-10-22 07:18:33', '2025-10-22 07:18:33'),
(284, 182, 'm1761128277937', 'Новый пункт', '/', 'internal', 0, 1, 1, '2025-10-22 07:18:33', '2025-10-22 07:18:33'),
(285, 182, 'm1761128281802', 'Новый пункт', '/', 'internal', 0, 1, 1, '2025-10-22 07:18:33', '2025-10-22 07:18:33'),
(286, 182, 'm1761128282584', 'Новый пункт', '/', 'internal', 0, 1, 1, '2025-10-22 07:18:33', '2025-10-22 07:18:33');

-- --------------------------------------------------------

--
-- Структура таблицы `site_widget_referral_leaderboard_settings`
--

CREATE TABLE `site_widget_referral_leaderboard_settings` (
  `id` bigint UNSIGNED NOT NULL,
  `site_widget_id` bigint UNSIGNED NOT NULL,
  `items_per_page` int NOT NULL DEFAULT '10',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `sort_by` enum('referrals_count','total_donations','name','created_at') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'referrals_count',
  `sort_direction` enum('asc','desc') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'desc',
  `show_rank` tinyint(1) NOT NULL DEFAULT '1',
  `show_referrals_count` tinyint(1) NOT NULL DEFAULT '1',
  `show_total_donations` tinyint(1) NOT NULL DEFAULT '1',
  `show_avatar` tinyint(1) NOT NULL DEFAULT '1',
  `display_options` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `site_widget_region_rating_settings`
--

CREATE TABLE `site_widget_region_rating_settings` (
  `id` bigint UNSIGNED NOT NULL,
  `site_widget_id` bigint UNSIGNED NOT NULL,
  `items_per_page` int NOT NULL DEFAULT '10',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `sort_by` enum('name','rating','donations','created_at') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'rating',
  `sort_direction` enum('asc','desc') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'desc',
  `show_rating` tinyint(1) NOT NULL DEFAULT '1',
  `show_donations_count` tinyint(1) NOT NULL DEFAULT '1',
  `show_progress_bar` tinyint(1) NOT NULL DEFAULT '1',
  `display_options` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `site_widget_slider_slides`
--

CREATE TABLE `site_widget_slider_slides` (
  `id` bigint UNSIGNED NOT NULL,
  `site_widget_id` bigint UNSIGNED NOT NULL,
  `slide_order` int NOT NULL DEFAULT '0',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtitle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `button_text` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `button_link` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `button_link_type` enum('internal','external') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'internal',
  `button_open_in_new_tab` tinyint(1) NOT NULL DEFAULT '0',
  `background_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `overlay_color` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `overlay_opacity` int NOT NULL DEFAULT '50',
  `overlay_gradient` enum('none','left','right','top','bottom','center') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'none',
  `overlay_gradient_intensity` int NOT NULL DEFAULT '50',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `site_widget_slider_slides`
--

INSERT INTO `site_widget_slider_slides` (`id`, `site_widget_id`, `slide_order`, `title`, `subtitle`, `description`, `button_text`, `button_link`, `button_link_type`, `button_open_in_new_tab`, `background_image`, `overlay_color`, `overlay_opacity`, `overlay_gradient`, `overlay_gradient_intensity`, `created_at`, `updated_at`) VALUES
(1, 186, 0, 'Слайд 1', NULL, NULL, NULL, '#', 'internal', 0, 'http://localhost:8000/storage/widgets/slider-widget/original_cropped-image_1760975084.jpg', '#000000', 50, 'none', 50, '2025-10-20 13:47:45', '2025-10-20 13:47:45'),
(2, 186, 0, 'Слайд 2', NULL, NULL, NULL, '#', 'internal', 0, 'http://localhost:8000/storage/widgets/slider-widget/original_cropped-image_1760975101.jpg', '#000000', 50, 'none', 50, '2025-10-20 13:47:45', '2025-10-20 13:47:45');

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `referred_by_id` bigint UNSIGNED DEFAULT NULL,
  `two_factor_secret` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `two_factor_recovery_codes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `organization_id` bigint UNSIGNED DEFAULT NULL,
  `site_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `is_active`, `referred_by_id`, `two_factor_secret`, `two_factor_recovery_codes`, `two_factor_confirmed_at`, `remember_token`, `organization_id`, `site_id`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'admin@example.com', '2025-09-28 05:35:07', '$2y$12$5NUQN5dxz47L84xXjW/2A.BqlGmKYg16.FbRe/KYibPDmgl5PSVp.', 1, NULL, NULL, NULL, NULL, 'WoowsD7rfM4APblDD4SbuyPlL97DBxC61wuFhnAmN6Hhx5ek1ndKjQ9eVPXc', NULL, NULL, '2025-09-28 05:35:07', '2025-09-28 05:35:07'),
(2, 'Test User', 'test@example.com', '2025-10-13 05:04:56', '$2y$12$3aigMEWJgJj1kFSNwHwz2upNc06TYEoizn9PB9qz5h6fmYNcBi7vC', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-13 05:04:56', '2025-10-13 05:04:56'),
(3, 'Referrer 1', 'referrer1@example.com', NULL, '$2y$12$5BKwnlmQezFjj1SeIFUqmOgSmkO/MpPg7wYdpByp25OU6sdvrruCu', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-14 09:33:27', '2025-10-14 09:33:27'),
(4, 'Referrer 2', 'referrer2@example.com', NULL, '$2y$12$8ZvlrsCn8ejUInozrF9WoOocB08JS/D6Xkc3.K0MD8/kjbD1MYIUK', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-14 09:33:27', '2025-10-14 09:33:27'),
(5, 'Referrer 3', 'referrer3@example.com', NULL, '$2y$12$ZLXaAoFqTnhJhvZykvP3sOxkPExdhbunBiso0DdTpYsfN2Ek4RZXW', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-14 09:33:27', '2025-10-14 09:33:27'),
(6, 'Referred 3-1', 'referred_3_1@example.com', NULL, '$2y$12$pWNR50ozrTLkKiFFBTXgl.riGZ6OT/tNq7p5.FHspcUqzAMIOr9dW', 1, 3, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-14 09:33:27', '2025-10-14 09:33:27'),
(7, 'Referred 3-2', 'referred_3_2@example.com', NULL, '$2y$12$GbeU.fVbG9Stz/1UOURrMuUjJuimBvcTPsFbWOqPxQDMcvNACd5.y', 1, 3, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-14 09:33:27', '2025-10-14 09:33:27'),
(8, 'Referred 3-3', 'referred_3_3@example.com', NULL, '$2y$12$av5Dmj/c07GKt5rdoCHAceTKkW/AO0FzcgaGrkq/fIPrRyWVpAp9y', 1, 3, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-14 09:33:28', '2025-10-14 09:33:28'),
(9, 'Referred 3-4', 'referred_3_4@example.com', NULL, '$2y$12$2I6.U/1G3YWq3zA3AcrDVOhWo8f.XsmIjV6myBAvZx5Z3.appXYvq', 1, 3, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-14 09:33:28', '2025-10-14 09:33:28'),
(10, 'Referred 4-1', 'referred_4_1@example.com', NULL, '$2y$12$t2bB.LaVtupTLE9rG6V4c.qhMAXEgaZ7JnRIGmqcA4rdW.IY/3bU2', 1, 4, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-14 09:33:28', '2025-10-14 09:33:28'),
(11, 'Referred 4-2', 'referred_4_2@example.com', NULL, '$2y$12$v6oHohvFgBp.wHY.415zY.uM.e41OMzjkRc7G2/o8.awFutwnAph.', 1, 4, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-14 09:33:28', '2025-10-14 09:33:28'),
(12, 'Referred 4-3', 'referred_4_3@example.com', NULL, '$2y$12$OKhE1DyU9iIhFa0dCsonLeTVQZE9MxK4cuYhmPrC83EeL49L95sFK', 1, 4, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-14 09:33:28', '2025-10-14 09:33:28'),
(13, 'Referred 4-4', 'referred_4_4@example.com', NULL, '$2y$12$9lOT4krAAnLwCFyDrpRl4uYCxteqvjcYLIWgTShe7t2FgTCM1rhjy', 1, 4, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-14 09:33:29', '2025-10-14 09:33:29'),
(14, 'Referred 5-1', 'referred_5_1@example.com', NULL, '$2y$12$YrDAYI2w/wt7PFycLcZZWuApzmCIEUegXc2hC6Wl9YINYrwwiDB4a', 1, 5, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-14 09:33:29', '2025-10-14 09:33:29'),
(15, 'Referred 5-2', 'referred_5_2@example.com', NULL, '$2y$12$OdtOddOJAPHOTr.oWHCUbez1asNtqoXfakF8nJDkFrYI58/hYG/Hq', 1, 5, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-14 09:33:29', '2025-10-14 09:33:29'),
(16, 'Referred 5-3', 'referred_5_3@example.com', NULL, '$2y$12$Xg3mo3Bpo/tBPn7c7t121Ob92qUA/L3RkV2Lgz/tKaGUVZFBETUuK', 1, 5, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-14 09:33:29', '2025-10-14 09:33:29'),
(17, 'Referred 5-4', 'referred_5_4@example.com', NULL, '$2y$12$ofU4StHow9I8fGNUxngEb.vnSi1qOpJVlmH./ExSsr.liGEfpUNJ2', 1, 5, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-14 09:33:29', '2025-10-14 09:33:29');

-- --------------------------------------------------------

--
-- Структура таблицы `widgets`
--

CREATE TABLE `widgets` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `widget_slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fields_config` json DEFAULT NULL,
  `settings_config` json DEFAULT NULL,
  `component_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `css_classes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `js_script` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `widgets`
--

INSERT INTO `widgets` (`id`, `name`, `widget_slug`, `description`, `icon`, `category`, `fields_config`, `settings_config`, `component_name`, `css_classes`, `js_script`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(2, 'Текстовый блок', 'text', 'Мощный текстовый редактор с поддержкой форматирования, списков, цитат, ссылок и настройками стилей', '📝', 'content', '{\"content\": {\"type\": \"richtext\", \"label\": \"Содержимое\", \"required\": true}, \"text_align\": {\"type\": \"select\", \"label\": \"Выравнивание\", \"options\": [\"left\", \"center\", \"right\"], \"required\": false}, \"text_color\": {\"type\": \"color\", \"label\": \"Цвет текста\", \"required\": false}, \"background_color\": {\"type\": \"color\", \"label\": \"Цвет фона\", \"required\": false}}', '{\"margin\": {\"type\": \"text\", \"label\": \"Внешние отступы\", \"default\": \"0\"}, \"padding\": {\"type\": \"text\", \"label\": \"Отступы\", \"default\": \"20px\"}, \"border_radius\": {\"type\": \"text\", \"label\": \"Скругление углов\", \"default\": \"0\"}}', 'TextWidget', 'text-widget', NULL, 1, 10, '2025-09-29 11:54:16', '2025-10-14 09:26:56'),
(3, 'Проекты', 'projects', 'Список проектов с прогрессом', '🚀', 'content', '{\"limit\": {\"max\": 20, \"min\": 1, \"type\": \"number\", \"label\": \"Количество проектов\", \"default\": 6, \"required\": false}, \"title\": {\"type\": \"text\", \"label\": \"Заголовок\", \"default\": \"Наши проекты\", \"required\": false}, \"columns\": {\"max\": 4, \"min\": 1, \"type\": \"number\", \"label\": \"Количество колонок\", \"default\": 3, \"required\": false}, \"show_image\": {\"type\": \"checkbox\", \"label\": \"Показывать изображение\", \"default\": true, \"required\": false}, \"show_progress\": {\"type\": \"checkbox\", \"label\": \"Показывать прогресс\", \"default\": true, \"required\": false}, \"show_description\": {\"type\": \"checkbox\", \"label\": \"Показывать описание\", \"default\": true, \"required\": false}}', '{\"animation\": {\"type\": \"select\", \"label\": \"Анимация\", \"default\": \"fade\", \"options\": [\"none\", \"fade\", \"slide\", \"zoom\"]}, \"hover_effect\": {\"type\": \"select\", \"label\": \"Эффект при наведении\", \"default\": \"lift\", \"options\": [\"none\", \"lift\", \"shadow\", \"scale\"]}}', 'ProjectsWidget', 'projects-widget', NULL, 1, 11, '2025-09-29 11:54:16', '2025-10-13 05:04:41'),
(4, 'Галерея', 'gallery', 'Галерея изображений с лайтбоксом', '🖼️', 'media', '{\"images\": {\"type\": \"images\", \"label\": \"Изображения\", \"required\": true}, \"columns\": {\"max\": 6, \"min\": 1, \"type\": \"number\", \"label\": \"Количество колонок\", \"default\": 3, \"required\": false}, \"lightbox\": {\"type\": \"checkbox\", \"label\": \"Лайтбокс\", \"default\": true, \"required\": false}, \"show_captions\": {\"type\": \"checkbox\", \"label\": \"Показывать подписи\", \"default\": false, \"required\": false}}', '{\"gap\": {\"type\": \"text\", \"label\": \"Отступ между изображениями\", \"default\": \"16px\"}, \"border_radius\": {\"type\": \"text\", \"label\": \"Скругление углов\", \"default\": \"8px\"}}', 'GalleryWidget', 'gallery-widget', NULL, 1, 21, '2025-09-29 11:54:16', '2025-10-13 05:04:41'),
(7, 'Изображение', 'image', 'Одиночное изображение с подписью', '🖼️', 'media', '{\"size\": {\"type\": \"select\", \"label\": \"Размер\", \"options\": [\"small\", \"medium\", \"large\", \"full\"], \"required\": false}, \"image\": {\"type\": \"image\", \"label\": \"Изображение\", \"required\": true}, \"caption\": {\"type\": \"text\", \"label\": \"Подпись\", \"required\": false}, \"alt_text\": {\"type\": \"text\", \"label\": \"Альтернативный текст\", \"required\": false}, \"alignment\": {\"type\": \"select\", \"label\": \"Выравнивание\", \"options\": [\"left\", \"center\", \"right\"], \"required\": false}}', '{\"shadow\": {\"type\": \"checkbox\", \"label\": \"Тень\", \"default\": true}, \"border_radius\": {\"type\": \"text\", \"label\": \"Скругление углов\", \"default\": \"8px\"}}', 'ImageWidget', NULL, NULL, 1, 20, '2025-09-30 05:15:01', '2025-10-13 05:04:41'),
(9, 'Статистика', 'stats', 'Блок со статистикой и цифрами', '📊', 'content', '{\"stats\": {\"type\": \"json\", \"label\": \"Статистика\", \"required\": true}, \"title\": {\"type\": \"text\", \"label\": \"Заголовок\", \"required\": false}, \"layout\": {\"type\": \"select\", \"label\": \"Макет\", \"default\": \"grid\", \"options\": [\"grid\", \"list\", \"carousel\"], \"required\": false}, \"columns\": {\"max\": 6, \"min\": 1, \"type\": \"number\", \"label\": \"Количество колонок\", \"default\": 3, \"required\": false}, \"show_icons\": {\"type\": \"checkbox\", \"label\": \"Показывать иконки\", \"default\": true, \"required\": false}}', '{\"animation\": {\"type\": \"select\", \"label\": \"Анимация\", \"default\": \"fade-in\", \"options\": [\"none\", \"count-up\", \"fade-in\"]}}', 'StatsWidget', NULL, NULL, 1, 12, '2025-09-30 05:15:01', '2025-10-13 05:04:41'),
(13, 'Форма', 'form', 'Универсальный конструктор форм - создавайте любые формы с нужными полями', '📋', 'forms', '[]', '[]', 'FormWidget', NULL, NULL, 1, 15, '2025-10-01 14:29:23', '2025-10-13 19:08:20'),
(14, 'Виджет пожертвований', 'donation', 'Прием пожертвований с поддержкой всех платежных систем и регулярных платежей', '💳', 'payment', '{\"title\": {\"help\": \"Если не указано, будет использовано действие из терминологии (например, \\\"Поддержать\\\")\", \"type\": \"text\", \"group\": \"main\", \"label\": \"Заголовок виджета\", \"default\": \"\", \"required\": false, \"placeholder\": \"Оставьте пустым для использования терминологии системы\"}, \"shadow\": {\"type\": \"select\", \"group\": \"appearance\", \"label\": \"Тень\", \"default\": \"small\", \"options\": {\"none\": \"Нет\", \"large\": \"Большая\", \"small\": \"Маленькая\", \"medium\": \"Средняя\"}, \"required\": false}, \"currency\": {\"type\": \"select\", \"group\": \"amounts\", \"label\": \"Валюта\", \"default\": \"RUB\", \"options\": {\"EUR\": \"€ Евро\", \"RUB\": \"₽ Рубли\", \"USD\": \"$ Доллары\"}, \"required\": false}, \"max_amount\": {\"min\": 0, \"help\": \"0 = без ограничений\", \"type\": \"number\", \"group\": \"amounts\", \"label\": \"Максимальная сумма\", \"default\": 0, \"required\": false}, \"min_amount\": {\"min\": 1, \"help\": \"Минимальная сумма пожертвования в рублях\", \"type\": \"number\", \"group\": \"amounts\", \"label\": \"Минимальная сумма\", \"default\": 100, \"required\": false}, \"project_id\": {\"help\": \"Привязка к конкретному проекту\", \"type\": \"select\", \"group\": \"fundraiser\", \"label\": \"Проект\", \"required\": false, \"placeholder\": \"Выберите проект\", \"options_source\": \"projects\"}, \"button_text\": {\"help\": \"Если не указано, будет использовано действие из терминологии\", \"type\": \"text\", \"group\": \"appearance\", \"label\": \"Текст кнопки\", \"default\": \"\", \"required\": false}, \"description\": {\"type\": \"textarea\", \"group\": \"main\", \"label\": \"Описание\", \"required\": false, \"placeholder\": \"Ваша поддержка поможет...\"}, \"button_style\": {\"type\": \"select\", \"group\": \"appearance\", \"label\": \"Стиль кнопки\", \"default\": \"primary\", \"options\": {\"primary\": \"Основной\", \"success\": \"Успех\", \"gradient\": \"Градиент\", \"secondary\": \"Дополнительный\"}, \"required\": false}, \"color_scheme\": {\"type\": \"select\", \"group\": \"appearance\", \"label\": \"Цветовая схема\", \"default\": \"light\", \"options\": {\"auto\": \"Автоматическая\", \"dark\": \"Темная\", \"light\": \"Светлая\"}, \"required\": false}, \"require_name\": {\"type\": \"checkbox\", \"group\": \"donor\", \"label\": \"Требовать имя\", \"default\": true, \"required\": false}, \"send_receipt\": {\"type\": \"checkbox\", \"group\": \"receipt\", \"label\": \"Отправлять чеки\", \"default\": true, \"required\": false}, \"border_radius\": {\"type\": \"select\", \"group\": \"appearance\", \"label\": \"Скругление углов\", \"default\": \"medium\", \"options\": {\"full\": \"Полное\", \"none\": \"Нет\", \"large\": \"Большое\", \"small\": \"Маленькое\", \"medium\": \"Среднее\"}, \"required\": false}, \"fundraiser_id\": {\"help\": \"Если выбран сбор, будет показан прогресс\", \"type\": \"select\", \"group\": \"fundraiser\", \"label\": \"Сбор средств\", \"required\": false, \"placeholder\": \"Выберите сбор средств\", \"options_source\": \"fundraisers\"}, \"primary_color\": {\"type\": \"color\", \"group\": \"appearance\", \"label\": \"Основной цвет\", \"default\": \"#3b82f6\", \"required\": false}, \"require_email\": {\"type\": \"checkbox\", \"group\": \"donor\", \"label\": \"Требовать email\", \"default\": false, \"required\": false}, \"require_phone\": {\"type\": \"checkbox\", \"group\": \"donor\", \"label\": \"Требовать телефон\", \"default\": false, \"required\": false}, \"show_progress\": {\"type\": \"checkbox\", \"group\": \"fundraiser\", \"label\": \"Показывать прогресс сбора\", \"default\": true, \"required\": false}, \"default_amount\": {\"min\": 1, \"help\": \"Сумма в рублях\", \"type\": \"number\", \"group\": \"amounts\", \"label\": \"Сумма по умолчанию\", \"default\": 100, \"required\": false}, \"preset_amounts\": {\"help\": \"Суммы в рублях\", \"type\": \"repeater\", \"group\": \"amounts\", \"label\": \"Предустановленные суммы\", \"default\": [100, 300, 500, 1000], \"required\": false}, \"allow_anonymous\": {\"type\": \"checkbox\", \"group\": \"donor\", \"label\": \"Разрешить анонимные пожертвования\", \"default\": true, \"required\": false}, \"allow_recurring\": {\"type\": \"checkbox\", \"group\": \"recurring\", \"label\": \"Разрешить регулярные платежи\", \"default\": true, \"required\": false}, \"payment_methods\": {\"help\": \"Если не выбрано, будут доступны все активные методы\", \"type\": \"multiselect\", \"group\": \"payment\", \"label\": \"Доступные способы оплаты\", \"default\": [\"yookassa\", \"sbp\", \"tinkoff\"], \"required\": false, \"options_source\": \"payment_methods\"}, \"recurring_periods\": {\"type\": \"multiselect\", \"group\": \"recurring\", \"label\": \"Периоды регулярных платежей\", \"default\": [\"daily\", \"weekly\", \"monthly\"], \"options\": {\"daily\": \"Ежедневно\", \"weekly\": \"Еженедельно\", \"monthly\": \"Ежемесячно\"}, \"required\": false}, \"thank_you_message\": {\"type\": \"richtext\", \"group\": \"receipt\", \"label\": \"Сообщение благодарности\", \"required\": false, \"placeholder\": \"Спасибо за вашу поддержку!\"}, \"show_message_field\": {\"type\": \"checkbox\", \"group\": \"donor\", \"label\": \"Показывать поле для сообщения\", \"default\": false, \"required\": false}, \"show_payment_icons\": {\"type\": \"checkbox\", \"group\": \"payment\", \"label\": \"Показывать иконки платежных систем\", \"default\": true, \"required\": false}, \"show_target_amount\": {\"type\": \"checkbox\", \"group\": \"fundraiser\", \"label\": \"Показывать целевую сумму\", \"default\": true, \"required\": false}, \"show_collected_amount\": {\"type\": \"checkbox\", \"group\": \"fundraiser\", \"label\": \"Показывать собранную сумму\", \"default\": true, \"required\": false}, \"default_payment_method\": {\"type\": \"select\", \"group\": \"payment\", \"label\": \"Способ оплаты по умолчанию\", \"default\": \"yookassa\", \"required\": false, \"options_source\": \"payment_methods\"}, \"redirect_after_payment\": {\"help\": \"URL страницы благодарности\", \"type\": \"url\", \"group\": \"receipt\", \"label\": \"Страница после оплаты\", \"required\": false, \"placeholder\": \"/thank-you\"}, \"default_recurring_period\": {\"type\": \"select\", \"group\": \"recurring\", \"label\": \"Период по умолчанию\", \"default\": \"daily\", \"options\": {\"daily\": \"Ежедневно\", \"weekly\": \"Еженедельно\", \"monthly\": \"Ежемесячно\"}, \"required\": false}}', '{\"width\": {\"help\": \"CSS значение (px, %, rem)\", \"type\": \"text\", \"label\": \"Ширина\", \"default\": \"100%\"}, \"margin\": {\"type\": \"text\", \"label\": \"Внешние отступы\", \"default\": \"0\"}, \"padding\": {\"type\": \"text\", \"label\": \"Внутренние отступы\", \"default\": \"20px\"}, \"position\": {\"type\": \"select\", \"label\": \"Позиция виджета\", \"default\": \"inline\", \"options\": {\"modal\": \"Модальное окно\", \"inline\": \"В потоке\", \"sticky\": \"Фиксированная\"}}, \"animation\": {\"type\": \"select\", \"label\": \"Анимация появления\", \"default\": \"fade\", \"options\": {\"fade\": \"Затухание\", \"none\": \"Нет\", \"zoom\": \"Масштабирование\", \"slide\": \"Скольжение\"}}, \"max_width\": {\"type\": \"text\", \"label\": \"Максимальная ширина\", \"default\": \"500px\"}, \"sticky_position\": {\"type\": \"select\", \"label\": \"Позиция при фиксации\", \"default\": \"bottom-right\", \"options\": {\"top-left\": \"Вверху слева\", \"top-right\": \"Вверху справа\", \"bottom-left\": \"Внизу слева\", \"bottom-right\": \"Внизу справа\"}, \"depends_on\": {\"position\": \"sticky\"}}}', 'DonationWidget', 'donation-widget payment-widget', NULL, 1, 30, '2025-10-13 04:32:45', '2025-10-13 06:47:11'),
(15, 'Главный баннер', 'hero', 'Главный баннер - одиночный слайд или слайдер с несколькими слайдами', '🎯', 'hero', '{\"title\": {\"type\": \"text\", \"label\": \"Заголовок\", \"required\": true}, \"subtitle\": {\"type\": \"text\", \"label\": \"Подзаголовок\", \"required\": false}, \"button_url\": {\"type\": \"url\", \"label\": \"Ссылка кнопки\", \"required\": false}, \"button_text\": {\"type\": \"text\", \"label\": \"Текст кнопки\", \"required\": false}, \"description\": {\"type\": \"textarea\", \"label\": \"Описание\", \"required\": false}, \"button_style\": {\"type\": \"select\", \"label\": \"Стиль кнопки\", \"options\": [\"primary\", \"secondary\", \"outline\"], \"required\": false}, \"background_image\": {\"type\": \"image\", \"label\": \"Фоновое изображение\", \"required\": false}}', '{\"height\": {\"type\": \"text\", \"label\": \"Высота\", \"default\": \"400px\"}, \"overlay\": {\"type\": \"checkbox\", \"label\": \"Наложение\", \"default\": true}, \"parallax\": {\"type\": \"checkbox\", \"label\": \"Параллакс эффект\", \"default\": false}, \"overlay_opacity\": {\"max\": 100, \"min\": 0, \"type\": \"range\", \"label\": \"Прозрачность наложения\", \"default\": 50}}', 'HeroWidget', NULL, NULL, 1, 2, '2025-10-13 05:04:41', '2025-10-13 06:54:23'),
(17, 'Меню', 'menu', 'Универсальный виджет меню - можно добавить в любую позицию', '🧭', 'navigation', '[]', '[]', 'MenuWidget', NULL, NULL, 1, 1, '2025-10-13 06:47:11', '2025-10-13 06:47:11'),
(18, 'Рейтинг регионов', 'region_rating', 'Рейтинг регионов по пожертвованиям с поиском и фильтрацией', '🗺️', 'content', '[]', '[]', 'RegionRatingWidget', NULL, NULL, 1, 13, '2025-10-13 18:45:46', '2025-10-13 18:45:46'),
(19, 'Список пожертвований', 'donations_list', 'Список последних пожертвований с фильтрацией и поиском', '💰', 'content', '[]', '[]', 'DonationsListWidget', NULL, NULL, 1, 14, '2025-10-13 19:08:20', '2025-10-13 19:08:20'),
(20, 'Рейтинг по приглашениям', 'referral_leaderboard', 'Лидерборд по приглашениям и сумме пожертвований приглашенных', '👥', 'content', '[]', '[]', 'ReferralLeaderboardWidget', NULL, NULL, 1, 16, '2025-10-14 09:26:56', '2025-10-14 09:26:56'),
(21, 'Слайдер', 'slider', 'Универсальный слайдер с поддержкой различных эффектов, макетов и настроек', '🎠', 'hero', '[]', '[]', 'SliderWidget', NULL, NULL, 1, 3, '2025-10-20 12:15:51', '2025-10-20 12:15:51'),
(22, 'Меню авторизации', 'auth_menu', 'Кнопки входа/регистрации с модальными окнами и поддержкой Sanctum токенов', '🔐', 'navigation', '[]', '[]', 'AuthMenuWidget', NULL, NULL, 1, 4, '2025-10-21 07:30:00', '2025-10-21 07:30:00'),
(23, 'HTML блок', 'html', 'Виджет для вставки произвольного HTML кода, включая скрипты, стили, iframe и другие элементы', '🌐', 'content', '[]', '[]', 'HtmlWidget', NULL, NULL, 1, 11, '2025-10-21 17:26:00', '2025-10-21 17:26:00');

-- --------------------------------------------------------

--
-- Структура таблицы `widget_positions`
--

CREATE TABLE `widget_positions` (
  `id` bigint UNSIGNED NOT NULL,
  `template_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `area` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order` int NOT NULL DEFAULT '0',
  `allowed_widgets` json DEFAULT NULL,
  `layout_config` json DEFAULT NULL,
  `is_required` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `widget_positions`
--

INSERT INTO `widget_positions` (`id`, `template_id`, `name`, `slug`, `description`, `area`, `order`, `allowed_widgets`, `layout_config`, `is_required`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Главный баннер', 'hero', 'Главный баннер или слайдер (hero секция)', 'hero', 2, '[]', '{\"width\": \"full\", \"margin\": \"0\", \"padding\": \"0\", \"alignment\": \"center\"}', 0, 1, '2025-09-29 11:54:07', '2025-10-13 05:05:07'),
(2, 1, 'Основной контент', 'content', 'Основная область контента сайта', 'content', 3, '[]', '{\"width\": \"full\", \"margin\": \"0\", \"padding\": \"40px 20px\", \"alignment\": \"left\"}', 1, 1, '2025-09-29 11:54:07', '2025-10-13 05:05:07'),
(3, 1, 'Боковая панель', 'sidebar', 'Боковая панель (виджеты, дополнительная информация)', 'sidebar', 4, '[]', '{\"width\": \"350px\", \"margin\": \"0\", \"padding\": \"20px\", \"alignment\": \"left\"}', 0, 1, '2025-09-29 11:54:07', '2025-10-13 05:05:07'),
(4, 1, 'Подвал сайта', 'footer', 'Нижняя часть сайта (контакты, информация, меню)', 'footer', 5, '[]', '{\"width\": \"full\", \"margin\": \"0\", \"padding\": \"40px 20px\", \"alignment\": \"center\"}', 0, 1, '2025-09-29 11:54:07', '2025-10-13 05:05:07'),
(17, 1, 'Шапка сайта', 'header', 'Верхняя часть сайта (меню, логотип, навигация)', 'header', 1, '[]', '{\"width\": \"full\", \"margin\": \"0\", \"padding\": \"20px\", \"alignment\": \"right\"}', 1, 1, '2025-09-30 05:15:25', '2025-10-21 07:34:06'),
(26, 1, 'Шапка: Колонка 1', 'header-col-1', NULL, 'header', 1, '[\"image\", \"menu\", \"text\"]', '[]', 0, 1, '2025-10-21 06:33:24', '2025-10-21 06:33:24'),
(28, 1, 'Шапка: Колонка 3', 'header-col-3', NULL, 'header', 3, '[\"auth_menu\", \"menu\", \"text\"]', '[]', 0, 1, '2025-10-21 06:33:24', '2025-10-21 06:33:24'),
(29, 1, 'Шапка: Колонка 4', 'header-col-4', NULL, 'header', 4, '[\"menu\", \"text\", \"image\"]', '[]', 0, 1, '2025-10-21 06:33:24', '2025-10-21 06:33:24'),
(30, 1, 'Подвал: Колонка 1', 'footer-col-1', NULL, 'footer', 1, '[\"menu\", \"text\", \"image\", \"contact\"]', '[]', 0, 1, '2025-10-21 06:33:24', '2025-10-21 06:33:24'),
(31, 1, 'Подвал: Колонка 2', 'footer-col-2', NULL, 'footer', 2, '[\"menu\", \"text\", \"image\", \"contact\"]', '[]', 0, 1, '2025-10-21 06:33:24', '2025-10-21 06:33:24'),
(32, 1, 'Подвал: Колонка 3', 'footer-col-3', NULL, 'footer', 3, '[\"menu\", \"text\", \"image\", \"contact\"]', '[]', 0, 1, '2025-10-21 06:33:24', '2025-10-21 06:33:24'),
(33, 1, 'Подвал: Колонка 4', 'footer-col-4', NULL, 'footer', 4, '[\"menu\", \"text\", \"image\", \"contact\"]', '[]', 0, 1, '2025-10-21 06:33:24', '2025-10-21 06:33:24'),
(34, 1, 'Шапка: Колонка 2', 'header-col-2', NULL, 'header', 2, '[\"image\", \"menu\", \"text\", \"auth_menu\"]', '[]', 0, 1, '2025-10-21 08:09:23', '2025-10-21 08:09:23');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Индексы таблицы `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Индексы таблицы `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cities_region_id_name_index` (`region_id`,`name`),
  ADD KEY `cities_type_index` (`type`),
  ADD KEY `cities_status_index` (`status`),
  ADD KEY `cities_is_active_index` (`is_active`);

--
-- Индексы таблицы `domains`
--
ALTER TABLE `domains`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organization_domains_domain_unique` (`domain`),
  ADD UNIQUE KEY `organization_domains_custom_domain_unique` (`custom_domain`),
  ADD KEY `organization_domains_organization_id_is_primary_index` (`organization_id`,`is_primary`),
  ADD KEY `organization_domains_status_index` (`status`);

--
-- Индексы таблицы `donations`
--
ALTER TABLE `donations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `donations_project_id_foreign` (`project_id`),
  ADD KEY `donations_organization_id_status_index` (`organization_id`,`status`),
  ADD KEY `donations_fundraiser_id_status_index` (`fundraiser_id`,`status`),
  ADD KEY `donations_donor_id_created_at_index` (`donor_id`,`created_at`),
  ADD KEY `donations_payment_id_index` (`payment_id`),
  ADD KEY `donations_transaction_id_index` (`transaction_id`),
  ADD KEY `donations_paid_at_index` (`paid_at`),
  ADD KEY `donations_payment_transaction_id_index` (`payment_transaction_id`),
  ADD KEY `donations_region_id_index` (`region_id`),
  ADD KEY `donations_org_referrer_status_idx` (`organization_id`,`referrer_user_id`,`status`),
  ADD KEY `donations_organization_id_index` (`organization_id`),
  ADD KEY `donations_status_index` (`status`),
  ADD KEY `donations_created_at_index` (`created_at`),
  ADD KEY `donations_project_id_index` (`project_id`);

--
-- Индексы таблицы `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Индексы таблицы `federal_districts`
--
ALTER TABLE `federal_districts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `federal_districts_slug_unique` (`slug`),
  ADD UNIQUE KEY `federal_districts_code_unique` (`code`),
  ADD KEY `federal_districts_is_active_index` (`is_active`);

--
-- Индексы таблицы `form_actions`
--
ALTER TABLE `form_actions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `form_actions_form_widget_id_foreign` (`form_widget_id`);

--
-- Индексы таблицы `form_fields`
--
ALTER TABLE `form_fields`
  ADD PRIMARY KEY (`id`),
  ADD KEY `form_fields_form_widget_id_foreign` (`form_widget_id`);

--
-- Индексы таблицы `form_submissions`
--
ALTER TABLE `form_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `form_submissions_form_widget_id_foreign` (`form_widget_id`);

--
-- Индексы таблицы `form_submissions_data`
--
ALTER TABLE `form_submissions_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `form_submissions_data_form_submission_id_foreign` (`form_submission_id`),
  ADD KEY `form_submissions_data_form_widget_id_created_at_index` (`form_widget_id`,`created_at`);

--
-- Индексы таблицы `form_widgets`
--
ALTER TABLE `form_widgets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `form_widgets_slug_unique` (`slug`),
  ADD KEY `form_widgets_site_id_foreign` (`site_id`);

--
-- Индексы таблицы `fundraisers`
--
ALTER TABLE `fundraisers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `fundraisers_slug_unique` (`slug`),
  ADD KEY `fundraisers_project_id_foreign` (`project_id`),
  ADD KEY `fundraisers_organization_id_status_index` (`organization_id`,`status`),
  ADD KEY `fundraisers_status_type_index` (`status`,`type`),
  ADD KEY `fundraisers_start_date_end_date_index` (`start_date`,`end_date`),
  ADD KEY `fundraisers_created_at_index` (`created_at`);

--
-- Индексы таблицы `global_settings`
--
ALTER TABLE `global_settings`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Индексы таблицы `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `members_organization_id_member_type_index` (`organization_id`,`member_type`),
  ADD KEY `members_graduation_year_is_featured_index` (`graduation_year`,`is_featured`),
  ADD KEY `members_last_name_first_name_index` (`last_name`,`first_name`);

--
-- Индексы таблицы `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Индексы таблицы `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Индексы таблицы `organizations`
--
ALTER TABLE `organizations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organizations_slug_unique` (`slug`),
  ADD KEY `organizations_settlement_id_foreign` (`settlement_id`),
  ADD KEY `organizations_status_is_public_index` (`status`,`is_public`),
  ADD KEY `organizations_region_id_city_id_index` (`region_id`,`city_id`),
  ADD KEY `organizations_city_id_settlement_id_index` (`city_id`,`settlement_id`),
  ADD KEY `organizations_type_index` (`type`),
  ADD KEY `organizations_status_index` (`status`),
  ADD KEY `organizations_region_id_index` (`region_id`),
  ADD KEY `organizations_slug_index` (`slug`),
  ADD KEY `organizations_created_at_index` (`created_at`);

--
-- Индексы таблицы `organization_media`
--
ALTER TABLE `organization_media`
  ADD PRIMARY KEY (`id`),
  ADD KEY `organization_media_mediaable_type_mediaable_id_index` (`mediaable_type`,`mediaable_id`),
  ADD KEY `organization_media_organization_id_type_index` (`organization_id`,`type`),
  ADD KEY `organization_media_file_hash_index` (`file_hash`),
  ADD KEY `organization_media_sort_order_index` (`sort_order`);

--
-- Индексы таблицы `organization_news`
--
ALTER TABLE `organization_news`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organization_news_slug_unique` (`slug`),
  ADD KEY `organization_news_organization_id_status_index` (`organization_id`,`status`),
  ADD KEY `organization_news_status_published_at_index` (`status`,`published_at`),
  ADD KEY `organization_news_category_featured_index` (`category`,`featured`),
  ADD KEY `organization_news_published_at_index` (`published_at`);

--
-- Индексы таблицы `organization_seo`
--
ALTER TABLE `organization_seo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organization_seo_organization_id_unique` (`organization_id`);

--
-- Индексы таблицы `organization_settings`
--
ALTER TABLE `organization_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organization_settings_organization_id_unique` (`organization_id`),
  ADD KEY `organization_settings_theme_index` (`theme`),
  ADD KEY `organization_settings_dark_mode_index` (`dark_mode`),
  ADD KEY `organization_settings_maintenance_mode_index` (`maintenance_mode`);

--
-- Индексы таблицы `organization_sliders`
--
ALTER TABLE `organization_sliders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `organization_sliders_organization_id_is_active_position_index` (`organization_id`,`is_active`,`position`),
  ADD KEY `organization_sliders_organization_id_type_index` (`organization_id`,`type`);

--
-- Индексы таблицы `organization_slider_slides`
--
ALTER TABLE `organization_slider_slides`
  ADD PRIMARY KEY (`id`),
  ADD KEY `organization_slider_slides_slider_id_is_active_sort_order_index` (`slider_id`,`is_active`,`sort_order`),
  ADD KEY `organization_slider_slides_slider_id_content_type_index` (`slider_id`,`content_type`);

--
-- Индексы таблицы `organization_statistics`
--
ALTER TABLE `organization_statistics`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organization_statistics_organization_id_date_unique` (`organization_id`,`date`),
  ADD KEY `organization_statistics_date_index` (`date`);

--
-- Индексы таблицы `organization_types`
--
ALTER TABLE `organization_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organization_types_key_unique` (`key`);

--
-- Индексы таблицы `organization_users`
--
ALTER TABLE `organization_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organization_users_organization_id_user_id_unique` (`organization_id`,`user_id`),
  ADD KEY `organization_users_user_id_status_index` (`user_id`,`status`),
  ADD KEY `organization_users_organization_id_role_index` (`organization_id`,`role`);

--
-- Индексы таблицы `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Индексы таблицы `payment_logs`
--
ALTER TABLE `payment_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_logs_payment_transaction_id_created_at_index` (`payment_transaction_id`,`created_at`),
  ADD KEY `payment_logs_action_created_at_index` (`action`,`created_at`),
  ADD KEY `payment_logs_level_created_at_index` (`level`,`created_at`);

--
-- Индексы таблицы `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_methods_slug_unique` (`slug`),
  ADD KEY `payment_methods_is_active_sort_order_index` (`is_active`,`sort_order`);

--
-- Индексы таблицы `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_transactions_transaction_id_unique` (`transaction_id`),
  ADD KEY `payment_transactions_organization_id_status_index` (`organization_id`,`status`),
  ADD KEY `payment_transactions_fundraiser_id_status_index` (`fundraiser_id`,`status`),
  ADD KEY `payment_transactions_project_id_status_index` (`project_id`,`status`),
  ADD KEY `payment_transactions_payment_method_id_status_index` (`payment_method_id`,`status`),
  ADD KEY `payment_transactions_status_created_at_index` (`status`,`created_at`),
  ADD KEY `payment_transactions_transaction_id_index` (`transaction_id`),
  ADD KEY `payment_transactions_external_id_index` (`external_id`);

--
-- Индексы таблицы `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`);

--
-- Индексы таблицы `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Индексы таблицы `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organization_projects_slug_unique` (`slug`),
  ADD KEY `organization_projects_organization_id_status_index` (`organization_id`,`status`),
  ADD KEY `organization_projects_status_featured_index` (`status`,`featured`),
  ADD KEY `organization_projects_category_index` (`category`),
  ADD KEY `organization_projects_created_at_index` (`created_at`);

--
-- Индексы таблицы `regions`
--
ALTER TABLE `regions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `regions_slug_unique` (`slug`),
  ADD UNIQUE KEY `regions_code_unique` (`code`),
  ADD KEY `regions_code_index` (`code`),
  ADD KEY `regions_federal_district_id_index` (`federal_district_id`),
  ADD KEY `regions_type_index` (`type`),
  ADD KEY `regions_is_active_index` (`is_active`);

--
-- Индексы таблицы `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);

--
-- Индексы таблицы `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Индексы таблицы `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Индексы таблицы `settlements`
--
ALTER TABLE `settlements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `settlements_region_id_name_index` (`region_id`,`name`),
  ADD KEY `settlements_city_id_index` (`city_id`),
  ADD KEY `settlements_type_index` (`type`),
  ADD KEY `settlements_is_active_index` (`is_active`);

--
-- Индексы таблицы `sites`
--
ALTER TABLE `sites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organization_sites_slug_unique` (`slug`),
  ADD KEY `organization_sites_organization_id_status_index` (`organization_id`,`status`),
  ADD KEY `organization_sites_domain_id_is_public_index` (`domain_id`,`is_public`),
  ADD KEY `organization_sites_status_index` (`status`),
  ADD KEY `organization_sites_is_public_index` (`is_public`),
  ADD KEY `organization_sites_organization_id_index` (`organization_id`),
  ADD KEY `organization_sites_slug_index` (`slug`),
  ADD KEY `organization_sites_created_at_index` (`created_at`),
  ADD KEY `sites_site_type_index` (`site_type`);

--
-- Индексы таблицы `site_pages`
--
ALTER TABLE `site_pages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organization_site_pages_site_id_slug_unique` (`site_id`,`slug`),
  ADD KEY `organization_site_pages_parent_id_foreign` (`parent_id`),
  ADD KEY `organization_site_pages_site_id_status_index` (`site_id`,`status`),
  ADD KEY `organization_site_pages_site_id_is_homepage_index` (`site_id`,`is_homepage`),
  ADD KEY `organization_site_pages_site_id_is_public_index` (`site_id`,`is_public`),
  ADD KEY `organization_site_pages_site_id_parent_id_index` (`site_id`,`parent_id`),
  ADD KEY `organization_site_pages_site_id_slug_index` (`site_id`,`slug`),
  ADD KEY `organization_site_pages_status_index` (`status`),
  ADD KEY `organization_site_pages_is_public_index` (`is_public`);

--
-- Индексы таблицы `site_page_seo`
--
ALTER TABLE `site_page_seo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `site_page_seo_page_id_unique` (`page_id`),
  ADD KEY `site_page_seo_page_id_index` (`page_id`);

--
-- Индексы таблицы `site_templates`
--
ALTER TABLE `site_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `site_templates_slug_unique` (`slug`),
  ADD KEY `site_templates_is_active_sort_order_index` (`is_active`,`sort_order`),
  ADD KEY `site_templates_is_premium_index` (`is_premium`);

--
-- Индексы таблицы `site_widgets`
--
ALTER TABLE `site_widgets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `site_widgets_position_id_foreign` (`position_id`),
  ADD KEY `site_widgets_site_id_position_name_order_index` (`site_id`,`position_name`,`order`),
  ADD KEY `site_widgets_site_id_is_active_index` (`site_id`,`is_active`),
  ADD KEY `site_widgets_widget_id_is_active_index` (`widget_id`,`is_active`),
  ADD KEY `idx_site_position` (`site_id`,`position_id`),
  ADD KEY `idx_widget_type` (`widget_id`),
  ADD KEY `idx_active_visible` (`is_active`,`is_visible`);

--
-- Индексы таблицы `site_widget_configs`
--
ALTER TABLE `site_widget_configs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_widget_config` (`site_widget_id`,`config_key`),
  ADD KEY `idx_config_key` (`config_key`),
  ADD KEY `idx_widget_type` (`site_widget_id`,`config_type`),
  ADD KEY `site_widget_configs_config_key_index` (`config_key`);

--
-- Индексы таблицы `site_widget_donations_list_settings`
--
ALTER TABLE `site_widget_donations_list_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_donations_list_settings` (`site_widget_id`);

--
-- Индексы таблицы `site_widget_donation_settings`
--
ALTER TABLE `site_widget_donation_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_donation_settings` (`site_widget_id`);

--
-- Индексы таблицы `site_widget_form_fields`
--
ALTER TABLE `site_widget_form_fields`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_field_order` (`site_widget_id`,`sort_order`),
  ADD KEY `idx_widget_field_type` (`site_widget_id`,`field_type`),
  ADD KEY `idx_field_type` (`field_type`),
  ADD KEY `site_widget_form_fields_field_type_index` (`field_type`);

--
-- Индексы таблицы `site_widget_gallery_images`
--
ALTER TABLE `site_widget_gallery_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_widget_image_order` (`site_widget_id`,`sort_order`),
  ADD KEY `idx_widget_image_active` (`site_widget_id`,`is_active`);

--
-- Индексы таблицы `site_widget_hero_slides`
--
ALTER TABLE `site_widget_hero_slides`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_slide_order` (`site_widget_id`,`sort_order`),
  ADD KEY `idx_site_widget` (`site_widget_id`);

--
-- Индексы таблицы `site_widget_image_settings`
--
ALTER TABLE `site_widget_image_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_image_settings` (`site_widget_id`);

--
-- Индексы таблицы `site_widget_menu_items`
--
ALTER TABLE `site_widget_menu_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_widget_item_order` (`site_widget_id`,`sort_order`),
  ADD KEY `idx_widget_item_active` (`site_widget_id`,`is_active`),
  ADD KEY `site_widget_menu_items_item_id_index` (`item_id`);

--
-- Индексы таблицы `site_widget_referral_leaderboard_settings`
--
ALTER TABLE `site_widget_referral_leaderboard_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_referral_leaderboard_settings` (`site_widget_id`);

--
-- Индексы таблицы `site_widget_region_rating_settings`
--
ALTER TABLE `site_widget_region_rating_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_region_rating_settings` (`site_widget_id`);

--
-- Индексы таблицы `site_widget_slider_slides`
--
ALTER TABLE `site_widget_slider_slides`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_slider_slide_order` (`site_widget_id`,`slide_order`),
  ADD KEY `idx_slider_site_widget` (`site_widget_id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_referred_by_idx` (`referred_by_id`),
  ADD KEY `users_organization_id_foreign` (`organization_id`),
  ADD KEY `users_site_id_foreign` (`site_id`);

--
-- Индексы таблицы `widgets`
--
ALTER TABLE `widgets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `widgets_widget_slug_unique` (`widget_slug`),
  ADD KEY `widgets_category_is_active_sort_order_index` (`category`,`is_active`,`sort_order`);

--
-- Индексы таблицы `widget_positions`
--
ALTER TABLE `widget_positions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `widget_positions_template_id_slug_unique` (`template_id`,`slug`),
  ADD KEY `widget_positions_template_id_area_order_index` (`template_id`,`area`,`order`),
  ADD KEY `widget_positions_template_id_is_active_index` (`template_id`,`is_active`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `cities`
--
ALTER TABLE `cities`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=90;

--
-- AUTO_INCREMENT для таблицы `domains`
--
ALTER TABLE `domains`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `donations`
--
ALTER TABLE `donations`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT для таблицы `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `federal_districts`
--
ALTER TABLE `federal_districts`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT для таблицы `form_actions`
--
ALTER TABLE `form_actions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `form_fields`
--
ALTER TABLE `form_fields`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `form_submissions`
--
ALTER TABLE `form_submissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `form_submissions_data`
--
ALTER TABLE `form_submissions_data`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `form_widgets`
--
ALTER TABLE `form_widgets`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `fundraisers`
--
ALTER TABLE `fundraisers`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `global_settings`
--
ALTER TABLE `global_settings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `members`
--
ALTER TABLE `members`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=105;

--
-- AUTO_INCREMENT для таблицы `organizations`
--
ALTER TABLE `organizations`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT для таблицы `organization_media`
--
ALTER TABLE `organization_media`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `organization_news`
--
ALTER TABLE `organization_news`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `organization_seo`
--
ALTER TABLE `organization_seo`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT для таблицы `organization_settings`
--
ALTER TABLE `organization_settings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT для таблицы `organization_sliders`
--
ALTER TABLE `organization_sliders`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `organization_slider_slides`
--
ALTER TABLE `organization_slider_slides`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `organization_statistics`
--
ALTER TABLE `organization_statistics`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `organization_types`
--
ALTER TABLE `organization_types`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `organization_users`
--
ALTER TABLE `organization_users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `payment_logs`
--
ALTER TABLE `payment_logs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT для таблицы `payment_transactions`
--
ALTER TABLE `payment_transactions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT для таблицы `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `projects`
--
ALTER TABLE `projects`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT для таблицы `regions`
--
ALTER TABLE `regions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT для таблицы `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT для таблицы `settlements`
--
ALTER TABLE `settlements`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `sites`
--
ALTER TABLE `sites`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `site_pages`
--
ALTER TABLE `site_pages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `site_page_seo`
--
ALTER TABLE `site_page_seo`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `site_templates`
--
ALTER TABLE `site_templates`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT для таблицы `site_widgets`
--
ALTER TABLE `site_widgets`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `site_widget_configs`
--
ALTER TABLE `site_widget_configs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3789;

--
-- AUTO_INCREMENT для таблицы `site_widget_donations_list_settings`
--
ALTER TABLE `site_widget_donations_list_settings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `site_widget_donation_settings`
--
ALTER TABLE `site_widget_donation_settings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `site_widget_form_fields`
--
ALTER TABLE `site_widget_form_fields`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT для таблицы `site_widget_gallery_images`
--
ALTER TABLE `site_widget_gallery_images`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `site_widget_hero_slides`
--
ALTER TABLE `site_widget_hero_slides`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=433;

--
-- AUTO_INCREMENT для таблицы `site_widget_image_settings`
--
ALTER TABLE `site_widget_image_settings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `site_widget_menu_items`
--
ALTER TABLE `site_widget_menu_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=287;

--
-- AUTO_INCREMENT для таблицы `site_widget_referral_leaderboard_settings`
--
ALTER TABLE `site_widget_referral_leaderboard_settings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `site_widget_region_rating_settings`
--
ALTER TABLE `site_widget_region_rating_settings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `site_widget_slider_slides`
--
ALTER TABLE `site_widget_slider_slides`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT для таблицы `widgets`
--
ALTER TABLE `widgets`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT для таблицы `widget_positions`
--
ALTER TABLE `widget_positions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `cities`
--
ALTER TABLE `cities`
  ADD CONSTRAINT `cities_region_id_foreign` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `domains`
--
ALTER TABLE `domains`
  ADD CONSTRAINT `domains_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `donations`
--
ALTER TABLE `donations`
  ADD CONSTRAINT `donations_donor_id_foreign` FOREIGN KEY (`donor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `donations_fundraiser_id_foreign` FOREIGN KEY (`fundraiser_id`) REFERENCES `fundraisers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `donations_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `donations_payment_transaction_id_foreign` FOREIGN KEY (`payment_transaction_id`) REFERENCES `payment_transactions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `donations_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `donations_region_id_foreign` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`) ON DELETE SET NULL;

--
-- Ограничения внешнего ключа таблицы `form_actions`
--
ALTER TABLE `form_actions`
  ADD CONSTRAINT `form_actions_form_widget_id_foreign` FOREIGN KEY (`form_widget_id`) REFERENCES `form_widgets` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `form_fields`
--
ALTER TABLE `form_fields`
  ADD CONSTRAINT `form_fields_form_widget_id_foreign` FOREIGN KEY (`form_widget_id`) REFERENCES `form_widgets` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `form_submissions`
--
ALTER TABLE `form_submissions`
  ADD CONSTRAINT `form_submissions_form_widget_id_foreign` FOREIGN KEY (`form_widget_id`) REFERENCES `form_widgets` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `form_submissions_data`
--
ALTER TABLE `form_submissions_data`
  ADD CONSTRAINT `form_submissions_data_form_submission_id_foreign` FOREIGN KEY (`form_submission_id`) REFERENCES `form_submissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `form_submissions_data_form_widget_id_foreign` FOREIGN KEY (`form_widget_id`) REFERENCES `form_widgets` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `form_widgets`
--
ALTER TABLE `form_widgets`
  ADD CONSTRAINT `form_widgets_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `fundraisers`
--
ALTER TABLE `fundraisers`
  ADD CONSTRAINT `fundraisers_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fundraisers_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `members`
--
ALTER TABLE `members`
  ADD CONSTRAINT `members_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `organizations`
--
ALTER TABLE `organizations`
  ADD CONSTRAINT `organizations_city_id_foreign` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `organizations_region_id_foreign` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `organizations_settlement_id_foreign` FOREIGN KEY (`settlement_id`) REFERENCES `settlements` (`id`) ON DELETE SET NULL;

--
-- Ограничения внешнего ключа таблицы `organization_media`
--
ALTER TABLE `organization_media`
  ADD CONSTRAINT `organization_media_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `organization_news`
--
ALTER TABLE `organization_news`
  ADD CONSTRAINT `organization_news_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `organization_seo`
--
ALTER TABLE `organization_seo`
  ADD CONSTRAINT `organization_seo_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `organization_settings`
--
ALTER TABLE `organization_settings`
  ADD CONSTRAINT `organization_settings_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `organization_sliders`
--
ALTER TABLE `organization_sliders`
  ADD CONSTRAINT `organization_sliders_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `organization_slider_slides`
--
ALTER TABLE `organization_slider_slides`
  ADD CONSTRAINT `organization_slider_slides_slider_id_foreign` FOREIGN KEY (`slider_id`) REFERENCES `organization_sliders` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `organization_statistics`
--
ALTER TABLE `organization_statistics`
  ADD CONSTRAINT `organization_statistics_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `organization_users`
--
ALTER TABLE `organization_users`
  ADD CONSTRAINT `organization_users_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `organization_users_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `payment_logs`
--
ALTER TABLE `payment_logs`
  ADD CONSTRAINT `payment_logs_payment_transaction_id_foreign` FOREIGN KEY (`payment_transaction_id`) REFERENCES `payment_transactions` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD CONSTRAINT `payment_transactions_fundraiser_id_foreign` FOREIGN KEY (`fundraiser_id`) REFERENCES `fundraisers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payment_transactions_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_transactions_payment_method_id_foreign` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `payment_transactions_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL;

--
-- Ограничения внешнего ключа таблицы `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL;

--
-- Ограничения внешнего ключа таблицы `regions`
--
ALTER TABLE `regions`
  ADD CONSTRAINT `regions_federal_district_id_foreign` FOREIGN KEY (`federal_district_id`) REFERENCES `federal_districts` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `settlements`
--
ALTER TABLE `settlements`
  ADD CONSTRAINT `settlements_city_id_foreign` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `settlements_region_id_foreign` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `sites`
--
ALTER TABLE `sites`
  ADD CONSTRAINT `sites_domain_id_foreign` FOREIGN KEY (`domain_id`) REFERENCES `domains` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `sites_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `site_pages`
--
ALTER TABLE `site_pages`
  ADD CONSTRAINT `site_pages_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `site_pages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `site_pages_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `site_page_seo`
--
ALTER TABLE `site_page_seo`
  ADD CONSTRAINT `site_page_seo_page_id_foreign` FOREIGN KEY (`page_id`) REFERENCES `site_pages` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `site_widgets`
--
ALTER TABLE `site_widgets`
  ADD CONSTRAINT `site_widgets_position_id_foreign` FOREIGN KEY (`position_id`) REFERENCES `widget_positions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `site_widgets_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `site_widgets_widget_id_foreign` FOREIGN KEY (`widget_id`) REFERENCES `widgets` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `site_widget_configs`
--
ALTER TABLE `site_widget_configs`
  ADD CONSTRAINT `site_widget_configs_site_widget_id_foreign` FOREIGN KEY (`site_widget_id`) REFERENCES `site_widgets` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `site_widget_donations_list_settings`
--
ALTER TABLE `site_widget_donations_list_settings`
  ADD CONSTRAINT `site_widget_donations_list_settings_site_widget_id_foreign` FOREIGN KEY (`site_widget_id`) REFERENCES `site_widgets` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `site_widget_donation_settings`
--
ALTER TABLE `site_widget_donation_settings`
  ADD CONSTRAINT `site_widget_donation_settings_site_widget_id_foreign` FOREIGN KEY (`site_widget_id`) REFERENCES `site_widgets` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `site_widget_form_fields`
--
ALTER TABLE `site_widget_form_fields`
  ADD CONSTRAINT `site_widget_form_fields_site_widget_id_foreign` FOREIGN KEY (`site_widget_id`) REFERENCES `site_widgets` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `site_widget_gallery_images`
--
ALTER TABLE `site_widget_gallery_images`
  ADD CONSTRAINT `site_widget_gallery_images_site_widget_id_foreign` FOREIGN KEY (`site_widget_id`) REFERENCES `site_widgets` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `site_widget_hero_slides`
--
ALTER TABLE `site_widget_hero_slides`
  ADD CONSTRAINT `site_widget_hero_slides_site_widget_id_foreign` FOREIGN KEY (`site_widget_id`) REFERENCES `site_widgets` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `site_widget_image_settings`
--
ALTER TABLE `site_widget_image_settings`
  ADD CONSTRAINT `site_widget_image_settings_site_widget_id_foreign` FOREIGN KEY (`site_widget_id`) REFERENCES `site_widgets` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `site_widget_menu_items`
--
ALTER TABLE `site_widget_menu_items`
  ADD CONSTRAINT `site_widget_menu_items_site_widget_id_foreign` FOREIGN KEY (`site_widget_id`) REFERENCES `site_widgets` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `site_widget_referral_leaderboard_settings`
--
ALTER TABLE `site_widget_referral_leaderboard_settings`
  ADD CONSTRAINT `site_widget_referral_leaderboard_settings_site_widget_id_foreign` FOREIGN KEY (`site_widget_id`) REFERENCES `site_widgets` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `site_widget_region_rating_settings`
--
ALTER TABLE `site_widget_region_rating_settings`
  ADD CONSTRAINT `site_widget_region_rating_settings_site_widget_id_foreign` FOREIGN KEY (`site_widget_id`) REFERENCES `site_widgets` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `site_widget_slider_slides`
--
ALTER TABLE `site_widget_slider_slides`
  ADD CONSTRAINT `site_widget_slider_slides_site_widget_id_foreign` FOREIGN KEY (`site_widget_id`) REFERENCES `site_widgets` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `users_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON DELETE SET NULL;

--
-- Ограничения внешнего ключа таблицы `widget_positions`
--
ALTER TABLE `widget_positions`
  ADD CONSTRAINT `widget_positions_template_id_foreign` FOREIGN KEY (`template_id`) REFERENCES `site_templates` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

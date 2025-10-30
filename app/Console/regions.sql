-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Хост: MySQL-8.0
-- Время создания: Окт 29 2025 г., 17:21
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
(66, 4, 'Чеченская Республика', 'cecenskaia-respublika', '20', 'Грозный', NULL, NULL, 1500000, 16165, 'Europe/Moscow', 'republic', 1, '2025-09-27 07:52:23', '2025-09-27 07:52:23'),
(69, 1, 'Владимирская область', 'vladimirskaia-oblast', '41904', 'Владимир', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'oblast', 1, '2025-10-26 12:02:58', '2025-10-26 12:02:58'),
(70, 1, 'Воронежская область', 'voronezskaia-oblast', '45836', 'Не определено', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'oblast', 1, '2025-10-26 12:02:58', '2025-10-26 12:02:58'),
(71, 1, 'Ивановская область', 'ivanovskaia-oblast', '39722', 'Не определено', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'oblast', 1, '2025-10-26 12:02:58', '2025-10-26 12:02:58'),
(72, 4, 'Кабардино-Балкарская Республика', 'kabardino-balkarskaia-respublika', '99081', 'Не определено', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'region', 1, '2025-10-26 12:02:58', '2025-10-26 12:02:58'),
(73, 4, 'Карачаево-Черкесская Республика', 'karacaevo-cerkesskaia-respublika', '99357', 'Не определено', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'region', 1, '2025-10-26 12:02:58', '2025-10-26 12:02:58'),
(74, 7, 'Кемеровская область - Кузбасс', 'kemerovskaia-oblast-kuzbass', '29627', 'Не определено', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'oblast', 1, '2025-10-26 12:02:58', '2025-10-26 12:02:58'),
(75, 6, 'Курганская область', 'kurganskaia-oblast', '56717', 'Не определено', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'oblast', 1, '2025-10-26 12:02:58', '2025-10-26 12:02:58'),
(76, 1, 'Курская область', 'kurskaia-oblast', '10290', 'Не определено', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'oblast', 1, '2025-10-26 12:02:58', '2025-10-26 12:02:58'),
(77, 8, 'Магаданская область', 'magadanskaia-oblast', '61313', 'Не определено', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'oblast', 1, '2025-10-26 12:02:58', '2025-10-26 12:02:58'),
(78, 1, 'Орловская область', 'orlovskaia-oblast', '84089', 'Не определено', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'oblast', 1, '2025-10-26 12:02:58', '2025-10-26 12:02:58'),
(79, 2, 'Псковская область', 'pskovskaia-oblast', '18142', 'Не определено', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'oblast', 1, '2025-10-26 12:02:58', '2025-10-26 12:02:58'),
(80, 2, 'Республика Карелия', 'respublika-kareliia', '82629', 'Не определено', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'region', 1, '2025-10-26 12:02:58', '2025-10-26 12:02:58'),
(81, 3, 'Республика Крым', 'respublika-krym', '59255', 'Не определено', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'region', 1, '2025-10-26 12:02:58', '2025-10-26 12:02:58'),
(88, 7, 'Республика Хакасия', 'respublika-xakasiia', '32771', 'Не определено', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'region', 1, '2025-10-26 12:02:59', '2025-10-26 12:02:59'),
(89, 1, 'Рязанская область', 'riazanskaia-oblast', '52247', 'Не определено', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'oblast', 1, '2025-10-26 12:02:59', '2025-10-26 12:02:59'),
(90, 3, 'Севастополь', 'sevastopol', '39874', 'Не определено', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'region', 1, '2025-10-26 12:02:59', '2025-10-26 12:02:59'),
(91, 1, 'Смоленская область', 'smolenskaia-oblast', '90539', 'Не определено', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'oblast', 1, '2025-10-26 12:02:59', '2025-10-26 12:02:59'),
(92, 1, 'Тамбовская область', 'tambovskaia-oblast', '66846', 'Не определено', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'oblast', 1, '2025-10-26 12:02:59', '2025-10-26 12:02:59'),
(93, 1, 'Тверская область', 'tverskaia-oblast', '38189', 'Не определено', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'oblast', 1, '2025-10-26 12:02:59', '2025-10-26 12:02:59'),
(94, 7, 'Томская область', 'tomskaia-oblast', '48441', 'Не определено', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'oblast', 1, '2025-10-26 12:02:59', '2025-10-26 12:02:59'),
(95, 1, 'Тульская область', 'tulskaia-oblast', '48256', 'Не определено', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'oblast', 1, '2025-10-26 12:02:59', '2025-10-26 12:02:59'),
(96, 8, 'Хабаровский край', 'xabarovskii-krai', '33873', 'Не определено', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'krai', 1, '2025-10-26 12:02:59', '2025-10-26 12:02:59'),
(97, 5, 'Чувашская Республика', 'cuvasskaia-respublika', '22638', 'Не определено', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'region', 1, '2025-10-26 12:02:59', '2025-10-26 12:02:59'),
(98, 8, 'Чукотский автономный округ', 'cukotskii-avtonomnyi-okrug', '97824', 'Не определено', NULL, NULL, NULL, NULL, 'Europe/Moscow', 'autonomous_okrug', 1, '2025-10-26 12:02:59', '2025-10-26 12:02:59');

--
-- Индексы сохранённых таблиц
--

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
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `regions`
--
ALTER TABLE `regions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=135;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `regions`
--
ALTER TABLE `regions`
  ADD CONSTRAINT `regions_federal_district_id_foreign` FOREIGN KEY (`federal_district_id`) REFERENCES `federal_districts` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

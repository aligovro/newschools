<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    @php
    /**
    * Базовые SEO-данные для серверного рендера (Telegram/WhatsApp, боты без JS)
    *
    * 1) Если контроллер передал готовый массив seo (например, HomeController) — используем его.
    * 2) Если есть главный сайт с seo_config (site.seo_config), собираем из него базовые теги.
    */
    $seoProps = $page['props']['seo'] ?? null;

    if (!$seoProps && isset($page['props']['site']['seo_config'])) {
    $rawSeo = $page['props']['site']['seo_config'] ?? [];
    $siteName = $page['props']['site']['name'] ?? config('app.name');
    $siteDescription = $page['props']['site']['description'] ?? '';

    $getString = function ($value) {
    return is_string($value) && trim($value) !== '' ? $value : null;
    };

    $seoTitle =
    $getString($rawSeo['seo_title'] ?? null) ??
    $getString($rawSeo['meta_title'] ?? null) ??
    $getString($rawSeo['title'] ?? null);

    $seoDescription =
    $getString($rawSeo['seo_description'] ?? null) ??
    $getString($rawSeo['meta_description'] ?? null) ??
    $getString($rawSeo['description'] ?? null);

    $seoKeywords =
    $getString($rawSeo['seo_keywords'] ?? null) ??
    $getString($rawSeo['meta_keywords'] ?? null) ??
    $getString($rawSeo['keywords'] ?? null);

    $metaTitle = $seoTitle ?? $siteName;
    $metaDescription = $seoDescription ?? $siteDescription;

    $seoProps = [
    'title' => $metaTitle,
    'description' => $metaDescription,
    'keywords' => $seoKeywords,
    'og_title' => $getString($rawSeo['og_title'] ?? null) ?? $metaTitle,
    'og_description' => $getString($rawSeo['og_description'] ?? null) ?? $metaDescription,
    'og_type' => $getString($rawSeo['og_type'] ?? null) ?? 'website',
    'og_image' => $getString($rawSeo['og_image'] ?? null) ?? $getString($rawSeo['image'] ?? null),
    'twitter_card' => $getString($rawSeo['twitter_card'] ?? null) ?? 'summary_large_image',
    'twitter_title' => $getString($rawSeo['twitter_title'] ?? null) ?? $metaTitle,
    'twitter_description' => $getString($rawSeo['twitter_description'] ?? null) ?? $metaDescription,
    'twitter_image' => $getString($rawSeo['twitter_image'] ?? null) ?? $getString($rawSeo['og_image'] ?? null),
    ];
    }

    $currentUrl = url()->current();
    @endphp

    @if(!empty($seoProps))
    {{-- Серверные SEO / Open Graph теги, которые увидят Telegram/WhatsApp и другие боты --}}
    <meta name="description" content="{{ $seoProps['description'] ?? '' }}">
    @if(!empty($seoProps['keywords']))
    <meta name="keywords" content="{{ $seoProps['keywords'] }}">
    @endif

    {{-- Robots meta tag для индексации --}}
    <meta name="robots" content="{{ $seoProps['robots'] ?? 'index, follow' }}">

    <link rel="canonical" href="{{ $currentUrl }}">

    {{-- Open Graph --}}
    <meta property="og:type" content="{{ $seoProps['og_type'] ?? 'website' }}">
    <meta property="og:title" content="{{ $seoProps['og_title'] ?? ($seoProps['title'] ?? '') }}">
    <meta property="og:description" content="{{ $seoProps['og_description'] ?? ($seoProps['description'] ?? '') }}">
    <meta property="og:url" content="{{ $currentUrl }}">
    @if(!empty($seoProps['og_image']))
    <meta property="og:image" content="{{ $seoProps['og_image'] }}">
    @endif

    {{-- Twitter --}}
    <meta name="twitter:card" content="{{ $seoProps['twitter_card'] ?? 'summary_large_image' }}">
    <meta name="twitter:title" content="{{ $seoProps['twitter_title'] ?? ($seoProps['title'] ?? '') }}">
    <meta name="twitter:description" content="{{ $seoProps['twitter_description'] ?? ($seoProps['description'] ?? '') }}">
    @if(!empty($seoProps['twitter_image']))
    <meta name="twitter:image" content="{{ $seoProps['twitter_image'] }}">
    @endif
    @endif


    {{-- Inline style to set the HTML background color --}}
    <style>
        html {
            background-color: oklch(1 0 0);
        }
    </style>

    <title inertia>{{ $seoProps['title'] ?? '' }}</title>

    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&family=montserrat:300,400,500,600,700" rel="stylesheet" />

    @viteReactRefresh
    {{-- Подключаем один общий бандл приложения (Inertia сам подгружает страницы через dynamic import) --}}
    @vite(['resources/css/app.scss', 'resources/js/app.tsx'])
    @inertiaHead
</head>

<body>
    @inertia
</body>

</html>